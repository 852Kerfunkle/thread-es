import { expect, assert } from "@esm-bundle/chai"
import { EsThread } from "../src/controller";
import { Transfer } from "../src/shared";
import { delay } from "../src/shared/Utils";
import { HelloWorldApiType } from "./threads/hello-world.worker"
import { TransferArrayApiType } from "./threads/transfer-array.worker";
import { AsyncHelloWorldApiType } from "./threads/async-api.worker";
import { ThrowHelloWorldApiType } from "./threads/throw.worker";
import { LongRunningApiType } from "./threads/long-running.worker";
import { RejectApiType } from "./threads/reject.worker";
import { TransferObjectWithArrayApiType } from "./threads/transfer-object-with-array.worker";

type TestWorkerType = new (scriptURL: string | URL, options?: WorkerOptions) => (Worker | SharedWorker);

export function genericWorkerTests(WorkerType: TestWorkerType) {
    describe(`Generic ${WorkerType.name} tests`, () => {
        it("Basic", async () => {
            const thread = await EsThread.Spawn<HelloWorldApiType>(
                new WorkerType(new URL("threads/hello-world.worker.ts", import.meta.url),
                {type: "module"}));

            expect(thread).to.not.be.undefined;
            expect(thread.methods.helloWorld).to.not.be.undefined;

            expect(await thread.methods.helloWorld()).to.be.eq("Hello World!");

            await thread.terminate();
        });

        it("Throws", async () => {
            const thread = await EsThread.Spawn<ThrowHelloWorldApiType>(
                new WorkerType(new URL("threads/throw.worker.ts", import.meta.url),
                {type: "module"}));

            expect(thread).to.not.be.undefined;
            expect(thread.methods.helloWorld).to.not.be.undefined;

            try {
                await thread.methods.helloWorld();
                assert(false);
            }
            catch(e) {
                assert(e.toString() === "Error: Hello World!");
            }

            await thread.terminate();
        });

        it("Unhandled rejection", async () => {
            const thread = await EsThread.Spawn<RejectApiType>(
                new WorkerType(new URL("threads/reject.worker.ts", import.meta.url),
                {type: "module"}));
            await delay(500);

            // "Error: it had to happen eventually"
            // NOTE: currently there is no way to deal with unhandled rejections.
            // Maybe need some event for it.
            thread.terminate();
        });

        it("With transfer", async () => {
            const thread = await EsThread.Spawn<TransferArrayApiType>(
                new WorkerType(new URL("threads/transfer-array.worker.ts", import.meta.url),
                {type: "module"}));

            expect(thread).to.not.be.undefined;
            expect(thread.methods.transferArray).to.not.be.undefined;

            const arrayIn = new Uint8Array(10);
            arrayIn.forEach((value, index) => { arrayIn[index] = index });

            const arrayOut = await thread.methods.transferArray(Transfer(arrayIn.buffer));

            expect(arrayOut.byteLength).to.be.eq(10);
            expect(new Uint8Array(arrayOut)).to.be.eql(new Uint8Array([0,3,6,9,12,15,18,21,24,27]));

            await thread.terminate();
        });

        it("With complex transfer", async () => {
            const thread = await EsThread.Spawn<TransferObjectWithArrayApiType>(
                new WorkerType(new URL("threads/transfer-object-with-array.worker.ts", import.meta.url),
                {type: "module"}));

            expect(thread).to.not.be.undefined;
            expect(thread.methods.transferObjectWithArray).to.not.be.undefined;

            const arrayIn = new Uint8Array(10);
            arrayIn.forEach((value, index) => { arrayIn[index] = index });
            const objectIn = {array: arrayIn.buffer}

            const objectOut = await thread.methods.transferObjectWithArray(Transfer(objectIn, [objectIn.array]));

            expect(objectOut.array.byteLength).to.be.eq(10);
            expect(new Uint8Array(objectOut.array)).to.be.eql(new Uint8Array([0,2,4,6,8,10,12,14,16,18]));

            await thread.terminate();
        });

        it("Async api", async () => {
            const thread = await EsThread.Spawn<AsyncHelloWorldApiType>(
                new WorkerType(new URL("threads/async-api.worker.ts", import.meta.url),
                {type: "module"}));

            expect(thread).to.not.be.undefined;
            expect(thread.methods.helloWorld).to.not.be.undefined;

            expect(await thread.methods.helloWorld()).to.be.eq("Hello World!");

            await thread.terminate();
        });

        it("Long-running", async () => {
            const thread = await EsThread.Spawn<LongRunningApiType>(
                new WorkerType(new URL("threads/long-running.worker.ts", import.meta.url),
                {type: "module"}));

            expect(thread).to.not.be.undefined;
            expect(thread.methods.takesTime).to.not.be.undefined;

            const result = thread.methods.takesTime(250);
            expect(thread.numQueuedJobs).to.be.eq(1);
            await thread.settled();
            expect(thread.numQueuedJobs).to.be.eq(0);

            expect(await result).to.be.eq("Hello World!");

            await thread.terminate();
        });
    });
}