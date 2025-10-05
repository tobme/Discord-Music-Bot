const QueueManager = require('../../cloud/MusicHandling/QueueManager.js')
const MusicInfo = require('../../cloud/MusicHandling/MusicInfo.js')
const MusicManager = require('../../cloud/MusicHandling/MusicManager.js')
const Parse = require('parse/node')

jest.mock('../../cloud/MusicHandling/MusicManager', () => {
    return jest.fn().mockImplementation(() => ({
        musicList: [
            { name: "Song 1", fileUrl: "url1.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
            { name: "Song 2", fileUrl: "url2.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
            { name: "Song 3", fileUrl: "url3.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" }
        ],

        retrieveSounds: jest.fn().mockResolvedValue(),  // Mock async function

        addSong: jest.fn(),   // Auto-mocked
        removeSong: jest.fn(), // Auto-mocked
    }))
})

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
                  creator: 'noName'
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

  test('getNextSong_EmptyQueue_ExpectNull', async () => {

    const musicMock = new MusicManager()

    const queueManager = new QueueManager(musicMock, Parse)

    const result = queueManager.getNextSong()

    expect(result).toEqual(null)
  });

  test('getNextSong_QueueExist_ExpectSong', async () => {

    const musicMock = new MusicManager()

    const queueManager = new QueueManager(musicMock, Parse)

    queueManager.addQueue('Song 1')
    queueManager.addQueue('Song 3')

    const result = queueManager.getNextSong()
    const result2 = queueManager.getNextSong()

    expect(result).toEqual('url1.mp3')
    expect(result2).toEqual('url3.mp3')
  });

  test('addQueue_addNotApproved_ExpectNotQueued', async () => {

    const musicMock = new MusicManager()

    const queueManager = new QueueManager(musicMock, Parse)

    const res = queueManager.addQueue('Song 2')

    expect(Object.keys(queueManager.musicQueue).length).toBe(0)
    expect(res).toBe(false)
  });

  test('addQueue_addQueueFromList_ExpectQueued', async () => {

    const musicMock = new MusicManager()

    const queueManager = new QueueManager(musicMock, Parse)

    queueManager.addQueue('Song 1')

    expect(queueManager.musicQueue[0]).toEqual('url1.mp3')
  });

  test('addQueue_addSameSong_ExpectOneQueued', async () => {

    const musicMock = new MusicManager()

    const queueManager = new QueueManager(musicMock, Parse)

    queueManager.addQueue('Song 1')
    queueManager.addQueue('Song 1')

    expect(queueManager.musicQueue[0]).toEqual('url1.mp3')
    expect(Object.keys(queueManager.musicQueue).length).toBe(1)
  });

  test('addQueue_addNotExistingSong_ExpectEmtpy', async () => {

    const musicMock = new MusicManager()

    const queueManager = new QueueManager(musicMock, Parse)

    queueManager.addQueue('Song 55')

    expect(Object.keys(queueManager.musicQueue).length).toBe(0)
  });

});
