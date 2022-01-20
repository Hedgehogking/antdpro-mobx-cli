import path from 'path'
import fs from 'fs-extra'
import Inquirer from 'inquirer'
import ora from 'ora'
import Creator from './Creator.js';

export default async (projectName, options) => {
  const cwd = process.cwd()
  const targetDir = path.join(cwd, projectName)
  if (fs.existsSync(targetDir)) {
    const spinner = ora('Removing...')
    if (options.force) {
      spinner.start()
      await fs.remove(targetDir)
    } else {
      // 提示用户是否确认覆盖
      const { action } = await Inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: 'Target directory already exists Pick an action:',
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: false },
          ]
        }
      ])
      if (!action) {
        // return
        process.exit()
      } else if (action === 'overwrite') {
        spinner.start()
        await fs.remove(targetDir)
      }
    }
    spinner.succeed('Remove completely')
  }
  const creator = new Creator(projectName, targetDir)
  return creator.create()
}
