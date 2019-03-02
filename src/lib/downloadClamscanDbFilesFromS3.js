import fs from "fs";
import path from "path";
import {CLAMSCAN_DB_FILES} from "./clamscan";
import {downloadFileFromBucket} from "./util";

export const downloadClamscanDbFileFromS3 = dbFile => new Promise((resolve, reject) => {
    const localFilePath = path.join(process.env.SLAMSCAN_CLAMSCAN_DB_PATH, dbFile);

    fs.access(localFilePath, error => {
        if (error) {
            return downloadFileFromBucket(process.env.SLAMSCAN_CLAMSCAN_DB_BUCKET, dbFile, localFilePath)
                .then(resolve)
                .catch(reject);
        } else {
            return resolve(localFilePath);
        }
    });
});

export const downloadClamscanDbFilesFromS3 = () => Promise.all(CLAMSCAN_DB_FILES.map(downloadClamscanDbFileFromS3));

export default downloadClamscanDbFilesFromS3;
