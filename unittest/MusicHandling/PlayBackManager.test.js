const PlaybackManager = require('../../cloud/MusicHandling/PlayBackManager.js')
const MusicInfo = require('../../cloud/MusicHandling/MusicInfo.js')
const MusicManager = require('../../cloud/MusicHandling/MusicManager.js')
const QueueManager = require('../../cloud/MusicHandling/QueueManager.js')
const ShuffleManager = require('../../cloud/MusicHandling/ShuffleManager.js')
const Parse = require('parse/node')

jest.mock('../../cloud/MusicHandling/MusicManager', () => {
    return jest.fn().mockImplementation(() => ({
        musicList: [
            { name: "Song 1", fileUrl: "url1.mp3", queueable: true, objectId: "1", amountPlayed: 0, creatorName: "Artist 1" },
            { name: "Song 2", fileUrl: "url2.mp3", queueable: false, objectId: "2", amountPlayed: 2,creatorName: "Artist 2" },
            { name: "Song 3", fileUrl: "url3.mp3", queueable: true, objectId: "3", amountPlayed: 5,creatorName: "Artist 3" }
        ],

        retrieveSounds: jest.fn().mockResolvedValue(),  // Mock async function

        addSong: jest.fn(),   // Auto-mocked
        removeSong: jest.fn(), // Auto-mocked
    }))
})

jest.mock('../../cloud/MusicHandling/QueueManager', () => {
    return jest.fn().mockImplementation(() => ({
        getNextSong: jest.fn().mockResolvedValue('QueuedFileUrl'), // Mock async function
    }));
});

jest.mock('../../cloud/MusicHandling/ShuffleManager', () => {
    return jest.fn().mockImplementation(() => ({
        getShuffledSong: jest.fn().mockResolvedValue('ShuffledFileUrl'),  // Mock async function
    }))
})

jest.mock('parse/node', function () {
    return {
        Object: jest.fn().mockImplementation(function () {
            this.set = jest.fn(),
            this.save = jest.fn().mockResolvedValue({ id: "mockedId" }) // Mock save() method
        })
    };
});

describe('DiscordTimeHandler tests', () => {

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks()
  });

  test('getNextSong_QueuedSong_ExpectQueuedSong', async () => {

    const musicMock = new MusicManager()
    const queueMock = new QueueManager()
    const shuffleManager = new ShuffleManager()

    const playbackManager = new PlaybackManager(musicMock, queueMock, shuffleManager, Parse)

    const result = await playbackManager.getNextSong()

    expect(result).toEqual('QueuedFileUrl')
  });

  test('getNextSong_EmptyQueueAndRandomOver0.5_ExpectShuffledSong', async () => {

    const musicMock = new MusicManager()
    const queueMock = new QueueManager()
    const shuffleManager = new ShuffleManager()

    queueMock.getNextSong = jest.fn().mockReturnValueOnce(null)

    jest.spyOn(global.Math, "random").mockReturnValueOnce(0.5);

    const playbackManager = new PlaybackManager(musicMock, queueMock, shuffleManager, Parse)

    const result = await playbackManager.getNextSong()

    expect(result).toEqual('ShuffledFileUrl')
  });

  test('getNextSong_EmptyQueueAndRandomUnder0.2_ExpectRandomSong', async () => {

    const musicMock = new MusicManager()
    const queueMock = new QueueManager()
    const shuffleManager = new ShuffleManager()

    queueMock.getNextSong = jest.fn().mockReturnValueOnce(null)

    jest.spyOn(global.Math, "random").mockReturnValueOnce(0.1).mockReturnValueOnce(0.99);

    const playbackManager = new PlaybackManager(musicMock, queueMock, shuffleManager, Parse)

    const result = await playbackManager.getNextSong()

    expect(result).toEqual('url3.mp3')
  });

  test('updateSongCounter_fileExist_ExpectUpdateSongCounter', async () => {

    const musicMock = new MusicManager()
    const queueMock = new QueueManager()
    const shuffleManager = new ShuffleManager()

    const playbackManager = new PlaybackManager(musicMock, queueMock, shuffleManager, Parse)

    playbackManager.updateSongCounter('url1.mp3')
    expect(Parse.Object.mock.instances[0].set).toHaveBeenCalledWith('amountPlayed', 1)
  });

  test('updateSongCounter_fileExist_ExpectUpdateSongCounter', async () => {

    const musicMock = new MusicManager()
    const queueMock = new QueueManager()
    const shuffleManager = new ShuffleManager()

    const playbackManager = new PlaybackManager(musicMock, queueMock, shuffleManager, Parse)

    playbackManager.updateSongCounter('url2.mp3')
    expect(Parse.Object.mock.instances[0].set).toHaveBeenCalledWith('amountPlayed', 3)
  });


});
