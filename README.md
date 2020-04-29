```plaintext
 _______    ___      _______  __   __          _______  _______  _______  __    _
|       |  |   |    |   _   ||  |_|  |        |       ||       ||   _   ||  |  | |
|  _____|  |   |    |  |_|  ||       |        |  _____||       ||  |_|  ||   |_| |
| |_____   |   |    |       ||       |        | |_____ |       ||       ||       |
|_____  |  |   |___ |       ||       |        |_____  ||      _||       ||  _    |
 _____| |  |       ||   _   || ||_|| |         _____| ||     |_ |   _   || | |   |
|_______|3 |_______||__| |__||_|   |_|bda Clam|_______||_______||__| |__||_|  |__|
```

[![Build status](https://img.shields.io/travis/com/randytarampi/slamscan.svg?style=flat-square)](https://travis-ci.com/randytarampi/slamscan)
[![Coverage status](https://img.shields.io/coveralls/randytarampi/slamscan.svg?style=flat-square)](https://coveralls.io/github/randytarampi/slamscan?branch=master)
[![Maintainability status](https://img.shields.io/codeclimate/maintainability-percentage/randytarampi/slamscan.svg?style=flat-square)](https://codeclimate.com/github/randytarampi/slamscan/maintainability)
[![Analytics](https://ga-beacon.appspot.com/UA-50921068-1/beacon/github/randytarampi/me/tree/master/packages/slamscan?flat&useReferrer)](https://github.com/igrigorik/ga-beacon)


Originally written in [2017](https://github.com/PeerJ/slamscan), and rewritten based off [upsidetravel/bucket-antivirus-function](https://github.com/upsidetravel/bucket-antivirus-function), the goal of this project was to efficiently virus scan files that are uploaded to a S3 bucket and notify the results of the scan. This is now just a relic that goes largely unused, but serves as a demo for the couple of people that wanted to see how I'd rewrite something in a "modern" way.

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
# The equivalent of `NODE_ENV=prd npx sls deploy --stage deploy`
npm run deploy

# The equivalent of `npx sls invoke --stage deploy --function updateDefinitions`
npm run seed
```

# Configuration

You'll need to specify some S3 buckets for `scanFile` to monitor before you're all good to go:

1. Define `SLAMSCAN_SPACE_DELIMITED_SOURCE_BUCKETS` at deploy time, say `foo`, `bar` and `baz` to be created automatically.
    ```bash
    SLAMSCAN_SPACE_DELIMITED_SOURCE_BUCKETS='foo bar baz' npm run deploy
    ```
    - This is **not recommended** since the bucket lifecycles are tied to the lifecycle of this serverless service – i.e. running `npm run remove` will delete your buckets and their contents.
1. For existing S3 buckets, or otherwise self-managed buckets, add the appropriate (S3 `PUT`) triggers [here](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/slamscan-deploy-scanFile?tab=triggers).
    - The `scanFile` handler will need the `GetObject`, `GetObjectTagging`, `PutObject`, `PutObjectTagging` and `PutObjectVersionTagging` permissions on these buckets, possibly by
        - adding some `IamRoleStatements` [per `iamRoleStatementForSourceBucketName` in `config/iamRoleStatementForSourceBucketName.js`](./config/iamRoleStatementForSourceBucketName.js),
        - or attaching an inline policy to the `slamscan-deploy-us-east-1-lambdaRole`.


