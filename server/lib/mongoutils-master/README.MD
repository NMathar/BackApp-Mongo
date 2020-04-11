# mongoutils
### Intro
A utilities to make and restore backups via mongodump and mongorestore. mongodump and mongorestore must be installed on your system to use this.

You can assert of mongodump and mongorestore is present on system using the function `checkInstalled` exported by this module.

```typescript
import { checkInstalled } from 'ale-mongoutils';
...

const isInstaled: boolean = await checkInstalled();

```


### Including
```typescript
import  { checkInstalled, createDumpCommand, createRestoreCommand, executeCommand } from 'ale-mongoutils';
```

### API

#### createDumpCommand(options: Credentials): Array<string>
Generate the mongodump command.

```typescript
export interface Credentials {
    database: string,
    dist: string,
    host: string,
    username?: string,
    password?: string,
    collections?: Array<{ name: string, query?: string }>,
    authenticationDatabase?: string,
}
```

```javascript
import  { createDumpCommand } from 'ale-mongoutils';

let commands = createDumpCommand({ database: 'test', host: 'mongodb://localhost:27017', dist: './temp' });
// [ 'mongodump --db test --host mongodb://localhost:27017 --out ./temp' ] 

```
This function return a array of commands strings for all item in collections array on options.
The query key of collections must ve a valid string of mongo find.
see: https://docs.mongodb.com/manual/reference/program/mongodump/#cmdoption-mongodump-query

#### createRestoreCommand(options: Restore)
Generate the mongorestore command.

```typescript
export interface Restore {
    database: string,
    username?: string,
    password?: string,
    from: string,
    host: string,
    drop?: boolean,
    collections?: Array<{ name: string }>,
    authenticationDatabase?: string,
}
```
```typescript
import  { createRestoreCommand } from 'ale-mongoutils';

let commands = createRestoreCommand(createRestoreCommand({ database: 'target-database', from: './temp/<from-db>', host: 'mongodb://localhost:27017' }));
// [ 'mongorestore --db target-database --host mongodb://localhost:27017 --dir ./temp/<from-db>' ]
```

This function return a array of commands strings for all item in collections array on options.
The query key of collections must be a valid string of mongo find.
see: https://docs.mongodb.com/manual/reference/program/mongorestore/

#### executeCommand(command: string, out: Function, err: Function): Promise<Number>
Execute a generated command.

```javascript
import  { executeCommand } from 'ale-mongoutils';

executeCommand(commandString, function(out) { console.log("OUT", out); }, function(err) { console.log("ERROR", err); })
.then(function(result) {
  console.log(result);
})
.catch(function(error) {
  throw error;
})
```
