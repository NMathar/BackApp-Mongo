
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
