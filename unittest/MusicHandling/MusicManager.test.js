const MusicManager = require('../../cloud/MusicHandling/MusicManager.js')
const MusicInfo = require('../../cloud/MusicHandling/MusicInfo.js')
const Parse = require('parse/node')


jest.mock('parse/node', function () {
  function MockParseObject() {
      this.set = jest.fn(); // Mocking `set()` method of Parse.Object
  }

  MockParseObject.extend = function () {
      return MockParseObject; // Returning the mocked class
  };

  function MockQuery() {
      // Ensure the constructor exists
  }

  MockQuery.prototype.testing = function () {
      console.log("Here");
  };

  MockQuery.prototype.limit = jest.fn().mockReturnThis(); // Method chaining
  MockQuery.prototype.find = jest.fn().mockResolvedValue([
      {
          id: 'object123',
          get: jest.fn(function (key) {
              var mockData = {
                File: {'_name': 'discan_ljud.mp3', '_url': 'fakeUrl'},
                  approved: true,
                  queueable: true,
                  objectId: '123',
                  amountPlayed: 0,
                  creator: 'noName',
                  category: "None"
              };
              return mockData[key]; // Return null if key doesn't exist
          }),
      },
  ]); // Mock `find()` to return a resolved promise

  return {
      Object: MockParseObject,
      Query: MockQuery,
  };
});

describe('DiscordTimeHandler tests', () => {

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks()
  });

  test('retrieveSoundsTimes_notApproved_ExpectEmptyDict', async () => {

    const musicManager = new MusicManager()

    Parse.Query.prototype.find.mockImplementationOnce(() => [
        {
        id: 'object123',
        get: jest.fn(function (key) {
            var mockData = {
                File: {'_name': 'fileName', '_url': 'fakeUrl'},
                approved: false,
                queueable: true,
                objectId: '123',
                amountPlayed: 0,
                creator: 'noName',
                category: "None"
            };
            return mockData[key]; // Return null if key doesn't exist
        }),
        },
    ]);

    await musicManager.retrieveSounds(Parse)

    expect(Object.keys(musicManager.musicList).length).toBe(0)
  });

  test('retrieveSoundsTimes_nullFile_ExpectEmptyDict', async () => {

    const musicManager = new MusicManager()

    Parse.Query.prototype.find.mockImplementationOnce(() => [
        {
        id: 'object123',
        get: jest.fn(function (key) {
            var mockData = {
                File: null,
                approved: true,
                queueable: true,
                objectId: '123',
                amountPlayed: 0,
                creator: 'noName',
                category: "None"
            };
            return mockData[key]; // Return null if key doesn't exist
        }),
        },
    ]);

    await musicManager.retrieveSounds(Parse)

    expect(Object.keys(musicManager.musicList).length).toBe(0)
  });

  test('retrieveSoundsTimes_normalFile_ExpectOneDictLength', async () => {

    const musicManager = new MusicManager()

    await musicManager.retrieveSounds(Parse)

    const musicInfo = new MusicInfo('ljud', 'fakeUrl', true, 'object123', 0, 'noName', "None")

    expect(musicManager.musicList[0]).toEqual(musicInfo)
  });

  test('addSong_addNewSong_ExpectAdded', async () => {

    const musicManager = new MusicManager()

    musicManager.addSong('song123', 'fakeUrl', true, '123', 'mother', "Rock")

    const musicInfo = new MusicInfo('song123', 'fakeUrl', true, '123', 0, 'mother', "Rock")

    expect(musicManager.musicList[0]).toEqual(musicInfo)
  });

  test('addSong_updateSong_ExpectAdded', async () => {

    const musicManager = new MusicManager()

    musicManager.addSong('song1234', 'fakeUrl', true, '123', 'mother', "None")

    musicManager.addSong('song1234', 'newUrl', true, '123', 'mother', "None")

    const musicInfo = new MusicInfo('song1234', 'newUrl', true, '123', 0, 'mother', "None")

    expect(musicManager.musicList[0]).toEqual(musicInfo)
  });

  test('removeSong_noSong_ExpectEmpty', async () => {

    const musicManager = new MusicManager()

    musicManager.removeSong('song1234')

    expect(Object.keys(musicManager.musicList).length).toBe(0)
  });

  test('removeSong_removeSong_ExpectEmpty', async () => {

    const musicManager = new MusicManager()

    musicManager.addSong('song123', 'fakeUrl', true, '123', 'mother', "None")

    musicManager.removeSong('song123')

    expect(Object.keys(musicManager.musicList).length).toBe(0)
  });

});
