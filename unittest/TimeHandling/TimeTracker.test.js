const TimeTracker = require('../../cloud/TimeHandling/TimeTracker.js')
const {UserManager, User} = require('../../cloud/TimeHandling/UserManager.js')
const Parse = require('parse/node')

jest.mock('../../TimeHandling/UserManager.js', () => {
    return {
        UserManager: jest.fn(() => ({
            getUser: jest.fn()
        })),
        User: jest.requireActual('../../TimeHandling/UserManager.js').User // Ensures `User` is not mocked
    };
});
jest.mock('parse/node', function () {
    return {
        Object: jest.fn().mockImplementation(function () {
            this.set = jest.fn(),
            this.save = jest.fn().mockResolvedValue({ id: "mockedId" }) // Mock save() method
        })
    };
});


describe('DiscordTimeHandler tests', () => {

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks()
    });


    test("updateLongestAway_userHasNotLeft_DontUpdate", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        UserManager.getUser = jest.fn().mockImplementation(() => {
            return new User('UserName', 0, false, new Date(), 'id', 0, "-1", 0, new Object(), new Object())
        })

        timeTracker.updateLongestAway('id')

        expect(Parse.Object).toHaveBeenCalledTimes(0)
    });

    test("updateLongestAway_userDoesNotExist_DontUpdate", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        UserManager.getUser = jest.fn().mockImplementation(() => {
            return null
        })

        timeTracker.updateLongestAway('id')

        expect(Parse.Object).toHaveBeenCalledTimes(0)
    });

    test("updateLongestAway_longestAwayLarger_DontUpdate", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        UserManager.getUser = jest.fn().mockImplementation(() => {
            return new User('UserName', 0, false, new Date(), 'id', 0, "2025-02-11T09:30:00.000Z", 100, new Object(), new Object())
        })

        const mockDate = new Date('2025-02-11T10:00:00.000Z');

        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        timeTracker.updateLongestAway('id')

        expect(Parse.Object).toHaveBeenCalledTimes(0)
    });
    
   
    test("updateLongestAway_longestAwayLarger_DontUpdate", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        UserManager.getUser = jest.fn().mockImplementation(() => {
            return new User('UserName', 0, false, new Date(), 'id', 0, "2025-02-11T09:30:00.000Z", 100, new Object(), new Object())
        })
        
        const leftTime = new Date('2025-02-11T10:00:00.000Z');
        const currentTime = new Date('2025-02-11T10:30:00.000Z');

        jest.spyOn(global, 'Date')
            .mockImplementationOnce(() => leftTime)
            .mockImplementationOnce(() => leftTime)
            .mockImplementationOnce(() => currentTime)

        timeTracker.updateLongestAway('id')

        expect(Parse.Object).toHaveBeenCalledTimes(0)
    });

    test("updateLongestAway_longestAwaySmaller_UpdateLongestAway", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, new Date(), 'id', 0, "2025-02-11T09:30:00.000Z", 10, new Object(), new Object())

        UserManager.getUser = jest.fn().mockReturnValue(user)
        
        const leftTime = new Date('2025-02-11T10:00:00.000Z');
        const currentTime = new Date('2025-02-11T10:30:00.000Z');

        jest.spyOn(global, 'Date')
            .mockImplementationOnce(() => leftTime)
            .mockImplementationOnce(() => currentTime)

        timeTracker.updateLongestAway('id')

        expect(Parse.Object).toHaveBeenCalledTimes(1)
        expect(user.longestAway).toBe(30)
    });

    test("updateTime_sessionTime30_ExpectSessionTime50", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, 'id', new Date("2025-02-11T09:30:00.000Z"), 50, "2025-02-11T09:30:00.000Z", 10, new Object(), new Object())

        UserManager.getUser = jest.fn().mockReturnValueOnce(user)
        
        const currentTime = new Date('2025-02-11T10:00:00.000Z');

        jest.spyOn(global, 'Date')
            .mockImplementation(() => currentTime)

        timeTracker.updateTime('id')

        expect(user.sessionTime).toBe(50)
    });

    test("updateTime_sessionTime30_ExpectSessionTime30", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, 'id', new Date("2025-02-11T09:30:00.000Z"), 0, "2025-02-11T09:30:00.000Z", 10, new Object(), new Object())

        UserManager.getUser = jest.fn().mockReturnValueOnce(user)
        
        const currentTime = new Date('2025-02-11T10:00:00.000Z');

        jest.spyOn(global, 'Date')
            .mockImplementation(() => currentTime)

        timeTracker.updateTime('id')

        expect(user.sessionTime).toBe(30)
    });

    test("updateTime_leftTime930_ExpectLeftTimeUpdated", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, 'id', new Date("2025-02-11T09:30:00.000Z"), 0, "2025-02-11T09:30:00.000Z", 10, new Object(), new Object())

        UserManager.getUser = jest.fn().mockReturnValueOnce(user)
        
        const currentTime = new Date('2025-02-11T10:00:00.000Z');

        jest.spyOn(global, 'Date')
            .mockImplementation(() => currentTime)

        timeTracker.updateTime('id')

        expect(user.leftTime).toEqual(currentTime.toISOString())
    });

    test("updateTime_differntDates_ExpectSessionTimeUpdated", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, 'id', new Date("2025-02-11T23:30:00.000Z"), 0, "2025-02-11T23:30:00.000Z", 10, new Object(), new Object())

        UserManager.getUser = jest.fn().mockReturnValueOnce(user)
        
        const currentTime = new Date('2025-02-12T00:30:00.000Z');

        jest.spyOn(global, 'Date')
            .mockImplementation(() => currentTime)

        timeTracker.updateTime('id')

        expect(user.sessionTime).toBe(60)
    });

    test("trackTimeObject_emptyObject_ExpectElapsedTimeAdded", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, 'id', new Date("2025-02-11T09:30:00.000Z"), 0, "2025-02-11T09:30:00.000Z", 10, new Object(), new Object())
        
        const currentTime = new Date('2025-02-11T10:00:00.000Z');
        const newTimeObject = {'2025':{'02': {'11': 30}}}

        jest.spyOn(global, 'Date')
            .mockImplementation(() => currentTime)

        timeTracker.trackTimeObject(user.timeObject, 30)

        expect(user.timeObject).toEqual(newTimeObject)
    });

    test("trackTimeObject_sameDayObject_ExpectElapsedTimeAdded", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, 'id', new Date("2025-02-11T09:30:00.000Z"), 0, "2025-02-11T09:30:00.000Z", 10, {'2025':{'02': {'11': 30}}}, new Object())
        
        const currentTime = new Date('2025-02-11T10:00:00.000Z');
        const newTimeObject = {'2025':{'02': {'11': 60}}}

        jest.spyOn(global, 'Date')
            .mockImplementation(() => currentTime)

        timeTracker.trackTimeObject(user.timeObject, 30)

        expect(user.timeObject).toEqual(newTimeObject)
    });

    test("trackTimeObject_newDayObject_ExpectElapsedTimeAdded", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, 'id', new Date("2025-02-11T09:30:00.000Z"), 0, "2025-02-11T09:30:00.000Z", 10, {'2025':{'02': {'11': 30}}}, new Object())
        
        const currentTime = new Date('2025-02-12T10:00:00.000Z');
        const newTimeObject = {'2025':{'02': {'11': 30, '12': 30}}}

        jest.spyOn(global, 'Date')
            .mockImplementation(() => currentTime)

        timeTracker.trackTimeObject(user.timeObject, 30)

        expect(user.timeObject).toEqual(newTimeObject)
    });

    test("trackTimeObject_newMonthObject_ExpectElapsedTimeAdded", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, 'id', new Date("2025-03-15T09:30:00.000Z"), 0, "2025-03-15T09:30:00.000Z", 10, {'2025':{'02': {'11': 30, '12':30}}}, new Object())
        
        const currentTime = new Date('2025-03-15T10:15:00.000Z');
        const newTimeObject = {'2025':{'02': {'11': 30, '12': 30}, '03': {'15': 45}}}

        jest.spyOn(global, 'Date')
            .mockImplementation(() => currentTime)

        timeTracker.trackTimeObject(user.timeObject, 45)

        expect(user.timeObject).toEqual(newTimeObject)
    });

    test("trackTimeObject_newYearObject_ExpectElapsedTimeAdded", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, 'id', new Date("2025-03-15T09:30:00.000Z"), 0, "2025-03-15T09:30:00.000Z", 10, {'2025':{'02': {'11': 30, '12': 30}, '03': {'15': 30}}}, new Object())
        
        const currentTime = new Date('2026-05-15T10:15:00.000Z');
        const newTimeObject = {'2025':{'02': {'11': 30, '12': 30}, '03': {'15': 30}}, '2026': {'05': {'15': 10}}}

        jest.spyOn(global, 'Date')
            .mockImplementation(() => currentTime)

        timeTracker.trackTimeObject(user.timeObject, 10)

        expect(user.timeObject).toEqual(newTimeObject)
    });

    test("saveUserTime_noObjectId_DontSetObjectID", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user = new User('UserName', 0, false, null, new Date("2025-03-15T09:30:00.000Z"), 0, "2025-03-15T09:30:00.000Z", 10, {'2025':{'02': {'11': 30, '12': 30}, '03': {'15': 30}}}, new Object())

        UserManager.getUser = jest.fn().mockReturnValueOnce(user)

        timeTracker.saveUserTime('id', {})

        expect(Parse.Object.mock.instances[0].set).not.toHaveBeenCalledWith(null)
    });

    test("saveUserTime_ObjectIdNotNull_SetObjectID", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user2 = new User('UserName', 0, false, 'id', new Date(), 0, "", 10, {}, new Object())

        UserManager.getUser = jest.fn().mockReturnValueOnce(user2)

        timeTracker.saveUserTime('id', {})

        expect(Parse.Object.mock.instances[0].set).toHaveBeenCalledWith('objectId', 'id')
    });

    test("saveUserTime_update_setUpdates", () => {
        let timeTracker = new TimeTracker(UserManager, Parse)

        const user2 = new User('UserName', 50, false, 'newId', new Date(), 20, "", 10, {'23': '52'}, new Object())

        UserManager.getUser = jest.fn().mockReturnValueOnce(user2)

        timeTracker.saveUserTime('id', {'userName': 'newName', 'time': 25, 'longestAway': 55})

        expect(Parse.Object.mock.instances[0].set).toHaveBeenCalledWith('objectId', 'newId')
        expect(Parse.Object.mock.instances[0].set).toHaveBeenCalledWith('userName', 'newName')
        expect(Parse.Object.mock.instances[0].set).toHaveBeenCalledWith('time', 25)
        expect(Parse.Object.mock.instances[0].set).toHaveBeenCalledWith('longestAway', 55)
    });

    

});
