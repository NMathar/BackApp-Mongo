import {WordArray} from "crypto-js";

export interface Backup {
  id?: string;
  database: string;
  collections:string[];
  hostname: string;
  port: number;
  username: string;
  password?: string | WordArray;
  schedule: string;
  authenticationDatabase: string;
  max_dumps: number;
}
