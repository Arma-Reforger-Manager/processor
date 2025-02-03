/*
    HTTP Server
*/
// console.log({...import.meta.env})
import { createServer, IncomingMessage } from "node:http"
import { env } from "node:process";
let server = createServer().listen(82, () => {
    console.debug({ listenPort: 82, NODE_ENV: env['NODE_ENV'] })
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
            if (req.headers["content-type"] === 'application/json') {
                try {
                    res(JSON.parse(body))
                } catch (error) {
                    console.error({error})
                    res(body)
                }
            }else res(body)
        })
    })
}

server.on("request", async (req, res) => {
    console.log({ method: req.method, url: req.url });

    if (req.method === 'OPTIONS') {
        res.writeHead(200, { ...headers });
        res.end();
    } else {
        const body: any = await ReadBody(req)
        res.writeHead(200, { 'Content-Type': 'application/json', ...headers });

        switch (req.url) {
            case '/game/logs':
                console.debug({ body })
                // console.debug({ ...body, ...req.rawHeaders })
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
try {
    console.log('Importing MongoDB')
    await import('./MongoDB.js')
} catch (error: any) {
    console.debug({ error })
    throw new Error("Failed to import MongoDB")
}

try {
    console.log('Importing MariaDB')
    await import('./MariaDB.js')
} catch (error: any) {
    console.debug({ error })
    throw new Error("Failed to import MariaDB")
}