import { ObjectId } from "mongodb";
import UserModel from "./User"
import mongoose from 'mongoose'

let Review = new mongoose.Schema(
    {
        _id: ObjectId,
        user: {type: ObjectId, ref: UserModel},
        bookId: ObjectId,
        comment: String,
        dateRated: Date,
        rating: Number,
        edited: Boolean
    }
)

export default mongoose.model('ReviewModel', Review, 'reviews')