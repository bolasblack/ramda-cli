#!/usr/bin/env node

const R = require('ramda')
const fs = require('fs')
const ramdaRunner = require('./index')

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

const groupArgv = R.compose(
  R.merge({
    args: [],
    flags: [],
  }),
  R.groupBy(
    R.ifElse(
      R.compose(R.isEmpty, R.match(/^\-\w/)),
      R.always('args'),
      R.always('flags')
    )
  )
)

const containsAnyFlags = R.curryN(2, (targetFlags, currentFlags) =>
  R.any(R.contains(R.__, targetFlags), currentFlags)
)

const groupedArgs = groupArgv(process.argv.slice(2))
if (containsAnyFlags(['-h', '--help'], groupedArgs.flags)) {
  const readmeContent = fs.readFileSync('./README.md').toString()
  console.log(readmeContent.split(/\n/).slice(2).join('\n'))
} else {
  const userScript = R.head(groupedArgs.args)
  let userDataStr, jsonTypeData = false
  getAllStdin().then((_userDataStr) => {
    let userData
    userDataStr = _userDataStr
    try {
      jsonTypeData = true
      userData = JSON.parse(userDataStr)
    } catch (err) {
      jsonTypeData = false
      userData = userDataStr
    }
    return ramdaRunner(userScript, userData)
  }).then((result) => {
    if (result && jsonTypeData && !containsAnyFlags(['-p', '--plain'], groupedArgs.flags)) {
      console.log(JSON.stringify(result))
    } else {
      console.log(result || userDataStr)
    }
    process.exit(0)
  }).catch((err) => {
    console.error(err.stack)
    process.exit(1)
  })
}
