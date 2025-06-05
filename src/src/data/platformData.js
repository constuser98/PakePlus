// src/data/platformData.js

let platforms = JSON.parse(localStorage.getItem('platforms')) || ['Nintendo Switch', 'PlayStation', 'Xbox', 'PC', 'Mobile'];

function savePlatforms() {
    localStorage.setItem('platforms', JSON.stringify(platforms));
}

function getPlatforms() {
    return platforms;
}

function setPlatforms(newPlatforms) {
    platforms = newPlatforms;
    savePlatforms();
}

export { platforms, savePlatforms, getPlatforms, setPlatforms };