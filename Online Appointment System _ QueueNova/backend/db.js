// db.js (AWS DynamoDB Version)
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const dynamo = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "QueueNovaTable";

const collections = [
    'users', 'family_members', 'appointments', 'doctors', 'services', 
    'hospitals', 'prescriptions', 'health_records', 'notifications', 
    'reviews', 'labTests', 'labBookings', 'medicines', 'medicineOrders', 
    'healthMetrics'
];

const readDB = async () => {
    const dbState = {};
    const fetchPromises = collections.map(async (coll) => {
        try {
            const result = await dynamo.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: coll }
            }));
            dbState[coll] = result.Item ? result.Item.data : [];
        } catch (err) {
            console.error(`Error loading ${coll} from DynamoDB:`, err);
            dbState[coll] = [];
        }
    });

    await Promise.all(fetchPromises);
    return dbState;
};

const writeDB = async (dbState) => {
    for (const coll of collections) {
        if (dbState[coll]) {
            try {
                await dynamo.send(new PutCommand({
                    TableName: TABLE_NAME,
                    Item: {
                        PK: coll,
                        data: dbState[coll]
                    }
                }));
            } catch (err) {
                console.error(`Error saving ${coll} to DynamoDB:`, err);
            }
        }
    }
};

module.exports = { readDB, writeDB };
