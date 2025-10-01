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

const { handler } = require("../deleteItem");
const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");

describe("deleteItem Lambda", () => {

  beforeEach(() => mockSend.mockReset());

  it("should delete item successfully and return deleted item", async () => {
    const mockItem = { 
      id: "1", 
      name: "Laptop",
      quantity: 5,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-02T00:00:00Z"
    };
    
    mockSend
      .mockResolvedValueOnce({ Item: mockItem }) // GetCommand
      .mockResolvedValueOnce({}); // DeleteCommand

    const event = {
      pathParameters: { id: "1" },
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Item deleted successfully");
    expect(body.deletedItem).toEqual(mockItem);
    expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteCommand));
  });

  it("should return 404 if item not found", async () => {
    mockSend.mockResolvedValueOnce({}); // GetCommand returns no Item
    const event = {
      pathParameters: { id: "1" },
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe("Item not found or unauthorized");
  });

  it("should return 400 if missing item ID", async () => {
    const event = {
      pathParameters: {},
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
  });

  it("should return 400 if user not authenticated", async () => {
    const event = {
      pathParameters: { id: "1" },
      requestContext: {}
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
  });
});