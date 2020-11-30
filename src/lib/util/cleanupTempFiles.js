import temp from "temp";

export const cleanupTempFiles = () => new Promise((resolve, reject) => temp.cleanup(error => {
    if (error) {
        return reject(error);
    }

    return resolve();
}));

export default cleanupTempFiles;
