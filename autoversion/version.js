const REPO = 'alextremp/brusc'

const runner = require('./runner')
const fs = require('fs')
const packageJSON = require('../package')

const releaseVersion = process.env.TRAVIS_TAG.replace('v', '')

const REPO_URL = `https://${process.env.GH_TOKEN}@github.com/${REPO}.git`
const MESSAGE = `[skip travis] Update version to: ${releaseVersion}`

const isBeta = releaseVersion.indexOf('-beta.') > -1

const branch = isBeta
  ? `develop/v${releaseVersion.replace(/\.[0-9]+\.[0-9]+-beta\.[0-9]+/, '')}`
  : 'master'

packageJSON.version = releaseVersion
const updatedJSON = JSON.stringify(packageJSON, null, 2)

runner.addFunction(() => fs.writeFileSync('package.json', updatedJSON))
runner.addShell(`git remote rm origin`)
runner.addShell(`git remote add origin ${REPO_URL}`)
runner.addShell(`git checkout -b ${branch}`)
runner.addShell('git add package.json')
runner.addShell(`git commit -m "${MESSAGE}"`)
runner.addShell(`npm publish${isBeta ? ' --tag beta' : ''}`)
runner.addShell(`git push --repo=${REPO_URL} origin ${branch} --quiet`)

runner.run()
