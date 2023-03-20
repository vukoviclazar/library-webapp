import express from 'express'
import BookModel from '../models/Book'
import UserModel from '../models/User'
import LoanModel from '../models/Loan'
import UtilsModel from '../models/Utils'
import ReviewModel from '../models/Review'
import { daysBetween, todaysDate } from '../util/utility.functions'
import { defaultAvatarName, defaultCoverPath, loanLengthTag, maxLoanedBooks } from '../util/constants'
import mongoose from 'mongoose'

export class ReviewsController {

    getAllReviewsForBook = (req: express.Request, res: express.Response) => {
        let bookId = req.body.bookId
        let userId = req.body.userId

        console.log(`Get all reviews for book parameters - ${bookId}, ${userId}`)
        let canReview: boolean = false

        LoanModel.find(
            {
                book: bookId,
                userId: userId
            }, null,
            (error, loans) => {
                if (error) {
                    console.error(`Error fetching reviews for book: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
                else {
                    if (loans != null && loans.length != 0)
                        canReview = true
                    ReviewModel.find({ bookId: bookId }, null, { sort: { 'dateRated': -1 } }).populate('user').then(
                        reviews => {
                            reviews.forEach(
                                review => {
                                    if (review.user != null) {
                                        review.user._id = review.user._id.toString()
                                        review.user.avatarImagePath = review.user.avatarImagePath ? review.user.avatarImagePath : defaultAvatarName
                                        console.log(review.user)
                                    }
                                }
                            )
                            console.log(reviews)
                            console.log(`Get reviews for book succeeded - ${reviews}, ${canReview}`)
                            res.status(200).json({ reviews: reviews, canReview: canReview })
                        }
                    ).catch(
                        error => {
                            console.error(`Error fetching reviews for book: ${error}`)
                            res.status(500).json({ message: `Error: ${error}` })
                        }
                    )
                }
            }
        )
    }

    addReview = (req: express.Request, res: express.Response) => {
        let bookId = req.body.bookId
        let rating = req.body.rating
        let comment = req.body.comment
        let userId = req.body.userId

        ReviewModel.find(
            {
                user: userId,
                bookId: bookId
            }
        ).then(
            reviews => {
                if (reviews != null && reviews.length != 0)
                    throw new Break('Add review failed - user already reviewed the book.')
                return LoanModel.find(
                    {
                        book: bookId,
                        userId: userId
                    }
                )
            }
        ).then(
            loans => {
                if (loans != null && loans.length == 0)
                    throw new Break('Add review failed - user never loaned the book.')
                return UserModel.findById(userId)
            }
        ).then(
            user => {
                if (user == null)
                    throw new Break('Add review failed - no such user.')
                return BookModel.findById(bookId)
            }
        ).then(
            book => {
                if (book == null)
                    throw new Break('Add review failed - no such book.')

                book.averageRating = (book.averageRating * book.timesRated + rating) / (book.timesRated + 1)
                book.timesRated = book.timesRated + 1

                return book.save()
            }
        ).then(
            book => {
                if (book == null)
                    throw new Break('Add review failed - error updating book rating.')

                let date = new Date(Date.now())

                let newReview = new ReviewModel({
                    _id: new mongoose.Types.ObjectId(),
                    user: userId,
                    bookId: bookId,
                    comment: comment,
                    dateRated: date,
                    rating: rating,
                    edited: false
                })

                return newReview.save()
            }
        ).then(
            (review) => {
                console.log(`Add review succeeded - ${review}`)
                res.status(200).json({ message: 'Success' })
            }
        ).catch(
            error => {
                if (error instanceof Break) {
                    console.log(error.message)
                    res.status(400).json({ message: error.message })
                }
                else {
                    console.log(`Error adding review - ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
            }
        )
    }

    editReview = (req: express.Request, res: express.Response) => {
        let bookId = req.body.bookId
        let rating = req.body.rating
        let comment = req.body.comment
        let userId = req.body.userId

        let prevRating: number = null

        ReviewModel.find(
            {
                user: userId,
                bookId: bookId
            }
        ).then(
            reviews => {
                if (reviews != null && reviews.length != 1)
                    throw new Break('Edit review failed - no such review.')

                let review = reviews[0]

                prevRating = review.rating

                review.rating = rating
                review.comment = comment
                review.edited = true

                return review.save()
            }
        ).then(
            review => {
                if (review == null)
                    throw new Break('Edit review failed - error updating review')
                return BookModel.findById(bookId)
            }
        ).then(
            book => {
                if (book == null)
                    throw new Break('Edit review failed - no such book.')

                if (prevRating == null)
                    throw new Break('Edit review failed - error with data of previous review.')

                book.averageRating = (book.averageRating * book.timesRated + rating - prevRating) / book.timesRated

                return book.save()
            }
        ).then(
            (book) => {
                console.log(`Edit review succeeded - ${book}`)
                res.status(200).json({ message: 'Success' })
            }
        ).catch(
            error => {
                if (error instanceof Break) {
                    console.log(error.message)
                    res.status(400).json({ message: error.message })
                }
                else {
                    console.log(`Error adding review - ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
            }
        )
    }
}

class Break {
    constructor(
        public message: string
    ) { }
}