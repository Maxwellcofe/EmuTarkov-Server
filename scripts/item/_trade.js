"use strict";

require('../libs.js');

var output = "";

//// ---- FUNCTIONS BELOW ---- ////

function buyItem(tmpList, body, trad = "") {
	let PlayerStash = itm_hf.getPlayerStash();
	let stashY = PlayerStash[1];
    let stashX = PlayerStash[0];
    let tmpTrader = 0;

    item.resetOutput();
    output = item.getOutput();

    if (trad === "") {
        tmpTrader = trader.getAssort(body.tid);
    } else {
        // its for fleamarket only
        tmpTrader = JSON.parse(utility.readJson(fileRoutes.assort.everything));
    }

    // no exceptions possible here
    let moneyID = [];

    // prepare barter items as money (roubles are counted there as well)
    for (let i = 0; i < body.scheme_items.length; i++) {
        moneyID[i] = body.scheme_items[i].id;
    }

    // check if money exists if not throw an exception (this step must be fullfill no matter what - by client side - if not user cheats)
    let moneyObject = itm_hf.findMoney(tmpList, moneyID);

    if (typeof moneyObject[0] === "undefined") {
        console.log("Error something goes wrong (not found Money)");
        return "";
    }

    // pay the item	to profile
    if (!itm_hf.payMoney(tmpList, moneyObject, body, trad)) {
        console.log("no money found");
        return "";
    }

    // print debug information
    console.log("Bought item: " + body.item_id, "", "", true);

    for (let item of tmpTrader.data.items) {
        if (item._id === body.item_id) {
            let MaxStacks = 1;
            let StacksValue = [];
            let tmpItem = itm_hf.getItem(item._tpl)[1];

            // split stacks if the size is higher than allowed by StackMaxSize
            if (body.count > tmpItem._props.StackMaxSize) {
                let count = body.count;

                // maxstacks if not divided by then +1
                let calc = body.count - (Math.floor(body.count / tmpItem._props.StackMaxSize) * tmpItem._props.StackMaxSize);

                MaxStacks = (calc > 0) ? MaxStacks + Math.floor(count / tmpItem._props.StackMaxSize) : Math.floor(count / tmpItem._props.StackMaxSize);

                for (let sv = 0; sv < MaxStacks; sv++) {
                    if (count > 0) {
                        if (count > tmpItem._props.StackMaxSize) {
                            count = count - tmpItem._props.StackMaxSize;
                            StacksValue[sv] = tmpItem._props.StackMaxSize;
                        } else {
                            StacksValue[sv] = count;
                        }
                    }
                }
            } else {
                StacksValue[0] = body.count;
            }
            // stacks prepared

            for (let stacks = 0; stacks < MaxStacks; stacks++) {
                // update profile on each stack so stash recalculate will have new items
                tmpList = profile.getCharacterData();

                let StashFS_2D = itm_hf.recheckInventoryFreeSpace(tmpList);
                let ItemSize = itm_hf.getSize(item._tpl, item._id, tmpTrader.data.items);
                let tmpSizeX = ItemSize[0];
                let tmpSizeY = ItemSize[1];

                addedProperly:
                    for (let y = 0; y <= stashY - tmpSizeY; y++) {
                        for (let x = 0; x <= stashX - tmpSizeX; x++) {
                            let badSlot = "no";

                            break_BadSlot:
                                for (let itemY = 0; itemY < tmpSizeY; itemY++) {
                                    for (let itemX = 0; itemX < tmpSizeX; itemX++) {
                                        if (StashFS_2D[y + itemY][x + itemX] !== 0) {
                                            badSlot = "yes";
                                            break break_BadSlot;
                                        }
                                    }
                                }

                            if (badSlot === "yes") {
                                continue;
                            }

                            console.log("Item placed at position [" + x + "," + y + "]", "", "", true);
                            
                            let newItem = utility.generateNewItemId();
                            let toDo = [[item._id, newItem]];

                            output.data.items.new.push({
                                "_id": newItem,
                                "_tpl": item._tpl,
                                "parentId": tmpList.data[0].Inventory.stash,
                                "slotId": "hideout",
                                "location": {"x": x, "y": y, "r": 0},
                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                            });

                            tmpList.data[0].Inventory.items.push({
                                "_id": newItem,
                                "_tpl": item._tpl,
                                "parentId": tmpList.data[0].Inventory.stash,
                                "slotId": "hideout",
                                "location": {"x": x, "y": y, "r": 0},
                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                            });

                            while (true) {
                                if (typeof toDo[0] === "undefined") {
                                    break;
                                }

                                for (let tmpKey in tmpTrader.data.items) {
                                    if (tmpTrader.data.items[tmpKey].parentId && tmpTrader.data.items[tmpKey].parentId === toDo[0][0]) {
                                        let SlotID = tmpTrader.data.items[tmpKey].slotId;

                                        newItem = utility.generateNewItemId();
                                        
                                        if (SlotID === "hideout") {
                                            output.data.items.new.push({
                                                "_id": newItem,
                                                "_tpl": tmpTrader.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": SlotID,
                                                "location": {"x": x, "y": y, "r": "Horizontal"},
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });

                                            tmpList.data[0].Inventory.items.push({
                                                "_id": newItem,
                                                "_tpl": tmpTrader.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": tmpTrader.data.items[tmpKey].slotId,
                                                "location": {"x": x, "y": y, "r": "Horizontal"},
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });
                                        } else {
                                            output.data.items.new.push({
                                                "_id": newItem,
                                                "_tpl": tmpTrader.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": SlotID,
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });

                                            tmpList.data[0].Inventory.items.push({
                                                "_id": newItem,
                                                "_tpl": tmpTrader.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": tmpTrader.data.items[tmpKey].slotId,
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });
                                        }
                                        
                                        toDo.push([tmpTrader.data.items[tmpKey]._id, newItem]);
                                    }
                                }

                                toDo.splice(0, 1);
                            }

                            break addedProperly;
                        }
                    }

                // save after each added item
                profile.setCharacterData(tmpList);
            }

            return output;
        }
    }

    return "";
}

// Selling item to trader
function sellItem(tmpList, body) {
    let money = 0;
    let prices = JSON.parse(profile.getPurchasesData());

    item.resetOutput();
    output = item.getOutput();
    
    // find the items to sell
    for (let i in body.items) {
        // print item trying to sell
        console.log("selling item" + JSON.stringify(body.items[i]), "", "", true);

        // profile inventory, look into it if item exist
        for (let item of tmpList.data[0].Inventory.items) {
            let isThereSpace = body.items[i].id.search(" ");
            let checkID = body.items[i].id;

            if (isThereSpace !== -1) {
                checkID = checkID.substr(0, isThereSpace);
            }

            // item found
            if (item._id === checkID) {
                console.log("Selling: " + checkID, "", "", true);
                
                // add money to return to the player
                let price_money = prices.data[item._id][0][0].count;

                output = move_f.removeItem(tmpList, {Action: 'Remove', item: checkID}, output);
                
                if (output !== "BAD") {
                    money += price_money;
                } else {
                    return "";
                }
            }
        }
    }

    // get money the item
    output = itm_hf.getMoney(tmpList, money, body, output);
    return output;
}

// separate is that selling or buying
function confirmTrading(tmpList, body, trader = "") {
    // buying
    if (body.type === "buy_from_trader") {
        return buyItem(tmpList, body, trader);
    }

    // selling
    if (body.type === "sell_to_trader") {
        return sellItem(tmpList, body);
    }

    return "";
}

// Ragfair trading
function confirmRagfairTrading(tmpList, body) {
    /*
    { Action: 'RagFairBuyOffer',  offerId: '56d59d3ad2720bdb418b4577',  count: 1,  items: [ { id: '1566757577968610909', count: 42 } ] }
    */

    item.resetOutput();

    let ragfairOffers = body.offers;
    let allOutput = item.getOutput()
    
    for (let oneOffer of ragfairOffers) {
        tmpList = profile.getCharacterData();
        body = {};
        body.Action = "TradingConfirm";
        body.type = "buy_from_trader";
        body.tid = "everything";
        body.item_id = oneOffer.id;
        body.count = oneOffer.count;
        body.scheme_id = 0;
        body.scheme_items = oneOffer.items;

        let tempOutput = confirmTrading(tmpList, body, "ragfair");

        for (let newItem of tempOutput.data.items.new) {
            allOutput.data.items.new.push(newItem);
        }
    }

    return allOutput;
}


//// ---- EXPORT LIST ---- ////

module.exports.buyItem = buyItem;
module.exports.sellItem = sellItem;
module.exports.confirmTrading = confirmTrading;
module.exports.confirmRagfairTrading = confirmRagfairTrading;