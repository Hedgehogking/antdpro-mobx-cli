import axios from 'axios'
import Inquirer from 'inquirer';
import { wrapLoading } from './utils.js'

axios.interceptors.response.use(res => res.data)

function fetchApi(type) {
  return async function (url) {
    let arr = await wrapLoading(() => axios.get(url), `Waiting fetch ${type}s...`, `Fetch ${type}s success`)
    if (!arr) return
    if (type === 'template') {
      arr = arr.filter(r => r.is_template)
    }
    const result = await Inquirer.prompt({
      name: type,
      type: 'list',
      message: `choose the ${type}`,
      choices: arr.map(r => ({ value: r.name, name: `${r.name} (${r.description})` }))
    })
    return result[type];
  }
}

export const fetchTemplate = fetchApi('template')
export const fetchTag = fetchApi('tag')
export const fetchBranch = fetchApi('branch')

export default axios
