import { ObjectId } from "mongodb";
import mongoose from "mongoose";

let Book = new mongoose.Schema(
    {
        _id : ObjectId,
        title: String,
        authors: [{
            firstName: String,
            lastName: String
        }],
        genres: [String],
        publisher: String,
        yearPublished: Date,
        language: String,
        coverImagePath: String,
        timesRated: Number,
        averageRating: Number,
        timesRead: Number,
        copiesAvailable: Number,
        successfullyAdded: Boolean,
        userWhoRequested: ObjectId,
        waitingUsers: [ObjectId]
    }
)

export default mongoose.model('BookModel', Book, 'books')