import {expect} from "chai";
import fs from "fs";
import sinon from "sinon";
import {readFile} from "../../../../../src/lib";

describe("readFile", function () {
    beforeEach(function () {
        sinon.stub(fs, "readFile").yields(null);
    });

    afterEach(function () {
        fs.readFile.restore();
    });

    it("defers to `fs.readFile`", function () {
        return readFile()
            .then(() => {
                expect(fs.readFile.callCount).to.eql(1);
            });
    });

    it("propagates errors", function () {
        fs.readFile.restore();
        sinon.stub(fs, "readFile").yields(new Error("woof"));

        return readFile()
            .then(() => {
                throw new Error("Wtf? This should've thrown");
            })
            .catch(error => {
                expect(fs.readFile.callCount).to.eql(1);
                expect(error.message).to.eql("woof");
            });
    });
});
