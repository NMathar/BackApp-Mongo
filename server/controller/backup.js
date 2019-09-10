require('dotenv').config({path: __dirname + '/../db/.env'})
const Backup = require('../model/backup.js');
const uuidv4 = require('uuid/v4');
const SimpleCrypto = require("simple-crypto-js").default;
const _secretKey = process.env.SECRET_KEY;
var simpleCrypto = new SimpleCrypto(_secretKey);
const backupDir = __dirname + '/../db/dumps/';//TODO: add to config
const createRestoreCommand = require('ale-mongoutils').createRestoreCommand;
const {exec} = require('child_process');

// Create and Save a new Note
exports.create = (req, res) => {
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
    Backup
        .push({
            id: id,
            database: req.body.database,
            collections: collectionArrayFormat(req.body.collections),
            hostname: req.body.hostname,
            port: req.body.port,
            username: req.body.username, password: req.body.password ? simpleCrypto.encrypt(req.body.password) : '', //TODO: in frontend/cron -> simpleCrypto.decrypt(cipherText)
            schedule: req.body.schedule,
            authenticationDatabase: req.body.authenticationDatabase,
            max_dumps: req.body.max_dumps ? req.body.max_dumps : 3
        })
        .write()
        .id

    const entry = Backup
        .find({id: id})
        .value()

    delete entry.password;
    if (entry)
        return res.send(entry);
    else
        return res.status(500)
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
    let data = Backup
        .value()
    res.send(data);
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
    const entry = Backup
        .find({id: req.params.id})
        .value()
    if (entry)
        res.send(entry);
    else
        res.send({})
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {

    let updateObj = {};
    if (req.body.database)
        updateObj.database = req.body.database
    if (req.body.collections && req.body.collections.length > 0)
        updateObj.collections = collectionArrayFormat(req.body.collections)
    if (req.body.hostname)
        updateObj.hostname = req.body.hostname
    if (req.body.port)
        updateObj.port = req.body.port
    if (req.body.username)
        updateObj.username = req.body.username
    if (req.body.password)
        updateObj.password = simpleCrypto.encrypt(req.body.password)
    if (req.body.schedule)
        updateObj.schedule = req.body.schedule
    if (req.body.authenticationDatabase)
        updateObj.authenticationDatabase = req.body.authenticationDatabase
    if (req.body.max_dumps && req.body.max_dumps > 0)
        updateObj.max_dumps = req.body.max_dumps

    let entry = Backup
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
exports.delete = (req, res) => {
    const rimraf = require('rimraf');
    let entry = Backup
        .remove({id: req.params.id})
        .write()
    rimraf.sync(backupDir + req.params.id)
    res.send(entry); // empty on error or if not exists
};

function collectionArrayFormat(array) {
    let collectionArray = [];
    if (array && array.length > 0) {
        array.forEach(element => {
            collectionArray.push({name: element.value})
        })
    }
    return collectionArray
}

exports.dumps = (req, res) => {
    const {readdirSync} = require('fs')
    const id = req.params.id;
    const entry = Backup
        .find({id: id})
        .value()
    let folderArr = readdirSync(backupDir + id)
    let dumps = [];
    folderArr.forEach(dir => {
        // console.log(backupDir+id+'/'+dir+'/'+entry.database)
        dumps.push({folder: dir, db: entry.database, dumps: readdirSync(backupDir + id + '/' + dir + '/' + entry.database)})
    })
    res.json({dumps: dumps});
}


exports.downloadDump = (req, res) => {
    const zipFolder = require('zip-a-folder');
    let version = req.params.folder
    if (!version) {
        return res.status(400).send({
            message: "Folder not found"
        });
    }
    const id = req.params.id;
    const entry = Backup
        .find({id: id})
        .value()
    let dlfile = '/tmp/' + entry.database + '.zip'
    zipFolder.zipFolder(backupDir + id + '/' + version + '/' + entry.database, dlfile, function (err) {
        if (err) {
            return res.status(400).send({
                message: "ZIP for download Failed"
            });
        } else {
            return res.download(dlfile)
        }
    });
}


exports.restoreDump = (req, res) => {
    const id = req.params.id;
    let version = req.params.folder
    if (!version) {
        return res.status(400).send({
            message: "Folder not found"
        });
    }
    const entry = Backup
        .find({id: id})
        .value()
    if (entry) {
        let commands = createRestoreCommand(
            {
                database: entry.database,
                from: backupDir + id + '/' + version + '/' + entry.database,
                host: entry.hostname + ':' + entry.port,
                username: entry.username ? entry.username : '',
                password: entry.password ? simpleCrypto.decrypt(entry.password) : '',
                authenticationDatabase: entry.authenticationDatabase ? entry.authenticationDatabase : '',
                drop: true
            });
        console.log(commands[0])
        exec(commands[0], (err, stdout, stderr) => {
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

exports.testDBConnection = async (req, res) => {
    const MongoClient = require('mongodb').MongoClient;
    const id = req.params.id;
    const entry = Backup
        .find({id: id})
        .value()

    const host = encodeURIComponent(entry.hostname)
    const port = encodeURIComponent(entry.port)
    const authMechanism = 'DEFAULT';
    let authDB = ''
    if (entry.authenticationDatabase)
        authDB = '?authSource=' + entry.authenticationDatabase

    let authString = '';
    if (entry.user && entry.password) {
        const user = encodeURIComponent(entry.user);
        const password = encodeURIComponent(entry.password);
        authString = `${user}:${password}@`
    }

// Connection URL
    const url = `mongodb://${authString}${host}:${port}/?authMechanism=${authMechanism}` + authDB;
    // console.log(url)
// Create a new MongoClient
    const client = new MongoClient(url, {useUnifiedTopology: true});

// Use connect method to connect to the Server
    client.connect(function (err) {
        // client.close();
        if (err === null) {
            return res.json({connection: true})
        } else {
            return res.json({connection: false})
        }
    });
}
