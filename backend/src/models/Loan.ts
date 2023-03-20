import { ObjectId } from "mongodb";
import mongoose from 'mongoose'
import BookModel from "./Book";

let Loan = new mongoose.Schema(
    {
        _id: ObjectId,
        userId: ObjectId,
        book: {type: ObjectId, ref: BookModel},
        dateBorrowed: Date,
        dateReturned: Date,
        extended: Boolean,
        backupTitle: String,
        backupAuthors: [{
            firstName: String,
            lastName: String
        }],
    }
)

export default mongoose.model('LoanModel', Loan, 'loans')