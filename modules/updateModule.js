const fsp = require('fs').promises;
const serverConfig = require("./configModule");


module.exports = async function (request, response, nickParam, gameParam) {
    response.writeHead(200, serverConfig.headers.sse);
    let fileData = await fsp.readFile('./data/gameData.json', 'utf8');
    const gameData = JSON.parse(fileData);
    let gameIdx = findGame(gameData, gameParam);
    let newGameData = gameData;
    if (gameData[gameIdx]["gameState"]["turn"] === "") {
        newGameData[gameIdx]["gameState"]["turn"] = nickParam;
        newGameData[gameIdx]["gameState"]["players"][nickParam] = "white";
    } else {
        newGameData[gameIdx]["gameState"]["players"][nickParam] = "black";
        response.write("data: " + JSON.stringify(newGameData[gameIdx]["gameState"]));
        response.write("\n\n");
    }
    await fsp.writeFile('./data/gameData.json', JSON.stringify(newGameData));


    setInterval(async () => {
        fileData = await fsp.readFile('./data/gameData.json', 'utf8');
        let updatedGameData = JSON.parse(fileData);
        let updatedGameIdx = findGame(updatedGameData, gameParam);
        if (newGameData[gameIdx]["gameState"]["players"].length < 2 && updatedGameData[updatedGameIdx]["gameState"]["players"].length === 2) {
            response.write("data: " + JSON.stringify(updatedGameData[updatedGameIdx]["gameState"]));
            response.write("\n\n");
        }
        if (updatedGameData[updatedGameIdx].hasOwnProperty("winner")) {
            const winner = updatedGameData[updatedGameIdx]["winner"];
            response.write("data: " + JSON.stringify({"winner": winner}));
            response.write("\n\n");
            updatedGameData.remove(updatedGameIdx);
            await fsp.writeFile('./data/gameData.json', JSON.stringify(updatedGameData));
        }
        if (updatedGameData[updatedGameIdx]["gameState"].hasOwnProperty("winner")) {
            response.write("data: " + JSON.stringify(updatedGameData[updatedGameIdx]["gameState"]));
            response.write("\n\n");
            updatedGameData.remove(updatedGameIdx);
            await fsp.writeFile('./data/gameData.json', JSON.stringify(updatedGameData));
        }
        if (newGameData[gameIdx]["gameState"]["move"] !== updatedGameData[updatedGameIdx]["gameState"]["move"]
            || newGameData[gameIdx]["gameState"]["step"] !== updatedGameData[updatedGameIdx]["gameState"]["step"]
            || newGameData[gameIdx]["gameState"]["phase"] !== updatedGameData[updatedGameIdx]["gameState"]["phase"]) {
            response.write("data: " + JSON.stringify(updatedGameData[updatedGameIdx]["gameState"]));
            response.write("\n\n");
        }
        newGameData = updatedGameData;
        gameIdx = findGame(newGameData, gameParam);
    });
}

function findGame(game, gameParam) {
    for (let i = 0; i < game.length; i++) {
        if (game[i]["game"] === gameParam) {
            return i;
        }
    }
    return -1;
}