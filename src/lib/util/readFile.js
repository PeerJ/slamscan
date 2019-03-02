import fs from "fs";

export const readFile = filePath => new Promise((resolve, reject) => fs.readFile(filePath, (error, file) => {
    if (error) {
        return reject(error);
    }

    return resolve(file);
}));

export default readFile;
