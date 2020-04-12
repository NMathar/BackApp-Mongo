
export interface Credentials {
    database: string,
    dist: string,
    host: string,
    username?: string,
    password?: string,
    collections?: Array<{ name: string, query?: string }>,
    authenticationDatabase?: string,
}
