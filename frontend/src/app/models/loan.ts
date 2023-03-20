import { Author } from "./author"
import { Book } from "./book"

export class Loan {
    _id: string
    userId: string
    book: Book
    dateBorrowed: Date
    dateReturned: Date
    extended: boolean
    backupTitle: string
    backupAuthors: Array<Author>
}