import { join } from "path";
import { Request, RequestHandle } from "../../modules/host/class/Request";

const sqlite = require("sqlite3").verbose();

const HEX = 16;

export = async (handle: Request): Promise<Partial<RequestHandle>> => {
    return new Promise(resolve => {
        let has_get =
            handle.method === "get" &&
            Object.prototype.hasOwnProperty.call(handle.data.get, "avatar") &&
            handle.data.get.avatar.length > 0;

        let has_post =
            handle.method === "post" &&
            Object.prototype.hasOwnProperty.call(handle.data.post, "avatar") &&
            handle.data.post.avatar.length > 0;

        let response: {
            data: {
                error: boolean;
                json?: null;
                reference: string | null;
            };
        } = {
            data: {
                error: false,
                json: null,
                reference: null
            }
        };

        try {
            if (has_get || has_post) {
                let database = new sqlite.Database(
                    join(__dirname, "index.db"),
                    sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, // eslint-disable-line
                    (error: any) => {
                        if (error) console.log(error); // eslint-disable-line
                    }
                );

                return database.serialize(async () => {
                    database.run(
                        `CREATE TABLE IF NOT EXISTS avatars (
                            avatar_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                            avatar_created TEXT NOT NULL DEFAULT (DATETIME()),
                            avatar_reference TEXT NOT NULL UNIQUE,
                            avatar_json TEXT
                        )`
                    );

                    if (has_get) {
                        return database.get(
                            `SELECT
                                avatar_json json
                            FROM
                                avatars
                            WHERE
                                avatar_reference = ?`,
                            [handle.data.get.avatar],
                            (error: null | string, data: object) => {
                                response.data = Object.assign(
                                    {
                                        error: Boolean(error),
                                        reference: handle.data.get.avatar
                                    },
                                    data || {}
                                );

                                return resolve(response);
                            }
                        );
                    }

                    if (has_post) {
                        response.data.json = handle.data.post.avatar;

                        return database.get(
                            `SELECT
                                avatar_reference reference
                            FROM
                                avatars
                            WHERE
                                avatar_json = ?`,
                            [handle.data.post.avatar],
                            (_1: null | string, data: any) => {
                                if (data) {
                                    response.data.reference = data.reference;
                                } else {
                                    response.data.reference = [...Array(HEX)]
                                        .map(() => {
                                            return Math.floor(
                                                Math.random() * HEX
                                            ).toString(HEX);
                                        })
                                        .join("");

                                    database.run(
                                        `INSERT INTO avatars
                                            (avatar_json, avatar_reference) VALUES
                                            (?, ?)`,
                                        [
                                            handle.data.post.avatar,
                                            response.data.reference
                                        ]
                                    );
                                }

                                return resolve(response);
                            }
                        );
                    }

                    return resolve(response);
                });
            }
        } catch (error) {
            response.data.error = error.message;
        }

        return resolve(response);
    });
};
