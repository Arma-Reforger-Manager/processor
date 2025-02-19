import { GLOBAL_VARS } from './environment.js';
import { Collection, Db, InsertOneResult, MongoClient } from 'mongodb';

// TESTING
const url = `mongodb://${GLOBAL_VARS().MongoDB_Username}:${GLOBAL_VARS().MongoDB_Password}@${GLOBAL_VARS().MongoDB_Host}:${GLOBAL_VARS().MongoDB_Port}`;
const client = new MongoClient(url);

async function main() {
    const dbName = 'test_db1';

    // Use connect method to connect to the server
    await client.connect();
    console.log('MongoDB - Connected successfully to server');
    const db = client.db(dbName,);
    const collection = db.collection('test_cn');

    // the following code examples can be pasted here...
    const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
    // console.log('Inserted documents =>', insertResult);

    // Find All Documents 
    const findResult = await collection.find({}).toArray();
    // console.log('Found documents =>', findResult);

    // Delete All Documents 
    console.debug({
        one: await collection.deleteMany({ a: 1 }),
        two: await collection.deleteMany({ a: 2 }),
        three: await collection.deleteMany({ a: 3 }),
        // msg: 'Deleted documents'
    })

    return 'MongoDB - done testing.';
}
main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());
// END TESTING

export class MongoDB_Query {
    private Database = 'proceessor'
    private Client: MongoClient | null;
    private MongoDB: Db | null;

    constructor() {
        this.Client = null;
        this.MongoDB = null;
    }

    private async DatabaseConnecter(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const Host = GLOBAL_VARS()['MongoDB_Host'];
            const Password = GLOBAL_VARS()['MongoDB_Password'];
            const Username = GLOBAL_VARS()['MongoDB_Username'];
            const Port = GLOBAL_VARS()['MongoDB_Port'];
            this.Client = new MongoClient(`mongodb://${Username}:${Password}@${Host}:${Port}`, {minPoolSize: 1, maxPoolSize: 10, maxIdleTimeMS : 270000});
            this.MongoDB = this.Client.db(this.Database);
            resolve(true)
        });
    }
    
    // Returns doucment's identifier
    public async GetCollection(collectionName: string): Promise<Collection<any>> {
        return new Promise(async (resolve, reject) => {
            if (this.Client === null) await this.DatabaseConnecter();
            if (this.MongoDB === null) await this.DatabaseConnecter();

            return resolve(this.MongoDB!.collection(collectionName));
        });
    }
}