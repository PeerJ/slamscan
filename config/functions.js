module.exports.default = () => {
    const sourceBuckets = process.env.SLAMSCAN_SPACE_DELIMITED_SOURCE_BUCKETS && process.env.SLAMSCAN_SPACE_DELIMITED_SOURCE_BUCKETS.split(" ") || [];

    return {
        scanFile: {
            description: "Use `clamscan` to scan files for threats",
            memorySize: 1024,
            timeout: 300,
            handler: "src/serverless/handlers/scanFile.handler",
            events: sourceBuckets.map(sourceBucket => {
                return {
                    s3: sourceBucket
                };
            }),
            onError: {
                Ref: "SNSTopicLambdaDeadLetterQueue"
            },
            layers: [
                {Ref: "ClamAvLambdaLayer"}
            ]
        },
        updateDefinitions: {
            description: "Use `freshclam` to keep threat definitions up to date",
            memorySize: 2048,
            handler: "src/serverless/handlers/updateDefinitions.handler",
            events: [
                {
                    schedule: "rate(3 hours)",
                    description: "Regularly run `freshclam` to keep slamscan definitions up to date"
                }
            ],
            onError: {
                Ref: "SNSTopicLambdaDeadLetterQueue"
            },
            layers: [
                {Ref: "ClamAvLambdaLayer"}
            ]
        }
    };
};
