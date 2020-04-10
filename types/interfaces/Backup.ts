export interface Backup {
  id?: string;
  database: string;
  collections:string[];
  hostname: string;
  port: number;
  username: string;
  password?: string;
  schedule: string;
  authenticationDatabase: string;
  max_dumps: number;
}
