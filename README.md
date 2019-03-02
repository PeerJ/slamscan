```plaintext
 _______    ___      _______  __   __          _______  _______  _______  __    _ 
|       |  |   |    |   _   ||  |_|  |        |       ||       ||   _   ||  |  | |
|  _____|  |   |    |  |_|  ||       |        |  _____||       ||  |_|  ||   |_| |
| |_____   |   |    |       ||       |        | |_____ |       ||       ||       |
|_____  |  |   |___ |       ||       |        |_____  ||      _||       ||  _    |
 _____| |  |       ||   _   || ||_|| |         _____| ||     |_ |   _   || | |   |
|_______|3 |_______||__| |__||_|   |_|bda Clam|_______||_______||__| |__||_|  |__|
```

The goal of this project is to efficiently virus scan files that are uploaded to a S3 bucket and notify the results of the scan.

This can be achieved in a reasonably cost effective manner using Lambda, `node` and `clamscan`.

S3 is configured to call a `node` handler when a S3 `PUT` event is received.  The `node` handler calls out to `clamscan` and then publishes to SNS with the results. SNS can be configured to `POST` to a webhook or `PUT` in a SQS queue for later processing.

Unfortunately due to size limitations, its not possible to keep the virus definitions in the package, but rather they need to be uploaded to S3 where the Lambda process can then download.  If you're processing files quite closely together, the Lambda container may still be around and so the virus definitions won't need to be re-downloaded.


# Dependencies

```bash
brew install nvm clamav
nvm install 8

brew cask install docker
open /Applications/Docker.app
```

# Installation

```bash
npm install 

# Or this, for safety
npm ci
```

# Testing

```bash
# Lint and test
npm test 

# Run tests with coverage
npm run cover
```

# Deployment

```bash
# The equivalent of `npx sls deploy --stage deploy`
npm run deploy
```

# Configuration

You'll need to do a couple of things in the AWS console before you're all good to go:

1. Specify some S3 buckets for `scanFile` to monitor.
    1. Define `SLAMSCAN_SPACE_DELIMITED_SOURCE_BUCKETS` at deploy time, say `foo`, `bar` and `baz` to be created automatically.
    ```bash
    SLAMSCAN_SPACE_DELIMITED_SOURCE_BUCKETS='foo bar baz' npx sls deploy
    ```
        1. This is **not recommended** since the bucket lifecycles are tied to the lifecycle of this serverless service – i.e. running `npx sls remove` will delete your buckets and their contents.
    1. For existing S3 buckets, or otherwise self-managed buckets, add the appropriate (S3 `PUT`) triggers [here](https://console.aws.amazon.com/lambda/home#/functions/slamscan?tab=triggers).
        1. The `scanFile` handler will need the `GetObject`, `GetObjectTagging`, `PutObject`, `PutObjectTagging` and `PutObjectVersionTagging` permissions on these buckets, possibly by adding some `IamRoleStatements` in [`serverless.yml`](./serverless.yml).

1. Manually invoke the `updateDefinitions` lambda to seed the initial set of virus definitions.


