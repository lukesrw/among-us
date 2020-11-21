/*global Game ImageElement*/

"use strict";

var ARG_AVATAR = "avatar";
var MAX_RGB_VALUE = 16777215;
var HEX = 16;

var directories = {
    background: "",
    hat: "",
    misc: "",
    pet: "",
    skin: "./img/skin/Professions/Doctor.png"
};
var ziad;
var state_request = {};
var img = {};
var background;
var cosmetic = {};
var linear1;
var linear2;
var text;
var radial1;
var radial2;
var color_two;
var canvas;
var context;
var inputs = {};
var long_to_short = {
    background: "b",
    background_custom_color: "bcc",
    background_custom_image: "bci",
    color: "c",
    radial1_val: "cr",
    start_x_val: "cx",
    start_y_val: "cy",
    color2: "c2",
    end_x_val: "c2x",
    end_y_val: "c2y",
    facing: "f",
    radial2_val: "c2r",
    color_custom: "cc",
    color_custom2: "cc2",
    hat: "h",
    misc: "m",
    misc_index: "mi",
    pet: "pe",
    pet_shadow: "ps",
    player: "p",
    shadow: "sh",
    skin: "sk",
    style: "s",
    custom_text: "t",
    custom_text_color: "tc",
    custom_text_offset: "to"
};
var coords = {
    normal: {
        x1: 170,
        x2: 392,
        y1: 206,
        y2: 525
    },
    ghost: {
        x1: 115,
        x2: 389,
        y1: 202,
        y2: 550
    }
};
var short_to_long = {};
var btn_classes = [
    "btn-primary",
    "btn-secondary",
    "btn-success",
    "btn-danger",
    "btn-warning",
    "btn-info",
    "btn-dark"
];

function pickRandom(min, max) {
    return Math.floor(Math.random() * max) + min;
}

Object.keys(long_to_short).forEach(function (long) {
    if (
        Object.prototype.hasOwnProperty.call(short_to_long, long_to_short[long])
    ) {
        throw new Error("Duplicate key: " + long_to_short[long]);
    }
    short_to_long[long_to_short[long]] = long;
});

/**
 * @returns {void}
 */
function updateURL() {
    var state = {};

    if (
        window.history.replaceState &&
        typeof window.history.replaceState === "function"
    ) {
        Object.keys(inputs).forEach(function (name) {
            state[long_to_short[name]] = inputs[name].value;
        });

        window.history.replaceState(
            "",
            "",
            "?" + ARG_AVATAR + "=" + encodeURIComponent(JSON.stringify(state))
        );
    }
}

/**
 * @param {string} name for reference
 * @param {string} src for file
 * @returns {void}
 */
function getImg(name, src) {
    var player = inputs.player.value;

    if (Object.prototype.hasOwnProperty.call(img, name)) {
        return img[name].load ? img[name].object : false;
    }

    if (name === "shadow" && inputs.player.value === "ghost") {
        return false;
    }

    img[name] = {
        load: false,
        object: new Image()
    };
    if (src) {
        img[name].object.src = src;
    } else {
        img[name].object.src = "./img/player/" + player + "/" + name + ".png";
    }
    img[name].object.onload = function () {
        if (Object.prototype.hasOwnProperty.call(img, name)) {
            img[name].load = true;
            render(); // eslint-disable-line
        }
    };
    img[name].object.onerror = function () {
        if (Object.prototype.hasOwnProperty.call(img, name)) {
            delete img[name];
            getImg("custom", "./img/background/error.jpg");
        }
    };
}

/**
 * @param {string} name image name
 * @returns {void}
 */
function drawImage(name) {
    if (getImg(name)) {
        context.drawImage(getImg(name), 0, 0);
    }
}

function flipCanvas() {
    if (inputs.facing.value === "left") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
    }
}

/**
 * @returns {void}
 */
function render() {
    var gradient;
    var color1 = inputs.color.value;
    var color2 = inputs.color2.value;
    if (color1 === "custom") color1 = inputs.color_custom.value;
    if (color2 === "custom") color2 = inputs.color_custom2.value;

    if (
        Object.values(img).every(function (sample) {
            return sample.load;
        })
    ) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        flipCanvas();
        drawImage("base");

        context.globalCompositeOperation = "source-in";

        context.fillStyle = color1;
        if (inputs.style.value !== "Normal") {
            if (inputs.style.value === "Linear") {
                gradient = context.createLinearGradient(
                    linear1.children[1].children[0].value,
                    linear1.children[3].children[0].value,
                    linear2.children[1].children[0].value,
                    linear2.children[3].children[0].value
                );
            } else {
                gradient = context.createRadialGradient(
                    linear1.children[1].children[0].value,
                    linear1.children[3].children[0].value,
                    radial1.children[1].value,
                    linear2.children[1].children[0].value,
                    linear2.children[3].children[0].value,
                    radial2.children[1].value
                );
            }
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            context.fillStyle = gradient;
        }
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.globalCompositeOperation = "source-over";

        flipCanvas();

        // opacity images
        context.globalAlpha = 0.2;
        if (inputs.shadow.value === "yes" && inputs.player.value !== "ghost") {
            drawImage("shadow");
        }

        flipCanvas();

        drawImage("overlay");

        context.globalAlpha = 1;

        drawImage("border");

        Object.keys(cosmetic).forEach(function (category) {
            if (
                (category === "skin" && inputs.player.value === "ghost") ||
                (category === "hat" && inputs.player.value === "dead") ||
                (category === "misc" && inputs.misc_index.value === "behind")
            ) {
                return;
            }

            if (category === "misc") flipCanvas();

            if (cosmetic[category]) {
                if (category === "pet" && inputs.pet_shadow.value === "yes") {
                    context.globalAlpha = 0.2;
                    getImg("pet-shadow", "./img/pet-shadow.png");
                    drawImage("pet-shadow");
                    context.globalAlpha = 1;
                }

                drawImage(category);
            }

            if (category === "misc") flipCanvas();
        });

        flipCanvas();

        fillText("front");

        context.globalCompositeOperation = "destination-over";

        if (inputs.misc_index.value === "behind" && cosmetic.misc) {
            drawImage("misc");
        }
        fillText("behind");

        if (background.substr(0, 1) === "#") {
            context.fillStyle = background;
            context.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            drawImage("custom");
        }
        context.globalCompositeOperation = "source-over";

        updateURL();
    }
}

function fillText(location) {
    if (
        inputs.custom_text.value.length > 0 &&
        inputs.misc_index.value === location
    ) {
        context.textAlign = "center";
        context.font = '91px "vcr_osd_monoregular", monospace';
        context.fillStyle = inputs.custom_text_color.value;
        context.fillText(
            inputs.custom_text.value,
            canvas.width / 2,
            inputs.custom_text_offset.value
        );
    }
}

/**
 * @param {DOM} target link
 * @returns {void}
 */
function save(target) {
    var data = canvas.toDataURL("image/png");

    target.href = data;
}

/**
 * @param {DOM} input1 First target color
 * @param {DOM} input2 Second target color
 * @returns {void}
 */
function updateColor(input1, input2) {
    if (input1.value !== "custom") {
        input2.value = input1.value;
    }
    input2.classList.toggle("d-none", input1.value !== "custom");
    render();
}

/**
 * @param {string} category name
 * @returns {void}
 */
function updateCosmetic(category) {
    var is_text = inputs.misc.value === "text";

    cosmetic[category] = inputs[category].value;

    switch (category) {
        case "skin":
            inputs.skin.nextElementSibling.classList.toggle(
                "d-none",
                !document.querySelector(
                    '#hat [value$="' +
                        cosmetic.skin.substr(cosmetic.skin.lastIndexOf("/")) +
                        '"]'
                )
            );
            break;

        case "hat":
            inputs.hat.nextElementSibling.classList.toggle(
                "d-none",
                !document.querySelector(
                    '#skin [value$="' +
                        cosmetic.hat.substr(cosmetic.hat.lastIndexOf("/")) +
                        '"]'
                )
            );
            break;

        case "misc":
            inputs.custom_text.parentElement.classList.toggle(
                "d-none",
                !is_text
            );
            if (is_text) {
                cosmetic.misc = false;
            } else {
                inputs.custom_text.value = "";
            }
            break;
    }

    delete img[category];
    if (cosmetic[category]) {
        getImg(category, cosmetic[category]);
    } else {
        render();
    }
}

/**
 * @returns {void}
 */
function setSkin() {
    document.querySelector(
        '#skin [value$="' +
            cosmetic.hat.substr(cosmetic.hat.lastIndexOf("/")) +
            '"]'
    ).selected = true;
    updateCosmetic("skin");
}

/**
 * @returns {void}
 */
function setHat() {
    document.querySelector(
        '#hat [value$="' +
            cosmetic.skin.substr(cosmetic.skin.lastIndexOf("/")) +
            '"]'
    ).selected = true;
    updateCosmetic("hat");
}

/**
 * @returns {void}
 */
function updateBackground() {
    background = inputs.background.value;

    inputs.background_custom_image.classList.toggle(
        "d-none",
        background !== "custom-image"
    );
    inputs.background_custom_color.classList.toggle(
        "d-none",
        background !== "custom-color"
    );

    switch (background) {
        case "custom-image":
            background = inputs.background_custom_image.value;
            break;

        case "custom-color":
            background = inputs.background_custom_color.value;
            break;
    }

    if (background.length === 0) return;

    if (background.substr(0, 1) === "#") {
        inputs.background_custom_color.value = background;
        render();
    } else {
        delete img.custom;
        getImg("custom", background);
    }
}

/**
 * @returns {void}
 */
function updateStyle() {
    var is_radial = inputs.style.value === "Radial";
    var is_normal = inputs.style.value === "Normal";

    color_two.classList.toggle("d-none", is_normal);
    linear1.classList.toggle("d-none", is_normal);
    linear2.classList.toggle("d-none", is_normal);
    radial1.classList.toggle("d-none", !is_radial);
    radial2.classList.toggle("d-none", !is_radial);

    render();
}

/**
 * @param {DOM} current target
 * @returns {void}
 */
function updateInput(current) {
    current.previousElementSibling.value = current.value;
    render();
}

/**
 * @param {DOM} current target
 * @returns {void}
 */
function updateSlider(current) {
    current.nextElementSibling.value = current.value;
    render();
}

/**
 * @returns {void}
 */
function updatePlayer() {
    var is_ghost = inputs.player.value === "ghost";
    var is_dead = inputs.player.value === "dead";
    var state = is_ghost ? "ghost" : "normal";
    var title = {
        x: "Player Left: " + coords[state].x1 + ", Right: " + coords[state].x2,
        y: "Player Top: " + coords[state].y1 + ", Bottom: " + coords[state].y2
    };
    inputs.start_x_val.parentElement.previousElementSibling.children[0].title =
        title.x;
    inputs.end_x_val.parentElement.previousElementSibling.children[0].title =
        title.x;
    inputs.start_y_val.parentElement.previousElementSibling.children[0].title =
        title.y;
    inputs.end_y_val.parentElement.previousElementSibling.children[0].title =
        title.y;

    inputs.hat.parentElement.classList.toggle("d-none", is_dead);
    inputs.hat.parentElement.previousElementSibling.classList.toggle(
        "d-none",
        is_dead
    );

    inputs.skin.parentElement.classList.toggle("d-none", is_ghost);
    inputs.skin.parentElement.previousElementSibling.classList.toggle(
        "d-none",
        is_ghost
    );
    inputs.shadow.classList.toggle("d-none", is_ghost);

    delete img.base;
    delete img.overlay;
    delete img.border;
    render();
}

/**
 * @param {DOM} button origin
 * @param {DOM} targets to randomize
 * @returns {void}
 */
function randomize(button, targets) {
    var target_i = 0;
    var options;
    var btn_class = btn_classes[pickRandom(0, btn_classes.length)];
    var has_block;

    if (button.tagName === "BUTTON") {
        has_block = button.classList.contains("btn-block");
        button.classList = ["btn", btn_class].join(" ");

        if (has_block) button.classList.add("btn-block");

        if (
            button.nextElementSibling &&
            button.nextElementSibling.classList.contains("dropdown-toggle")
        ) {
            button.nextElementSibling.classList = [
                "btn",
                btn_class,
                "dropdown-toggle",
                "dropdown-toggle-split"
            ].join(" ");
        }
    }

    for (target_i; target_i < targets.length; target_i += 1) {
        switch (targets[target_i].tagName) {
            case "SELECT":
                options = targets[target_i].querySelectorAll("option");
                options[pickRandom(0, options.length)].selected = true;
                break;

            case "INPUT":
                switch (targets[target_i].type) {
                    case "number":
                        targets[target_i].value = pickRandom(
                            1,
                            targets[target_i].max
                        );
                        break;

                    case "color":
                        targets[target_i].value =
                            "#" + pickRandom(0, MAX_RGB_VALUE).toString(HEX);
                        break;
                }
        }

        if (typeof targets[target_i].onchange === "function") {
            targets[target_i].onchange();
        }
    }
}

function getLoaded(category) {
    if (category) {
        delete directories[category];

        if (Object.keys(directories).length === 0) {
            window.location.search
                .substr(1)
                .split("&")
                .some(function (part) {
                    if (part.split("=")[0] === ARG_AVATAR) {
                        try {
                            state_request = JSON.parse(
                                decodeURIComponent(
                                    part.substr(ARG_AVATAR.length + 1)
                                )
                            );

                            Object.keys(state_request).forEach(function (name) {
                                if (
                                    Object.prototype.hasOwnProperty.call(
                                        inputs,
                                        short_to_long[name]
                                    )
                                ) {
                                    inputs[short_to_long[name]].value =
                                        state_request[name];
                                }
                            });
                        } catch (ignore) {}

                        return true;
                    }

                    return false;
                });

            updateBackground();
            updateStyle();
            updatePlayer();

            getImg("base");
            getImg("border");
            getImg("shadow");
            getImg("overlay");

            updateCosmetic("skin");
            updateCosmetic("hat");
            updateCosmetic("pet");
            updateCosmetic("misc");
            updateColor(inputs.color, inputs.color_custom);
            updateColor(inputs.color2, inputs.color_custom2);

            return true;
        }

        return false;
    }

    Object.keys(directories).forEach(function (directory) {
        var request = new XMLHttpRequest();
        request.open("GET", "./api/?dir=" + directory);
        request.onload = function () {
            var data = JSON.parse(request.response);
            var option = document.createElement("option");
            option.value = "";
            option.innerText = "None";
            inputs[directory].appendChild(option);

            Object.keys(data).forEach(function (key) {
                var target = inputs[directory];
                var path = "./img/" + directory + "/";

                if (typeof data[key] === "string") {
                    data[key] = [data[key]];
                } else {
                    target = document.createElement("optgroup");
                    target.label = key;
                    inputs[directory].appendChild(target);
                    path += key + "/";
                }

                data[key].forEach(function (item) {
                    option = document.createElement("option");
                    option.value = path + item + ".png";
                    option.innerText = item;
                    target.appendChild(option);
                });
            });

            inputs[directory].value = directories[directory];

            getLoaded(directory);
        };

        return request.send();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var inputs_r_i = 0;
    var inputs_r = document.querySelectorAll(
        "select,input:not([type='range'])"
    );

    for (inputs_r_i; inputs_r_i < inputs_r.length; inputs_r_i += 1) {
        inputs[inputs_r[inputs_r_i].id.replace(/-/g, "_")] =
            inputs_r[inputs_r_i];
    }

    color_two = document.getElementById("color-two");
    linear1 = document.getElementById("linear1");
    linear2 = document.getElementById("linear2");
    radial1 = document.getElementById("radial1");
    radial2 = document.getElementById("radial2");

    document.getElementById("ziad").addEventListener("click", function () {
        setTimeout(function () {
            document.querySelector("#random").classList.remove("d-none");
        }, 100);
    });

    Object.keys(inputs).forEach(function (name) {
        if (inputs[name] === null) {
            throw new Error("Missing target for: " + name);
        }
        if (!Object.prototype.hasOwnProperty.call(long_to_short, name)) {
            throw new Error("Missing short definition: " + name);
        }
    });

    canvas = document.getElementById("canvas");
    canvas.width = 600;
    canvas.height = 600;

    context = canvas.getContext("2d");

    getLoaded();
});
