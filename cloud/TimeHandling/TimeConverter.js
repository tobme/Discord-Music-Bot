function convertToTime(minutes)
{
    let out = ""
    
    let tmpMinutes = Number(minutes)
    
    let days = Math.floor(tmpMinutes / (60 * 24))
    
    tmpMinutes -= days * (60 * 24)
    
    let hours =  Math.floor(tmpMinutes / 60)
    
    tmpMinutes -= hours * 60
    
    if (days !== 0)
    {
        out += days + "d "
    }
    
    if (hours !== 0)
    {
        out += hours + "h "
    }
    
    if (tmpMinutes !== 0)
    {
        out += tmpMinutes + "m"
    }
    
    if (out === "")
    {
        out = "0m"
    }
    
    return out
}

module.exports.convertToTime = convertToTime