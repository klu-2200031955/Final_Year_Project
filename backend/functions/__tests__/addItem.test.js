const { handler } = require("../addItem");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

jest.mock("@aws-sdk/lib-dynamodb", () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({ send: jest.fn() }))
    },
    PutCommand: jest.fn()
  };
});

describe("addItem Lambda", () => {
  let mockSend;

  beforeEach(() => {
    mockSend = jest.fn();
    DynamoDBDocumentClient.from.mockReturnValue({ send: mockSend });
  });

  it("should add item successfully", async () => {
    mockSend.mockResolvedValue({});
    const event = {
      body: JSON.stringify({
        id: "1",
        name: "Laptop",
        description: "Gaming Laptop",
        category: "Electronics",
        quantity: 5,
        price: 1200,
        createdAt: "2025-01-01T00:00:00Z"
      }),
      requestContext: {
        authorizer: { claims: { sub: "user123", email: "test@example.com" } }
      }
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe("Item added successfully");
    expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  it("should fail if no userId", async () => {
    const event = { body: "{}", requestContext: {} };
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
  });
});
