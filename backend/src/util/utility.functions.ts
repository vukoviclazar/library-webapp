const millisecondsInDay: number = 1000 * 60 * 60 * 24   

export function random(seed: Date): number {
    let m = 0x80000000; // 2**31;
    let a = 1103515245;
    let c = 12345;
    let retval = (a * (seed.valueOf()/millisecondsInDay) + c) % m;
    // return retval;

    // var x = Math.sin(seed.valueOf() / millisecondsInDay) * 10000;
    // let retval = x - Math.floor(x);
    console.log(`random called - return value is  ${retval}`)
    return retval
}

export function daysBetween(date1: Date, date2: Date): number {
    return Math.floor((date2.getTime() - date1.getTime()) / millisecondsInDay)
}

export function todaysDate(): Date {
    let temp: Date = new Date(Date.now())
    let today: Date = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate())
    console.log(`todaysDate called - ${today}`)
    return today
}