import { promises as fs } from "fs";
import { join } from "path";
import { Request, RequestHandle } from "../../../modules/host/class/Request";

export = async (handle: Request): Promise<Partial<RequestHandle>> => {
    let file = handle.getUrl().pathname.split("/").pop() as string;

    try {
        let data = await fs.readFile(
            join(
                __dirname,
                "..",
                "..",
                "..",
                "lukesrw.co.uk",
                "js",
                "functions",
                file
            ),
            "utf-8"
        );

        return {
            data,
            headers: {
                "Content-Length": Buffer.byteLength(data),
                "Content-Type": "text/javascript"
            }
        };
    } catch (_1) {}

    return {
        status: "NOT_FOUND"
    };
};
