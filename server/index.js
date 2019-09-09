const express = require('express')
const bodyParser = require('body-parser');
const consola = require('consola')
// const {Nuxt, Builder} = require('nuxt')
const {exec} = require('child_process');

// let nodemailer = require("nodemailer");

const app = express()
app.use(bodyParser.json())

// start cron on app startup
exec('npm run cron:start --silent');

const backup = require('./controller/backup.js');
const Backup = require('./model/backup.js');

// Create a new Note
app.post('/backups', backup.create);

// Retrieve all Notes
app.get('/backups', backup.findAll);

// Retrieve a single Note with noteId
app.get('/backups/:id', backup.findOne);

// Update a Note with noteId
app.put('/backups/:id', backup.update);

// Delete a Note with noteId
app.delete('/backups/:id', backup.delete);

app.get('/backups/dumps/:id', backup.dumps)

app.get('/download/dump/:id/:folder', backup.downloadDump)

app.get('/restore/dump/:id/:folder', backup.restoreDump)


// create mail transporter
// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "COMPANYEMAIL@gmail.com",
//     pass: "userpass"
//   }
// });


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
