const fsp = require('fs').promises;

async function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        let data = '';
        request.on('data', chunk => {
            data += chunk;
        });
        request.on('end', () => {
            resolve(data);
        });
        request.on('error', (error) => {
            reject(error);
        });
    });
}


const headers = {
    plain: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    },
    sse: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
    }
};

module.exports = async function (request, response) {
    let answer;
    let status;

    try {
        const data = await readRequestBody(request);
        const userInput = JSON.parse(data);

        if (!userInput.hasOwnProperty("group") || !userInput.hasOwnProperty("size")) {
            answer.error = "invalid body";
            response.writeHead(400, headers.plain);
            response.end(JSON.stringify(answer));
            return;
        }

        const fileData = await fsp.readFile('leaderboardData.json', 'utf8');
        const leaderboardData = JSON.parse(fileData);

        const leaderboard = findLeaderboard(leaderboardData, userInput);
        if (leaderboard === undefined) {
            status = 400;
            answer = {};
        } else {
            status = 200;
            leaderboard.sort(orderLeaderboard);
            answer = leaderboard.slice(0, 10);
        }

        response.writeHead(status, headers.plain);
        response.end(JSON.stringify(answer));
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        response.writeHead(500, headers.plain);
        response.end();
    }

}

function findLeaderboard(leaderboardData, userInput) {
    for (let i = 0; i < leaderboardData.length; i++) {
        if (leaderboardData[i].group === userInput.group && leaderboardData[i].size === userInput.size) {
            return leaderboardData[i].table;
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