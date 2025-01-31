import {MongoClient} from 'mongodb'

// Connection URL
const url = 'mongodb://database_raw:27017';
const client = new MongoClient(url, {directConnection: true});
client.connect().then(() => {
    const collection = client.db().collection('collection');

});