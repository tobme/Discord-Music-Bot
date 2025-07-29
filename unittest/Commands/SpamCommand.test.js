const {execute} = require('../../cloud/commands/utility/spamCommand.js')


describe('DiscordTimeHandler tests', () => {

    let interaction;
    let context;

    beforeEach(() => {
        // Mock the interaction object
        interaction = {
          reply: jest.fn().mockResolvedValue(null), // Mock reply() as an async function
          followUp: jest.fn().mockResolvedValue(null), // Mock followUp() as an async function
        };
    
        // Mock the playBackManager with a sample music list
        context = {
          playBackManger: {
            getMusicList: jest.fn().mockReturnValue([
              { name: 'Song1', queueable: true, amountPlayed: 2 },
              { name: 'Song2', queueable: true, amountPlayed: 1 },
              { name: 'Song3', queueable: false, amountPlayed: 3 },
            ]),
          },
        };
      });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks()
  });

  test('execute_2Sounds_ExpectSounds', async () => {

    await execute(interaction, context)

    let expectedString = '1: Song1 - 2\n'
    expectedString += '2: Song2 - 1\n'

    expect(interaction.reply).toHaveBeenCalledWith({content: expectedString, ephemeral: false})
  });

});
