import {config} from "dotenv"
import express from "express"
import * as bodyParser from "body-parser"
import {exec} from "child_process"
import backup from "./controller/backup";
import auth from "./controller/auth";
import {checkJwt} from "./middlewares/checkJwt";

config()
const {loadNuxt, build} = require("nuxt")
const app = express()
app.use(bodyParser.json())

const isDev = process.env.NODE_ENV !== "production"
const port = process.env.PORT || 3000
const route = "/api"

// set / get env vars
if (!process.env.SECRET_KEY || process.env.SECRET_KEY.length <= 0) {
  throw new Error("Please set a SECRET_KEY value in your Environment Variables")
}
if (!process.env.BASE_URL || process.env.BASE_URL.length <= 0) {
  process.env.BASE_URL = "http://localhost:3000"
}
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length <= 0) {
  process.env.ADMIN_PASSWORD = "admin" // please change the password
}
// if (!process.env.BACKUP_DIR || process.env.BACKUP_DIR.length <= 0) {
//   process.env.BACKUP_DIR = "db/dump"
// }

// start cron on app startup
if (!isDev) { // start only in production to prevent to many cron processes
  exec('npm run cron:start --silent');
}

// send login
app.post(route + '/auth/login', auth.login)

// Create a new Backup
app.post(route + '/backups', [checkJwt], backup.create);

// Retrieve all Backups
app.get(route + '/backups', [checkJwt], backup.findAll);

// Retrieve a single Backup with noteId
app.get(route + '/backups/:id', backup.findOne);

// Update a Backup with BackupId
app.put(route + '/backups/:id', backup.update);

// Delete a Backup with BackupId
app.delete(route + '/backups/:id', backup.deleteR);

app.get(route + '/backups/dumps/:id', backup.dumps)

app.get(route + '/download/dump/:id/:folder', backup.downloadDump)

app.get(route + '/restore/dump/:id/:folder', backup.restoreDump)

app.get(route + '/db/test/:id', backup.testDBConnection)


app.get(route + '/cron/restart', function (req, res) {
  exec('npm run cron:restart', (err, stdout, stderr) => {
    if (err) {
      res.json({success: false, message: stderr});
    } else {
      res.json({success: true, message: "cron restart was successful"})
    }
  });
});

app.get(route + '/cron/start', function (req, res) {
  exec('npm run cron:start --silent', (err, stdout, stderr) => {
    if (err) {
      res.json({success: false, message: stderr});
    } else {
      res.json({success: true, message: "cron start was successful"})
    }
  });
});

app.get(route + '/cron/stop', function (req, res) {
  exec('npm run cron:stop --silent', (err, stdout, stderr) => {
    if (err) {
      res.json({success: false, message: stderr});
    } else {
      res.json({success: true, message: "cron stop was successful"})
    }
  });
});

app.get(route + '/cron/status', function (req, res) {
  exec('npm run cron:status --silent', (err, stdout, stderr) => {
    // console.log(stdout);
    res.json({success: true, status: stdout})
  });
});


const server = (async () => {
  // We get Nuxt instance
  const nuxt = await loadNuxt(isDev ? "dev" : "start")

// Render every route with Nuxt.js
  app.use(nuxt.render)

// Build only in dev mode with hot-reloading
  if (isDev) {
    await nuxt.ready()
    build(nuxt)
  }
// Listen the server
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
  })
})()
export default server

