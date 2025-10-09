class DiscordTimeCalculator {

    #timeHandler

    constructor(timeHandler)
    {
        this.#timeHandler = timeHandler;
    }

    #getWeekNumber(date) 
    {
        const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = temp.getUTCDay() || 7;
        temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);
        return weekNo.toString().padStart(2, '0');
    }

    #extractFilteredDates(user, yearSelection, monthSelection, weekSelection) {
    const allDates = [];
    const grouped = {};

    const allYears = yearSelection === 'All';
    const allMonths = monthSelection === 'All';
    const allWeeks = weekSelection === 'All';
    let daySelection = 'All'

        if (weekSelection != 'All')
        {
            daySelection = this.#splitDay(weekSelection)
        }

        const monthToInt = {'All': 'All', 'Januari': '01', 'Februari': '02', 'Mars': '03', 'April': '04', 'Maj': '05', 'Juni': '06', 'Juli': '07', 'Augusti': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'December': '12'};

        monthSelection = monthToInt[monthSelection]

        const selectedYears = this.getUserObject(user.timeObject, [yearSelection])

        for (const [yearDate, years] of Object.entries(selectedYears))
        {
            const selectedMonths = this.getUserObject(years, [monthSelection])

            for (const [monthDate, month] of Object.entries(selectedMonths))
            {
                const selectedDays = this.getUserObject(month, daySelection)

                for (const [day, time] of Object.entries(selectedDays))
                {
                    const m = monthDate.padStart(2, '0');
                    const d = day.padStart(2, '0');
                    const date = new Date(`${yearDate}-${m}-${d}`);

                    const week = this.#getWeekNumber(date);

                    if (allMonths && allWeeks) 
                    {
                        allDates.push(date); // global mode
                    } else {
                    // Build grouping key
                    const key = allWeeks
                        ? `${yearDate}-${m}`                  // month group
                        : `${yearDate}-${m}-W${week}`;       // week group

                    if (!grouped[key])
                        grouped[key] = [];
                        grouped[key].push(date);
                    }
                }
            }
        }

        const now = new Date();
        const nowUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const nowYear = now.getFullYear().toString();
        const nowMonth = (now.getMonth() + 1).toString().padStart(2, '0');
        const nowWeek = this.#getWeekNumber(now);
        const nowDay = nowUtc.getDate();

        const yearMatch = allYears || yearSelection == nowYear;
        const monthMatch = allMonths || monthSelection == nowMonth;
        const dayRange = daySelection === 'All' ? [1, 31] : daySelection
        const [startDay, endDay] = dayRange;
        const dayMatch = daySelection === 'All' || (nowDay >= startDay && nowDay <= endDay);

        if (yearMatch && monthMatch && dayMatch) {
            if (allMonths && allWeeks) {
            allDates.push(nowUtc);
            } else {
            const key = allWeeks ? `${nowYear}-${nowMonth}-W${nowWeek}` : `${nowYear}-${nowMonth}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(nowUtc);
            }
        }

        if (allMonths && allWeeks)
        {
            return { mode: 'global', dates: allDates.sort((a, b) => a - b) };
        } 
        else 
        {
            for (const key in grouped) 
            {
                grouped[key].sort((a, b) => a - b);
            }
            return { mode: 'grouped', dates: grouped };
        }
    }

    #findLongestGap(dates) {
        if (dates.length < 2) return -1;
        let maxGap = 0;
        for (let i = 1; i < dates.length; i++) {
            const gap = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
            if (gap > maxGap) maxGap = gap;
        }
        return maxGap;
    }

    #getMaxGap(user, yearFilter = [], monthFilter = [], weekFilter = []) 
    {
        const { mode, dates } = this.#extractFilteredDates(user, yearFilter, monthFilter, weekFilter);

        if (mode === 'global') {
            return this.#findLongestGap(dates);
        }

        let maxGap = 0;
        for (const key in dates) {
            const gap = this.#findLongestGap(dates[key]);
            if (gap > maxGap) maxGap = gap;
        }
        return maxGap;
    }

    async getLongestAway(user, year, month, day)
    {
        console.log("Is in discord: " + Boolean(user.InDiscord))

        
        if (year === 'All' && month === 'All' && day === 'All')
        {
            // If user is in discord then the updated longest away is always largest
            if (Boolean(user.InDiscord))
            {
                return user.longestAway
            }
            
            let leftTime = user.leftTime
            
            // Never have left disc
            if (leftTime === "-1")
            {
                return user["longestAway"]
            }
            
            leftTime = new Date(leftTime)
            
            let currentTime = new Date()
            
            let timeSinceLeft = currentTime - leftTime
            
            timeSinceLeft /= 1000 * 60 // min
                
            timeSinceLeft = Math.round(timeSinceLeft)
            
            if (timeSinceLeft > Number(user.longestAway))
            {
                return timeSinceLeft
            }
            else
            {
                return user.longestAway
            }
        }
        else
        {
            return this.#getMaxGap(user, year, month, day)
        }
    }

    getUserObject(object, selectionString)
    {
        if (selectionString == 'All')
            return object

        let retObject = new Object()

        for (const [key, val] of Object.entries(object))
        {
            if (selectionString.includes(key))
                retObject[key] = val
        }

        return retObject
    }

    #splitDay(daySelection)
    {
        const tmpSplit = daySelection.split('-')
        let tmp = []
        for (let i = Number(tmpSplit[0]); i <= Number(tmpSplit[1]); i++)
        {
            let string = ''
            if (i < 10)
                string += '0'
            string += String(i)
            tmp.push(string)
        }
        return tmp
    }

    getUserTime(user, yearSelection, monthSelection, daySelection)
    {
        let time = 0

        if (yearSelection == 'All' && monthSelection == 'All' && daySelection == 'All')
            time += user.time

        if (daySelection != 'All')
        {
            daySelection = this.#splitDay(daySelection)
        }

        const monthToInt = {'All': 'All', 'Januari': '01', 'Februari': '02', 'Mars': '03', 'April': '04', 'Maj': '05', 'Juni': '06', 'Juli': '07', 'Augusti': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'December': '12'};

        monthSelection = monthToInt[monthSelection]

        const selectedYears = this.getUserObject(user.timeObject, [yearSelection])

        for (const [key, years] of Object.entries(selectedYears))
        {
            const selectedMonths = this.getUserObject(years, [monthSelection])

            for (const [key2, month] of Object.entries(selectedMonths))
            {
                const selectedDays = this.getUserObject(month, daySelection)

                for (const [key2, day] of Object.entries(selectedDays))
                {
                    time += Number(day)
                }
            }
        }

        return time
    }

    getUserStreak(user, yearSelection, monthSelection, daySelection)
    {
        let ret = 0
        let streak = 0

        if (daySelection != 'All')
        {
            daySelection = this.#splitDay(daySelection)
        }

        const monthToInt = {'All': 'All', 'Januari': '01', 'Februari': '02', 'Mars': '03', 'April': '04', 'Maj': '05', 'Juni': '06', 'Juli': '07', 'Augusti': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'December': '12'};

        monthSelection = monthToInt[monthSelection]

        const selectedYears = this.getUserObject(user.timeObject, [yearSelection])

        const lastDate = new Date()

        for (const [currentYear, years] of Object.entries(selectedYears))
        {
            const selectedMonths = this.getUserObject(years, [monthSelection])

            for (const [currentMonth, month] of Object.entries(selectedMonths).sort(([a], [b]) => Number(a) - Number(b)))
            {
                const selectedDays = this.getUserObject(month, daySelection)

                for (const [currentDay, day] of Object.entries(selectedDays))
                {
                    const newDate = new Date(currentYear, parseInt(currentMonth)-1, currentDay)
                    const nextDate = new Date(lastDate)
                    nextDate.setDate(nextDate.getDate() + 1)

                    if (nextDate.getDate() === newDate.getDate() &&
                        nextDate.getMonth() === newDate.getMonth() &&
                        nextDate.getFullYear() === newDate.getFullYear())
                    {
                        streak++
                    }
                    else
                    {
                        streak = 1
                    }
                    ret = Math.max(ret, streak)
                    lastDate.setDate(newDate.getDate());
                    lastDate.setMonth(newDate.getMonth());
                    lastDate.setFullYear(newDate.getFullYear());
                }
            }
        }

        return String(ret)
    }

    getSessionTime(user, yearSelection, monthSelection, daySelection)
    {
        if (yearSelection == 'All' && monthSelection == 'All' && daySelection == 'All')
            return user.sessionTime

        if (daySelection != 'All')
        {
            daySelection = this.#splitDay(daySelection)
        }

        const monthToInt = {'All': 'All', 'Januari': '01', 'Februari': '02', 'Mars': '03', 'April': '04', 'Maj': '05', 'Juni': '06', 'Juli': '07', 'Augusti': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'December': '12'};

        let sessionTime = 0

        monthSelection = monthToInt[monthSelection]

        const selectedYears = this.getUserObject(user.timeObject, [yearSelection])

        const lastDate = new Date()

        for (const [currentYear, years] of Object.entries(selectedYears))
        {
            const selectedMonths = this.getUserObject(years, [monthSelection])

            for (const [currentMonth, month] of Object.entries(selectedMonths).sort(([a], [b]) => Number(a) - Number(b)))
            {
                const selectedDays = this.getUserObject(month, daySelection)

                for (const [currentDay, day] of Object.entries(selectedDays))
                {
                    sessionTime = Math.max(sessionTime, day)
                }
            }
        }

        return sessionTime
    }

    async getTimeData(year, month, day)
    {
        var out = new Array()
        const personsInDiscord = this.#timeHandler.getDiscordTimes()

        for (const person in personsInDiscord)
        {
            let time = this.getUserTime(personsInDiscord[person], year, month, day)
            let streak = this.getUserStreak(personsInDiscord[person], year, month, day)
            let longestAway = await this.getLongestAway(personsInDiscord[person], year, month, day)
            let sessionTime = this.getSessionTime(personsInDiscord[person], year, month, day)
            out.push( {"name": personsInDiscord[person].userName, "InDiscord": personsInDiscord[person].InDiscord, "time": time, "sessionTime": sessionTime, "leftTime": personsInDiscord[person].leftTime, "longestAway": longestAway, "streak": streak} )
        }

        return out
    }
}
module.exports = DiscordTimeCalculator;