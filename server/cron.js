const cron = require("node-cron");
const Backup = require('./model/backup.js');
const createDumpCommand = require('ale-mongoutils').createDumpCommand;
const {exec} = require('child_process');
const SimpleCrypto = require("simple-crypto-js").default;

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
let data = Backup
    .value()
const backupDir = __dirname + '/db/dumps/';//TODO: add to config
const _secretKey = "some-unique-key"; //TODO: add to config
const simpleCrypto = new SimpleCrypto(_secretKey);

// dummy schedule to let process start
cron.schedule('*/30 * * * *', function () {
    // console.log('Cron is running');
});

data.forEach(function (backup) {
    // console.log(backup);
    cron.schedule(backup.schedule, function () {
        // console.log("Run Backup for " + backup.hostname + " DB: " + backup.database);

        let d = new Date();
        // console.log('./db/dumps/' + backup.database + '_' + d.getDate()+ d.getMonth()+d.getFullYear()+'.dump')

        let commandString = createDumpCommand({
            database: backup.database,
            host: backup.hostname + ':' + backup.port,
            dist: backupDir + backup.id + '/' + d.getDate() + monthNames[d.getMonth()] + d.getFullYear() + '_' + d.getHours() + d.getMinutes(),
            username: backup.username ? backup.username : '',
            password: backup.password ? simpleCrypto.decrypt(backup.password) : '',
            collections: backup.collections.length > 0 ? backup.collections : '',
            authenticationDatabase: backup.authenticationDatabase ? backup.authenticationDatabase : '',
        });
        // console.log(commandString)

        commandString.forEach(command => {
            // console.log(command)
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    //TODO: send mail on every fail to configured address
                    // let nodemailer = require("nodemailer");
                    // create mail transporter
                    // let transporter = nodemailer.createTransport({
                    //   service: "gmail",
                    //   auth: {
                    //     user: "COMPANYEMAIL@gmail.com",
                    //     pass: "userpass"
                    //   }
                    // });

                    console.log(err)
                    console.log(stderr)
                    console.log(stdout)
                } else {
                    // console.log(stdout)
                    // handle backup.max_dumps
                    deleteIfMaxDumpsReached(backup.id, backup.max_dumps)
                }
            });
        })
    });
});

function deleteIfMaxDumpsReached(id, max_dumps) {
    const {readdirSync, statSync} = require('fs')
    const rimraf = require('rimraf');

    let folderArr = readdirSync(backupDir + id)

    if(folderArr.length > max_dumps){
        let sort = folderArr.sort(function (a, b) {
            return statSync(backupDir + id + '/' + a).mtime.getTime() - statSync(backupDir + id + '/' + b).mtime.getTime();
        });
        let delArray = sort.slice(0, sort.length - max_dumps)
        // console.log(delArray)
        delArray.forEach(folder => {
            rimraf.sync(backupDir+id+'/'+folder)
        });
    }
}
