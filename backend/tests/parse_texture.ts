import * as Bytes from '../services/bytes.ts'
import { mobileGearCDN } from '../env.ts'

const urls = [
    "7c899bead553d2da98a195742bb53888.tgxm.bin",
    "86cfe0a97b0fd056b8da4b2caeaf73d2.tgxm.bin",
    "dc775333803a9080911c6b206890ba11.tgxm.bin",
    "f89891ce98f58c494ab77b6805f6bd23.tgxm.bin",
    "be1e3aa93a6bf37aed9642f3059c7f1b.tgxm.bin",
    "328f89f4872e8b903a99d3d3eec17c62.tgxm.bin",
    "db987362e660ae6d3e7ba33d2afaf660.tgxm.bin",
    "48b278072ae73f059c6d3e631732d9a3.tgxm.bin",
    "074d73ef28f2f4c1e8b207e1f4d074e7.tgxm.bin",
    "b500aa106dead46242044b42ddc88660.tgxm.bin",
    "40fee78e82c5a780387e5355f4d4692f.tgxm.bin",
    "52f7ddcda3009bf1f1c2dcc327d29d0f.tgxm.bin",
    "66e65e26792405749df013d5a6c6d0ef.tgxm.bin",
    "2d6167f1fc3323f0ffbaaca232d8020a.tgxm.bin",
    "2940c32d241581d237a12805380dfd54.tgxm.bin",
    "69ee3255ee69c2c20023d60d1de7bce7.tgxm.bin",
    "c989a0c8bfe0a441671046322d1b52d9.tgxm.bin",
    "c391867ce2130eacc0071a75d6d4a9e4.tgxm.bin",
    "44d050e054b4f58ad3372049f4232f14.tgxm.bin",
    "b7c4e5602050ecdb5c21243f0c8dbc61.tgxm.bin",
    "2bec0b17b8ca63f78fd16b4be074d18c.tgxm.bin",
    "6a6618fb9dc1d4785aae354693bb50bd.tgxm.bin",
    "d384ac5ff728941ac19040b347f1638d.tgxm.bin",
    "f916fc808a57012a3675014cd6cb5564.tgxm.bin",
    "b317345eda9429bc7e4748fb3126db9a.tgxm.bin"
]


for(const url of urls) {
    const buffer = await (await fetch(`${mobileGearCDN.Texture}/${url}`)).arrayBuffer()

    const data = new Int8Array(buffer)

    const magic = Bytes.ToString(data.slice(0, 4))
    const version = Bytes.ToInt(Bytes.Int.U32, data.slice(4, 8))
    const headerOffset = Bytes.ToInt(Bytes.Int.U32, data.slice(8, 12))
    const fileCount = Bytes.ToInt(Bytes.Int.U32, data.slice(12, 16))
    const identifier = Bytes.ToString(data.slice(16, 256 + 16))

    console.log(fileCount)

    const allFiles = {} as any

    function toHexString(arr: Int8Array) {
        return arr.reduce((output: string, elem: number) => (output + ('0' + elem.toString(16)).slice(-2)), '')
    }

    for(let currentFileNo = 0; currentFileNo < fileCount; ++currentFileNo) {
        const startByte = headerOffset + currentFileNo * 272
        const currentFileName = Bytes.ToString(data.slice(startByte, startByte + 256))
        const fileDataOffset = Bytes.ToInt(Bytes.Int.U32, data.slice(startByte + 256, startByte + 256 + 4))
        const fileType = Bytes.ToInt(Bytes.Int.U32, data.slice(startByte + 256 + 4, startByte + 256 + 8))
        const fileSize = Bytes.ToInt(Bytes.Int.U32, data.slice(startByte + 256 + 8, startByte + 256 + 12))

        console.log(currentFileName)

        let fileData = data.slice(fileDataOffset, fileDataOffset + fileSize)

        if(Bytes.ToString(fileData.slice(0,8)).includes('PNG')) {
            Deno.writeFileSync(`${currentFileName}.png`, new Uint8Array(fileData))
        }



        allFiles[currentFileName] = fileData
    }
}
// console.log(allFiles)