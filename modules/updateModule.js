const fsp = require('fs').promises;
const fs = require('fs');
const serverConfig = require("./configModule");


module.exports = async function (request, response, nickParam, gameParam) {
    try {
        const fileData = await fsp.readFile('./data/gameData.json', 'utf8');
        const gameData = JSON.parse(fileData);
        const gameIdx = findGame(gameData, gameParam);

        response.writeHead(200, serverConfig.headers.sse);

        let fsWait = false;
        let prevGameData = gameData;
        fs.watch('./data/gameData.json', (event, filename) => {
            if (filename) {
                if (fsWait) return;
                fsWait = setTimeout(() => {
                    fsWait = false;
                }, 100);
                fsp.readFile('./data/gameData.json', 'utf8').then(data => {
                    const updatedGameData = JSON.parse(data);
                    if (prevGameData[gameIdx] !== updatedGameData[gameIdx] && Object.keys(updatedGameData[gameIdx]["gameState"]["players"]).length === 2) {
                        gameLoop(updatedGameData, gameIdx, response);
                        prevGameData = updatedGameData;
                    }
                });
            }
        });


        if (gameData[gameIdx]["gameState"]["turn"] === "") {
            gameData[gameIdx]["gameState"]["turn"] = nickParam;
            gameData[gameIdx]["gameState"]["players"][nickParam] = "white";
        } else {
            gameData[gameIdx]["gameState"]["players"][nickParam] = "black";
        }

        await fsp.writeFile('./data/gameData.json', JSON.stringify(gameData));


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

function gameLoop(gameData, gameIdx, response) {
    if (gameData[gameIdx]["gameState"].hasOwnProperty("winner")) {
        if (gameData[gameIdx]["gameState"]["winner"] === null) {
            response.write("data: " + JSON.stringify({"winner": null}));
            response.write("\n\n");
        } else {
            response.write("data: " + JSON.stringify(gameData[gameIdx]["gameState"]));
            response.write("\n\n");
        }
        return;
    }

    response.write("data: " + JSON.stringify(gameData[gameIdx]["gameState"]));
    response.write("\n\n");
}