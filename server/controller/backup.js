const Backup = require('../model/backup.js');
const uuidv4 = require('uuid/v4');
const SimpleCrypto = require("simple-crypto-js").default;
var _secretKey = "some-unique-key"; //TODO: add to config
var simpleCrypto = new SimpleCrypto(_secretKey);

// Create and Save a new Note
exports.create = (req, res) => {
// Validate request
  if (!req.body.hostname || !req.body.database || !req.body.port || !req.body.schedule) {
    return res.status(400).send({
      message: "Infos are not complete"
    });
  }
  if (req.body.max_dumps < 0){
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
  let entry = Backup
    .remove({id: req.params.id})
    .write()
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
