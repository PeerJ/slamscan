import {expect} from "chai";
import sinon from "sinon";
import {getTagsForFileInBucket} from "../../../../../src/lib/util/getTagsForFileInBucket";
import Aws from "../../../../../src/serverless/aws";

describe("getTagsForFileInBucket", function () {
    let s3GetObjectTaggingStub;
    let s3PromiseStub;
    let s3TagSetDataStub;
    let s3ClientStubClass;

    beforeEach(function () {
        s3TagSetDataStub = {
            TagSet: [
                "woof",
                "meow",
                "grr"
            ]
        };
        s3PromiseStub = sinon.stub();
        s3GetObjectTaggingStub = sinon.stub();

        s3ClientStubClass = class StubS3Client {
            constructor(error, data = s3TagSetDataStub) {
                this.error = error || false;
                this.data = data || {};
            }

            getObjectTagging(...args) {
                s3GetObjectTaggingStub.apply(this, args);
                return this;
            }

            promise(...args) {
                s3PromiseStub.apply(this, args);

                if (this.error) {
                    return Promise.reject(this.error);
                }

                return Promise.resolve(this.data);
            }
        };

        sinon.stub(Aws, "S3").returns(new s3ClientStubClass());
    });

    afterEach(function () {
        Aws.S3.restore();
    });

    it("should return a temp file", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "meow"
        };

        return getTagsForFileInBucket(stubBucketAndKey.Bucket, stubBucketAndKey.Key)
            .then(tags => {
                expect(tags).to.eql(s3TagSetDataStub.TagSet);

                expect(s3GetObjectTaggingStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(s3GetObjectTaggingStub, stubBucketAndKey);
            });
    });

    it("should `decodeURIComponent` on the key", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "folder/file%3Awith%3Acolons"
        };

        return getTagsForFileInBucket(stubBucketAndKey.Bucket, stubBucketAndKey.Key)
            .then(tags => {
                expect(tags).to.eql(s3TagSetDataStub.TagSet);

                expect(s3GetObjectTaggingStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(s3GetObjectTaggingStub, {
                    Bucket: stubBucketAndKey.Bucket,
                    Key: decodeURIComponent(stubBucketAndKey.Key)
                });
            });
    });

    it("propagates errors", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "folder/file%3Awith%3Acolons"
        };

        Aws.S3.restore();
        sinon.stub(Aws, "S3").returns(new s3ClientStubClass(new Error("woof")));

        return getTagsForFileInBucket(stubBucketAndKey.Bucket, stubBucketAndKey.Key)
            .then(() => {
                throw new Error("Wtf? This should've thrown");
            })
            .catch(error => {
                expect(error.message).to.eql("woof");

                expect(s3GetObjectTaggingStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(s3GetObjectTaggingStub, {
                    Bucket: stubBucketAndKey.Bucket,
                    Key: decodeURIComponent(stubBucketAndKey.Key)
                });
            });
    });
});
