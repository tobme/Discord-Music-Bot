const {execute} = require('../../cloud/commands/utility/queueCommand.js')

describe('QueueCommand tests', () => {

    let interaction;
    let context;

    beforeEach(() => {
        interaction = {
            reply: jest.fn().mockResolvedValue(null),
            options: {
                get: jest.fn().mockReturnValue({ value: 'Song 1' })
            }
        };

        context = {
            playBackManger: {
                addQueue: jest.fn().mockReturnValue(true)
            }
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test('execute_songFound_expectSongAddedReply', async () => {
        await execute(interaction, context);
        expect(interaction.reply).toHaveBeenCalledWith({ content: "Song added", ephemeral: true });
    });

    test('execute_songNotFound_expectSongNotFoundReply', async () => {
        context.playBackManger.addQueue.mockReturnValue(false);
        await execute(interaction, context);
        expect(interaction.reply).toHaveBeenCalledWith({ content: "Song not found", ephemeral: true });
    });

});
