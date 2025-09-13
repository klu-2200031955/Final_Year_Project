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

const { handler } = require("../getItems");
describe("getItems Lambda", () => {

  beforeEach(() => mockSend.mockReset());

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
