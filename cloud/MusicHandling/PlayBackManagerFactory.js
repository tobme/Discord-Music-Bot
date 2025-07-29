const PlayBackManager = require('./PlayBackManager.js')

const MusicManager = require('./MusicManager.js')
const QueueManager = require('./QueueManager.js')
const ShuffleManager = require('./ShuffleManager.js')

function createPlayBackManager(Parse)
{
    const musicManager = new MusicManager()
    musicManager.retrieveSounds(Parse)
    const queueManager = new QueueManager(musicManager)
    const shuffleManager = new ShuffleManager(musicManager)
    
    return new PlayBackManager(musicManager, queueManager, shuffleManager, Parse)
}

module.exports = {createPlayBackManager};