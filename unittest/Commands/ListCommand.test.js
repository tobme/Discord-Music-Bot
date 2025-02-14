const {execute} = require('../../commands/utility/listCommand.js')


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
              { name: 'Song1', queueable: true },
              { name: 'Song2', queueable: true },
              { name: 'Song3', queueable: false },
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

    const expectedString = "Song1, Song2, "

    expect(interaction.reply).toHaveBeenCalledTimes(1)
    expect(interaction.followUp).toHaveBeenCalledWith({content: expectedString, ephemeral: true})
  });

});
