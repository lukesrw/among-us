const { promises: fs } = require("fs");
const { join } = require("path");

function filterSort(files) {
    return files
        .filter(file => !file.startsWith("_"))
        .sort((item1, item2) => {
            if (item1.includes(".")) return 1;
            if (item2.includes(".")) return -1;

            if (item1 > item2) return 1;
            if (item2 > item1) return -1;

            return 0;
        });
}

module.exports = async handle => {
    let response = {
        data: {}
    };

    if (
        Object.prototype.hasOwnProperty.call(handle.data.get, "dir") &&
        handle.data.get.dir &&
        ["background", "hat", "misc", "pet", "skin"].includes(
            handle.data.get.dir
        )
    ) {
        let location = [__dirname, "..", "img", handle.data.get.dir];
        let file = filterSort(await fs.readdir(join(...location)));

        for (let file_i = 0; file_i < file.length; file_i += 1) {
            if (file[file_i].includes(".")) {
                response.data[file[file_i]] = file[file_i].split(".")[0];
            } else {
                response.data[file[file_i]] = filterSort(
                    await fs.readdir(join(...location.concat(file[file_i])))
                ).map(file => file.split(".")[0]);
            }
        }
    }

    return response;
};
