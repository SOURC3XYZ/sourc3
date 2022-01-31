import fs from 'fs';

export const fileCreate = async (path:string) => new Promise(
  (resolve) => {
    fs.open(path, 'w', (err) => {
      if (err) return resolve(false);
      return resolve(true);
    });
  }
);

export const writeText = async (
  path:string,
  text:string
):Promise<boolean> => new Promise(
  (resolve) => {
    fs.writeFile(path, text, (err) => {
      if (err) return resolve(false);
      return resolve(true);
    });
  }
);

export const readText = async (
  path:string
):Promise<string> => new Promise(
  (resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) return reject(err);
      return resolve(data.toString('utf8'));
    });
  }
);
