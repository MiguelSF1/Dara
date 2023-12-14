const fsp = require('fs').promises;
const serverConfig = require("./configModule");

module.exports = async function (request, response) {
    let answer = {};
    let status;

    const data = await serverConfig.readRequestBody(request);
    const userInput = JSON.parse(data);

    if (typeof userInput["move"] !== "object" || !Number.isInteger(userInput["move"]["row"]) || !Number.isInteger(userInput["move"]["column"]) || userInput["move"]["row"] < 0
        || userInput["move"]["column"] < 0) {
        answer.error = "invalid move value";
        response.writeHead(400, serverConfig.headers.plain);
        response.end(JSON.stringify(answer));
        return;
    }

    const fileData = await fsp.readFile('./data/gameData.json', 'utf8');
    const gameData = JSON.parse(fileData);
    const game = findGame(gameData, userInput);

    if (userInput["nick"] !== game["gameState"]["turn"]) {
        answer.error = "Not your turn to play";
        response.writeHead(400, serverConfig.headers.plain);
        response.end(JSON.stringify(answer));
        return;
    }

    // make move
    // on game over put winner on data and update leaderboard

    status = 200;
    response.writeHead(status, serverConfig.headers.plain);
    response.end(JSON.stringify(answer));
}


function findGame(game, userInput) {
    for (let i = 0; i < game.length; i++) {
        if (game[i]["game"] === userInput["game"]) {
            return game[i];
        }
    }
    return {};
}
