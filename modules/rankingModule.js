const fsp = require('fs').promises;
const serverConfig = require("./configModule");

module.exports = async function (request, response) {
    let answer = {};
    let status;

    try {
        const data = await serverConfig.readRequestBody(request);
        const userInput = JSON.parse(data);

        if (!userInput.hasOwnProperty("group") || !userInput.hasOwnProperty("size")) {
            answer.error = "undefined group or size";
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
            response.writeHead(400, serverConfig.headers.plain);
            response.end(JSON.stringify(answer));
            return;
        }

        if (!Number.isInteger(userInput["size"]["rows"]) || !Number.isInteger(userInput["size"]["columns"])) {
            answer.error = "invalid rows or columns value from size";
            response.writeHead(400, serverConfig.headers.plain);
            response.end(JSON.stringify(answer));
            return;
        }

        if (userInput["group"] <= 0) {
            answer.error = "group value has to be positive";
            response.writeHead(400, serverConfig.headers.plain);
            response.end(JSON.stringify(answer));
            return;
        }

        const fileData = await fsp.readFile('./data/leaderboardData.json', 'utf8');
        const leaderboardData = JSON.parse(fileData);

        const leaderboard = findLeaderboard(leaderboardData, userInput);
        if (leaderboard === undefined) {
            status = 200;
            answer = { "ranking": [] };
        } else {
            status = 200;
            leaderboard.sort(orderLeaderboard);
            answer = { "ranking": leaderboard.slice(0, 10) };
        }

        response.writeHead(status, serverConfig.headers.plain);
        response.end(JSON.stringify(answer));
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        response.writeHead(500, serverConfig.headers.plain);
        response.end();
    }

}

function findLeaderboard(leaderboardData, userInput) {
    for (let i = 0; i < leaderboardData.length; i++) {
        if (leaderboardData[i].group === userInput.group && leaderboardData[i]["size"]["rows"] === userInput["size"]["rows"]
            && leaderboardData[i]["size"]["columns"] === userInput["size"]["columns"]) {
            return leaderboardData[i]["ranking"];
        }
    }
}

function orderLeaderboard(a, b) {
    if (a.wins > b.wins) {
        return -1;
    }

    if (a.wins < b.wins) {
        return 1;
    }

    if (a.defeats > b.defeats) {
        return 1;
    }

    if (a.defeats < b.defeats) {
        return -1;
    }

    return 0;
}