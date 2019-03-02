import Aws from "../../serverless/aws";

export const getTagsForFileInBucket = (bucket, key) => new Aws.S3({signatureVersion: "v4"})
    .getObjectTagging({
        Bucket: bucket,
        Key: decodeURIComponent(key)
    })
    .promise()
    .then(data => data.TagSet);

export default getTagsForFileInBucket;
