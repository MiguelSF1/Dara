const fsp = require('fs').promises;
const serverConfig = require("./configModule");

module.exports = async function (request, response) {
    let answer = {};
    let status;

    try {

        const data = await serverConfig.readRequestBody(request);
        const userInput = JSON.parse(data);

        if (!userInput.hasOwnProperty("nick") || !userInput.hasOwnProperty("password") || !userInput.hasOwnProperty("game")) {
            answer.error = "undefined nick or password or game";
            response.writeHead(400, serverConfig.headers.plain);
            response.end(JSON.stringify(answer));
            return;
        }


        const fileData = await fsp.readFile('./data/gameData.json', 'utf8');
        const gameData = JSON.parse(fileData);

        const newGameData = findGame(userInput["game"], gameData, userInput["nick"]);
        await fsp.writeFile('./data/gameData.json', JSON.stringify(newGameData));

        status = 200;
        response.writeHead(status, serverConfig.headers.plain);
        response.end(JSON.stringify(answer));
    } catch (error) {
        console.error('Error processing :', error);
        response.writeHead(500, serverConfig.headers.sse);
        response.end();
    }
}

function findGame(game, gameData, nick) {
    const newGameData = gameData;
    for (let i = 0; i < gameData.length; i++) {
        if (gameData[i]["game"] === game) {
            if (Object.keys(gameData[i]["gameState"]["players"]).length < 2) {
                newGameData[i]["gameState"]["winner"] = null;
            } else {
                for (let player in gameData[i]["gameState"]["players"]) {
                    if (player !== nick) {
                        newGameData[i]["gameState"]["winner"] = player;
                    }
                }
            }
            break;
        }
    }
    return newGameData;
}