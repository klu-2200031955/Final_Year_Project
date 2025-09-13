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

const { handler } = require("../updateItem");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");

describe("updateItem Lambda", () => {

  beforeEach(() => mockSend.mockReset());

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
