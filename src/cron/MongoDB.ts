import {MongoClient} from 'mongodb'
import { GLOBAL_VARS } from './environment.js';

// Connection URL
const url = `mongodb://${GLOBAL_VARS()['MongoDB_Username']}:${GLOBAL_VARS()['MongoDB_Password']}@${GLOBAL_VARS()['MongoDB_Host']}:27017`;
const client = new MongoClient(url);
client.connect().then(async () => {
    const collection = client.db('processor').collection('collection');
    console.log(await collection.insertOne({test: true}))
})

console.log("mongodb")
