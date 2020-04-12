import { exec } from 'child_process';

function exists(command: string): Promise<boolean> {
    return new Promise(function(resolve, reject) {
        let spawn = exec(`which ${command}`);
        let data: any;

        if (spawn && spawn.stderr && spawn.stdout) {
            spawn.stdout.on('data', function(out) {
                data = out;
            });
            spawn.stderr.on('data', function(error) {
                return reject(error);
            });

            spawn.on('close', function() {
                resolve(!!data);
            });
        }
    });
}

export function checkInstalled () {
    return new Promise(function(resolve, reject) {
        Promise.all([ exists("mongodump"), exists("mongorestore") ])
            .then(function(result) {
                if (!result[0] || !result[1]) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
            .catch(function(error) {
                reject(error);
            })
    });
}
