const fs = require('fs')
const shell = require('shelljs')

const config = require('./package')
const releaseVersion = process.env.TRAVIS_TAG.replace('v', '')

const GIT_ORIGIN = `https://alextremp:${process.env.GH_TOKEN}@github.com/alextremp/brusc.git`
const COMMIT_AUTHOR = 'Travis CI <travis@travis-ci.org>'
const COMMIT_MESSAGE = `Update version to: ${releaseVersion}`

const runCommand = function(command) {
  shell.exec(command, function(code, stdout, stderr) {
    console.log('>' + command)
    console.log('> exit code', code)
    console.log('> ', stdout)
    if (code !== 0) {
      console.log('> ', stderr)
      shell.exit(code)
    }
  })
}

const isBeta = releaseVersion.indexOf('-beta.') > -1
config.version = releaseVersion

fs.writeFileSync('package.json', JSON.stringify(config, null, 2))

const commands = []
const branch = isBeta ? `beta/${releaseVersion}` : 'master'
commands.push('git config --global user.email "alextremp@hotmail.com"')
commands.push('git config --global user.name "Alex Castells"')
commands.push(`git checkout -b ${branch}`)
commands.push(`git remote rm origin`)
commands.push(`git remote add origin ${GIT_ORIGIN} > /dev/null 2>&1`)
commands.push('git add package.json')
commands.push(`git commit -m "${COMMIT_MESSAGE}" --author="${COMMIT_AUTHOR}"`)
commands.push(`git push --repo=${GIT_ORIGIN} origin ${branch} --quiet`)
commands.push(`npm publish${isBeta ? ' --tag beta' : ''}`)

commands.forEach(command => {
  runCommand(command)
})
