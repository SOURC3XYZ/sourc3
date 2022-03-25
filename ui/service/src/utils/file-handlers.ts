import fs from 'fs';
import path from 'path';

export const fileCreate = async (filepath: string) => new Promise(
  (resolve) => {
    fs.open(filepath, 'w', (err) => {
      if (err) return resolve(false);
      return resolve(true);
    });
  }
);

export const writeText = async (
  filepath: string,
  text: string
): Promise<boolean> => new Promise(
  (resolve) => {
    fs.writeFile(filepath, text, (err) => {
      if (err) return resolve(false);
      return resolve(true);
    });
  }
);

export const readText = async (
  filepath: string
): Promise<string> => new Promise(
  (resolve, reject) => {
    fs.readFile(filepath, (err, data) => {
      if (err) return reject(err);
      return resolve(data.toString('utf8'));
    });
  }
);

function isFileExecutable(exec: string) {
  let result: boolean = true;
  if (process.platform === 'win32') {
    const filename = path.basename(exec);
    const exe = path.extname(filename).toLowerCase();
    switch (exe) {
      case '.exe': case '.bat': case '.cmd': case '.vbs': case '.ps1': {
        break;
      }
      default: result = false;
    }
    return result;
  }
  try {
    if (fs.lstatSync(exec).isDirectory()) {
      return false;
    }

    // Check if linux has execution rights
    fs.accessSync(exec, fs.constants.X_OK);
    return result;
  } catch (ex) {
    result = false;
  }
  return result;
}

export function getExecutableFile(dirPath: string) {
  const filePath = fs.readdirSync(dirPath)
    .map((el) => path.join(dirPath, el))
    .find(isFileExecutable);
  return filePath;
}

export function isExistsSync(dir:string, filename: string) {
  return fs.existsSync(path.join(dir, filename));
}
