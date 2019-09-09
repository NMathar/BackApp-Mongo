const cron = require("node-cron");
const Backup = require('./model/backup.js');
const createDumpCommand = require('ale-mongoutils').createDumpCommand;
const executeCommand = require('ale-mongoutils').executeCommand;
const SimpleCrypto = require("simple-crypto-js").default;
const _secretKey = "some-unique-key"; //TODO: add to config
const simpleCrypto = new SimpleCrypto(_secretKey);

let data = Backup
    .value()

// dummy schedule to let process start
cron.schedule('*/5 * * * *', function () {
    // console.log('Cron is running');
});

data.forEach(function (backup) {
    console.log(backup);
    let commandString = createDumpCommand({
        database: backup.database,
        host: 'mongodb://' + backup.hostname + ':' + backup.port,
        dist: './temp/' + backup.database,
        username: backup.username ? backup.username : '',
        password: backup.password ? simpleCrypto.decrypt(backup.password) : '',
        collections: backup.collections,
        authenticationDatabase: backup.authenticationDatabase ? backup.authenticationDatabase : '',
    });
    console.log(commandString);
    cron.schedule(backup.schedule, function () {
        console.log("Run Backup for " + backup.hostname + " DB: " + backup.collection);
        //TODO: handle backup.max_dumps

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
