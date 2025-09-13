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

  it("should delete item successfully", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { id: "1", name: "Laptop" } }) // GetCommand
      .mockResolvedValueOnce({}); // DeleteCommand

    const event = {
      pathParameters: { id: "1" },
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe("Item deleted successfully");
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
  });
});
