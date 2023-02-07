import { Transfer, TransferDescriptor } from "../../src/shared/TransferDescriptor";
import { exposeApi } from "../../src/worker/Worker"

const transferObjectWithArrayApi = {
    transferObjectWithArray: (object: TransferDescriptor<{array: ArrayBuffer}>): TransferDescriptor<{array: ArrayBuffer}> => {
        const uint8 = new Uint8Array(object.send.array);
        uint8.forEach((value, index) => {
            uint8[index] = value * 2;
        });
        console.log(uint8)
        const res = {array: uint8.buffer};
        return Transfer(res, [res.array]);
    }
}

export type TransferObjectWithArrayApiType = typeof transferObjectWithArrayApi;

exposeApi(transferObjectWithArrayApi);