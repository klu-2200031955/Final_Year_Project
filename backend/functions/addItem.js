const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const db = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  const claims = event.requestContext.authorizer?.claims;
  const userId = claims?.sub;         
  const userEmail = claims?.email;    

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Unauthorized or missing user info." })
    };
  }

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      userId,                        
      email: userEmail,              
      id: body.id,
      name: body.name,
      description: body.description,
      category: body.category,
      quantity: body.quantity,
      price: body.price,
      createdAt: body.createdAt
    }
  };

  try {
    await db.send(new PutCommand(params));
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS,PUT, DELETE"
      },
      body: JSON.stringify({ message: "Item added successfully" })
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not add item" })
    };
  }
};
