const fs = require('fs')
const shell = require('shelljs')

const config = require('./package')
const releaseVersion = process.env.TRAVIS_TAG.replace('v', '')

const REPO = `https://${process.env.GH_TOKEN}@github.com/alextremp/brusc.git`
const MESSAGE = `[skip travis] Update version to: ${releaseVersion}`

const commands = []

const runCommand = function(i = 0) {
  if (commands.length < i) {
    console.log('Finished')
    shell.exit(0)
  }
  const command = commands[i]
  shell.exec(command, function(code, stdout, stderr) {
    console.log('>' + command)
    console.log('> exit code', code)
    console.log('> ', stdout)
    if (code !== 0 && code !== 128) {
      console.log('> ', stderr)
      shell.exit(code)
    }
    const tid = setTimeout(function() {
      clearTimeout(tid)
      runCommand(i + 1)
    }, 100)
  })
}

const isBeta = releaseVersion.indexOf('-beta.') > -1
config.version = releaseVersion

fs.writeFileSync('package.json', JSON.stringify(config, null, 2))

const NOLOG = ' > /dev/null 2>&1'
const branch = isBeta
  ? `develop/v${releaseVersion.replace(/\.[0-9]+\.[0-9]+-beta\.[0-9]+/, '')}`
  : 'master'
commands.push(`git checkout -b ${branch}`)
commands.push(`git push --repo=${REPO} --set-upstream origin ${branch}${NOLOG}`)
commands.push(`git remote rm origin`)
commands.push(`git remote add origin ${REPO}${NOLOG}`)
commands.push('git add package.json')
commands.push(`git commit -m "${MESSAGE}"${NOLOG}`)
// commands.push(`npm publish${isBeta ? ' --tag beta' : ''}`)
commands.push(`git push --repo=${REPO} origin ${branch} --quiet${NOLOG}`)

runCommand()
