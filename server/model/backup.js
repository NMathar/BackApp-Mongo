const fs = require('fs')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const settingFile = __dirname + '/../db/settings.json'

// create if file not exists
fs.closeSync(fs.openSync(settingFile, 'a'));

// fs.closeSync(fs.open(settingFile, 'a', (err) =>{
//     console.log(err)
//     fs.appendFileSync(settingFile, '{backups: []}', 'utf8');
// }))

const adapter = new FileSync(settingFile)
const db = low(adapter)

// Set some defaults
// db.defaults({backups: []})
//   .write()

module.exports = db.get('backups')
