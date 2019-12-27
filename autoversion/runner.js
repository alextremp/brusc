/* eslint-disable no-console */
const shell = require('shelljs')

const queue = []

const run = function() {
  const command = queue.shift()
  if (!command) {
    console.log('Finished')
    shell.exit(0)
  }
  command()
  const tid = setTimeout(function() {
    clearTimeout(tid)
    run()
  }, 500)
}

const addFunction = f => {
  queue.push(() => f())
}

const addShell = command => {
  queue.push(() => {
    console.log('>' + command)
    shell.exec(command, (code, stdout, stderr) => {
      console.log('> exit code', code)
      console.log('> ', stdout)
      if (code !== 0) {
        console.log('> ', stderr)
        shell.exit(code)
      }
    })
  })
}

module.exports = {
  run,
  addFunction,
  addShell
}
