const {execute, update} = require('../../cloud/commands/utility/onionCommand.js')
const discordTimeCalculator = require('../../cloud/TimeHandling/DiscordTimeCalculator.js')

jest.mock('../../cloud/TimeHandling/DiscordTimeCalculator.js');

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

describe('DiscordTimeHandler tests', () => {

    beforeEach(() => {

        interaction = MockInteraction()

        context = {
          timeCalculator: {
            getTimeData: jest.fn().mockReturnValue([
              { name: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: 500, longestAway: 600, streak: "2"}
            ]),
          },
        };
      });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks()
    });
  
    test('execute_expectOnionScore', async () => {

      await execute(interaction, context)

      let expectedRes = " P | Name                | Time        | sessionTime | Longest Away | Streak \n"
      expectedRes    += '-----------------------------------------------------------------------------\n'

      expectedRes += String(1).padEnd(2) + " | "
      expectedRes += 'Alice'.padEnd(20, " ") + "  "
      expectedRes += '2d 12h '.padEnd(12, " ") + "  "
      expectedRes += '20h '.padEnd(12, " ") + "  "
      expectedRes += '10h '.padEnd(13, " ") + "  "
      expectedRes += '2'.padEnd(6, " ")
      expectedRes += '\n'

      const contentString = "```" + expectedRes + "```"
  
      expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
        content: contentString,
        components: expect.any(Array),
        ephemeral: false
      }))
    });

    test('execute_noLongestAway_expectNoData', async () => {

        context = {
          timeCalculator: {
            getTimeData: jest.fn().mockReturnValue([
                { name: 'Alice', InDiscord: true, time: 3600, sessionTime: 1200, leftTime: 500, longestAway: 600, streak: "0" },
                { name: 'Bobby', InDiscord: true, time: 30, sessionTime: 20, leftTime: 500, longestAway: 0, streak: "2" }
            ]),
          },
        };

        await execute(interaction, context)
  
        let expectedRes = " P | Name                | Time        | sessionTime | Longest Away | Streak \n"
        expectedRes    += '-----------------------------------------------------------------------------\n'
  
        expectedRes += String(1).padEnd(2) + " | "
        expectedRes += 'Alice'.padEnd(20, " ") + "  "
        expectedRes += '2d 12h '.padEnd(12, " ") + "  "
        expectedRes += '20h '.padEnd(12, " ") + "  "
        expectedRes += '10h '.padEnd(13, " ") + "  "
        expectedRes += '0'.padEnd(6, " ")
        expectedRes += '\n'

        expectedRes += String(2).padEnd(2) + " | "
        expectedRes += 'Bobby'.padEnd(20, " ") + "  "
        expectedRes += '30m'.padEnd(12, " ") + "  "
        expectedRes += '20m'.padEnd(12, " ") + "  "
        expectedRes += 'No Data'.padEnd(13, " ") + "  "
        expectedRes += '2'.padEnd(6, " ")
        expectedRes += '\n'

        const contentString = "```" + expectedRes + "```"
    
        expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
          content: contentString,
          components: expect.any(Array),
          ephemeral: false
        }))
      });

    test('execute_SecondLargerTime_expectChangeOrder', async () => {

        context = {
          timeCalculator: {
            getTimeData: jest.fn().mockReturnValue([
              { name: 'Alice', InDiscord: true, time: 30, sessionTime: 1200, leftTime: 500, longestAway: 600, streak: "0" },
              { name: 'Bobby', InDiscord: true, time: 3600, sessionTime: 20, leftTime: 500, longestAway: 0, streak: "2" }
            ]),
          },
        };

        await execute(interaction, context)
  
        let expectedRes = " P | Name                | Time        | sessionTime | Longest Away | Streak \n"
        expectedRes    += '-----------------------------------------------------------------------------\n'

        expectedRes += String(1).padEnd(2) + " | "
        expectedRes += 'Bobby'.padEnd(20, " ") + "  "
        expectedRes += '2d 12h '.padEnd(12, " ") + "  "
        expectedRes += '20m'.padEnd(12, " ") + "  "
        expectedRes += 'No Data'.padEnd(13, " ") + "  "
        expectedRes += '2'.padEnd(6, " ")
        expectedRes += '\n'
  
        expectedRes += String(2).padEnd(2) + " | "
        expectedRes += 'Alice'.padEnd(20, " ") + "  "
        expectedRes += '30m '.padEnd(12, " ") + "  "
        expectedRes += '20h '.padEnd(12, " ") + "  "
        expectedRes += '10h '.padEnd(13, " ") + "  "
        expectedRes += '0'.padEnd(6, " ")
        expectedRes += '\n'

        const contentString = "```" + expectedRes + "```"
    
        expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
          content: contentString,
        }))
      });

      test('update_anotherUserTryUpdate_expectDenyResponse', async () => {

        interaction = MockInteraction({currentUserId: 'newUserId'})

        await update(interaction, context)
    
        expect(interaction.reply).toHaveBeenCalledTimes(1)
      });
  });
  