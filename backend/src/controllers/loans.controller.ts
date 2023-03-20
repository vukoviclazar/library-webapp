import express from 'express'
import BookModel from '../models/Book'
import UserModel from '../models/User'
import LoanModel from '../models/Loan'
import UtilsModel from '../models/Utils'
import { daysBetween, todaysDate } from '../util/utility.functions'
import { defaultCoverPath, loanLengthTag, maxLoanedBooks } from '../util/constants'
import mongoose from 'mongoose'

export class LoansController {

    extendLoan = (req: express.Request, res: express.Response) => {
        let userId = req.body.userId
        let bookId = req.body.bookId

        LoanModel.findOneAndUpdate(
            {
                userId: userId,
                book: bookId,
                dateReturned: null
            },
            {
                $set: { extended: true }
            },
            (error, result) => {
                if (error) {
                    console.error(`Error extending loan for user: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                    return
                }
                if (result == null) {
                    console.log(`Extend loan failed - no active loan found for this user and this book.`)
                    res.status(400).json({ message: `Extend loan failed - no active loan found for this user and this book.` })
                    return
                }
                else {
                    console.log(result)
                    console.log(`Get active loans for user succeeded`)
                    res.status(200).json({ message: 'Success' })
                }
            })
    }

    getFinishedLoansForUser = (req: express.Request, res: express.Response) => {

        let userId = req.body.userId

        LoanModel.find(
            {
                userId: userId,
            })
            .populate('book')
            .then(
                (loans) => {
                    loans = loans.filter(loan => loan.dateReturned != null)
                    loans.forEach(
                        loan => {
                            if(loan.book != null)
                                loan.book.coverImagePath = loan.book.coverImagePath ? loan.book.coverImagePath : defaultCoverPath
                        }
                    )
                    console.log(loans)
                    console.log(`Get finished loans for user succeeded`)
                    res.status(200).json(loans)
                }
            )
            .catch(
                (error) => {
                    console.error(`Error getting finished loans for user: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
            )

    }

    getActiveLoansForUser = (req: express.Request, res: express.Response) => {

        let userId = req.body.userId

        let loans = null

        LoanModel.find(
            {
                userId: userId,
                dateReturned: null
            })
            .populate('book')
            .then(
                (_loans) => {
                    console.log(_loans)
                    _loans.forEach(
                        loan => {
                            loan.book.coverImagePath = loan.book.coverImagePath ? loan.book.coverImagePath : defaultCoverPath
                        }
                    )
                    loans = _loans
                    return UtilsModel.findOne({
                        tag: loanLengthTag
                    })
                }
            )
            .then(
                (result) => {
                    console.log(result)
                    console.log(`Get active loans for user succeeded`)
                    res.status(200).json({ loans: loans, loanLength: result.data })
                }
            )
            .catch(
                (error) => {
                    console.error(`Error getting active loans for user: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
            )
    }

    returnBook = (req: express.Request, res: express.Response) => {

        let userId = req.body.userId
        let bookId = req.body.bookId

        LoanModel.find(
            {
                userId: userId,
                book: bookId,
                dateReturned: null
            },
            (error, result) => {
                if (error) {
                    console.error(`Error processing return book request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                } else {
                    console.log(result)
                    if (result == null) {
                        console.log(`Return book failed - no active loan found for this user and this book.`)
                        res.status(400).json({ message: `Return book failed - no active loan found for this user and this book.` })
                        return
                    } else {
                        if (result.length != 1) {
                            console.log(`Return book failed - user has multiple copies of this book loaned.`)
                            res.status(400).json({ message: `Return book failed - user has multiple copies of this book loaned.` })
                            return
                        }

                        let loan = result[0]

                        BookModel.findById(bookId).then(
                            book => {
                                console.log(book)
                                book.copiesAvailable = book.copiesAvailable + 1
                                // TODO: update waiting queue 
                                return book.save()
                            }
                        ).then(
                            (book) => {
                                console.log(book)
                                let date = todaysDate()

                                loan.dateReturned = date

                                return loan.save()
                            }
                        ).then(
                            (loan) => {
                                console.log(loan)
                                console.log(`Return book succeeded`)
                                res.status(200).json({ message: 'Success' })
                            }
                        ).catch(
                            error => {
                                console.error(`Error processing return book request: ${error}`)
                                res.status(500).json({ message: `Error: ${error}` })
                            }
                        )

                    }
                }
            }
        )
    }

    borrowBook = (req: express.Request, res: express.Response) => {

        let userId = req.body.userId
        let bookId = req.body.bookId

        BookModel.findById(
            bookId,
            (error, book) => {
                if (error) {
                    console.error(`Error processing borrow book request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                } else {
                    if (book == null) {
                        console.log(`Borrow book failed - book not found.`)
                        res.status(400).json({ message: `Borrow book failed - book not found.` })
                    } else {
                        if (book.copiesAvailable < 1) {
                            // TODO: update waiting queue 
                            console.log(`Borrow book failed - no copies available.`)
                            res.status(400).json({ message: `Borrow book failed - no copies available.` })
                            return
                        }
                        UserModel.findById(
                            userId,
                            (error, result) => {
                                if (error) {
                                    console.error(`Error processing borrow book request: ${error}`)
                                    res.status(500).json({ message: `Error: ${error}` })
                                } else {
                                    if (result == null) {
                                        console.log(`Borrow book failed - user not found.`)
                                        res.status(400).json({ message: `Borrow book failed - user not found.` })
                                    } else {
                                        LoanModel.find(
                                            {
                                                userId: userId,
                                                dateReturned: null
                                            },
                                            (error, result) => {

                                                console.log(result)
                                                if (error) {
                                                    console.error(`Error processing borrow book request: ${error}`)
                                                    res.status(500).json({ message: `Error: ${error}` })
                                                } else {
                                                    if (result != null) {
                                                        let message: string = ""
                                                        if (result.length >= maxLoanedBooks) {
                                                            message = "Borrow book failed - user has maximum books loaned."
                                                        }
                                                        if (message == "") {
                                                            result.forEach(element => {
                                                                if (element.book == bookId)
                                                                    message = "Borrow book failed - user already has the requested book."
                                                            });
                                                        }
                                                        if (message == "") {
                                                            let today = todaysDate()

                                                            UtilsModel.findOne({ tag: loanLengthTag })
                                                                .then(
                                                                    (util) => {
                                                                        result.forEach(element => {
                                                                            if (util.data + (element.extended ? util.data : 0) - daysBetween(element.dateBorrowed, today) < 0)
                                                                                message = "Borrow book failed - user has exceeded the deadline for a book."
                                                                        });

                                                                        if (message != "") {
                                                                            console.log(`Borrow book failed - user has maximum books loaned or already has the requested book.`)
                                                                            res.status(400).json({ message: message })
                                                                            return
                                                                        }


                                                                        BookModel.findById(bookId).then(
                                                                            book => {
                                                                                console.log(book)
                                                                                book.timesRead = book.timesRead + 1
                                                                                book.copiesAvailable = book.copiesAvailable - 1
                                                                                return book.save()
                                                                            }
                                                                        ).then(
                                                                            (book) => {
                                                                                console.log(book)
                                                                                let date = todaysDate()

                                                                                let newLoan = new LoanModel({
                                                                                    _id: new mongoose.Types.ObjectId(),
                                                                                    userId: userId,
                                                                                    book: bookId,
                                                                                    dateBorrowed: date,
                                                                                    extended: false,
                                                                                    backupTitle: book.title,
                                                                                    backupAuthors: book.authors
                                                                                })

                                                                                return newLoan.save()
                                                                            }
                                                                        ).then(
                                                                            (loan) => {
                                                                                console.log(loan)
                                                                                console.log(`Borrow book succeeded`)
                                                                                res.status(200).json({ message: 'Success' })
                                                                            }
                                                                        ).catch(
                                                                            error => {
                                                                                console.error(`Error processing borrow book request: ${error}`)
                                                                                res.status(500).json({ message: `Error: ${error}` })
                                                                            }
                                                                        )

                                                                    }
                                                                )
                                                        } else {
                                                            console.log(`Borrow book failed - user has maximum books loaned or already has the requested book.`)
                                                            res.status(400).json({ message: message })
                                                            return
                                                        }
                                                    }
                                                }
                                            }
                                        )
                                    }
                                }
                            }
                        )
                    }
                }
            }
        )
    }
}