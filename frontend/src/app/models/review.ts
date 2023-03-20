import { User } from "./user"

export class Review {
        user: User
        bookId: string
        comment: string
        dateRated: Date
        rating: number
        edited: boolean
    }