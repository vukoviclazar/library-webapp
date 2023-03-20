import express from 'express'
import { LoansController } from '../controllers/loans.controller'
import { BooksController } from '../controllers/books.controller'
import { uploadCover } from '../util/multer.settings'
import { ReviewsController } from '../controllers/reviews.controller'

const booksRouter = express.Router()

booksRouter.route('/getAllBooks').post(
    (req, res) => new BooksController().getAllBooks(req, res)
)

booksRouter.route('/getFeaturedBooks').post(
    (req, res) => new BooksController().getFeaturedBooks(req, res)
)

booksRouter.route('/bookOfTheDay').post(
    (req, res) => new BooksController().getBookOfTheDay(req, res)
)

booksRouter.route('/getBookById').post(
    (req, res) => new BooksController().getBookById(req, res)
)

booksRouter.route('/borrowBook').post(
    (req, res) => new LoansController().borrowBook(req, res)
)

booksRouter.route('/returnBook').post(
    (req, res) => new LoansController().returnBook(req, res)
)

booksRouter.route('/getActiveLoansForUser').post(
    (req, res) => new LoansController().getActiveLoansForUser(req, res)
)

booksRouter.route('/getFinishedLoansForUser').post(
    (req, res) => new LoansController().getFinishedLoansForUser(req, res)
)

booksRouter.route('/extendLoan').post(
    (req, res) => new LoansController().extendLoan(req, res)
)

booksRouter.route('/searchForBooks').post(
    (req, res) => new BooksController().searchForBooks(req, res)
)

booksRouter.route('/getAllGenres').post(
    (req, res) => new BooksController().getAllGenres(req, res)
)

booksRouter.route('/newBook').post(
    (req, res) => new BooksController().newBook(req, res)
)

booksRouter.route('/updateBook').post(
    (req, res) => new BooksController().updateBook(req, res)
)

booksRouter.route('/removeBook').post(
    (req, res) => new BooksController().removeBook(req, res)
)

booksRouter.route('/uploadCover').post(
    uploadCover,
    (req, res) => new BooksController().uploadCover(req, res)
)

booksRouter.route('/getReviews').post(
    (req, res) => new ReviewsController().getAllReviewsForBook(req, res)
)

booksRouter.route('/addReview').post(
    (req, res) => new ReviewsController().addReview(req, res)
)

booksRouter.route('/editReview').post(
    (req, res) => new ReviewsController().editReview(req, res)
)

export default booksRouter