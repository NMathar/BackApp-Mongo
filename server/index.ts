import express from "express"
import * as bodyParser from "body-parser"
import {exec} from "child_process"
import backup from "./controller/backup";

const app = express()
app.use(bodyParser.json())

// start cron on app startup
exec('npm run cron:start --silent');

// Create a new Note
app.post('/backups', backup.create);

// Retrieve all Notes
app.get('/backups', backup.findAll);

// Retrieve a single Note with noteId
app.get('/backups/:id', backup.findOne);

// Update a Note with noteId
app.put('/backups/:id', backup.update);

// Delete a Note with noteId
app.delete('/backups/:id', backup.deleteR);

app.get('/backups/dumps/:id', backup.dumps)

app.get('/download/dump/:id/:folder', backup.downloadDump)

app.get('/restore/dump/:id/:folder', backup.restoreDump)

app.get('/db/test/:id', backup.testDBConnection)


app.get('/cron/restart', function (req, res) {
  exec('npm run cron:restart', (err, stdout, stderr) => {
    if (err) {
      res.json({success: false, message: stderr});
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

module.exports = app
