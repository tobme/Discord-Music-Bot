const ShuffleManager = require('../../cloud/MusicHandling/ShuffleManager.js')
const MusicInfo = require('../../cloud/MusicHandling/MusicInfo.js')
const MusicManager = require('../../cloud/MusicHandling/MusicManager.js')
const Parse = require('parse/node')

jest.mock('../../MusicHandling/MusicManager', () => {
    return jest.fn().mockImplementation(() => ({
        musicList: [
            { name: "Song 1", fileUrl: "url1.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
            { name: "Song 2", fileUrl: "url2.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
            { name: "Song 3", fileUrl: "url3.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" },
            { name: "Song 4", fileUrl: "url4.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
            { name: "Song 5", fileUrl: "url5.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
            { name: "Song 6", fileUrl: "url6.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" },
            { name: "Song 7", fileUrl: "url7.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
            { name: "Song 8", fileUrl: "url8.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
            { name: "Song 9", fileUrl: "url9.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" },
            { name: "Song 10", fileUrl: "url10.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
            { name: "Song 11", fileUrl: "url11.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
            { name: "Song 12", fileUrl: "url12.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" }
        ],

        retrieveSounds: jest.fn().mockResolvedValue(),  // Mock async function

        addSong: jest.fn(),   // Auto-mocked
        removeSong: jest.fn(), // Auto-mocked
    }))
})

describe('DiscordTimeHandler tests', () => {

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks()
  });

  test('shuffleTheQueue_shuffle_ExpectShuffled', async () => {

    const musicMock = new MusicManager()

    const shuffleManager = new ShuffleManager(musicMock)

    musicList = [
        { name: "Song 1", fileUrl: "url1.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
        { name: "Song 2", fileUrl: "url2.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
        { name: "Song 3", fileUrl: "url3.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" },
        { name: "Song 4", fileUrl: "url4.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
        { name: "Song 5", fileUrl: "url5.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
        { name: "Song 6", fileUrl: "url6.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" },
        { name: "Song 7", fileUrl: "url7.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
        { name: "Song 8", fileUrl: "url8.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
        { name: "Song 9", fileUrl: "url9.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" },
        { name: "Song 10", fileUrl: "url10.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
        { name: "Song 11", fileUrl: "url11.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
        { name: "Song 12", fileUrl: "url12.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" }
    ]

    shuffleManager.shuffleTheQueue()

    expect(shuffleManager.shuffleQueue).not.toEqual(musicList)
    expect(Object.keys(shuffleManager.shuffleQueue).length).toBe(12)
  });

  test('getShuffledSong_getNextSong_ExpectNextSong', async () => {

    const musicMock = new MusicManager()

    const shuffleManager = new ShuffleManager(musicMock)

    musicList = [
        { name: "Song 1", fileUrl: "url1.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
        { name: "Song 2", fileUrl: "url2.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
        { name: "Song 3", fileUrl: "url3.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" },
        { name: "Song 4", fileUrl: "url4.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
        { name: "Song 5", fileUrl: "url5.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
        { name: "Song 6", fileUrl: "url6.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" },
        { name: "Song 7", fileUrl: "url7.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
        { name: "Song 8", fileUrl: "url8.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
        { name: "Song 9", fileUrl: "url9.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" },
        { name: "Song 10", fileUrl: "url10.mp3", queueable: true, objectId: "1", creatorName: "Artist 1" },
        { name: "Song 11", fileUrl: "url11.mp3", queueable: false, objectId: "2", creatorName: "Artist 2" },
        { name: "Song 12", fileUrl: "url12.mp3", queueable: true, objectId: "3", creatorName: "Artist 3" }
    ]

    let res = shuffleManager.getShuffledSong()

    const expectedRes = shuffleManager.shuffleQueue[0].fileUrl

    res = shuffleManager.getShuffledSong()

    expect(expectedRes).toEqual(res)
  });

});
