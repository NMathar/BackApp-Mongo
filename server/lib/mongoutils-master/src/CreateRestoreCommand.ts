import { Restore } from './Restore.interface';

export function createRestoreCommand(options: Restore): Array<string> {
    let command = `mongorestore --db ${options.database} --host ${options.host} --dir ${options.from}`;
    if (options.username)
        command += ` --username ${options.username}`;

    if (options.password)
        command += ` --password ${options.password}`;

    if (options.authenticationDatabase)
        command += ` --authenticationDatabase ${options.authenticationDatabase}`;

    if (options.drop)
        command += ` --drop`;

    if (options.collections)
        return options.collections
            .map((i) => (`${command} --collection ${i.name}`));

    return [command];
}
