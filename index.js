const vm = require('vm')
const R = require('ramda')
const RX = require('ramda-extra').default

module.exports = (userScript, userData) => {
  const vmlizedScript = new vm.Script('result = ' + userScript)
  const sandbox = R.mergeAll([R, R.omit(['default', 'call'], RX), {data: userData}])

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
