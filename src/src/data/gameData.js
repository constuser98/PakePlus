// src/data/gameData.js

let games = JSON.parse(localStorage.getItem('games')) || [];

function saveGames() {
    localStorage.setItem('games', JSON.stringify(games));
}

function getGames() {
    return games;
}

function setGames(newGames) {
    games = newGames;
    saveGames();
}

export { games, saveGames, getGames, setGames };