import {expect} from "chai";
import sinon from "sinon";
import {notifySns} from "../../../../../src/lib/util/notifySns";
import Aws from "../../../../../src/serverless/aws";

describe("notifySns", function () {
    let snsPublishStub;
    let snsPromiseStub;
    let snsClientStubClass;

    beforeEach(function () {
        snsPromiseStub = sinon.stub();
        snsPublishStub = sinon.stub();

        snsClientStubClass = class StubSnsClient {
            constructor(error) {
                this.error = error || false;
            }

            publish(...args) {
                snsPublishStub.apply(this, args);
                return this;
            }

            promise(...args) {
                snsPromiseStub.apply(this, args);

                if (this.error) {
                    return Promise.reject(this.error);
                }

                return Promise.resolve();
            }
        };

        sinon.stub(Aws, "SNS").returns(new snsClientStubClass());
    });

    afterEach(function () {
        Aws.SNS.restore();
    });

    it("should return a temp file", function () {
        const stubTopicArnAndMessage = {
            TopicArn: "woof",
            Message: "meow"
        };

        return notifySns(stubTopicArnAndMessage.TopicArn, stubTopicArnAndMessage.Message)
            .then(() => {
                expect(snsPublishStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(snsPublishStub, stubTopicArnAndMessage);
            });
    });

    it("propagates errors", function () {
        const stubTopicArnAndMessage = {
            TopicArn: "woof",
            Message: "meow"
        };

        Aws.SNS.restore();
        sinon.stub(Aws, "SNS").returns(new snsClientStubClass(new Error("woof")));

        return notifySns(stubTopicArnAndMessage.TopicArn, stubTopicArnAndMessage.Message)
            .then(() => {
                throw new Error("Wtf? This should've thrown");
            })
            .catch(error => {
                expect(error.message).to.eql("woof");

                expect(snsPublishStub.calledOnce).to.eql(true);
                sinon.assert.calledWith(snsPublishStub, stubTopicArnAndMessage);
            });
    });
});
