const { handler } = require("../deleteItem");
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({ send: jest.fn() }))
  },
  GetCommand: jest.fn(function (args) { return { ...args }; }),
  DeleteCommand: jest.fn(function (args) { return { ...args }; })
}));

describe("deleteItem Lambda", () => {
  let mockSend;

  beforeEach(() => {
    mockSend = jest.fn();
    DynamoDBDocumentClient.from.mockReturnValue({ send: mockSend });
  });

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
