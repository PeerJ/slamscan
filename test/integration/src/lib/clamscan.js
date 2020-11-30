import {expect} from "chai";
import path from "path";
import {scanFile} from "../../../../src/lib";

describe("clamscan", function () {
    describe("scanFile", function () {
        this.timeout(60000);

        it("returns `true` for EICAR-AV-Test", function () {
            const eicarAvTestFile = path.join(__dirname, "../../..", "resources", "EICAR-AV-Test");

            return scanFile(eicarAvTestFile)
                .then(isInfected => {
                    expect(isInfected).to.eql(true);
                });
        });
    });
});
