const fsp = require('fs').promises;

module.exports = async function (request, response) {
    let answer = {};
    let status;

    try {
        const data = await readRequestBody(request);
        const userInput = JSON.parse(data);

        if (!userInput.hasOwnProperty("nick") || !userInput.hasOwnProperty("password")) {
            answer.error = "undefined nick or password";
            response.writeHead(400, headers.plain);
            response.end(JSON.stringify(answer));
            return;
        }

        const fileData = await fsp.readFile('userData.json', 'utf8');
        const userData = JSON.parse(fileData);

        const login = tryLogin(userData, userInput);
        if (login === 2) {
            userData.push(userInput);
            await registerUser(userData);
            status = 200;
        } else if (login === 1) {
            status = 200;
        } else {
            status = 401;
            answer.error = "wrong password for nick";
        }

        response.writeHead(status, headers.plain);
        response.end(JSON.stringify(answer));
    } catch (error) {
        console.error('Error processing registration:', error);
        response.writeHead(500, headers.plain);
        response.end();
    }
}

async function registerUser(query) {
    await fsp.writeFile('userData.json', JSON.stringify(query));
}

function tryLogin(data, query) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].nick === query.nick) {
            if (data[i].password === query.password) {
                return 1;
            }
            return 0;
        }
    }
    return 2;
}


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
