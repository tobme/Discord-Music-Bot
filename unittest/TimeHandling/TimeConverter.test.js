const {convertToTime} = require('../../TimeHandling/TimeConverter.js')

describe('DiscordTimeHandler tests', () => {

    test('convertToTime_noTime_Expect0m', async () => {

        const time = convertToTime(0)
  
      expect(time).toBe('0m')
    });
    test('convertToTime_30m_Expect30m', async () => {

        const time = convertToTime(30)
  
      expect(time).toBe('30m')
    });

    test('convertToTime_90m_Expect1h30m', async () => {

        const time = convertToTime(90)
  
      expect(time).toBe('1h 30m')
    });

    test('convertToTime_1440m_Expect1d', async () => {

        const time = convertToTime(1440)
  
      expect(time).toBe('1d ')
    });

    test('convertToTime_1440m_Expect1d', async () => {

        const time = convertToTime(1520)
  
      expect(time).toBe('1d 1h 20m')
    });
});