const sqlite = require("sqlite3").verbose();
const { join } = require("path");

const HEX = 16;

module.exports = handle => {
    return new Promise(resolve => {
        let has_get =
            handle.method === "get" &&
            Object.prototype.hasOwnProperty.call(handle.data.get, "avatar") &&
            handle.data.get.avatar.length > 0;

        let has_post =
            handle.method === "post" &&
            Object.prototype.hasOwnProperty.call(handle.data.post, "avatar") &&
            handle.data.post.avatar.length > 0;

        let response = {
            data: {
                error: false,
                reference: null,
                json: null
            }
        };

        try {
            if (has_get || has_post) {
                let database = new sqlite.Database(
                    join(__dirname, "index.db"),
                    sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, // eslint-disable-line
                    error => {
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
                            (_1, data) => {
                                response.data = Object.assign(
                                    {
                                        reference: handle.data.get.avatar
                                    },
                                    data
                                );

                                return resolve(response);
                            }
                        );
                    }

                    if (has_post) {
                        response.data = {
                            json: handle.data.post.avatar,
                            reference: [...Array(HEX)]
                                .map(() => {
                                    return Math.floor(
                                        Math.random() * HEX
                                    ).toString(HEX);
                                })
                                .join("")
                        };

                        database.run(
                            `INSERT INTO avatars
                                (avatar_json, avatar_reference) VALUES
                                (?, ?)`,
                            [handle.data.post.avatar, response.data.reference]
                        );
                    }

                    return resolve(response);
                });
            }
        } catch (error) {
            response.error = error.message;
        }

        return resolve(response);
    });
};
