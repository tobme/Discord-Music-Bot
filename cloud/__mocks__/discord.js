const mockReturnThis = () => jest.fn().mockReturnThis();

const StringSelectMenuOptionBuilder = jest.fn().mockImplementation(() => ({
    setLabel: mockReturnThis(),
    setValue: mockReturnThis(),
}));

const StringSelectMenuBuilder = jest.fn().mockImplementation(() => ({
    setCustomId: mockReturnThis(),
    setPlaceholder: mockReturnThis(),
    addOptions: mockReturnThis(),
}));

const ActionRowBuilder = jest.fn().mockImplementation(() => ({
    addComponents: mockReturnThis(),
}));

const SlashCommandBuilder = jest.fn().mockImplementation(() => ({
    setName: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    toJSON: jest.fn().mockReturnValue({}),
}));

module.exports = {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    Collection: jest.fn(),
    REST: jest.fn(),
    Routes: {},
    Client: jest.fn(),
    GatewayIntentBits: {},
    Events: {},
};
