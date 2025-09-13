const { handler } = require("../updateItem");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({ send: jest.fn() }))
  },
  GetCommand: jest.fn(function (args) { return { ...args }; }),
  UpdateCommand: jest.fn(function (args) { return { ...args }; })
}));

describe("updateItem Lambda", () => {
  let mockSend;

  beforeEach(() => {
    mockSend = jest.fn();
    DynamoDBDocumentClient.from.mockReturnValue({ send: mockSend });
  });

  it("should update item successfully", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { id: "1", name: "Old" } }) // GetCommand
      .mockResolvedValueOnce({ Attributes: { id: "1", name: "New" } }); // UpdateCommand

    const event = {
      pathParameters: { id: "1" },
      body: JSON.stringify({ name: "New" }),
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).name).toBe("New");
    expect(mockSend).toHaveBeenCalledWith(expect.any(UpdateCommand));
  });

  it("should return 404 if item not found", async () => {
    mockSend.mockResolvedValueOnce({}); // GetCommand returns no Item
    const event = {
      pathParameters: { id: "1" },
      body: JSON.stringify({ name: "New" }),
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(404);
  });
});
