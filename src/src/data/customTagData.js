// src/data/customTagData.js

let customTags = JSON.parse(localStorage.getItem('customTags')) || ['角色扮演', '动作冒险', '开放世界', '射击', '策略', '模拟经营', '体育', '格斗', '音乐节奏', '独立游戏'];

function saveCustomTags() {
    localStorage.setItem('customTags', JSON.stringify(customTags));
}

function getCustomTags() {
    return customTags;
}

function setCustomTags(newTags) {
    customTags = newTags;
    saveCustomTags();
}

export { customTags, saveCustomTags, getCustomTags, setCustomTags };