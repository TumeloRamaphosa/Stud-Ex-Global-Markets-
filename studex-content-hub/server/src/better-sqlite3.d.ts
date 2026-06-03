declare module "better-sqlite3" {
  export default class Database {
    constructor(filename: string);
    pragma(statement: string): unknown;
    exec(sql: string): unknown;
    prepare(sql: string): {
      run: (...params: unknown[]) => { lastInsertRowid: number | bigint };
      get: (...params: unknown[]) => unknown;
      all: (...params: unknown[]) => unknown[];
    };
  }
}
