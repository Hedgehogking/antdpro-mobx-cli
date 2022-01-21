import fs from 'fs-extra';
import path from 'path';
import Inquirer from 'inquirer';
import downloadGitRepo from 'download-git-repo'
import { promisify } from 'util'
import menFs from 'mem-fs'
import memFsEditor from 'mem-fs-editor'
import { exec } from 'child_process'
import { fileURLToPath } from 'url';

import { fetchTemplate, fetchTag, fetchBranch } from './request.js'
import { wrapLoading } from './utils.js'
const __dirname = path.dirname(fileURLToPath(import.meta.url))


const templateName = 'antd-pro-admin'
const orgName = 'HedgehogOrg'
const repoVersion = 'main'
// const userRepos = 'https://api.github.com/users/Hedgehogking/repos'
const orgsRepos = `https://api.github.com/orgs/${orgName}/repos`

export default class Creator {
  constructor(projectName, targetDir) {
    this.name = projectName
    this.target = targetDir
    this.downloadGitRepo = promisify(downloadGitRepo)
  }
  async create() {
    /**
     * 1、从个人或组织拉取模板列表，选择模板
     * 2、根据所选模板拉取版本号或分支
     * 3、根据所选版本号或分支，下载模板
     * 4、根据选项生成项目
     * 5、安装依赖
     */

    // 1、选择模板
    // const repo = await fetchTemplate(orgsRepos)
    const repo = templateName
    // 2、选择版本号或分支
    // const version = await fetchTag(`https://api.github.com/repos/${orgName}/${repo}/tags`)
    // const version = await fetchBranch(`https://api.github.com/repos/${orgName}/${repo}/branches`)
    const version = repoVersion
    // 3、下载
    const tmpTarget = await this.download(orgName, repo, version)
    // 4、生成项目
    await this.copyTpl(tmpTarget);
    // 5、安装依赖
    await this.install()
  }

  async download(orgName, repo, version) {
    /**
     * 1、拼接路径
     * 2、下载到某路径，非target
     */
    const tmpDir = `${repo}_${version}`
    // tag: `${orgName}/${repo}@${tag}`
    const downloadUrl = `${orgName}/${repo}#${version}`
    const tmpDownloadDir = path.join(__dirname, '../__download__')
    const target = path.join(tmpDownloadDir, tmpDir)
    if (!fs.existsSync(tmpDownloadDir)) {
      fs.mkdirSync(tmpDownloadDir)
    }
    if (fs.existsSync(target)) {
      // 提示用户已经有缓存，是否需要重新拉取最新代码
      const { update } = await Inquirer.prompt({
        name: 'update',
        type: 'checkbox',
        message: 'Target Repository already has a cache. Do you want to update it?',
        choices: ['Update']
      })
      if (!update.length) {
        return target
      }
      await wrapLoading(() => fs.removeSync(target), 'Removing cache...', 'Removing cache success')
    }
    await wrapLoading(() => this.downloadGitRepo(downloadUrl, target), 'Waiting fetch repository...', 'Fetch repository success')
    return target
  }

  async copyTpl(tmpTarget) {
    await wrapLoading(() => {
      const editor = memFsEditor.create(menFs.create())
      return new Promise((resolve, reject) => {
        editor.copyTpl(tmpTarget, this.target, {
          projectName: this.name
        })
        editor.commit(() => {
          // men-fs 内 ${tmpTarget}/** 匹配不了.env
          exec(`cp ${tmpTarget}/.** ${this.target}`)
          resolve()
        })
      })
    }, 'Copying files from repository...', 'Copy success')
  }

  async install() {
    await wrapLoading(async () => {
      return new Promise((resolve, reject) => {
        exec(`cd ${this.target} && npm install`, err => {
          if (!err) {
            resolve()
          } else {
            console.error(err)
            reject(err)
          }
        })
      })
    }, 'Installing...', 'Install success')
  }
}
