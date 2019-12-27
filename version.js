const fs = require('fs')
const shell = require('shelljs')

const GIT_ORIGIN = `https://alextremp:${process.env.GH_TOKEN}@github.com/alextremp/brusc.git`

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

const config = require('./package')
const releaseVersion = process.env.TRAVIS_TAG.replace('v', '')
const isBeta = releaseVersion.indexOf('-beta.') > -1
config.version = releaseVersion

fs.writeFileSync('package.json', JSON.stringify(config, null, 2))

const commands = []
const branch = isBeta ? `beta/${releaseVersion}` : 'master'
commands.push('git config --global user.email "travis@travis-ci.org"')
commands.push('git config --global user.name "Travis CI"')
commands.push(`git checkout -b ${branch}`)
commands.push(`git push --set-upstream origin ${branch}`)
commands.push('git add package.json')
commands.push(`git commit -m "Update version to: ${releaseVersion}"`)
commands.push(`git push origin ${branch} --quiet`)
commands.push(`npm publish${isBeta ? ' --tag beta' : ''}`)

commands.forEach(command => {
  runCommand(command)
})
