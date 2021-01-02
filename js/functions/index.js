/*global Promise*/

"use strict";

var fs = require("fs");
var path = require("path");

module.exports = function (handle) {
    return new Promise(function (resolve) {
        var file = handle.getUrl().pathname.split("/").pop();

        return fs.promises
            .readFile(
                path.join(
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
            )
            .then(function (data) {
                return resolve({
                    data: data,
                    headers: {
                        "Content-Length": data.length,
                        "Content-Type": "text/javascript"
                    }
                });
            })
            .catch(function () {
                return resolve({
                    status: "NOT_FOUND"
                });
            });
    });
};
