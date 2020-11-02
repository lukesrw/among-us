/*global Game ImageElement*/

"use strict";

var img = {};
var background;
var cosmetic = {};
var linear1;
var linear2;
var radial1;
var radial2;
var color_two;
var canvas;
var context;
var inputs = {};

/**
 * @param {string} name for reference
 * @param {string} src for file
 * @returns {void}
 */
function getImg(name, src) {
    if (Object.prototype.hasOwnProperty.call(img, name)) {
        return img[name].load ? img[name].object : false;
    }

    img[name] = {
        load: false,
        object: new Image()
    };
    img[name].object.src = src ? src : "./img/player/" + name + ".png";
    img[name].object.onload = function () {
        img[name].load = true;
        render(); // eslint-disable-line
    };
    img[name].object.onerror = function () {
        delete img[name];
        getImg("custom", "./img/error.jpg");
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

        // opacity images
        context.globalAlpha = 0.2;
        if (inputs.shadow.value === "yes") {
            drawImage("shadow");
        }
        drawImage("overlay");
        context.globalAlpha = 1;

        drawImage("border");
        Object.keys(cosmetic).forEach(function (category) {
            if (cosmetic[category]) drawImage(category);
        });

        context.globalCompositeOperation = "destination-over";
        if (background.substr(0, 1) === "#") {
            context.fillStyle = background;
            context.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            drawImage("custom");
        }
        context.globalCompositeOperation = "source-over";
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

document.addEventListener("DOMContentLoaded", function () {
    color_two = document.getElementById("color-two");
    linear1 = document.getElementById("linear1");
    linear2 = document.getElementById("linear2");
    radial1 = document.getElementById("radial1");
    radial2 = document.getElementById("radial2");

    inputs.style = document.getElementById("style");
    inputs.pet = document.getElementById("pet");
    inputs.shadow = document.getElementById("shadow");
    inputs.color = document.getElementById("color");
    inputs.color2 = document.getElementById("color2");
    inputs.color_custom = document.getElementById("color-custom");
    inputs.color_custom2 = document.getElementById("color-custom2");
    inputs.hat = document.getElementById("hat");
    inputs.skin = document.getElementById("skin");
    inputs.background = document.getElementById("background");
    inputs.background_custom_image = document.getElementById(
        "background-custom-image"
    );
    inputs.background_custom_color = document.getElementById(
        "background-custom-color"
    );

    canvas = document.getElementById("canvas");
    canvas.width = 600;
    canvas.height = 600;

    context = canvas.getContext("2d");

    getImg("base");
    getImg("border");
    getImg("shadow");
    getImg("overlay");

    updateStyle();
    updateBackground();
    updateCosmetic("skin");
    updateCosmetic("hat");
    updateCosmetic("pet");
    updateColor(inputs.color, inputs.color_custom);
    updateColor(inputs.color2, inputs.color_custom2);
});
