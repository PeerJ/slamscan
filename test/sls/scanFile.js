import {chai, getWrapper} from "serverless-mocha-plugin";
import sinon from "sinon";
import * as downloadAndScanFileForS3RecordModule from "../../src/lib/downloadAndScanFileForS3Record";
import * as downloadClamscanDbFilesFromS3Module from "../../src/lib/downloadClamscanDbFilesFromS3";
import failureEvent from "../resources/scanFile/failure.json";
import successCleanEvent from "../resources/scanFile/success.clean.json";
import successInfectedEvent from "../resources/scanFile/success.infected.json";

const expect = chai.expect;

describe("scanFile", function () {
    let wrapped;

    beforeEach(function () {
        wrapped = getWrapper("scanFile", "/src/serverless/handlers/scanFile.js", "handler");

        sinon.stub(downloadClamscanDbFilesFromS3Module, "downloadClamscanDbFilesFromS3").returns(Promise.resolve());
        sinon.stub(downloadAndScanFileForS3RecordModule, "downloadAndScanFileForS3Record").returns(Promise.resolve());
    });

    afterEach(function () {
        downloadClamscanDbFilesFromS3Module.downloadClamscanDbFilesFromS3.restore();
        downloadAndScanFileForS3RecordModule.downloadAndScanFileForS3Record.restore();
    });

    it("handles success (clean)", function () {
        return wrapped.run(successCleanEvent).then(response => {
            expect(response).to.eql(undefined);

            expect(downloadClamscanDbFilesFromS3Module.downloadClamscanDbFilesFromS3.callCount).to.eql(1);
            expect(downloadAndScanFileForS3RecordModule.downloadAndScanFileForS3Record.callCount).to.eql(successCleanEvent.Records.length);
        });
    });

    it("handles success (infected)", function () {
        return wrapped.run(successInfectedEvent).then(response => {
            expect(response).to.eql(undefined);

            expect(downloadClamscanDbFilesFromS3Module.downloadClamscanDbFilesFromS3.callCount).to.eql(1);
            expect(downloadAndScanFileForS3RecordModule.downloadAndScanFileForS3Record.callCount).to.eql(successInfectedEvent.Records.length);
        });
    });

    it("handles failure", function () {
        downloadClamscanDbFilesFromS3Module.downloadClamscanDbFilesFromS3.restore();
        sinon.stub(downloadClamscanDbFilesFromS3Module, "downloadClamscanDbFilesFromS3").returns(Promise.reject(new Error("woof")));

        return wrapped.run(failureEvent)
            .then(() => {
                throw new Error("Wtf? This should've thrown");
            })
            .catch(error => {
                expect(error.message).to.eql("woof");

                expect(downloadClamscanDbFilesFromS3Module.downloadClamscanDbFilesFromS3.callCount).to.eql(1);
                expect(downloadAndScanFileForS3RecordModule.downloadAndScanFileForS3Record.callCount).to.eql(0);
            });
    });
});
