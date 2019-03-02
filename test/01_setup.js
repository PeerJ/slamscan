process.env.SENTRY_DSN = "https://meow@sentry.io/woof";
process.env.LOGGER_ENABLED = "true";
process.env.LOGGER_STREAM_HUMAN_ENABLED = "true";
process.env.LOGGER_STREAM_STDOUT_ENABLED = "false";
process.env.LOGGER_STREAM_SENTRY_ENABLED = "false";
process.env.LOGGER_SRC_ENABLED = "true";

process.env.SLAMSCAN_CLAMSCAN_DB_PATH = "/tmp/slamscan-test/db";
process.env.SLAMSCAN_CLAMSCAN_DB_BUCKET = "slamscan-test.randytarampi.ca";
process.env.SLAMSCAN_SCAN_RESULT_SNS_ARN = "arn:aws:s3:::slamscan-test.randytarampi.ca";
