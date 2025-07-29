const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const db = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const itemId = event.pathParameters?.id;
  const claims = event.requestContext?.authorizer?.claims;
  const userId = claims?.sub;

  if (!itemId || !userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing item ID or user not authenticated" })
    };
  }

  const getParams = {
    TableName: process.env.TABLE_NAME,
    Key: { userId, id: itemId }
  };

  try {
    const result = await db.send(new GetCommand(getParams));

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found or unauthorized" })
      };
    }
    
    const deleteParams = {
      TableName: process.env.TABLE_NAME,
      Key: { userId, id: itemId }
    };

    await db.send(new DeleteCommand(deleteParams));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS,PUT, DELETE"
      },
      body: JSON.stringify({ message: "Item deleted successfully" })
    };
  } catch (err) {
    console.error("Error deleting item:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error: err.message })
    };
  }
};
