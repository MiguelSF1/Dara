const fsp = require('fs').promises;
const serverConfig = require("./configModule");


module.exports = async function (request, response, nickParam, gameParam) {
    try {
        const fileData = await fsp.readFile('./data/gameData.json', 'utf8');
        const gameData = JSON.parse(fileData);
        const gameIdx = findGame(gameData, gameParam);

        if (Object.keys(gameData[gameIdx]["gameState"]["players"]).length < 2) {
            response.writeHead(200, serverConfig.headers.sse);

            if (gameData[gameIdx]["gameState"]["turn"] === "") {
                gameData[gameIdx]["gameState"]["turn"] = nickParam;
                gameData[gameIdx]["gameState"]["players"][nickParam] = "white";
            } else {
                gameData[gameIdx]["gameState"]["players"][nickParam] = "black";
                response.write("data: " + JSON.stringify(gameData[gameIdx]["gameState"]));
                response.write("\n\n");
            }

            await fsp.writeFile('./data/gameData.json', JSON.stringify(gameData));

            await gameLoop(gameData, gameIdx, response);

        } else {
            response.writeHead(400, serverConfig.headers.sse);
            response.end();
        }
    } catch (error) {
        console.error('Error processing :', error);
        response.writeHead(500, serverConfig.headers.plain);
        response.end();
    }
}

function findGame(game, gameParam) {
    for (let i = 0; i < game.length; i++) {
        if (game[i]["game"] === gameParam) {
            return i;
        }
    }
    return -1;
}

async function gameLoop(gameData, gameIdx, response) {
    try {
        const fileData = await fsp.readFile('./data/gameData.json', 'utf8');
        const updatedGameData = JSON.parse(fileData);

        if (updatedGameData[gameIdx]["gameState"].hasOwnProperty("winner")) {
            if (updatedGameData[gameIdx]["gameState"]["winner"] === null) {
                response.write("data: " + JSON.stringify({"winner": null}));
                response.write("\n\n");
            } else {
                response.write("data: " + JSON.stringify(updatedGameData[gameIdx]["gameState"]));
                response.write("\n\n");
            }
            return;
        }

        if (Object.keys(gameData[gameIdx]["gameState"]["players"]).length < 2 && Object.keys(updatedGameData[gameIdx]["gameState"]["players"]).length === 2) {
            response.write("data: " + JSON.stringify(updatedGameData[gameIdx]["gameState"]));
            response.write("\n\n");

        }

        if (!gameData[gameIdx]["gameState"].hasOwnProperty("move") && updatedGameData[gameIdx]["gameState"].hasOwnProperty("move")) {
            response.write("data: " + JSON.stringify(updatedGameData[gameIdx]["gameState"]));
            response.write("\n\n");
        } else if (gameData[gameIdx]["gameState"]["move"] !== updatedGameData[gameIdx]["gameState"]["move"]) {
            response.write("data: " + JSON.stringify(updatedGameData[gameIdx]["gameState"]));
            response.write("\n\n");
        }

        setTimeout(() => {
            gameLoop(updatedGameData, gameIdx, response);
        }, 4000)

    } catch (error) {
        console.error('Error processing :', error);
        response.writeHead(500, serverConfig.headers.plain);
        response.end();
    }
}