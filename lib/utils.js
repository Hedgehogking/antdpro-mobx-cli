import ora from 'ora'

export const sleep = (n) => {
  return new Promise((resolve, reject) => setTimeout(resolve, n))
}

export const wrapLoading = async (fn, message, successMsg) => {
  const spinner = ora(message)
  spinner.start()
  try {
    const result = await fn()
    spinner.succeed(successMsg ? successMsg : 'success')
    return result
  } catch (error) {
    console.log(error);
    spinner.fail('fail, redo...')
    await sleep(1000)
    const repeat = await wrapLoading(fn, message)
    return repeat
  }
}
