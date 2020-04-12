import FileSync from 'lowdb/adapters/FileSync';
import lowdb from 'lowdb'
import {Backup} from "~/types";

const settingFile = __dirname + '/../db/settings.json'

// create if file not exists
// fs.closeSync(fs.openSync(settingFile, 'a'));
type Schema = {
  backups: Backup[];
};
let db = lowdb(new FileSync<Schema>(settingFile));

// Set some defaults
db.defaults({backups: []})
  .write()

export default db.get('backups', [])
