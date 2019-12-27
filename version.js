const fs = require('fs')
const shell = require('shelljs')

const GIT_ORIGIN = `https://alextremp:${process.env.GH_TOKEN}@github.com/alextremp/brusc.git`

const config = require('./package')
const releaseVersion = process.env.TRAVIS_TAG.replace('v', '')
const isBeta = releaseVersion.indexOf('-beta.') > -1
config.version = releaseVersion

fs.writeFileSync('package.json', JSON.stringify(config, null, 2))

const commands = []
commands.push('git config --global user.email "travis@travis-ci.org"')
commands.push('git config --global user.name "Travis CI"')
commands.push('git remote rm origin')
commands.push(`git remote add origin ${GIT_ORIGIN} > /dev/null 2>&1`)
commands.push('git add package.json')
commands.push(`git commit -m "Update version to: ${releaseVersion}"`)
commands.push('git push origin master --quiet')
commands.push(`npm publish${isBeta ? ' --tag beta' : ''}`)

commands.forEach(command => {
  console.log('>' + command)
  shell.exec(command, function(code, stdout, stderr) {
    console.log('Exit code:', code)
    console.log('Output:', stdout, stderr)
    if (code !== 0) {
      shell.exit(1)
    }
  })
})
