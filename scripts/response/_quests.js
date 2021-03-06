"use strict";

require('../libs.js');

let quests = "";

//// ---- FUNCTIONS BELOW ---- ////
/////////////////////////////////// TODO: REWRITE TO FULLY USE FILEROUTES.JSON ///////////////////////////////////

function prepareQuests() {
	if (!fs.existsSync(fileRoutes.cache.quests)) {
		console.log("rebuilding quests cache...");

		let questsDir = "database/configs/quests/";
		let quest_BaseJSON = JSON.parse('{"err":0,"errmsg":null,"data":[]}');
		let quest_data = quest_BaseJSON.data;
		let quest_List = fs.readdirSync(questsDir);

		for (let file in quest_List) {
			if (typeof quest_List[file] != "undefined") {
				let temp_fileData = JSON.parse(utility.readJson(questsDir + quest_List[file]));
				
				quest_data.push(temp_fileData);
			}
		}

		quest_BaseJSON.data = quest_data;
		quests = quest_BaseJSON;
		utility.writeJson(fileRoutes.cache.quests, quest_BaseJSON);
		return quest_BaseJSON;
	} else {
		if (quests == "") {
			return JSON.parse(utility.readJson(fileRoutes.cache.quests));
		} else {
			return quests;
		}
	}
}

//// ---- EXPORT LIST ---- ////

module.exports.prepareQuests = prepareQuests;