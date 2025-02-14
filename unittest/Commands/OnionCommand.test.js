const {execute} = require('../../commands/utility/onionCommand.js')

describe('DiscordTimeHandler tests', () => {

    beforeEach(() => {
        // Mock the interaction object
        interaction = {
          reply: jest.fn().mockResolvedValue(null),
          followUp: jest.fn().mockResolvedValue(null),
        };
    
        // Mock the timeHandler with sample user data
        context = {
          timeHandler: {
            getDiscordTimes: jest.fn().mockReturnValue({
              user1: { userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: 500, longestAway: 600, timeObject: {} }
            }),
          },
        };
      });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks()
    });
  
    test('execute_expectOnionScore', async () => {

      await execute(interaction, context)

      let expectedRes = " P |    Name    |    Time     | sessionTime  | Longest Away\n"
      expectedRes    += '------------------------------------------------------------\n'

      expectedRes += String(1).padEnd(2) + " | "
      expectedRes += 'Alice'.padEnd(10, " ") + "   "
      expectedRes += '2d 12h '.padEnd(11, " ") + "   "
      expectedRes += '20h '.padEnd(11, " ") + "   "
      expectedRes += '10h '.padEnd(11, " ")
      expectedRes += '\n'
  
      expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
        content: expectedRes,
      }))
    });

    test('execute_noLongestAway_expectNoData', async () => {

        context = {
            timeHandler: {
              getDiscordTimes: jest.fn().mockReturnValue({
                user1: { userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: 500, longestAway: 600, timeObject: {} },
                user2: { userName: 'Bobby', InDiscord: true, time: 30, sessionTime: 20, leftTime: 500, longestAway: 0, timeObject: {} }
              }),
            },
          };

        await execute(interaction, context)
  
        let expectedRes = " P |    Name    |    Time     | sessionTime  | Longest Away\n"
        expectedRes    += '------------------------------------------------------------\n'
  
        expectedRes += String(1).padEnd(2) + " | "
        expectedRes += 'Alice'.padEnd(10, " ") + "   "
        expectedRes += '2d 12h '.padEnd(11, " ") + "   "
        expectedRes += '20h '.padEnd(11, " ") + "   "
        expectedRes += '10h '.padEnd(11, " ")
        expectedRes += '\n'

        expectedRes += String(2).padEnd(2) + " | "
        expectedRes += 'Bobby'.padEnd(10, " ") + "   "
        expectedRes += '30m'.padEnd(11, " ") + "   "
        expectedRes += '20m'.padEnd(11, " ") + "   "
        expectedRes += 'No Data'.padEnd(11, " ")
        expectedRes += '\n'
    
        expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
          content: expectedRes,
        }))
      });

      test('execute_LongestAwaySmallerThanTimeSinceLeft_expectLeftTimeLongestAway', async () => {

        context = {
            timeHandler: {
              getDiscordTimes: jest.fn().mockReturnValue({
                user1: { userName: 'Alice', InDiscord: false, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 5, timeObject: {} },
              }),
            },
          };

          const leftDate = new Date('2025-02-11T10:00:00.000Z');
          const currentDate = new Date('2025-02-11T10:30:00.000Z');

          jest.spyOn(global, 'Date').mockImplementationOnce(() => leftDate).mockImplementationOnce(() => currentDate);

        await execute(interaction, context)
  
        let expectedRes = " P |    Name    |    Time     | sessionTime  | Longest Away\n"
        expectedRes    += '------------------------------------------------------------\n'
  
        expectedRes += String(1).padEnd(2) + " | "
        expectedRes += 'Alice'.padEnd(10, " ") + "   "
        expectedRes += '2d 12h '.padEnd(11, " ") + "   "
        expectedRes += '20h '.padEnd(11, " ") + "   "
        expectedRes += '30m'.padEnd(11, " ")
        expectedRes += '\n'
    
        expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
          content: expectedRes,
        }))
      });

      test('execute_LongestAwayLargerThanTimeSinceLeft_expectLongestAway', async () => {

        context = {
            timeHandler: {
              getDiscordTimes: jest.fn().mockReturnValue({
                user1: { userName: 'Alice', InDiscord: false, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {} },
              }),
            },
          };

          const leftDate = new Date('2025-02-11T10:00:00.000Z');
          const currentDate = new Date('2025-02-11T10:30:00.000Z');

          jest.spyOn(global, 'Date').mockImplementationOnce(() => leftDate).mockImplementationOnce(() => currentDate);

        await execute(interaction, context)
  
        let expectedRes = " P |    Name    |    Time     | sessionTime  | Longest Away\n"
        expectedRes    += '------------------------------------------------------------\n'
  
        expectedRes += String(1).padEnd(2) + " | "
        expectedRes += 'Alice'.padEnd(10, " ") + "   "
        expectedRes += '2d 12h '.padEnd(11, " ") + "   "
        expectedRes += '20h '.padEnd(11, " ") + "   "
        expectedRes += '40m'.padEnd(11, " ")
        expectedRes += '\n'
    
        expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
          content: expectedRes,
        }))
      });

      test('execute_LongestAwayLargerButInDiscord_expectLongestAway', async () => {

        context = {
            timeHandler: {
              getDiscordTimes: jest.fn().mockReturnValue({
                user1: { userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {} },
              }),
            },
          };

          const leftDate = new Date('2024-02-11T10:00:00.000Z');
          const currentDate = new Date('2025-02-11T10:30:00.000Z');

          jest.spyOn(global, 'Date').mockImplementationOnce(() => leftDate).mockImplementationOnce(() => currentDate);

        await execute(interaction, context)
  
        let expectedRes = " P |    Name    |    Time     | sessionTime  | Longest Away\n"
        expectedRes    += '------------------------------------------------------------\n'
  
        expectedRes += String(1).padEnd(2) + " | "
        expectedRes += 'Alice'.padEnd(10, " ") + "   "
        expectedRes += '2d 12h '.padEnd(11, " ") + "   "
        expectedRes += '20h '.padEnd(11, " ") + "   "
        expectedRes += '40m'.padEnd(11, " ")
        expectedRes += '\n'
    
        expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
          content: expectedRes,
        }))
      });

      test('execute_timeObject30m_expectTimeObjectAdded', async () => {

        context = {
            timeHandler: {
              getDiscordTimes: jest.fn().mockReturnValue({
                user1: { userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {'2024': {'02': {'01': 30}}} },
              }),
            },
          };

        await execute(interaction, context)
  
        let expectedRes = " P |    Name    |    Time     | sessionTime  | Longest Away\n"
        expectedRes    += '------------------------------------------------------------\n'
  
        expectedRes += String(1).padEnd(2) + " | "
        expectedRes += 'Alice'.padEnd(10, " ") + "   "
        expectedRes += '2d 12h 30m'.padEnd(11, " ") + "   "
        expectedRes += '20h '.padEnd(11, " ") + "   "
        expectedRes += '40m'.padEnd(11, " ")
        expectedRes += '\n'
    
        expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
          content: expectedRes,
        }))
      });

      test('execute_timeObject30m_expectTimeObjectAdded', async () => {

        context = {
            timeHandler: {
              getDiscordTimes: jest.fn().mockReturnValue({
                user1: { userName: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: new Date('2025-02-11T10:00:00.000Z'), longestAway: 40, timeObject: {'2024': {'02': {'01': 30, '02': 40}, '05': {'15': 27}}} },
              }),
            },
          };

        await execute(interaction, context)
  
        let expectedRes = " P |    Name    |    Time     | sessionTime  | Longest Away\n"
        expectedRes    += '------------------------------------------------------------\n'
  
        expectedRes += String(1).padEnd(2) + " | "
        expectedRes += 'Alice'.padEnd(10, " ") + "   "
        expectedRes += '2d 13h 37m'.padEnd(11, " ") + "   "
        expectedRes += '20h '.padEnd(11, " ") + "   "
        expectedRes += '40m'.padEnd(11, " ")
        expectedRes += '\n'
    
        expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
          content: expectedRes,
        }))
      });
  
  });
  