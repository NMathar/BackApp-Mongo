import {Request, Response} from "express";
import {config} from "dotenv"
import BackupModel from "../model/backup"
import {v4 as uuidv4} from 'uuid';
import Rabbit from "crypto-js/rabbit"
import {exec} from "child_process"
import {createRestoreCommand} from '../lib/mongoutils-master/src';
import {Backup, Dump} from "~/types";

config({path: __dirname + '/../db/.env'})
const _secretKey = process.env.SECRET_KEY || "";
const backupDir = __dirname + '/../db/dumps/';//TODO: add to config

// Create and Save a new Note
const create = (req: Request, res: Response) => {
// Validate request
  if (!req.body.hostname || !req.body.database || !req.body.port || !req.body.schedule) {
    return res.status(400).send({
      message: "Infos are not complete"
    });
  }
  if (req.body.max_dumps < 0) {
    return res.status(400).send({
      message: "Infos are not correct"
    });
  }
  let id = uuidv4();
  BackupModel
    .push({
      id: id,
      database: req.body.database,
      collections: req.body.collections, //collectionArrayFormat(req.body.collections),
      hostname: req.body.hostname,
      port: req.body.port,
      username: req.body.username, password: req.body.password ? Rabbit.encrypt(req.body.password, _secretKey) : '',
      schedule: req.body.schedule,
      authenticationDatabase: req.body.authenticationDatabase,
      max_dumps: req.body.max_dumps ? req.body.max_dumps : 3
    })
    .write()

  const entry = BackupModel
    .find({id: id})
    .value()

  // delete entry.password;
  if (entry)
    return res.send(entry);
  else
    return res.status(400)
};

// Retrieve and return all notes from the database.
const findAll = (req: Request, res: Response) => {
  let data = BackupModel
    .value()
  res.send(data);
};

// Find a single note with a noteId
const findOne = (req: Request, res: Response) => {
  const entry = BackupModel
    .find({id: req.params.id})
    .value()
  if (entry)
    res.send(entry);
  else
    res.send({})
};

// Update a note identified by the noteId in the request
const update = (req: Request, res: Response) => {

  let updateObj: Backup = {
    database: req.body.database ? req.body.database : "",
    collections: req.body.collections && req.body.collections.length > 0 ? req.body.collections : [],
    hostname: req.body.hostname ? req.body.hostname : "",
    port: req.body.port ? req.body.port : "",
    username: req.body.username ? req.body.username : "",
    schedule: req.body.schedule ? req.body.schedule : "",
    authenticationDatabase: req.body.authenticationDatabase ? req.body.authenticationDatabase : "",
    max_dumps: req.body.max_dumps && req.body.max_dumps > 0 ? req.body.max_dumps : 1
  }
  if (req.body.password)
    updateObj.password = Rabbit.encrypt(req.body.password, _secretKey)

  let entry = BackupModel
    .find({id: req.params.id})
    .assign(
      updateObj
    )
    .write()
  if (entry)
    res.send(entry);
  else
    res.send({})
};

// Delete a note with the specified noteId in the request
const deleteR = (req: Request, res: Response) => {
  const rimraf = require('rimraf');
  let entry = BackupModel
    .remove({id: req.params.id})
    .write()
  rimraf.sync(backupDir + req.params.id)
  res.send(entry); // empty on error or if not exists
};

// function collectionArrayFormat(array) {
//   let collectionArray = [];
//   if (array && array.length > 0) {
//     array.forEach(element => {
//       collectionArray.push({name: element.value})
//     })
//   }
//   return collectionArray
// }

const dumps = (req: Request, res: Response) => {
  const {readdirSync} = require('fs')
  const id = req.params.id;
  const entry = BackupModel
    .find({id: id})
    .value()
  let folderArr = readdirSync(backupDir + id)
  let dumps: Dump[] = [];
  folderArr.forEach((dir: string) => {
    // console.log(backupDir+id+'/'+dir+'/'+entry.database)
    dumps.push({folder: dir, db: entry.database, dumps: readdirSync(backupDir + id + '/' + dir + '/' + entry.database)})
  })
  res.json({dumps: dumps});
}


const downloadDump = (req: Request, res: Response) => {
  const zipFolder = require('zip-a-folder');
  let version = req.params.folder
  if (!version) {
    return res.status(400).send({
      message: "Folder not found"
    });
  }
  const id = req.params.id;
  const entry = BackupModel
    .find({id: id})
    .value()
  let dlfile = '/tmp/' + entry.database + '.zip'
  zipFolder.zipFolder(backupDir + id + '/' + version + '/' + entry.database, dlfile, function (err: any) {
    if (err) {
      return res.status(400).send({
        message: "ZIP for download Failed"
      });
    } else {
      return res.download(dlfile)
    }
  });
}


const restoreDump = (req: Request, res: Response) => {
  const id = req.params.id;
  let version = req.params.folder
  if (!version) {
    return res.status(400).send({
      message: "Folder not found"
    });
  }
  const entry = BackupModel
    .find({id: id})
    .value()
  if (entry) {
    let options: any = {
      database: entry.database,
      from: backupDir + id + '/' + version + '/' + entry.database,
      host: entry.hostname + ':' + entry.port,
      username: entry.username ? entry.username : '',
      authenticationDatabase: entry.authenticationDatabase ? entry.authenticationDatabase : '',
      drop: true
    }
    if (entry.password) {
      options.password = Rabbit.decrypt(entry.password, _secretKey)
    }
    let commands = createRestoreCommand(
      options
    );
    // console.log(commands[0])
    exec(commands[0], (err: any, stdout: any, stderr: any) => {
      if (err) {
        // console.log(err)
        // console.log(stderr)
        // console.log(stdout)
        return res.json({success: false, command: commands[0], message: stderr});
      } else {
        return res.json({success: true, command: commands[0], message: 'Restore was successful!'});
      }
    });
  }

}

const testDBConnection = async (req: Request, res: Response) => {
  const MongoClient = require('mongodb').MongoClient;
  const id = req.params.id;
  const entry = BackupModel
    .find({id: id})
    .value()

  const host = encodeURIComponent(entry.hostname)
  const port = encodeURIComponent(entry.port)
  const authMechanism = 'DEFAULT';
  let authDB = ''
  if (entry.authenticationDatabase)
    authDB = '&authSource=' + entry.authenticationDatabase

  let authString = '';
  if (entry.username && entry.password) {
    const username = encodeURIComponent(entry.username);
    // @ts-ignore
    const password = encodeURIComponent(Rabbit.decrypt(entry.password, _secretKey));
    authString = `${username}:${password}@`
  }

  // Connection URL
  const url = `mongodb://${authString}${host}:${port}/?authMechanism=${authMechanism}` + authDB;
  // console.log(url)
  // Create a new MongoClient
  const client = new MongoClient(url, {useUnifiedTopology: true});

  // Use connect method to connect to the Server
  client.connect(function (err: any) {
    client.close();
    if (err === null) {
      return res.json({connection: true})
    } else {
      console.error(err)
      return res.json({connection: false})
    }
  });
}

export default {
  create,
  findAll,
  findOne,
  update,
  deleteR,
  dumps,
  downloadDump,
  restoreDump,
  testDBConnection
}
