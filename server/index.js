const fs = require('fs')
const express = require('express')
const consola = require('consola')
// const {Nuxt, Builder} = require('nuxt')
const {exec} = require('child_process');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
// let nodemailer = require("nodemailer");

// create if file not exists
fs.closeSync(fs.openSync(__dirname + '/db/settings.json', 'a'))

const adapter = new FileSync(__dirname + '/db/settings.json')
const db = low(adapter)

// Set some defaults
db.defaults({dbs: []})
  .write()

const app = express()

// db.get('dbs')
//   .push({
//     id: 1, collection: 'test', hostname: 'localhost', port: '27017',
//     username: '', password: '', schedule: '*/5 * * * *'
//   })
//   .write()

// create mail transporter
// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "COMPANYEMAIL@gmail.com",
//     pass: "userpass"
//   }
// });

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

app.get('/cron/restart', function (req, res) {
  exec('npm run cron:restart', (err, stdout, stderr) => {
    if (stdout) {
      res.json({success: false, message: stdout});
    } else {
      res.json({success: true, message: "cron restart was successful"})
    }
  });
});

app.get('/cron/start', function (req, res) {
  exec('npm run cron:start --silent', (err, stdout, stderr) => {
    if (err) {
      res.json({success: false, message: stderr});
    } else {
      res.json({success: true, message: "cron start was successful"})
    }
  });
});

app.get('/cron/stop', function (req, res) {
  exec('npm run cron:stop --silent', (err, stdout, stderr) => {
    if (err) {
      res.json({success: false, message: stderr});
    } else {
      res.json({success: true, message: "cron stop was successful"})
    }
  });
});

app.get('/cron/status', function (req, res) {
  exec('npm run cron:status --silent', (err, stdout, stderr) => {
    // console.log(stdout);
    res.json({success: true, status: stdout})
  });
});

module.exports = {
  path: '/api',
  handler: app
}
