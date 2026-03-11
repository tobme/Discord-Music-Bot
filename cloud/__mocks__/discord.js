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

const SlashCommandBuilder = jest.fn().mockImplementation(function() {
    const builder = {
        setName: jest.fn().mockReturnValue(undefined),
        setDescription: jest.fn().mockReturnValue(undefined),
        addStringOption: jest.fn().mockReturnValue(undefined),
        toJSON: jest.fn().mockReturnValue({}),
    };
    builder.setName.mockReturnValue(builder);
    builder.setDescription.mockReturnValue(builder);
    builder.addStringOption.mockImplementation((cb) => {
        const opt = { setName: jest.fn().mockReturnThis(), setDescription: jest.fn().mockReturnThis(), setRequired: jest.fn().mockReturnThis() };
        cb(opt);
        return builder;
    });
    return builder;
});

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
