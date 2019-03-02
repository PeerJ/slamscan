import {expect} from "chai";
import sinon from "sinon";
import temp from "temp";
import {cleanupTempFiles} from "../../../../../src/lib";

describe("cleanupTempFiles", function () {
    beforeEach(function () {
        sinon.stub(temp, "cleanup").yields(null);
    });

    afterEach(function () {
        temp.cleanup.restore();
    });

    it("defers to `temp.cleanup`", function () {
        return cleanupTempFiles()
            .then(() => {
                expect(temp.cleanup.callCount).to.eql(1);
            });
    });

    it("propagates errors", function () {
        temp.cleanup.restore();
        sinon.stub(temp, "cleanup").yields(new Error("woof"));

        return cleanupTempFiles()
            .then(() => {
                throw new Error("Wtf? This should've thrown");
            })
            .catch(error => {
                expect(temp.cleanup.callCount).to.eql(1);
                expect(error.message).to.eql("woof");
            });
    });
});
