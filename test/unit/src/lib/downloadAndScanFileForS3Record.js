import sinon from "sinon";
import * as clamscanModule from "../../../../src/lib/clamscan";
import {downloadAndScanFileForS3Record} from "../../../../src/lib/downloadAndScanFileForS3Record";
import * as cleanupTempFilesModule from "../../../../src/lib/util/cleanupTempFiles";
import * as downloadFileFromBucketModule from "../../../../src/lib/util/downloadFileFromBucket";
import * as notifySnsModule from "../../../../src/lib/util/notifySns";
import * as putTagsOnS3ObjectModule from "../../../../src/lib/util/putTagsOnS3Object";
import cleanRecord from "../../../resources/records/clean";

describe("downloadAndScanFileForS3Record", function () {
    beforeEach(function () {
        sinon.stub(clamscanModule, "scanFile").returns(Promise.resolve(false));
        sinon.stub(cleanupTempFilesModule, "cleanupTempFiles").returns(Promise.resolve());
        sinon.stub(downloadFileFromBucketModule, "downloadFileFromBucket").callsFake((bucket, key, localFilePath) => Promise.resolve(localFilePath));
        sinon.stub(notifySnsModule, "notifySns").returns(Promise.resolve());
        sinon.stub(putTagsOnS3ObjectModule, "putTagsOnS3Object").returns(Promise.resolve());
    });

    afterEach(function () {
        clamscanModule.scanFile.restore();
        cleanupTempFilesModule.cleanupTempFiles.restore();
        downloadFileFromBucketModule.downloadFileFromBucket.restore();
        notifySnsModule.notifySns.restore();
        putTagsOnS3ObjectModule.putTagsOnS3Object.restore();
    });

    it("does as it says", function () {
        return downloadAndScanFileForS3Record(cleanRecord)
            .then(() => {
                sinon.assert.calledOnce(downloadFileFromBucketModule.downloadFileFromBucket);
                sinon.assert.calledWith(downloadFileFromBucketModule.downloadFileFromBucket, cleanRecord.s3.bucket.name, cleanRecord.s3.object.key);

                sinon.assert.calledOnce(clamscanModule.scanFile);

                sinon.assert.calledOnce(notifySnsModule.notifySns);
                sinon.assert.calledWith(notifySnsModule.notifySns, process.env.SLAMSCAN_SCAN_RESULT_SNS_ARN, JSON.stringify({
                    Bucket: cleanRecord.s3.bucket.name,
                    uri: `s3://${cleanRecord.s3.bucket.name}/${cleanRecord.s3.object.key}`,
                    isInfected: false
                }));

                sinon.assert.calledOnce(cleanupTempFilesModule.cleanupTempFiles);

                sinon.assert.calledTwice(putTagsOnS3ObjectModule.putTagsOnS3Object);
            });
    });
});
