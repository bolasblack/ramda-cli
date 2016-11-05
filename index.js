const vm = require('vm')
const R = require('ramda')

const getAllStdin = () => {
  // http://stackoverflow.com/a/15467539

  if (process.stdin.isTTY) {
    return Promise.resolve(undefined)
  }

  return new Promise((resolve, reject) => {
    let stdinStr = ''

    process.stdin.setEncoding('utf8')

    process.stdin.on('readable', () => {
      const chunk = process.stdin.read()
      if (chunk) {
        stdinStr += chunk
      }
    })

    process.stdin.on('end', () => {
      resolve(stdinStr)
    })
  })
}

module.exports = (userScript, userDataStr) => {
  let userData, jsonTypeData = false

  try {
    jsonTypeData = true
    userData = JSON.parse(userDataStr)
  } catch (err) {
    jsonTypeData = false
    userData = userDataStr
  }

  const vmlizedScript = new vm.Script('result = ' + userScript)
  const sandbox = {R, data: userData}

  try {
    vmlizedScript.runInNewContext(sandbox)
  } catch (err) {
    return Promise.reject(err)
  }

  if (sandbox.result) {
    let result
    if (typeof sandbox.result === 'function') {
      result = sandbox.result(userData)
    } else {
      result = sandbox.result
    }

    if (jsonTypeData) {
      return Promise.resolve(JSON.stringify(result))
    } else {
      return Promise.resolve(result)
    }
  }
}

if (require.main === module) {
  const userScript = process.argv[2]
  let userDataStr
  getAllStdin().then((_userDataStr) => {
    userDataStr = _userDataStr
    return module.exports(userScript, userDataStr)
  }).then((result) => {
    console.log(result || userDataStr)
    process.exit(0)
  }).catch((err) => {
    console.error(err.stack)
    process.exit(1)
  })
}
