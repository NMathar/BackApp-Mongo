import BackupModel from "./model/backup"
import {config} from "dotenv"
import {schedule} from "node-cron"
import {createDumpCommand} from './lib/mongoutils-master/src';
import {exec} from "child_process"
import {createTransport,} from "nodemailer"
import Mail from "nodemailer/lib/mailer";
import Rabbit from "crypto-js/rabbit"
import ENC from "crypto-js/enc-utf8";
import {Credentials} from "~/server/lib/mongoutils-master/src/Credentials.interface";

config()


// create mail transporter
let transporter: Mail | null = null
if (process.env.MAILER_URL && process.env.MAILER_URL.length > 0) {
  transporter = createTransport(process.env.MAILER_URL);
}

// transporter.verify(function(error, success) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log("Server is ready to take our messages");
//     }
// });

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
let data = BackupModel
  .value()
const backupDir = __dirname + '/db/dumps/';//TODO: add to config
const _secretKey = process.env.SECRET_KEY || "";

// dummy schedule to let process start
schedule('*/30 * * * *', function () {
  // console.log('Cron is running');
});

data.forEach(function (backup) {
  // console.log(backup);
  schedule(backup.schedule, function () {
    // console.log("Run Backup for " + backup.hostname + " DB: " + backup.database);

    let d = new Date();
    // console.log('./db/dumps/' + backup.database + '_' + d.getDate()+ d.getMonth()+d.getFullYear()+'.dump')

    let options: Credentials = {
      database: backup.database,
      host: backup.hostname + ':' + backup.port,
      dist: backupDir + backup.id + '/' + d.getDate() + monthNames[d.getMonth()] + d.getFullYear() + '_' + d.getHours() + d.getMinutes(),
      username: backup.username ? backup.username : '',
      authenticationDatabase: backup.authenticationDatabase ? backup.authenticationDatabase : '',
    }
    if(backup.collections.length > 0){
      options.collections = collectionArrayFormat(backup.collections)
    }
    if (backup.password) {
      options.password = Rabbit.decrypt(backup.password, _secretKey).toString(ENC)
    }
    console.log(options)
    let commandString = createDumpCommand(options);
    console.log(commandString)

    commandString.forEach(command => {
      // console.log(command)
      exec(command + ' --forceTableScan', (err, stdout, stderr) => {
        console.log(command)
        if (err) {
          //send mail on every fail to configured address
          if (transporter) {
            let message = {
              from: 'mongodb-backup@noreply.com',
              to: process.env.CRON_MAIL_ADDRESS,
              subject: 'Cron for ' + backup.hostname + ' failed',
              text: 'Command that failed: \n ' + command + ' \n\n Error:\n' + stderr,
              html: '<p>Command that failed:</p><p>' + command + '</p><p>Error:</p><p>' + stderr + '</p>'
            };
            transporter.sendMail(message, function (err: Error | null) {
              if (err) {
                console.log(err)
              } else {
                // console.log('message was send!')
              }
            });
          }
          // console.log(err)
          console.log(stderr)
          // console.log(stdout)
        } else {
          // console.log(stdout)
          // handle backup.max_dumps
          deleteIfMaxDumpsReached(backup.id || "", backup.max_dumps)
        }
      });
    })
  });
});

function collectionArrayFormat(array: string[]) {
  let collectionArray: Array<{ name: string, query?: string }> = [];
  if (array && array.length > 0) {
    array.forEach((element: any) => {
      collectionArray.push({name: element})
    })
  }
  return collectionArray
}

function deleteIfMaxDumpsReached(id: string, max_dumps: number) {
  const {readdirSync, statSync} = require('fs')
  const rimraf = require('rimraf');

  try {
    let folderArr = readdirSync(backupDir + id)

    if (folderArr && folderArr.length > max_dumps) {
      let sort = folderArr.sort(function (a: string, b: string) {
        return statSync(backupDir + id + '/' + a).mtime.getTime() - statSync(backupDir + id + '/' + b).mtime.getTime();
      });
      let delArray = sort.slice(0, sort.length - max_dumps)
      // console.log(delArray)
      delArray.forEach((folder: string) => {
        rimraf.sync(backupDir + id + '/' + folder)
      });
    }
  } catch (e) {
    console.log(e)
  }

}
