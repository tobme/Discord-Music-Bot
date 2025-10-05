const DiscordTimeCalculator = require('../../cloud/TimeHandling/DiscordTimeCalculator.js')
const DiscordTimeHandler = require('../../cloud/TimeHandling/DiscordTimeHandler.js')

jest.mock('../../cloud/TimeHandling/DiscordTimeHandler.js');

const MockInteraction = (options = {}) => {
  return {
    reply: jest.fn().mockResolvedValue(null),
    followUp: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(null),
    message: {
      components: [
        {'components': [{'data': {'placeholder': options.yearHolder || 'All', 'custom_id': 'year'}}]},
        {'components': [{'data': {'placeholder': options.monthHolder || 'All', 'custom_id': 'month'}}]},
        {'components': [{'data': {'placeholder': options.dayHolder || 'All', 'custom_id': 'day'}}]}
      ],
      interaction: {
        user: {
          id: options.originalUserId || "UserID"
        }
      }
    },
    values: [options.values || 'All'],
    customId: options.customId || 'None',
    user: {
      id: options.currentUserId || "UserID"
    }
  };
};

describe('DiscordTimeCalculator tests', () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks()
    });
  
    test('getUserTime_3600Time_Expect3600', async () => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

        let userTime = discordTimeCalculator.getUserTime({ userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: 500, longestAway: 600, timeObject: {}}, 'All', 'All', 'All')

        expect(userTime).toBe(3600)
    });

    test('getUserTime_3600Time30DayExpect3630', async () => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

        let userTime = discordTimeCalculator.getUserTime({ userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: 500, longestAway: 600, timeObject: {'2024': {'02': {'01': 30}}}}, 'All', 'All', 'All')

        expect(userTime).toBe(3630)
    });

      test.each([
        ['All', 'All', 'All', 150],
        ['All', 'All', '2025', 80],
        ['All', 'December', 'All', 50],
        ['All', 'December', '2024', 20],
        ['All', 'Maj', '2024', 50],
        ['1-7', 'Maj', '2024', 20],
        ['8-15', 'Maj', '2024', 30],
        ['16-23', 'Maj', '2024', 0],
      ])('getUserTime_timeObject_ExpectTimeAdded', async (day, month, year, result) => {

        timeobj = {'2024': {'05': {'01': 10, '02': 10, '10': 10, '11': 10, '12': 10}, '12': {'30': 10, '31': 10}}, '2025': {'01' : {'01': 10, '02': 10, '03': 10, '04': 10, '05': 10}, '12': {'29': 10, '30': 10, '31': 10}}}

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

        let userTime = discordTimeCalculator.getUserTime({ userName: 'Alice', InDiscord: true, time: 0, sessionTime: 1200, leftTime: 500, longestAway: 600, timeObject: timeobj}, year, month, day)

        expect(userTime).toBe(result)
      });

    test('getLongestAway_noLongestAway_expectLongestAwayReturned', async () => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

        let longestAway = await discordTimeCalculator.getLongestAway({ userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: 500, longestAway: 50, timeObject: {}}, 'All', 'All', 'All')

        expect(longestAway).toBe(50)
      });

      test('getLongestAway_LongestAwayLargerThanTimeSinceLeft_expectLongestAway', async () => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

        const leftDate = new Date('2025-02-11T10:00:00.000Z');
        const currentDate = new Date('2025-02-11T10:30:00.000Z');

        jest.spyOn(global, 'Date').mockImplementationOnce(() => leftDate).mockImplementationOnce(() => leftDate).mockImplementationOnce(() => currentDate);

        let longestAway = await discordTimeCalculator.getLongestAway({ userName: 'Alice', InDiscord: false, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {} }, 'All', 'All', 'All')

        expect(longestAway).toBe(40)
      });

      test('getLongestAway_TimeSinceLeftLargerButInDiscord_expectLongestAway', async () => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

        const leftDate = new Date('2025-02-11T10:00:00.000Z');
        const currentDate = new Date('2025-02-11T10:50:00.000Z');

        jest.spyOn(global, 'Date').mockImplementationOnce(() => leftDate).mockImplementationOnce(() => leftDate).mockImplementationOnce(() => currentDate);

        let longestAway = await discordTimeCalculator.getLongestAway({ userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {} }, 'All', 'All', 'All')

        expect(longestAway).toBe(40)
      });

      test('getLongestAway_TimeSinceLeftLarger_expectTimeSinceLeft', async () => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

        const leftDate = new Date('2025-02-11T10:00:00.000Z');
        const currentDate = new Date('2025-02-11T10:50:00.000Z');

        jest.spyOn(global, 'Date').mockImplementationOnce(() => leftDate).mockImplementationOnce(() => leftDate).mockImplementationOnce(() => currentDate);

        let longestAway = await discordTimeCalculator.getLongestAway({ userName: 'Alice', InDiscord: false, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {} }, 'All', 'All', 'All')

        expect(longestAway).toBe(50)
      });

      test.each([
        ['All', 'Januari', 'All', 3],
        ['All', 'Januari', '1-7', 3],
        ['2024', 'Januari', '1-7', 2],
        ['All', 'All', '1-7', 3],
        ['All', 'Februari', 'All', 1],
        ['All', 'June', 'All', 0],
        ['2025', 'All', 'All', 5],
      ])('getLongestAway_TimeSelection_expect', async (yearSelection, monthSelection, daySelection, result) => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

        const date = new Date('2025-01-10T10:00:00.000Z');
        const RealDate = Date;

        jest.spyOn(global, 'Date').mockImplementation((...args) => {
          if (args.length === 0) {
            return date
          }
          return new RealDate(...args);
        });
        global.Date.UTC = RealDate.UTC;
        global.Date.now = RealDate.now;
        global.Date.parse = RealDate.parse;

        let longestAway = await discordTimeCalculator.getLongestAway({ userName: 'Alice', InDiscord: false, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {'2024': {'01': {'01': 30, '03': 0, '05': 0}, '02': {'01': 0, '02': 0}}, '2025': {'01': {'01': 0, '04': 0, '05': 0}}} }, yearSelection, monthSelection, daySelection)

        expect(longestAway).toBe(result)
      });

      test.each([
        [{'2024': {'02': {'27': 30, '28': 0}}}, "2"],
        [{'2024': {'02': {'27': 30, '28': 0, '29': 0}, '03': {'01': 0, '02': 0, '03': 0, '04': 0}}}, "7"],
        [{'2024': {'02': {'27': 30, '28': 0}, '06': {'30': 0}, '07': {'05': 0, '07': 0, '08': 0, '09': 0}}}, "3"],
        [{'2024': {'12': {'30': 30, '31': 0}}, '2025': {'01' : {'01': 0, '02': 0, '03': 0}}}, "5"],
      ])('getUserStreak_timeObject6dayStreak_expectDayStreak', async (timeobj, result) => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

         let streak = await discordTimeCalculator.getUserStreak({ userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: timeobj }, 'All', 'All', 'All')

          expect(streak).toBe(result)
      });

      test.each([
        ['All', 'All', 'All', "3"],
        ['2024', 'All', 'All', "2"],
        ['All', 'Januari', 'All', "3"],
        ['All', 'All', '1-7', "3"],
        ['All', 'All', '8-15', "2"]
      ])('getUserStreak_timeObject6dayStreak_expectDayStreak', async (yearSelection, monthSelection, daySelection, result) => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

         let streak = await discordTimeCalculator.getUserStreak({ userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {'2024': {'01': {'01': 30, '02': 0}}, '2025': {'01' : {'03': 0, '04': 0, '05': 0, '07': 0, '10': 0, '11': 0}}} }, yearSelection, monthSelection, daySelection)

          expect(streak).toBe(result)
      });

      test('getSessionTime_SessionTime100_expect100', async () => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

        const leftDate = new Date('2025-02-11T10:00:00.000Z');
        const currentDate = new Date('2025-02-11T10:50:00.000Z');

        jest.spyOn(global, 'Date').mockImplementationOnce(() => leftDate).mockImplementationOnce(() => leftDate).mockImplementationOnce(() => currentDate);

        let sessionTime = await discordTimeCalculator.getSessionTime({ userName: 'Alice', InDiscord: false, time: 3600, sessionTime: 100, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {'2024': {'02': {'01': 30, '02': 40}}}}, 'All', 'All', 'All')

        expect(sessionTime).toBe(100)
      });

      test('getSessionTime_Date202402_expect40', async () => {

        discordTimeCalculator = new DiscordTimeCalculator(DiscordTimeHandler)

        const leftDate = new Date('2025-02-11T10:00:00.000Z');
        const currentDate = new Date('2025-02-11T10:50:00.000Z');

        jest.spyOn(global, 'Date').mockImplementationOnce(() => leftDate).mockImplementationOnce(() => leftDate).mockImplementationOnce(() => currentDate);

        let sessionTime = await discordTimeCalculator.getSessionTime({ userName: 'Alice', InDiscord: false, time: 3600, sessionTime: 0, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {'2024': {'02': {'01': 30, '02': 40}}}}, '2024', 'Februari', 'All')

        expect(sessionTime).toBe(40)
      });
  });
  