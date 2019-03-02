import Aws from "../../serverless/aws";

export const putTagsOnS3Object = (bucket, key, tagsMap) => new Aws.S3({signatureVersion: "v4"})
    .putObjectTagging({
        Bucket: bucket,
        Key: key,
        Tagging: {
            TagSet: Object.keys(tagsMap).map(key => {
                return {
                    Key: key,
                    Value: String(tagsMap[key])
                };
            })
        }
    })
    .promise();

export default putTagsOnS3Object;
