import {chai, getWrapper} from "serverless-mocha-plugin";
import sinon from "sinon";
import * as updateClamscanDbFilesModule from "../../src/lib/updateClamscanDbFiles";
import failureEvent from "../resources/updateDefinitions/failure.json";
import successEvent from "../resources/updateDefinitions/success.json";

const expect = chai.expect;

describe("updateDefinitions", function () {
    let wrapped;

    beforeEach(function () {
        wrapped = getWrapper("updateDefinitions", "/src/serverless/handlers/updateDefinitions.js", "handler");

        sinon.stub(updateClamscanDbFilesModule, "updateClamscanDbFiles").returns(Promise.resolve());
    });

    afterEach(function () {
        updateClamscanDbFilesModule.updateClamscanDbFiles.restore();
    });

    it("handles success", function () {
        return wrapped.run(successEvent).then(response => {
            expect(response).to.eql(undefined);

            expect(updateClamscanDbFilesModule.updateClamscanDbFiles.callCount).to.eql(1);
        });
    });

    it("handles failure", function () {
        updateClamscanDbFilesModule.updateClamscanDbFiles.restore();
        sinon.stub(updateClamscanDbFilesModule, "updateClamscanDbFiles").returns(Promise.reject(new Error("woof")));

        return wrapped.run(failureEvent)
            .then(() => {
                throw new Error("Wtf? This should've thrown");
            })
            .catch(error => {
                expect(error.message).to.eql("woof");

                expect(updateClamscanDbFilesModule.updateClamscanDbFiles.callCount).to.eql(1);
            });
    });
});
