import temp from "temp";

export const createTempDirectory = () => new Promise((resolve, reject) => temp.mkdir(null, (error, path) => {
    if (error) {
        return reject(error);
    }

    return resolve(path);
}));

export default createTempDirectory;
