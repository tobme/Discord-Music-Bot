const DiscordTimeHandler = require('../../cloud/TimeHandling/DiscordTimeHandler.js')
const TimeTracker = require('../../cloud/TimeHandling/TimeTracker.js')
const {UserManager, User} = require('../../cloud/TimeHandling/UserManager.js')
const Parse = require('parse/node')


jest.mock('../../cloud/TimeHandling/UserManager.js', function () {
  return {
      UserManager: jest.fn().mockImplementation(function () {
              this.getUser = jest.fn()
              this.userExists = jest.fn()
              this.addUser = jest.fn()
              this.updateUser = jest.fn()
      }),
      User: jest.requireActual('../../cloud/TimeHandling/UserManager.js').User
  };
});

jest.mock('../../cloud/TimeHandling/TimeTracker.js', function () {
  return jest.fn().mockImplementation(function () {
      this.updateLongestAway = jest.fn()
      this.updateTime = jest.fn()
      this.updateFarmingTime = jest.fn()
  });
});

jest.mock('parse/node', function () {
  function MockParseObject() {
      this.set = jest.fn(); // Mocking `set()` method of Parse.Object
  }

  MockParseObject.extend = function () {
      return MockParseObject; // Returning the mocked class
  };

  function MockQuery() {
      // Ensure the constructor exists
  }

  MockQuery.prototype.testing = function () {
      console.log("Here");
  };

  MockQuery.prototype.limit = jest.fn().mockReturnThis(); // Method chaining
  MockQuery.prototype.find = jest.fn().mockResolvedValue([
      {
          id: 'object123',
          get: jest.fn(function (key) {
              var mockData = {
                  id: 'dbID',
                  discordID: 'ID',
                  time: 0,
                  name: 'TestUser',
                  sessionTime: 0,
                  leftTime: '-1',
                  longestAway: 5,
                  timeObject: {},
                  farmingObject: {},
              };
              return mockData[key]; // Return null if key doesn't exist
          }),
      },
  ]); // Mock `find()` to return a resolved promise

  return {
      Object: MockParseObject,
      Query: MockQuery,
  };
});




describe('DiscordTimeHandler tests', () => {

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks()
  });

  test('retrieveDiscordTimes_OneUser_ExpectEqualInDict', async () => {

    const mockUserManager = new UserManager(); 
    const timeTrackerMock = new TimeTracker(mockUserManager, Parse)

    const discordTimeHandler = new DiscordTimeHandler(mockUserManager, timeTrackerMock, Parse)

    const currentTime = new Date('2026-05-15T10:15:00.000Z');

    jest.spyOn(global, 'Date')
        .mockImplementation(() => currentTime)

    await discordTimeHandler.retrieveDiscordTimes()

    const tmpUser = {
      objectId: 'object123',
      time: 0,
      inDiscord: false,
      userName: 'TestUser',
      joinTime: currentTime,
      sessionTime: 0,
      leftTime: '-1',
      longestAway: 5,
      timeObject: {},
      farmingObject: {},
    };

    expect(mockUserManager.addUser).toHaveBeenCalledWith('ID', tmpUser)
  });

  test('retrieveDiscordTimes_MultibleUsers_ExpectEqualInDict', async () => {

    const mockUserManager = new UserManager(); 
    const timeTrackerMock = new TimeTracker(mockUserManager, Parse)

    Parse.Query.prototype.find.mockImplementationOnce(() => [
      {
        id: 'object123',
        get: jest.fn(function (key) {
            var mockData = {
                id: 'dbID',
                discordID: 'ID',
                time: 0,
                name: 'TestUser',
                sessionTime: 0,
                leftTime: '-1',
                longestAway: 5,
                timeObject: {},
                farmingObject: {},
            };
            return mockData[key]; // Return null if key doesn't exist
        }),
      },
      {
        id: 'object1234',
        get: jest.fn(function (key) {
            var mockData = {
                id: 'dbID',
                discordID: 'ID2',
                time: 0,
                name: 'TestUser',
                sessionTime: 5,
                leftTime: '-1',
                longestAway: 5,
                timeObject: {},
                farmingObject: {},
            };
            return mockData[key]; // Return null if key doesn't exist
        }),
      },
    ]);

    const discordTimeHandler = new DiscordTimeHandler(mockUserManager, timeTrackerMock, Parse)

    const currentTime = new Date('2026-05-15T10:15:00.000Z');

    jest.spyOn(global, 'Date')
        .mockImplementation(() => currentTime)

    await discordTimeHandler.retrieveDiscordTimes()

    const tmpUser = {
      objectId: 'object123',
      time: 0,
      inDiscord: false,
      userName: 'TestUser',
      joinTime: currentTime,
      sessionTime: 0,
      leftTime: '-1',
      longestAway: 5,
      timeObject: {},
      farmingObject: {},
    };

    const tmpUser2 = {
      objectId: 'object1234',
      time: 0,
      inDiscord: false,
      userName: 'TestUser',
      joinTime: currentTime,
      sessionTime: 5,
      leftTime: '-1',
      longestAway: 5,
      timeObject: {},
      farmingObject: {},
    };

    expect(mockUserManager.addUser).toHaveBeenCalledWith('ID', tmpUser)
    expect(mockUserManager.addUser).toHaveBeenCalledWith('ID2', tmpUser2)
  });

  test("userJoined_newUser_expectNewUser", () => {

      const mockUserManager = new UserManager(); 
      const timeTrackerMock = new TimeTracker(mockUserManager, Parse)

      const discordTimeHandler = new DiscordTimeHandler(mockUserManager, timeTrackerMock, Parse)

      const currentTime = new Date('2026-05-15T10:15:00.000Z');

      jest.spyOn(global, 'Date')
          .mockImplementation(() => currentTime)

      const tmpUser = {
        objectId: null,
        time: 0,
        inDiscord: true,
        userName: 'mongo',
        joinTime: currentTime,
        sessionTime: 0,
        leftTime: '-1',
        longestAway: 0,
        timeObject: {},
        farmingObject: {},
      };

      discordTimeHandler.userJoined('123', 'mongo')

      expect(mockUserManager.addUser).toHaveBeenCalledWith('123', tmpUser)
  });

  test("userJoined_oldUser_expectOldUser", () => {

    const mockUserManager = new UserManager(); 
    const timeTrackerMock = new TimeTracker(mockUserManager, Parse)

    const discordTimeHandler = new DiscordTimeHandler(mockUserManager, timeTrackerMock, Parse)

    const currentTime = new Date('2026-05-15T10:15:00.000Z');

    jest.spyOn(global, 'Date')
        .mockImplementation(() => currentTime)

    const tmpUser = {
      objectId: null,
      time: 0,
      inDiscord: true,
      userName: 'mongo',
      joinTime: currentTime,
      sessionTime: 0,
      leftTime: '-1',
      longestAway: 0,
      timeObject: {},
      farmingObject: {},
    };

    discordTimeHandler.retrieveDiscordTimes()

    discordTimeHandler.userJoined('ID', 'mongo')

    expect(mockUserManager.addUser).not.toHaveBeenCalledWith('123', tmpUser)
  });

test("isUserInDiscord_noUser_expectFalse", () => {

    const mockUserManager = new UserManager(); 
    const timeTrackerMock = new TimeTracker(mockUserManager, Parse)

    const discordTimeHandler = new DiscordTimeHandler(mockUserManager, timeTrackerMock, Parse)

    expect(discordTimeHandler.isUserInDiscord('123')).toBe(false)
  });

  test("isUserInDiscord_UserNotInDiscord_expectFalse", () => {

    const mockUserManager = new UserManager(); 
    const timeTrackerMock = new TimeTracker(mockUserManager, Parse)

    const user = new User('UserName', 0, false, new Date(), 'id', 0, "2025-02-11T09:30:00.000Z", 10, new Object(), new Object())

    mockUserManager.getUser = jest.fn().mockReturnValue(user)

    const discordTimeHandler = new DiscordTimeHandler(mockUserManager, timeTrackerMock, Parse)

    expect(discordTimeHandler.isUserInDiscord('123')).toBe(false)
  });

  test("isUserInDiscord_UserInDiscord_expectTrue", () => {

    const mockUserManager = new UserManager(); 
    const timeTrackerMock = new TimeTracker(mockUserManager, Parse)

    const user = new User('UserName', 0, true, new Date(), 'id', 0, "2025-02-11T09:30:00.000Z", 10, new Object(), new Object())

    mockUserManager.getUser = jest.fn().mockReturnValue(user)

    const discordTimeHandler = new DiscordTimeHandler(mockUserManager, timeTrackerMock, Parse)

    expect(discordTimeHandler.isUserInDiscord('123')).toBe(true)
  });

});
