"use strict";
let server = '0.8.0-beta';
let game = 'Not Started';
let profileActiveId = 0;

function serverVersion() {
    return server;
}

function gameVersion() {
    return game;
}

function setVersion(version) {
    game = version;
}

function getActiveID() {
    return profileActiveId;
}

function setActiveID(ID) {
    if (ID === (profileActiveId + "")) return;
    profileActiveId = ID - 1;
}

module.exports.getActiveID = getActiveID;
module.exports.setActiveID = setActiveID;
module.exports.serverVersion = serverVersion;
module.exports.gameVersion = gameVersion;
module.exports.setVersion = setVersion;