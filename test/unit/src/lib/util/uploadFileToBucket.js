import {expect} from "chai";
import md5 from "md5";
import sinon from "sinon";
import * as readFileModule from "../../../../../src/lib/util/readFile";
import {uploadFileToBucket} from "../../../../../src/lib/util/uploadFileToBucket";
import Aws from "../../../../../src/serverless/aws";

describe("uploadFileToBucket", function () {
    let s3PutObjectStub;
    let readFileContentStub;
    let s3ClientStubClass;

    beforeEach(function () {
        s3PutObjectStub = sinon.stub();
        readFileContentStub = "rawr";

        s3ClientStubClass = class StubS3Client {
            constructor(error) {
                this.error = error || false;
            }

            putObject(...args) {
                s3PutObjectStub.apply(this, args);

                return this;
            }

            promise() {
                if (this.error) {
                    return Promise.reject(this.error);
                } else {
                    return Promise.resolve({
                        ETag: "argh"
                    });
                }
            }
        };

        sinon.stub(Aws, "S3").returns(new s3ClientStubClass());
        sinon.stub(readFileModule, "readFile").returns(Promise.resolve(readFileContentStub));
    });

    afterEach(function () {
        Aws.S3.restore();
        readFileModule.readFile.restore();
    });

    it("should return a temp file", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "meow",
            Body: readFileContentStub,
            Tagging: `MD5=${md5(readFileContentStub)}`
        };
        const stubFilePath = "grr";

        return uploadFileToBucket(stubBucketAndKey.Bucket, stubBucketAndKey.Key, stubFilePath)
            .then(filePath => {
                expect(filePath).to.eql(stubFilePath);

                expect(readFileModule.readFile.calledOnce).to.eql(true);
                sinon.assert.calledWith(readFileModule.readFile, stubFilePath);

                expect(s3PutObjectStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(s3PutObjectStub, stubBucketAndKey);
            });
    });

    it("should `decodeURIComponent` on the key", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "folder/file%3Awith%3Acolons",
            Body: readFileContentStub,
            Tagging: `MD5=${md5(readFileContentStub)}`
        };
        const stubFilePath = "grr";

        return uploadFileToBucket(stubBucketAndKey.Bucket, stubBucketAndKey.Key, stubFilePath)
            .then(filePath => {
                expect(filePath).to.eql(stubFilePath);

                expect(readFileModule.readFile.calledOnce).to.eql(true);
                sinon.assert.calledWith(readFileModule.readFile, stubFilePath);

                expect(s3PutObjectStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(s3PutObjectStub, {
                    ...stubBucketAndKey,
                    Key: decodeURIComponent(stubBucketAndKey.Key)
                });
            });
    });

    it("propagates errors", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "folder/file%3Awith%3Acolons",
            Body: readFileContentStub,
            Tagging: `MD5=${md5(readFileContentStub)}`
        };
        const stubFilePath = "grr";

        Aws.S3.restore();
        sinon.stub(Aws, "S3").returns(new s3ClientStubClass(new Error("woof")));

        return uploadFileToBucket(stubBucketAndKey.Bucket, stubBucketAndKey.Key, stubFilePath)
            .then(() => {
                throw new Error("Wtf? This should've thrown");
            })
            .catch(error => {
                expect(error.message).to.eql("woof");

                expect(readFileModule.readFile.calledOnce).to.eql(true);
                sinon.assert.calledWith(readFileModule.readFile, stubFilePath);

                expect(s3PutObjectStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(s3PutObjectStub, {
                    ...stubBucketAndKey,
                    Key: decodeURIComponent(stubBucketAndKey.Key)
                });
            });
    });
});
