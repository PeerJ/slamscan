import {expect} from "chai";
import fs from "fs";
import path from "path";
import sinon from "sinon";
import {CLAMSCAN_DB_FILES} from "../../../../src/lib/clamscan";
import {
    downloadClamscanDbFileFromS3,
    downloadClamscanDbFilesFromS3
} from "../../../../src/lib/downloadClamscanDbFilesFromS3";
import * as downloadFileFromBucketModule from "../../../../src/lib/util/downloadFileFromBucket";

describe("downloadClamscanDbFilesFromS3", function () {
    beforeEach(function () {
        sinon.stub(fs, "access").yields(new Error("woof"));
        sinon.stub(downloadFileFromBucketModule, "downloadFileFromBucket").callsFake((bucket, key, localFilePath) => Promise.resolve(localFilePath));
    });

    afterEach(function () {
        fs.access.restore();
        downloadFileFromBucketModule.downloadFileFromBucket.restore();
    });

    it("delegates to `downloadClamscanDbFileFromS3`", function () {
        return downloadClamscanDbFilesFromS3()
            .then(localFilePaths => {
                expect(localFilePaths).to.eql(CLAMSCAN_DB_FILES.map(dbFile => path.join(process.env.SLAMSCAN_CLAMSCAN_DB_PATH, dbFile)));

                expect(downloadFileFromBucketModule.downloadFileFromBucket.callCount).to.eql(CLAMSCAN_DB_FILES.length);
            });
    });

    describe("downloadClamscanDbFileFromS3", function () {
        it("delegates to `downloadFileFromBucket` if file is not found", function () {
            const stubFile = "meow";

            return downloadClamscanDbFileFromS3(stubFile)
                .then(localFilePath => {
                    expect(localFilePath).to.eql(path.join(process.env.SLAMSCAN_CLAMSCAN_DB_PATH, stubFile));

                    sinon.assert.calledOnce(downloadFileFromBucketModule.downloadFileFromBucket);
                    sinon.assert.calledWith(downloadFileFromBucketModule.downloadFileFromBucket, process.env.SLAMSCAN_CLAMSCAN_DB_BUCKET, stubFile, localFilePath);
                });
        });

        it("does nothing if file is found", function () {
            fs.access.restore();
            sinon.stub(fs, "access").yields(null);

            const stubFile = "meow";

            return downloadClamscanDbFileFromS3(stubFile)
                .then(localFilePath => {
                    expect(localFilePath).to.eql(path.join(process.env.SLAMSCAN_CLAMSCAN_DB_PATH, stubFile));

                    sinon.assert.notCalled(downloadFileFromBucketModule.downloadFileFromBucket);
                });
        });
    });
});
