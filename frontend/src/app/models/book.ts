import { Author } from "./author"

export class Book {
        _id : string
        title: string
        authors: Array<Author>
        genres: Array<string>
        publisher: string
        yearPublished: Date
        language: string
        coverImagePath: string
        timesRated: number
        averageRating: number
        timesRead: number
        copiesAvailable: number
        successfullyAdded: boolean
        userWhoRequested: string
        waitingUsers: Array<string>

        constructor() {
            this.title = ""
            this.authors = []
            this.genres = []
            this.publisher = ""
            this.yearPublished = new Date()
            this.language = ""
            this.copiesAvailable = 0
            this.successfullyAdded = false
        }
    }
