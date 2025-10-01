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
    
    // Ensure all items have the required tracking fields
    const items = (data.Items || []).map(item => ({
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
      lastQuantityChange: item.lastQuantityChange || 0,
      lastQuantityChangeDate: item.lastQuantityChangeDate || item.createdAt || new Date().toISOString(),
      soldOutAt: item.soldOutAt || null
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS,PUT, DELETE"
      },
      body: JSON.stringify(items)
    };
  } catch (err) {
    console.error("Error fetching items:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not fetch items" })
    };
  }
};