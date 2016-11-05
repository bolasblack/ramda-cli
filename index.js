const vm = require('vm')
const R = require('ramda')

module.exports = (userScript, userData) => {
  const vmlizedScript = new vm.Script('result = ' + userScript)
  const sandbox = R.merge({data: userData}, R)

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

    return Promise.resolve(result)
  }
}
