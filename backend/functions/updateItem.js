const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const db = DynamoDBDocumentClient.from(new DynamoDBClient());

exports.handler = async (event) => {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  const itemId = event.pathParameters?.id || body?.id;
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
    const itemResult = await db.send(new GetCommand(getParams));

    if (!itemResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found or unauthorized" })
      };
    }

    const { id, ...updates } = body;
    const updateExpr = [];
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    for (const key in updates) {
      ExpressionAttributeNames[`#${key}`] = key;
      ExpressionAttributeValues[`:${key}`] = updates[key];
      updateExpr.push(`#${key} = :${key}`);
    }

    if (updateExpr.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No fields to update" })
      };
    }

    const updateParams = {
      TableName: process.env.TABLE_NAME,
      Key: { userId, id: itemId },
      UpdateExpression: `SET ${updateExpr.join(', ')}`,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW"
    };

    const updateResult = await db.send(new UpdateCommand(updateParams));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS,PUT, DELETE"
      },
      body: JSON.stringify(updateResult.Attributes)
    };
  } catch (err) {
    console.error("Error updating item:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error: err.message })
    };
  }
};
