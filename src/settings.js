var utility = require('./utility.js');

var settings = JSON.parse(utility.readJson("data/settings.json"));

function getEmulateLauncher() {
    return settings.emulation.emulateLauncher;
}

function getEmulateServer() {
    return settings.emulation.emulateServer;
}

function getPort() {
	return settings.server.port;
}

function getEmail() {
    return settings.account.email;
}

function getPassword() {
    return settings.account.password;
}

function getEnablePmcWar() {
    return settings.bots.enablePmcWar;
}

module.exports.getEmulateLauncher = getEmulateLauncher;
module.exports.getEmulateServer = getEmulateServer;
module.exports.getPort = getPort;
module.exports.getEmail = getEmail;
module.exports.getPassword = getPassword;
module.exports.getEnablePmcWar = getEnablePmcWar;