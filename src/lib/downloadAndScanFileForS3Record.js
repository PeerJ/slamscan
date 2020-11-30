import path from "path";
import temp from "temp";
import {scanFile} from "./clamscan";
import {
    cleanupTempFiles,
    downloadFileFromBucket,
    notifySns,
    putTagsOnS3Object,
    S3_FILE_CONTENT_SCAN_END_TAG,
    S3_FILE_CONTENT_SCAN_IS_INFECTED_TAG,
    S3_FILE_CONTENT_SCAN_START_TAG
} from "./util";

export const downloadAndScanFileForS3Record = record => {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;
    const file = temp.path({suffix: path.extname(key)});

    return Promise.all([
            downloadFileFromBucket(bucket, key, file),
            putTagsOnS3Object(bucket, key, {
                [S3_FILE_CONTENT_SCAN_START_TAG]: new Date().toISOString()
            })
        ])
        .then(([localFilePath]) => scanFile(localFilePath))
        .then(isInfected => Promise.all([
            notifySns(process.env.SLAMSCAN_SCAN_RESULT_SNS_ARN, JSON.stringify({
                Bucket: bucket,
                uri: `s3://${bucket}/${key}`,
                isInfected: isInfected
            })),
            putTagsOnS3Object(bucket, key, {
                [S3_FILE_CONTENT_SCAN_END_TAG]: new Date().toISOString(),
                [S3_FILE_CONTENT_SCAN_IS_INFECTED_TAG]: isInfected
            })
        ]))
        .then(() => cleanupTempFiles());
};

export default downloadAndScanFileForS3Record;
