const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const db = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const claims = event.requestContext.authorizer?.claims;
  const userId = claims?.sub;

  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized" })
    };
  }

  const params = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: {
      ':uid': userId
    }
  };

  try {
    const data = await db.send(new QueryCommand(params));
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS,PUT, DELETE"
      },
      body: JSON.stringify(data.Items)
    };
  } catch (err) {
    console.error("Error fetching items:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not fetch items" })
    };
  }
};
