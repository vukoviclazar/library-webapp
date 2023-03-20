import { Book } from "../models/book";
import { doubleTolerance } from "./constants";

const millisecondsInDay: number = 1000 * 60 * 60 * 24   

export function todaysDate(): Date {
  let temp: Date = new Date(Date.now())
  let today: Date = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate())
  console.log(`todaysDate called - ${today}`)
  return today
}

export function doubleCompare(a: number, b: number): number {
  if (Math.abs(a - b) < doubleTolerance)
    return 0;
  else if (a - b < 0)
    return -1
  else return 1
}

export function genresToString(book: Book): string {
  let retval: string = ''
  book.genres.forEach((genre) => {
    retval = String().concat(retval, genre)
    if (book.genres[book.genres.length - 1] != genre)
      retval = String().concat(retval, ', ')
  })
  return retval
}

export function authorsToString(book: Book): string {
  let retval: string = ''
  book.authors.forEach((author) => {
    retval = String().concat(retval, author.lastName)
    if (book.authors[book.authors.length - 1] != author)
      retval = String().concat(retval, ', ')
  })
  return retval
}

export function daysBetween(date1: Date, date2: Date): number {
  return Math.floor((date2.getTime() - date1.getTime()) / millisecondsInDay)
}