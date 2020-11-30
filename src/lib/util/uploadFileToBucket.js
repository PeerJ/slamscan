import md5 from "md5";
import Aws from "../../serverless/aws";
import logger from "../../serverless/logger";
import {S3_FILE_CONTENT_MD5_TAG} from "../constants";
import {readFile} from "./readFile";

export const uploadFileToBucket = (bucket, key, filePath) => readFile(filePath)
    .then(file => {
        logger.debug("preparing upload of %s to s3://%s/%s", filePath, bucket, key);

        const contentMd5 = md5(file);
        const s3 = new Aws.S3({signatureVersion: "v4"});

        logger.debug("uploading %s to s3://%s/%s (%s)", filePath, bucket, key, contentMd5);

        return s3.putObject({
                Body: file,
                Bucket: bucket,
                Key: decodeURIComponent(key),
                Tagging: `${S3_FILE_CONTENT_MD5_TAG}=${contentMd5}`
            })
            .promise()
            .then(data => {
                logger.debug("successful upload of %s to s3://%s/%s %j", filePath, bucket, key, data);
                return filePath;
            });
    });

export default uploadFileToBucket;
