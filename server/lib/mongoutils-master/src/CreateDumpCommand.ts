import {Credentials} from './Credentials.interface';

export function createDumpCommand(options: Credentials): Array<String>  {
    let command = `mongodump --db ${options.database} --host ${options.host} --out ${options.dist}`;
    if (options.username)
        command += ` --username ${options.username}`;

    if (options.password)
        command += ` --password ${options.password}`;

    if (options.authenticationDatabase)
        command += ` --authenticationDatabase ${options.authenticationDatabase}`;

    if (options.collections)
        return options.collections
            .map((i) => (`${command} --collection ${i.name}` + (i.query ? ` -q '${i.query}'` : '')));

    return [ command ];
}
