module.exports.default = () => {
    const sourceBuckets = process.env.SLAMSCAN_SPACE_DELIMITED_SOURCE_BUCKETS && process.env.SLAMSCAN_SPACE_DELIMITED_SOURCE_BUCKETS.split(" ") || [];

    return [
        {
            Effect: "Allow",
            Action: [
                "SNS:Publish"
            ],
            Resource: {
                Ref: "SNSTopicLambdaDeadLetterQueue"
            }
        },
        {
            Effect: "Allow",
            Action: [
                "SNS:Publish"
            ],
            Resource: {
                Ref: "SNSTopicScanResult"
            }
        },
        {
            Effect: "Allow",
            Action: [
                "S3:*"
            ],
            Resource: "arn:aws:s3:::${self:provider.environment.SLAMSCAN_CLAMSCAN_DB_BUCKET}/*"
        },
        {
            Effect: "Allow",
            Action: [
                "S3:*"
            ],
            Resource: "arn:aws:s3:::${self:provider.environment.SLAMSCAN_CLAMSCAN_DB_BUCKET}"
        }
    ].concat(sourceBuckets.map(iamRoleStatementForSourceBucketName));
};

const iamRoleStatementForSourceBucketName = module.exports.iamRoleStatementForSourceBucketName = sourceBucketName => {
    return {
        Effect: "Allow",
        Action: [
            "S3:GetObject",
            "S3:GetObjectTagging",
            "S3:PutObject",
            "S3:PutObjectTagging",
            "S3:PutObjectVersionTagging"
        ],
        Resource: `arn:aws:s3:::${sourceBucketName}/*`
    };
};
