jest.mock('parse/node', () => {
    class MockParseObject {
      static extend = jest.fn().mockReturnValue(class {});
    }
  
    class MockQuery {
      constructor() {} // ✅ Ensure the constructor exists
      limit = jest.fn().mockReturnThis(); // ✅ Enable method chaining
      find = jest.fn(() => 
        Promise.resolve([
          {
            id: 'object123',
            get: jest.fn((key) => {
              const mockData = {
                discordID: '123456789',
                time: '100',
                name: 'TestUser',
                sessionTime: '30',
                leftTime: '5',
                longestAway: '60',
                timeObject: {},
                farmingObject: {},
              };
              return mockData[key] || null;
            }),
          },
        ])
      ); // ✅ Ensures find() returns a resolved Promise
    }
  
    return {
      __esModule: true,
      default: {
        Object: MockParseObject,
        Query: MockQuery, // ✅ Ensure Query is correctly mocked
      },
    };
  });