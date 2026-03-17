// src/utils/random.js
const counts = { h: 1124, v: 4382 };
const domain = "https://p.2x.nz";

let sessionRandomH = null;
let sessionRandomV = null;

function getRandomUrl(type) {
    if (!counts[type]) return "";
    if (type === "h" && sessionRandomH) return sessionRandomH;
    if (type === "v" && sessionRandomV) return sessionRandomV;

    const num = Math.floor(Math.random() * counts[type]) + 1;
    const url = `${domain}/ri/${type}/${num}.webp`;

    if (type === "h") sessionRandomH = url;
    if (type === "v") sessionRandomV = url;

    return url;
}

export function getRandomPicH() {
    return getRandomUrl("h");
}

export function getRandomPicV() {
    return getRandomUrl("v");
}