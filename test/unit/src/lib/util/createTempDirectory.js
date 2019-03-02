import {expect} from "chai";
import sinon from "sinon";
import temp from "temp";
import {createTempDirectory} from "../../../../../src/lib";

describe("createTempDirectory", function () {
    beforeEach(function () {
        sinon.stub(temp, "mkdir").yields(null);
    });

    afterEach(function () {
        temp.mkdir.restore();
    });

    it("defers to `temp.mkdir`", function () {
        return createTempDirectory()
            .then(() => {
                expect(temp.mkdir.callCount).to.eql(1);
            });
    });

    it("propagates errors", function () {
        temp.mkdir.restore();
        sinon.stub(temp, "mkdir").yields(new Error("woof"));

        return createTempDirectory()
            .then(() => {
                throw new Error("Wtf? This should've thrown");
            })
            .catch(error => {
                expect(temp.mkdir.callCount).to.eql(1);
                expect(error.message).to.eql("woof");
            });
    });
});
