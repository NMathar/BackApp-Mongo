const Backup = require('../model/backup.js');
const uuidv4 = require('uuid/v4');
const SimpleCrypto = require("simple-crypto-js").default;
var _secretKey = "some-unique-key"; //TODO: add to config
var simpleCrypto = new SimpleCrypto(_secretKey);

// Create and Save a new Note
exports.create = (req, res) => {
// Validate request
  if (!req.body.hostname || !req.body.collection || !req.body.port || !req.body.schedule) {
    return res.status(400).send({
      message: "Infos are not complete"
    });
  }
  let id = uuidv4();
  Backup
    .push({
      id: id,
      collection: req.body.collection,
      hostname: req.body.hostname,
      port: req.body.port,
      username: req.body.username, password: simpleCrypto.encrypt(req.body.password), //TODO: in frontend/cron -> simpleCrypto.decrypt(cipherText)
      schedule: req.body.schedule
    })
    .write()
    .id

  const entry = Backup
    .find({id: id})
    .value()

  delete entry.password;
  if (entry)
    res.send(entry);
  else
    res.status(500)
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
  if (req.body.collection)
    updateObj.collection = req.body.collection
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
