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

  it("should update item successfully with tracking fields", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { id: "1", name: "Old", quantity: 5 } }) // GetCommand
      .mockResolvedValueOnce({ 
        Attributes: { 
          id: "1", 
          name: "New", 
          quantity: 5,
          updatedAt: expect.any(String)
        } 
      }); // UpdateCommand

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

  it("should track quantity changes", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { id: "1", name: "Item", quantity: 10 } }) // GetCommand
      .mockResolvedValueOnce({ 
        Attributes: { 
          id: "1", 
          name: "Item", 
          quantity: 15,
          lastQuantityChange: 5,
          lastQuantityChangeDate: expect.any(String),
          updatedAt: expect.any(String)
        } 
      }); // UpdateCommand

    const event = {
      pathParameters: { id: "1" },
      body: JSON.stringify({ quantity: 15 }),
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.lastQuantityChange).toBe(5);
  });

  it("should set soldOutAt when quantity becomes 0", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { id: "1", name: "Item", quantity: 5 } }) // GetCommand
      .mockResolvedValueOnce({ 
        Attributes: { 
          id: "1", 
          name: "Item", 
          quantity: 0,
          soldOutAt: expect.any(String),
          lastQuantityChange: -5,
          updatedAt: expect.any(String)
        } 
      }); // UpdateCommand

    const event = {
      pathParameters: { id: "1" },
      body: JSON.stringify({ quantity: 0 }),
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.soldOutAt).toBeDefined();
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