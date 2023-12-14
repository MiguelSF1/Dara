const fsp = require('fs').promises;
const crypto = require('crypto');
const serverConfig = require("./configModule");

module.exports = async function (request, response) {
    let answer = {};
    let status;

    const data = await serverConfig.readRequestBody(request);
    const userInput = JSON.parse(data);

    if (!userInput.hasOwnProperty("group") || !userInput.hasOwnProperty("nick") || !userInput.hasOwnProperty("password")
        || !userInput.hasOwnProperty("size")) {
        answer.error = "undefined nick or password or group or size";
        response.writeHead(400, serverConfig.headers.plain);
        response.end(JSON.stringify(answer));
        return;
    }

    if (!Number.isInteger(userInput["group"]) || typeof userInput["size"] !== "object") {
        answer.error = "invalid group or size value";
        response.writeHead(400, serverConfig.headers.plain);
        response.end(JSON.stringify(answer));
        return;
    }

    if (!userInput["size"].hasOwnProperty("rows") || !userInput["size"].hasOwnProperty("columns")) {
        answer.error = "undefined rows or columns from size";
        response.writeHead("400", serverConfig.headers.plain);
        response.end(JSON.stringify(answer));
        return;
    }

    if (!Number.isInteger(userInput["size"]["rows"]) || !Number.isInteger(userInput["size"]["columns"])) {
        answer.error = "invalid rows or columns value from size";
        response.writeHead("400", serverConfig.headers.plain);
        response.end(JSON.stringify(answer));
        return;
    }


    const fileData = await fsp.readFile('./data/gameData.json', 'utf8');
    const gameData = JSON.parse(fileData);

    let game = findGame(gameData, userInput);
    if (game === "") {
        game = crypto.createHash('md5').digest('hex');
        await fsp.writeFile('./data/gameData.json', JSON.stringify(makeGame(userInput, game, gameData)));
    }

    answer = { "game": game }
    status = 200;
    response.writeHead(status, serverConfig.headers.plain);
    response.end(JSON.stringify(answer));
}

function findGame(gameData, userInput) {
    for (let i = 0; i < gameData.length; i++) {
        if (gameData[i]["group"] === userInput["group"] && gameData[i]["size"]["rows"] === userInput["size"]["rows"]
            && gameData[i]["size"]["columns"] === userInput["size"]["columns"] && !gameData[i].hasOwnProperty("winner")) {
            if (gameData[i]["gameState"]["players"].length < 2) {
                return gameData[i]["game"];
            }
        }
    }

    return "";
}

function makeGame(userInput, game, gameData) {
    const newGameData = gameData;
    const board = [];
    for (let i = 0; i < userInput["size"]["rows"]; i++) {
        board.push([]);
        for (let j = 0; j < userInput["size"]["columns"]; j++) {
            board[i].push("empty");
        }
    }
    newGameData.push({
        "game": game,
        "group": userInput["group"],
        "size": userInput["size"],
        "gameState": {
            "board": board,
            "phase":"drop","step":"from","turn": "" ,"players":{}
        }
    })

    return newGameData;
}