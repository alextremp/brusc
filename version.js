const fs = require('fs')
const shell = require('shelljs')

const GIT_ORIGIN = `https://alextremp:${process.env.GH_TOKEN}@github.com/alextremp/brusc.git`

const tempBranchFile = '.version_branch'
const BRANCH_COMMAND = `git branch --points-at ${process.env.TRAVIS_TAG} > ${tempBranchFile}`

const runCommand = function(command) {
  console.log('>' + command)
  shell.exec(command, function(code, stdout, stderr) {
    console.log('Exit code:', code)
    console.log('Output:', stdout, stderr)
    if (code !== 0) {
      shell.exit(1)
    }
  })
}

const getBranch = function() {
  runCommand(BRANCH_COMMAND)
  const content = fs.readFileSync(tempBranchFile, 'utf8')
  if (content) {
    const lines = content.match(/^.*([\n\r]+|$)/gm)
    if (lines && lines.length > 0) {
      return lines[0].replace('* ', '')
    }
  }
  return null
}

const branch = getBranch()
if (!branch) {
  console.log('cannot get branch')
  shell.exit(1)
}
console.log('BRANCH ' + branch)

const config = require('./package')
const releaseVersion = process.env.TRAVIS_TAG.replace('v', '')
const isBeta = releaseVersion.indexOf('-beta.') > -1
config.version = releaseVersion

fs.writeFileSync('package.json', JSON.stringify(config, null, 2))

const commands = []
commands.push('git status')
commands.push('git config --global user.email "travis@travis-ci.org"')
commands.push('git config --global user.name "Travis CI"')
commands.push('git remote rm origin')
commands.push(`git remote add origin ${GIT_ORIGIN} > /dev/null 2>&1`)
commands.push('git add package.json')
commands.push(`git commit -m "Update version to: ${releaseVersion}"`)
commands.push(`git push origin ${branch} --quiet`)
commands.push(`npm publish${isBeta ? ' --tag beta' : ''}`)

commands.forEach(command => {
  runCommand(command)
})
