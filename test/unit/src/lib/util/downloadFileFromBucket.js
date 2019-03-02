import {expect} from "chai";
import fs from "fs";
import sinon from "sinon";
import {Writable} from "stream";
import {downloadFileFromBucket} from "../../../../../src/lib/util/downloadFileFromBucket";
import Aws from "../../../../../src/serverless/aws";

describe("downloadFileFromBucket", function () {
    let s3GetObjectStub;
    let s3CreateReadStreamStub;
    let s3PipeStub;
    let filePathFileStreamStub;
    let fsFileStreamStub;
    let s3ClientStubClass;

    beforeEach(function () {
        s3GetObjectStub = sinon.stub();
        s3CreateReadStreamStub = sinon.stub();
        s3PipeStub = sinon.stub();
        filePathFileStreamStub = new Writable({
            write: () => {
            }
        });
        fsFileStreamStub = sinon.stub().returns(filePathFileStreamStub);

        s3ClientStubClass = class StubS3Client {
            constructor(error) {
                this.error = error || false;
            }

            createReadStream(...args) {
                s3CreateReadStreamStub.apply(this, args);
                return this;
            }

            pipe(...args) {
                s3PipeStub.apply(this, args);

                setTimeout(() => {
                    if (this.error) {
                        filePathFileStreamStub.emit("error", this.error);
                    } else {
                        filePathFileStreamStub.emit("close");
                    }
                }, 50);

                return filePathFileStreamStub;
            }

            getObject(...args) {
                s3GetObjectStub.apply(this, args);
                return this;
            }
        };

        sinon.stub(Aws, "S3").returns(new s3ClientStubClass());
        sinon.stub(fs, "createWriteStream").returns(fsFileStreamStub);
    });

    afterEach(function () {
        Aws.S3.restore();
        fs.createWriteStream.restore();
    });

    it("should return a temp file", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "meow"
        };
        const stubFilePath = "grr";

        return downloadFileFromBucket(stubBucketAndKey.Bucket, stubBucketAndKey.Key, stubFilePath)
            .then(filePath => {
                expect(filePath).to.eql(stubFilePath);

                expect(s3GetObjectStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(s3GetObjectStub, stubBucketAndKey);

                expect(s3CreateReadStreamStub.calledOnce).to.eql(true);

                expect(s3PipeStub.calledOnce).to.eql(true);
                expect(fs.createWriteStream.calledOnce).to.eql(true);
            });
    });

    it("should `decodeURIComponent` on the key", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "folder/file%3Awith%3Acolons"
        };
        const stubFilePath = "grr";

        return downloadFileFromBucket(stubBucketAndKey.Bucket, stubBucketAndKey.Key, stubFilePath)
            .then(filePath => {
                expect(filePath).to.eql(stubFilePath);

                expect(s3GetObjectStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(s3GetObjectStub, {
                    Bucket: stubBucketAndKey.Bucket,
                    Key: decodeURIComponent(stubBucketAndKey.Key)
                });

                expect(s3CreateReadStreamStub.calledOnce).to.eql(true);

                expect(s3PipeStub.calledOnce).to.eql(true);
                expect(fs.createWriteStream.calledOnce).to.eql(true);
            });
    });

    it("propagates errors", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "folder/file%3Awith%3Acolons"
        };
        const stubFilePath = "grr";

        Aws.S3.restore();
        sinon.stub(Aws, "S3").returns(new s3ClientStubClass(new Error("woof")));

        return downloadFileFromBucket(stubBucketAndKey.Bucket, stubBucketAndKey.Key, stubFilePath)
            .then(() => {
                throw new Error("Wtf? This should've thrown");
            })
            .catch(error => {
                expect(error.message).to.eql("woof");

                expect(s3GetObjectStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(s3GetObjectStub, {
                    Bucket: stubBucketAndKey.Bucket,
                    Key: decodeURIComponent(stubBucketAndKey.Key)
                });

                expect(s3CreateReadStreamStub.calledOnce).to.eql(true);

                expect(s3PipeStub.calledOnce).to.eql(true);
                expect(fs.createWriteStream.calledOnce).to.eql(true);
            });
    });
});
