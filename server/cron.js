const cron = require("node-cron");
const Backup = require('./model/backup.js');
import {createDumpCommand, createRestoreCommand, executeCommand} from 'ale-mongoutils';


let data = Backup
  .value()

data.forEach(function (backup) {
  console.log(backup);
  let commandString = createDumpCommand({
    database: backup.collection,
    host: 'mongodb://' + backup.hostname + ':' + backup.port,
    dist: './temp/'+backup.collection,
    username: backup.username ? backup.username : '',
    password: backup.password ? backup.password : '', // TODO: decrypt
    collections: backup.collection ? [{name : backup.collections}] : [],
    authenticationDatabase: backup.authenticationDatabase ? backup.authenticationDatabase : '',
  });
  cron.schedule(backup.schedule, function () {
    console.log("Run Backup for " + backup.hostname + " DB: " + backup.collection);
    executeCommand(commandString, function(out) { console.log("OUT", out); }, function(err) { console.log("ERROR", err); })
      .then(function(result) {
        console.log(result);
      })
      .catch(function(error) {
        throw error;
      })
  });
});
