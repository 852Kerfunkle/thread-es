import { expect, assert } from "@esm-bundle/chai"
import { Transfer } from "../src/shared";
import { assertMessageEvent, ControllerTaskRunMessage, ControllerMessageType,
    isControllerTaskRunMessage, isControllerTerminateMessage,
    ControllerTerminateMessage } from "../src/shared/Messages";
import { assertSharedWorkerScope, assertWorkerScope, isDedicatedWorkerScope,
    isSharedWorkerContext, isSharedWorkerScope, isWorkerScope } from "../src/worker/Utils";

describe("Other tests", () => {
    it("Transfer non-transferrable fails", () => {
        const payload = {nonTransferable: "should fail"};
        // @ts-expect-error: test case
        expect(() => Transfer(payload, [payload.nonTransferable])).to.throw("Object is not transferable");
    });

    it("Transfer non-transferrable fails implicit", () => {
        const payload = "should fail";
        // @ts-expect-error: test case
        expect(() => Transfer(payload)).to.throw("Object is not transferable");
    });

    it("Test messages", () => {
        // @ts-expect-error: test case
        expect(isControllerTaskRunMessage({})).to.be.false;
        expect(isControllerTaskRunMessage({type: ControllerMessageType.Run, uid: "uid", method: "test", args: []} as ControllerTaskRunMessage)).to.be.eq(true);
        // @ts-expect-error: test case
        expect(isControllerTerminateMessage({})).to.be.false;
        expect(isControllerTerminateMessage({type: ControllerMessageType.Terminate} as ControllerTerminateMessage)).to.be.eq(true);

        expect(() => assertMessageEvent(new Event("error"))).to.throw("Not MessageEvent");
    });

    it("Test scope/context functions failing in Window context", async () => {
        // None of these should ever be true or not throw in Window context.
        expect(isWorkerScope(self)).to.be.false;
        // @ts-expect-error: test case
        expect(isDedicatedWorkerScope(self)).to.be.false;
        // @ts-expect-error: test case
        expect(isSharedWorkerScope(self)).to.be.false;
        // @ts-expect-error: test case
        expect(isSharedWorkerContext(self)).to.be.false;

        expect(() => assertWorkerScope(self)).to.throw("Not in a WebWorker");
        // @ts-expect-error: test case
        expect(() => assertSharedWorkerScope(self)).to.throw("Not in a shared web worker");

        // Don't test Worker stuff for now. Until there's a polyfill.
        //expect(() => exposeApi({test: () => {}})).to.throw("Not in a WebWorker");
    });
});