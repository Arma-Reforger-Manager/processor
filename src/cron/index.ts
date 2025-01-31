/*
    HTTP Server
*/
// console.log({...import.meta.env})
import { createServer, IncomingMessage } from "node:http"
import { env } from "node:process";
let server = createServer().listen(82, () => {
    console.debug({listenPort: 82, NODE_ENV: env['NODE_ENV']})
})

const headers = {
    'Access-Control-Allow-Origin': env['NODE_ENV'] === 'production' ? "https://raw.fabby.dev" : "http://localhost",
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': 2592000, // 30 days
};

async function ReadBody(req: IncomingMessage) {
    return new Promise((res, rej) => {
        let body = "";
        req.on('readable', function () {
            const read = req.read();
            if (read) body += read
        });
        req.on('end', function () {
            res(body)
        })
    })
}

server.on("request", async (req, res) => {
    console.log({ method: req.method, url: req.url });

    if (req.method === 'OPTIONS') {
        res.writeHead(200, { ...headers });
        res.end();
    } else {
        const body = await ReadBody(req)
        res.writeHead(200, { 'Content-Type': 'application/json', ...headers });

        switch (req.url) {
            case '/game/logs':
                console.debug({'/game/logs': body})
                return res.end(JSON.stringify({ success: true }));
                break;

            default:
                return res.end(JSON.stringify({ success: false }));
                break;
        }
    }
})

/*
    Database(s)
*/
import './mongo.js'