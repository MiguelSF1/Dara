const http = require('http');
const url  = require('url');
const serverRegister = require('./registerModule');
const serverRanking = require('./rankingModule');

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

const server = http.createServer(function (request, response) {
    const parsedUrl = url.parse(request.url,true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    let answer = {};

    switch (request.method) {
        case 'GET':
            answer = doGet(pathname, request, response);
            break;
        case 'POST':
            doPost(pathname, request, response);
            break;
        default:
            answer.status = 400;
    }

});

server.listen(8008);


function doGet(pathname, request, response) {
    let answer = {};

    switch (pathname) {
        case '/update':
            answer.style = 'sse';
            break;
        default:
            answer.status = 400;
        break;
    }

    return answer;
}

function doPost(pathname, request, response) {

    switch (pathname) {
        case '/register':
            serverRegister(request, response).then(() => {});
            break;
        case '/join':
            break;
        case '/leave':
            break;
        case '/notify':
            break;
        case 'ranking':
            serverRanking(request, response).then(() => {});
            break;
        default:
            response.writeHead(404, headers.plain);
            response.end();
            break;
    }
}

