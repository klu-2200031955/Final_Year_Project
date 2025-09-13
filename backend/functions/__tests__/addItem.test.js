// ---- mock before importing handler ----
const mockSend = jest.fn();
jest.mock("@aws-sdk/lib-dynamodb", () => {
  const actual = jest.requireActual("@aws-sdk/lib-dynamodb");
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({ send: mockSend }))
    }
  };
});

const { handler } = require("../addItem");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");

describe("addItem Lambda", () => {

  beforeEach(() => mockSend.mockReset());

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
