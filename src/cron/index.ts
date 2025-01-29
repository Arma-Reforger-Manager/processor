/*
    HTTP Server
*/
import { createServer, IncomingMessage } from "node:http"
let server = createServer().listen(83)

const headers = {
    'Access-Control-Allow-Origin': 'http://localhost',
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
    console.log({ method: req.method, url: req.url, ...req.headers });

    if (req.method === 'OPTIONS') {
        res.writeHead(200, { ...headers });
        res.end();
    } else {
        // const body = await ReadBody(req)
        // console.debug(body)
        res.writeHead(200, { 'Content-Type': 'application/json', ...headers });

        switch (req.url) {
            default:
                return res.end(JSON.stringify({ success: false }));
                break;
        }
    }
})