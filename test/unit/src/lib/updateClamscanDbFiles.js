import {expect} from "chai";
import childProcess from "child_process";
import md5 from "md5";
import path from "path";
import sinon from "sinon";
import * as clamscanModule from "../../../../src/lib/clamscan";
import {S3_FILE_CONTENT_MD5_TAG} from "../../../../src/lib/constants";
import {
    downloadClamscanDbFilesFromFreshclam,
    updateClamscanDbFiles,
    uploadClamscanDbFile,
    uploadClamscanDbFileIfNecessary
} from "../../../../src/lib/updateClamscanDbFiles";
import * as cleanupTempFilesModule from "../../../../src/lib/util/cleanupTempFiles";
import * as createTempDirectoryModule from "../../../../src/lib/util/createTempDirectory";
import * as getTagsForFileInBucketModule from "../../../../src/lib/util/getTagsForFileInBucket";
import * as readFileModule from "../../../../src/lib/util/readFile";
import * as uploadFileToBucketModule from "../../../../src/lib/util/uploadFileToBucket";

describe("updateClamscanDbFiles", function () {
    let stubFileValue;
    let stubDirectory;

    beforeEach(function () {
        stubDirectory = "/tmp/dir";
        stubFileValue = "woof";

        sinon.stub(childProcess, "exec").yields(null, null, null);
        sinon.stub(clamscanModule, "scanFile").returns(Promise.resolve(false));
        sinon.stub(createTempDirectoryModule, "createTempDirectory").returns(Promise.resolve(stubDirectory));
        sinon.stub(uploadFileToBucketModule, "uploadFileToBucket").callsFake((bucket, key, localFilePath) => Promise.resolve(localFilePath));
        sinon.stub(readFileModule, "readFile").returns(Promise.resolve(stubFileValue));
        sinon.stub(cleanupTempFilesModule, "cleanupTempFiles").returns(Promise.resolve());
        sinon.stub(getTagsForFileInBucketModule, "getTagsForFileInBucket").returns(Promise.resolve([
            {Key: S3_FILE_CONTENT_MD5_TAG, Value: md5(stubFileValue)}
        ]));
    });

    afterEach(function () {
        childProcess.exec.restore();
        clamscanModule.scanFile.restore();
        createTempDirectoryModule.createTempDirectory.restore();
        uploadFileToBucketModule.uploadFileToBucket.restore();
        readFileModule.readFile.restore();
        cleanupTempFilesModule.cleanupTempFiles.restore();
        getTagsForFileInBucketModule.getTagsForFileInBucket.restore();
    });

    describe("downloadClamscanDbFilesFromFreshclam", function () {
        it("does as it says", function () {
            const expectedCommand = [
                process.env.SLAMSCAN_FRESHCLAM_BINARY_PATH,
                "--config-file=$SLAMSCAN_FRESHCLAM_CONFIG_PATH",
                "--user=$(whoami)",
                `--datadir=${stubDirectory}`
            ].join(" ");

            return downloadClamscanDbFilesFromFreshclam(stubDirectory)
                .then(() => {
                    sinon.assert.calledOnce(childProcess.exec);
                    sinon.assert.calledWith(childProcess.exec, expectedCommand);
                });
        });

        it("propagates errors", function () {
            const expectedCommand = [
                process.env.SLAMSCAN_FRESHCLAM_BINARY_PATH,
                "--config-file=$SLAMSCAN_FRESHCLAM_CONFIG_PATH",
                "--user=$(whoami)",
                `--datadir=${stubDirectory}`
            ].join(" ");

            childProcess.exec.restore();
            sinon.stub(childProcess, "exec").yields(new Error("woof"), "meow", "grr");

            return downloadClamscanDbFilesFromFreshclam(stubDirectory)
                .then(() => {
                    throw new Error("Wtf? This should've thrown?");
                })
                .catch(error => {
                    expect(error.message).to.eql("woof");

                    sinon.assert.calledOnce(childProcess.exec);
                    sinon.assert.calledWith(childProcess.exec, expectedCommand);
                });
        });
    });

    describe("uploadClamscanDbFile", function () {
        it("delegates to `uploadFileToBucket`", function () {
            const stubDbFilename = "woof";
            const expectedDbFilePath = path.join(stubDirectory, stubDbFilename);

            return uploadClamscanDbFile(stubDirectory, stubDbFilename)
                .then(dbFilePath => {
                    expect(dbFilePath).to.eql(expectedDbFilePath);

                    sinon.assert.calledOnce(uploadFileToBucketModule.uploadFileToBucket);
                    sinon.assert.calledWith(uploadFileToBucketModule.uploadFileToBucket, process.env.SLAMSCAN_CLAMSCAN_DB_BUCKET, stubDbFilename, expectedDbFilePath);
                });
        });
    });

    describe("uploadClamscanDbFileIfNecessary", function () {
        it("does as it says (no upload)", function () {
            const stubDbFilename = "woof";
            const expectedDbFilePath = path.join(stubDirectory, stubDbFilename);

            return uploadClamscanDbFileIfNecessary(stubDirectory, stubDbFilename)
                .then(dbFilePath => {
                    expect(dbFilePath).to.eql(expectedDbFilePath);

                    sinon.assert.calledOnce(readFileModule.readFile);
                    sinon.assert.calledWith(readFileModule.readFile, dbFilePath);

                    sinon.assert.calledOnce(getTagsForFileInBucketModule.getTagsForFileInBucket);
                    sinon.assert.calledWith(getTagsForFileInBucketModule.getTagsForFileInBucket, process.env.SLAMSCAN_CLAMSCAN_DB_BUCKET, stubDbFilename);

                    sinon.assert.notCalled(uploadFileToBucketModule.uploadFileToBucket);
                });
        });

        it("does as it says (uploads)", function () {
            readFileModule.readFile.restore();
            sinon.stub(readFileModule, "readFile").returns(Promise.resolve("meow"));

            const stubDbFilename = "woof";
            const expectedDbFilePath = path.join(stubDirectory, stubDbFilename);

            return uploadClamscanDbFileIfNecessary(stubDirectory, stubDbFilename)
                .then(dbFilePath => {
                    expect(dbFilePath).to.eql(expectedDbFilePath);

                    sinon.assert.calledOnce(readFileModule.readFile);
                    sinon.assert.calledWith(readFileModule.readFile, dbFilePath);

                    sinon.assert.calledOnce(getTagsForFileInBucketModule.getTagsForFileInBucket);
                    sinon.assert.calledWith(getTagsForFileInBucketModule.getTagsForFileInBucket, process.env.SLAMSCAN_CLAMSCAN_DB_BUCKET, stubDbFilename);

                    sinon.assert.calledOnce(uploadFileToBucketModule.uploadFileToBucket);
                    sinon.assert.calledWith(uploadFileToBucketModule.uploadFileToBucket, process.env.SLAMSCAN_CLAMSCAN_DB_BUCKET, stubDbFilename, expectedDbFilePath);
                });
        });
    });

    it("does as it says", function () {
        return updateClamscanDbFiles()
            .then(() => {
                sinon.assert.calledOnce(createTempDirectoryModule.createTempDirectory);

                sinon.assert.calledOnce(childProcess.exec);

                expect(readFileModule.readFile.callCount).to.eql(clamscanModule.CLAMSCAN_DB_FILES.length);
                expect(getTagsForFileInBucketModule.getTagsForFileInBucket.callCount).to.eql(clamscanModule.CLAMSCAN_DB_FILES.length);
                clamscanModule.CLAMSCAN_DB_FILES.forEach(dbFilename => {
                    sinon.assert.calledWith(readFileModule.readFile, path.join(stubDirectory, dbFilename));
                    sinon.assert.calledWith(getTagsForFileInBucketModule.getTagsForFileInBucket, process.env.SLAMSCAN_CLAMSCAN_DB_BUCKET, dbFilename);
                });

                sinon.assert.calledOnce(cleanupTempFilesModule.cleanupTempFiles);
            });
    });
});
