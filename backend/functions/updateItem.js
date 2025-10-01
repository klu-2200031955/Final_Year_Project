const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const db = DynamoDBDocumentClient.from(new DynamoDBClient());

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE"
  };

  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  const itemId = event.pathParameters?.id || body?.id;
  const claims = event.requestContext?.authorizer?.claims;
  const userId = claims?.sub;

  if (!itemId || !userId) {
    return {
      statusCode: 400,
      headers,
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
        headers,
        body: JSON.stringify({ message: "Item not found or unauthorized" })
      };
    }

    const existingItem = itemResult.Item;
    const now = new Date().toISOString();

    // Calculate quantity change if quantity is being updated
    let quantityChange = 0;
    if (body.quantity !== undefined && body.quantity !== existingItem.quantity) {
      quantityChange = body.quantity - existingItem.quantity;
    }

    // Check if item is being sold out (quantity going to 0)
    const isSoldOut = body.quantity === 0 && existingItem.quantity > 0;

    const { id, userId: _omitUserId, ...updates } = body;
    
    // Add tracking fields
    updates.updatedAt = now;
    
    if (quantityChange !== 0) {
      updates.lastQuantityChange = quantityChange;
      updates.lastQuantityChangeDate = now;
    }
    
    if (isSoldOut) {
      updates.soldOutAt = now;
    } else if (body.quantity > 0 && existingItem.quantity === 0) {
      // Item restocked, clear soldOutAt
      updates.soldOutAt = null;
    }

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
        headers,
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
      headers,
      body: JSON.stringify(updateResult.Attributes)
    };
  } catch (err) {
    console.error("Error updating item:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error", error: err.message })
    };
  }
};