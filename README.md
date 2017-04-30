NOT WORKING!!!!
---
We're having an issue getting the clamscan executable to execute in labmda.  Hopefully will be able to eventually
pick this up again and resolve

S3 LAMbda clamSCAN
---
The goal of this project is to efficiently virus scan files that are uploaded to a s3 bucket
and notify the results of the scan.

This can be achieved in a reasonably cost effictive manner using Lambda, NodeJs and Clamscan.

S3 is configured to call a nodejs handler when a s3 put event is received.  The nodejs handler calls out to clamscan
and then publishes to SNS with the results.  SNS can be configured to post to a webhook or put in a SQS queue for
later processing.

Unfortunately due to size limitations, its not possible to keep the virus definitions in the package, but rather
they need to be uploaded to s3 where the lambda process can then download.  If you're processing files quite closely
together, the lambda container may still be around and so the virus definitions won't need to be re-downloaded.

Requirements
---
1. AWS Account Configured with:
   1. S3 Bucket to trigger events
   1. SNS Topic for notification
   1. IAM Resources
      1. A IAM user for Node Lambda deployment with an access key/secret
         * Quick Start: `AWSLambdaFullAccess`
      1. A `lambda_exec` role
         * IAM/Roles/New Role
         * AWS Lambda Service Type
         * Quick Start: Add Policies: `AmazonS3ReadOnlyAccess` & `AmazonSNSFullAccess`
         * Better Security: Publish Access to your SNS Topic Arn & `ListBuckets`/`GetObject` Access to your S3 Buckets that you want to scan
         * CloudWatch is very useful for debugging - you will need to add permissions for that as well if desired.
1. NodeJS installed

Installation
---
1. Clone this repo `git clone https://github.com/PeerJ/slamscan.git`
1. Configure your SNS topic arn in `config/default.json`
1. Run `npm install`

Clamscan
---
Clamscan is currently the only supported virus scanning engine and need to be configured to
run under AWS Lambda.
1. Start an amazon image
1. Login and run `sudo yum groupinstall "Development Tools"`
1. Run `sudo yum install openssl openssl-devel`
1. Download latest package and untarzip
1. Run `./configure --enable-static=yes --enable-shared=no --disable-unrar --prefix=/var/task`
1. Run `make`
1. Run `sudo make install`
1. Copy files to the same relative folder names in `slamscan/bin` & `slamscan/lib64`
   * `/var/task/bin/clamscan`
   * `/var/task/lib64/*`
   * `/var/task/lib64/pkgconfig/*`

You'll now need to update the virus definition files
1. You probably want to change ownership to ec2-user. `sudo chown -R ec2-user /var/task`
1. `cp /var/task/etc/freshclam.conf.sample /var/task/etc/freshclam.conf` and update
   * Minimally, you'll need to adjust the line below `#Comment or remove the line below`
1. `mkdir /var/task/share/clamav`
1. `/var/task/bin/freshclam`
1. You'll need to upload the files from `/var/task/bin/freshclam` to a location in s3.
   You'll need to make sure that the `lambda_exec_role` has read permission to these files, or alternatively, just
   give everyone read access.

You can verify that it works
1. `/var/task/bin/clamscan /var/task/test/resources/EICAR-AV-Test`
   * Should return `/var/task/test/resources/EICAR-AV-Test: Eicar-Test-Signature FOUND`

Deployment
---
Node Lambda is strongly encouraged for deployment as its much quicker.  Alternatively, you can manually zip up and upload.
1. Run `./node_modules/node-lambda/bin/node-lambda setup` or alternatively configure your .env file as per node-lambda requirements.
   1. **.env is gitignored.  For you own sake, please DO NOT check in your aws credentials**
   1. You should base the timeouts on our expected max filesize upload. Running clamscan locally on a reasonably powerful
      laptop, clamscan takes 9seconds to run a simple text file, so a minimum of around 20s and most likely around 45-60s.
      Memory is less of a issue and 128mb should be ok in most cases.
1. Run `./node_modules/node-lambda/bin/node-lambda deploy`

S3 Bucket Configuration
---
Once you deploy your lambda function, make a note of the arn.  Go to your s3 bucket properties and add under Events.
You'll most likely want to subscribe to at least put requests.

Local Testing
---
If you edit, `event.json` to change to your s3 bucket with an existing file, you can verify that you're able
to download from s3, run a clamscan locally, and publish to your sns topic.  However, this will use the account
credentials of the aws user in the .env, so they would also need the permissions that the lambda_exec_role has.
Run `./node_modules/node-lambda/bin/node-lambda run` to do so.

Tests
---
There is a test suit that can be run by `npm test`.

Contributing
---
Pull requests welcome.  Please ensure existing standards and tests pass.

