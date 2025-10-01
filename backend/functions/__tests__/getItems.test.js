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

  it("should return items for user with tracking fields", async () => {
    const mockItems = [
      { 
        id: "1", 
        name: "Laptop",
        quantity: 10,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
        lastQuantityChange: 5,
        lastQuantityChangeDate: "2025-01-02T00:00:00Z"
      }
    ];
    
    mockSend.mockResolvedValue({ Items: mockItems });
    
    const event = {
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };
    
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    const items = JSON.parse(result.body);
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveProperty('createdAt');
    expect(items[0]).toHaveProperty('updatedAt');
    expect(items[0]).toHaveProperty('lastQuantityChange');
    expect(items[0]).toHaveProperty('lastQuantityChangeDate');
    expect(items[0]).toHaveProperty('soldOutAt');
  });

  it("should add default tracking fields to items without them", async () => {
    const mockItems = [
      { 
        id: "1", 
        name: "Old Item",
        quantity: 5
        // Missing tracking fields
      }
    ];
    
    mockSend.mockResolvedValue({ Items: mockItems });
    
    const event = {
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };
    
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    const items = JSON.parse(result.body);
    expect(items[0]).toHaveProperty('createdAt');
    expect(items[0]).toHaveProperty('updatedAt');
    expect(items[0]).toHaveProperty('lastQuantityChange', 0);
    expect(items[0]).toHaveProperty('soldOutAt', null);
  });

  it("should return empty array when no items found", async () => {
    mockSend.mockResolvedValue({ Items: [] });
    
    const event = {
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };
    
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual([]);
  });

  it("should return 401 if unauthorized", async () => {
    const event = { requestContext: {} };
    const result = await handler(event);
    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body).error).toBe("Unauthorized");
  });

  it("should handle database errors gracefully", async () => {
    mockSend.mockRejectedValue(new Error("Database error"));
    
    const event = {
      requestContext: { authorizer: { claims: { sub: "user123" } } }
    };
    
    const result = await handler(event);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe("Could not fetch items");
  });
});