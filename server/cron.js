const cron = require("node-cron");
const Backup = require('./model/backup.js');
const createDumpCommand = require('ale-mongoutils').createDumpCommand;
const executeCommand = require('ale-mongoutils').executeCommand;
var _secretKey = "some-unique-key"; //TODO: add to config
var simpleCrypto = new SimpleCrypto(_secretKey);

let data = Backup
  .value()

data.forEach(function (backup) {
  console.log(backup);
  let commandString = createDumpCommand({
    database: backup.collection,
    host: 'mongodb://' + backup.hostname + ':' + backup.port,
    dist: './temp/' + backup.collection,
    username: backup.username ? backup.username : '',
    password: backup.password ? simpleCrypto.decrypt(backup.password) : '',
    collections: backup.collection ? [{name: backup.collections}] : [],
    authenticationDatabase: backup.authenticationDatabase ? backup.authenticationDatabase : '',
  });
  cron.schedule(backup.schedule, function () {
    console.log("Run Backup for " + backup.hostname + " DB: " + backup.collection);
    // executeCommand(commandString, function (out) {
    //   console.log("OUT", out);
    // }, function (err) {
    //   console.log("ERROR", err);
    // })
    //   .then(function (result) {
    //     console.log(result);
    //   })
    //   .catch(function (error) {
    //TODO: send mail on every fail to configured address
    //     throw error;
    //   })
  });
});
