module.exports = {
  // Tell Jest the folder containing your tests
  roots: ['../unittest'],

  // Make sure Jest matches your test file naming
  testMatch: [
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],

  // Use Node environment for Discord bot tests
  testEnvironment: 'node',

  // Optional: verbose output
  verbose: true,

  // Resolve modules from cloud/node_modules for tests outside rootDir
  modulePaths: ['<rootDir>/node_modules'],

  // Map unresolvable third-party modules to manual mocks
  moduleNameMapper: {
    '^discord\\.js$': '<rootDir>/__mocks__/discord.js',
  },
};