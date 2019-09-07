const cron = require("node-cron");
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(__dirname + '/db/settings.json')
const db = low(adapter)

let entry = db.get('dbs')
  .find({id: 1})
  .value()

console.log(entry)

// cron.schedule("* * * * *", function() {
//   console.log("running a task every minute");
// });

let array = [{schedule: '*/2 * * * *', text: 'test text 1'}, {schedule: '*/2 * * * *', text: 'test text 2'}]

array.forEach(function (job) {
  console.log(job);
  cron.schedule(job.schedule, function () {
    console.log(job.text);
  });
});
