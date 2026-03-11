const { execute } = require('../../cloud/commands/utility/webCommand.js')

const MockInteraction = () => {
  return {
    reply: jest.fn().mockResolvedValue(null),
  };
};

describe('WebCommand tests', () => {

    let interaction;

    beforeEach(() => {
        interaction = MockInteraction();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test('execute_expectEphemeralReplyWithUrl', async () => {
        await execute(interaction, {});

        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'https://mrbot.b4a.app/',
            ephemeral: true
        });
    });

    test('execute_expectReplyCalledOnce', async () => {
        await execute(interaction, {});

        expect(interaction.reply).toHaveBeenCalledTimes(1);
    });
});
