import {expect} from "chai";
import sinon from "sinon";
import {putTagsOnS3Object} from "../../../../../src/lib/util/putTagsOnS3Object";
import Aws from "../../../../../src/serverless/aws";

describe("putTagsOnS3Object", function () {
    let S3PutObjectTaggingStub;
    let S3PromiseStub;
    let S3ClientStubClass;

    beforeEach(function () {
        S3PromiseStub = sinon.stub();
        S3PutObjectTaggingStub = sinon.stub();

        S3ClientStubClass = class StubS3Client {
            constructor(error) {
                this.error = error || false;
            }

            putObjectTagging(...args) {
                S3PutObjectTaggingStub.apply(this, args);
                return this;
            }

            promise(...args) {
                S3PromiseStub.apply(this, args);

                if (this.error) {
                    return Promise.reject(this.error);
                }

                return Promise.resolve();
            }
        };

        sinon.stub(Aws, "S3").returns(new S3ClientStubClass());
    });

    afterEach(function () {
        Aws.S3.restore();
    });

    it("delegates to `putObjectTagging`", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "meow",
            Tagging: {
                TagSet: [
                    {
                        Key: "rawr",
                        Value: "grr"
                    },
                    {
                        Key: "arf",
                        Value: "ruff"
                    }
                ]
            }
        };

        return putTagsOnS3Object(stubBucketAndKey.Bucket, stubBucketAndKey.Key, stubBucketAndKey.Tagging.TagSet.reduce((tagsMap, tagTuple) => {
            tagsMap[tagTuple.Key] = tagTuple.Value;
            return tagsMap;
        }, {}))
            .then(() => {
                expect(S3PutObjectTaggingStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(S3PutObjectTaggingStub, stubBucketAndKey);
            });
    });

    it("stringifies `Value`s", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "meow",
            Tagging: {
                TagSet: [
                    {
                        Key: "rawr",
                        Value: true
                    },
                    {
                        Key: "arf",
                        Value: 1
                    }
                ]
            }
        };

        return putTagsOnS3Object(stubBucketAndKey.Bucket, stubBucketAndKey.Key, stubBucketAndKey.Tagging.TagSet.reduce((tagsMap, tagTuple) => {
            tagsMap[tagTuple.Key] = String(tagTuple.Value);
            return tagsMap;
        }, {}))
            .then(() => {
                expect(S3PutObjectTaggingStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(S3PutObjectTaggingStub, {
                    ...stubBucketAndKey,
                    Tagging: {
                        ...stubBucketAndKey.Tagging,
                        TagSet: stubBucketAndKey.Tagging.TagSet.map(tag => {
                            return {
                                ...tag,
                                Value: String(tag.Value)
                            };
                        })
                    }
                });
            });
    });

    it("propagates errors", function () {
        const stubBucketAndKey = {
            Bucket: "woof",
            Key: "meow",
            Tagging: {
                TagSet: [
                    {
                        Key: "rawr",
                        Value: "grr"
                    },
                    {
                        Key: "arf",
                        Value: "ruff"
                    }
                ]
            }
        };

        Aws.S3.restore();
        sinon.stub(Aws, "S3").returns(new S3ClientStubClass(new Error("woof")));

        return putTagsOnS3Object(stubBucketAndKey.Bucket, stubBucketAndKey.Key, stubBucketAndKey.Tagging.TagSet.reduce((tagsMap, tagTuple) => {
            tagsMap[tagTuple.Key] = tagTuple.Value;
            return tagsMap;
        }, {}))
            .then(() => {
                throw new Error("Wtf? This should've thrown");
            })
            .catch(error => {
                expect(error.message).to.eql("woof");

                expect(S3PutObjectTaggingStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(S3PutObjectTaggingStub, stubBucketAndKey);
            });
    });
});
