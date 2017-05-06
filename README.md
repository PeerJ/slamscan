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

This can be achieved in a reasonably cost effictive manner using Lambda, `node` and `clamscan`.

S3 is configured to call a `node` handler when a S3 `PUT` event is received.  The `node` handler calls out to `clamscan` and then publishes to SNS with the results.  SNS can be configured to `POST` to a webhook or `PUT` in a SQS queue for later processing.

Unfortunately due to size limitations, its not possible to keep the virus definitions in the package, but rather they need to be uploaded to S3 where the Lambda process can then download.  If you're processing files quite closely together, the Lambda container may still be around and so the virus definitions won't need to be re-downloaded.


## Installation

### Build the `clamscan` binaries
`clamscan` is currently the only supported virus scanning engine and need to be configured to
run under Lambda. There are a couple of ways to do this:

#### Build the binaries on the `amazonlinux` Docker image
1. `docker pull amazonlinux`
1. `docker run -it amazonlinux`
1. Follow the build/update instructions below.

#### Build the binaries on an actual EC2 instance

1. Spin up an EC2 instance and assume the `ec2-user`.
1. `sudo yum groupinstall "Development Tools"`
1. `sudo yum install openssl openssl-devel wget`
1. `wget https://www.clamav.net/downloads/production/clamav-0.99.2.tar.gz`
1. `tar -xvf clamav-0.99.2.tar.gz`
1. `cd clamav-0.99.2`
1. `./configure --enable-static=yes --enable-shared=no --disable-unrar --prefix=/var/task`
1. `make`
1. `sudo make install`

#### Update the virus definition files
1. `sudo chown -R ec2-user /var/task`
1. `touch /var/task/etc/freshclam.conf`
   * or `cp /var/task/etc/freshclam.conf.sample /var/task/etc/freshclam.conf` and follow the instruction to  `#Comment or remove the line below`
1. `mkdir /var/task/share/clamav`
1. `/var/task/bin/freshclam`
1. `/var/task/bin/clamscan /var/task/test/resources/EICAR-AV-Test`
   * Should return `/var/task/test/resources/EICAR-AV-Test: Eicar-Test-Signature FOUND`

#### Copy the files to where they need to be
1. You'll need to upload the virus definition files from `/var/task/share/clamav` to a location in S3, or some HTTP/HTTPS accessible location.
   * Make sure that the `lambda_exec` IAM role has `read` permissions on these files.
   * Add the URIs to the files to your configuration under `db-files`
1. You'll need to copy the `clamscan` binary in `/var/task/bin/clamscan` to the `bin` directory in this project
1. You'll need to copy the `lib64` libraries in `/var/task/lib64` to the `lib64` directory in this project


### Set up your AWS Infrastructure
1. S3 Bucket with files to scan
1. SNS Topic to notify on infected file discovery
1. IAM Resources
    1. An IAM user with an access key/secret so you can `node-lambda run` and `node-lambda deploy`
       * Quick Start: 
          * `AWSLambdaFullAccess`
    1. A `lambda_exec` role (Lambda Service type role)
       * Quick Start: 
          * `AmazonS3ReadOnlyAccess`
          * `AmazonSNSFullAccess`
       * Better Security: 
          * S3 Bucket: `ListBuckets` & `GetObject`
          * SNS Topic: Publish access
1. CloudWatch is very useful for debugging - you will need to add permissions for that as well if desired.


### Configure and deploy the Lambda function
```sh
# Install dependencies
brew install node
npm install -g node-lambda


# Setup the package
npm install # or `yarn install`


# Provide your `slamscan` configuration by changing the `DEFINE-ME` values in default.yaml to the relevant ones for you
cp config/test.yaml config/local.yaml
emacs config/local.yaml # or `vim` or `nano` or whatever.


# Initialize and provide some `node-lambda` configuration
node-lambda setup

emacs .env # or `vim` or `nano` or whatever.
# You'll want to set the following, but experimentation is encouraged
# AWS_MEMORY_SIZE=1024 # `clamscan` is pretty RAM hungry these days, per https://github.com/widdix/aws-s3-virusscan/issues/12
# AWS_TIMEOUT=120 # `clamscan` takes a bit of time to spin up, plus downloading your virus definitions & files to scan might take a while
# AWS_RUN_TIMEOUT=120
# AWS_PROFILE=<your local `aws-cli` configured credentials in a profile>

cp test/resources/event.json ./event.json 
# Might as well use the skeleton that's already there and just change the `DEFINE-ME`s
emacs event.json # or `vim` or `nano` or whatever.


# Run your lambda locally
node-lambda run


# Deploy your lambda
node-lambda deploy

```

### Configure your Lambda function triggers
Login to the AWS Console and add the appropriate (S3 `PUT`) triggers [here](https://console.aws.amazon.com/lambda/home#/functions/slamscan?tab=triggers).


## Contributing
Pull requests are welcome.  Please ensure existing standards and tests pass by running `npm test`.

