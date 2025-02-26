import { ObjectId } from "mongodb";
import { MariaDB, MongoDB } from "./index.js";
import { createHash } from "crypto";
import { GLOBAL_VARS } from "./environment.js";

interface DocumentWithLogs {
	_id: ObjectId
	token?: string
	server_token?: string
	website_token?: string
	logs?: string[]
	log?: string
}

// Database
const rawClass = new MongoDB.MongoDB_Query()
const rawLogger = await rawClass.GetCollection('game_logs')

async function main_loop() {
	if  (GLOBAL_VARS().IS_DEVELOPMENT) console.log('Running game_log_loop.ts main_loop()')
	try {
		const UnProcessedBatchedLogs = await rawLogger.find(
			{
				processed: {
					$exists: false
				},
				$or: [
					{
						logs: {
							$exists: true
						}
					}
				]
			}, { limit: 25 }
		).toArray()
		const UnProcessedLogs = await rawLogger.find(
			{
				processed: {
					$exists: false
				},
				$or: [
					{
						log: {
							$exists: true
						}
					}
				]
			}, { limit: 50 }
		).toArray()

		// Close database link

		// const log = rawLogger.insertOne(body)
		const logs = [...UnProcessedBatchedLogs, ...UnProcessedLogs] // <= 300

		// About 300 logs MAX
		for (let index = 0; index < logs.length; index++) {
			const document = logs[index];

			// Check for tokens
			await identifiers(document)
			const extracted_logs = extractFromString(document);
			await rawLogger.updateOne({ _id: document._id }, { $set: { website_token: null, server_token: null, ...document, extracted_logs, processed: true } })
		}
	} catch (error) {
		console.error({ error })
	}
}

 function extractFromString(document: DocumentWithLogs): any[] {
	const logs = document.log ?? document.logs;
	if (!logs) return [];

	let extracted = []
	if (Array.isArray(logs)) {

		logs.forEach(log => {
			if (typeof log === 'string') {
				try {
					const extract = JSON.parse(log)
					extracted.push(extract)
				} catch (error) {

				}
			}
		});
	} else {
		try {
			extracted.push(JSON.parse(logs))
		} catch (error) {

		}
	}

	return extracted;
}

async function identifiers(document: DocumentWithLogs): Promise<void> {
	// console.debug({ document })
	const QueryClass = new MariaDB.MariaDB_Query();
	const QueryConnector = await QueryClass.GetConnection();

	// Hashes
	let WebsiteTokenHash: any = false
	if (document.website_token)
		WebsiteTokenHash = createHash('sha512').update(document.website_token).digest('base64');
	let ServerTokenHash: any = false
	if (document.server_token)
		ServerTokenHash = createHash('sha512').update(document.server_token).digest('base64');

	// Queries
	const Query_ServerToken = QueryConnector.query<any[]>(
		"SELECT COUNT(`row.identifier`) AS count FROM `tokens` WHERE `server.token.hash`=? LIMIT 1;",
		[ServerTokenHash]
	)
	const Query_WebsiteToken = QueryConnector.query<any[]>(
		"SELECT COUNT(`row.identifier`) AS count FROM `tokens` WHERE  `website.token.hash`=? LIMIT 1;",
		[WebsiteTokenHash]
	)
	const Query_BothTokens = QueryConnector.query<any[]>(
		"SELECT COUNT(`row.identifier`) AS count FROM `tokens` WHERE `server.token.hash`=? OR `website.token.hash`=? LIMIT 1;",
		[ServerTokenHash, WebsiteTokenHash]
	)

	const Select_Query = await Promise.all([
		Query_ServerToken,
		Query_WebsiteToken,
		Query_BothTokens
	])

	// Both tokens here so see if they are in processed database
	if (document.server_token && document.website_token) {
		const Result_Count = Select_Query[2][0][0]['count']
		// Is the token used
		if (Result_Count === 0) {
			await QueryConnector.query(
				"INSERT INTO `tokens` (`server.token`, `server.token.hash`, `website.token`, `website.token.hash`) VALUES (?,?, ?,?);",
				[document.server_token, ServerTokenHash, document.website_token, WebsiteTokenHash]
			)
		}
	} else {
		if (document.server_token) {
			const Query = Select_Query[1]

			const Response = Query[0];
			const Result = Response[0];
			const Result_Count = Result['count']
			// Is the token used
			if (Result_Count === 0) {
				await QueryConnector.query(
					"INSERT INTO `tokens` (`server.token`, `server.token.hash`) VALUES (?,?);",
					[document.server_token, ServerTokenHash]
				)
			}
		}

		if (document.website_token) {
			const Query = Select_Query[1]

			const Response = Query[0];
			const Result = Response[0];
			const Result_Count = Result['count']
			// Is the token used
			if (Result_Count === 0) {
				// Ready server token for insertion
				const website_token = document.website_token;
				const website_token_hash = WebsiteTokenHash;
				await QueryConnector.query(
					"INSERT INTO `tokens` (`website.token`, `website.token.hash`) VALUES (?,?);",
					[website_token, website_token_hash]
				)
			}
		}
	}
}

setInterval(() => {
	main_loop()
}, 300000); //5 minutes