const fs = require('fs')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

// create if file not exists
fs.closeSync(fs.openSync(__dirname + '/../db/settings.json', 'a'))

const adapter = new FileSync(__dirname + '/../db/settings.json')
const db = low(adapter)
// Set some defaults
db.defaults({backups: []})
  .write()

module.exports = db.get('backups')
