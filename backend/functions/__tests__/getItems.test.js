const { handler } = require("../getItems");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

jest.mock("@aws-sdk/lib-dynamodb", () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({ send: jest.fn() }))
    },
    QueryCommand: jest.fn()
  };
});

describe("getItems Lambda", () => {
  let mockSend;

  beforeEach(() => {
    mockSend = jest.fn();
    DynamoDBDocumentClient.from.mockReturnValue({ send: mockSend });
  });

  it("should return items for user", async () => {
    mockSend.mockResolvedValue({ Items: [{ id: "1", name: "Laptop" }] });
    const event = {
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual([{ id: "1", name: "Laptop" }]);
  });

  it("should return 401 if unauthorized", async () => {
    const event = { requestContext: {} };
    const result = await handler(event);
    expect(result.statusCode).toBe(401);
  });
});
