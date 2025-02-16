const {execute, update} = require('../../commands/utility/listCategoryCommand.js')

const MockInteraction = (options = {}) => {
    return {
      reply: jest.fn().mockResolvedValue(null),
      followUp: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(null),
      message: {
        components: [
          {'components': [{'data': {'placeholder': options.yearHolder || undefined, 'custom_id': 'category'}}]}
        ],
        interaction: {
          user: {
            id: options.originalUserId || "UserID"
          }
        }
      },
      values: [options.values || 'None'],
      customId: options.customId || 'category',
      user: {
        id: options.currentUserId || "UserID"
      }
    };
  };

describe('DiscordTimeHandler tests', () => {

    let interaction;
    let context;

    beforeEach(() => {
        // Mock the playBackManager with a sample music list
        context = {
          playBackManger: {
            getMusicList: jest.fn().mockReturnValue([
              { name: 'Song1', queueable: true, category: "Rock" },
              { name: 'Song2', queueable: true, category: "Mongo" },
              { name: 'Song3', queueable: false, category: "Rock" },
              { name: 'Song4', queueable: true, category: "Rock" },
            ]),
          },
        };
      });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks()
  });

  test('execute_ExpectChooseCategory', async () => {

    interaction = MockInteraction()

    await execute(interaction, context)

    const expectedString = "Choose category"

    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
        content: expectedString,
      }))
  });

  test('update_RockCategory_ExpectRockSounds', async () => {

    interaction = MockInteraction({values: 'Rock'})

    await update(interaction, context)

    const expectedString = "Song1, Song4, "

    expect(interaction.update).toHaveBeenCalledWith(expect.objectContaining({
        content: expectedString,
      }))
  });

  test('update_MongoCategory_ExpectMongoSounds', async () => {

    interaction = MockInteraction({values: 'Mongo'})

    await update(interaction, context)

    const expectedString = "Song2, "

    expect(interaction.update).toHaveBeenCalledWith(expect.objectContaining({
        content: expectedString,
      }))
  });

});
