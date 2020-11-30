import fs from "fs";
import Aws from "../../serverless/aws";

export const downloadFileFromBucket = (bucket, key, filePath) => new Promise((resolve, reject) => new Aws.S3({signatureVersion: "v4"})
    .getObject({
        Bucket: bucket,
        Key: decodeURIComponent(key)
    })
    .createReadStream()
    .pipe(fs.createWriteStream(filePath))
    .on("error", reject)
    .on("close", () => resolve(filePath))
);

export default downloadFileFromBucket;
