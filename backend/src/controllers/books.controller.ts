import express from 'express'
import BookModel from '../models/Book'
import UserModel from '../models/User'
import LoanModel from '../models/Loan'
import ReviewModel from '../models/Review'
import { unlink } from 'node:fs'
import mongoose from 'mongoose'
import { todaysDate, random} from '../util/utility.functions'
import { coversPath, defaultCoverPath, genresTag, numFeaturedBooks } from '../util/constants'
import UtilsModel from '../models/Utils'

export class BooksController {

    getAllGenres = (req: express.Request, res: express.Response) => {
        UtilsModel.findOne({tag: genresTag})
        .then(
            (result) => {
                console.log(result)
                console.log(`Get all genres succeeded`)
                res.status(200).json({ genres: result.data })
            }
        )
        .catch(
            (error) => {
                console.error(`Error getting all genres: ${error}`)
                res.status(500).json({ message: `Error: ${error}` })
            }
        )
    }

    appendDayAndMonth(year: string) {
        return `${year}-01-01`
    }

    searchForBooks = (req: express.Request, res: express.Response) => {
        let query = {}
        // if(req.body.registeredSuccessfully != null)
        //     query['registeredSuccessfully'] = req.body.registeredSuccessfully
        let titleParam: string= req.body.titleParam
        let authorsParamRegex: string= (<string[]>req.body.authorsParam).join("|")

        let pageSize: number= req.body.pageSize
        let pageNum: number = req.body.pageNum
        
        if(req.body.yearFrom != null && req.body.yearFrom != "" 
            && req.body.yearTo != null && req.body.yearTo != "")
            query['yearPublished'] = {$gte: this.appendDayAndMonth(req.body.yearFrom), $lte: this.appendDayAndMonth(req.body.yearTo)}
        else if(req.body.yearTo != null && req.body.yearTo != ""){
            query['yearPublished'] = {$lte: this.appendDayAndMonth(req.body.yearTo)} 
        } 
        else if(req.body.yearFrom != null && req.body.yearFrom != ""){
            query['yearPublished'] = {$gte: this.appendDayAndMonth(req.body.yearFrom)} 
        }    
        if(req.body.publisherParam)
            query['publisher'] = {$regex: req.body.publisherParam, $options: 'i'}
            
        if(req.body.genresParam && req.body.genresParam.length != 0) {
            query['genres'] = {$in: req.body.genresParam}
        }

        query['successfullyAdded'] = !req.body.searchForRequests
        query['title'] = { $regex: titleParam, $options: 'i'}
        query['$or'] = [ 
            { 'authors.firstName': { $regex: authorsParamRegex, $options: 'i'} },
            { 'authors.lastName': { $regex: authorsParamRegex, $options: 'i'} }
        ]

        console.log(`Search users request: ${titleParam}, ${authorsParamRegex}, ${req.body.publisherParam}, ${req.body.yearTo}, ${req.body.yearFrom}, ${req.body.genresParam} pageSize : ${pageSize}, pageNum : ${pageNum}`)

        console.log(`Query is - ${JSON.stringify(query)}`)
        if (pageSize < 1 || pageNum < 1) {
            console.log(`Search for users failed - invalid page size (${pageSize}) or page number (${pageNum}).`)
            res.status(400).json({ message: `Search for users failed - invalid page parameters.` })
            return
        }
        BookModel.countDocuments(
            query,
            (error, result) => {
                if (error) {
                    console.error(`Error processing search users request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
                else {
                    if (result == null) {
                        console.error(`Error processing search users request: ${error}`)
                        res.status(500).json({ message: `Error: ${error}` })
                    }
                    
                    let pageCount: number = Math.ceil(result/pageSize)
                    if (pageCount == 0)
                        pageCount = 1
                    console.log(`Page count for query: ${pageCount}`)

                    if(pageCount < pageNum) {
                        console.log(`Search for users failed - invalid page size (${pageSize}) or page number (${pageNum}).`)
                        res.status(400).json({ message: `Search for users failed - invalid page parameters.` })
                        return
                    }

                    BookModel.find(
                        query,
                        null,
                        {
                            sort : { _id : -1 },
                            skip : pageSize*(pageNum-1),
                            limit : pageSize
                        },
                        (error, result) => {
                            if (error) {
                                console.error(`Error processing search users request: ${error}`)
                                res.status(500).json({ message: `Error: ${error}` })
                            }
                            else {
                                result.forEach( res => {
                                    res.coverImagePath = res.coverImagePath ? res.coverImagePath : defaultCoverPath
                                })
                                console.log(`Search users succeeded`)
                                console.log(result)
                                res.status(200).json({books : result, pageCount: pageCount})
                            }
                        }
                    )
                }
            }

        )
    }

    getBookById = (req: express.Request, res: express.Response) => {
        let bookId = req.body.bookId
        let userId = req.body.userId

        console.log(bookId + ' ' + userId )

        BookModel.findById(
            bookId,
            (error, book) => {
                if (error) {
                    console.error(`Error processing get book by id request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                } else {
                    if (book == null) {
                        console.log(`Get book by id failed - book not found.`)
                        res.status(400).json({ message: `Get book by id failed - book not found.` })
                    } else {
                        LoanModel.findOne(
                            {
                                book: bookId,
                                userId: userId,
                                dateReturned: null
                            },
                            (error, result) => {
                                if (error) {
                                    console.error(`Error processing get book by id request: ${error}`)
                                    res.status(500).json({ message: `Error: ${error}` })
                                }
                                else {
                                    let flag : boolean = (result != null)

                                    if (book.userWhoRequested != null) {
                                        UserModel.findById(
                                            book.userWhoRequested,
                                            null,
                                            (error, result) => {
                                                if (error) {
                                                    console.error(`Error processing get book by id request: ${error}`)
                                                    res.status(500).json({ message: `Error: ${error}` })
                                                } else {
                                                    if (result != null) {
                                                        book.coverImagePath = book.coverImagePath ? book.coverImagePath : defaultCoverPath
                                                        console.log(book)
                                                        console.log(`Get book by id succeeded`)
                                                        res.status(200).json({book: book, alreadyLoaned: flag, username: result.username})
                                                    }
                                                    else {
                                                        book.coverImagePath = book.coverImagePath ? book.coverImagePath : defaultCoverPath
                                                        console.log(book)
                                                        console.log(`Get book by id succeeded, but userWhoRequested does not exist`)
                                                        res.status(200).json({book: book, alreadyLoaned: flag, username: null})
                                                    }
                                                }
                                            }
                                        )
                                    }
                                    else {
                                        book.coverImagePath = book.coverImagePath ? book.coverImagePath : defaultCoverPath
                                        console.log(book)
                                        console.log(`Get book by id succeeded, but the book has no userWhoRequested`)
                                        res.status(200).json({book: book, alreadyLoaned: flag, username: null})
                                    }
                                }
                            }
                        )

                    }
                }
            }
        )
    }

    getBookOfTheDay = (req: express.Request, res: express.Response) => {
        BookModel.find(
            { successfullyAdded: true },
            null,
            {
                sort: { _id: -1 },
            },
            (error, result) => {
                if (error) {
                    console.error(`Error processing get book of the day request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
                else {
                    console.log(result)
                    let today = todaysDate()
                    let retval = result[Math.floor(random(today)) % result.length]
                    // today.setDate(today.getDate()+2)
                    console.log(Math.floor(random(today)) % result.length)
                    console.log(retval)
                    console.log(`Getting book of the day succeeded`)
                    if(retval != null)
                        retval.coverImagePath = retval.coverImagePath ? retval.coverImagePath : defaultCoverPath
                    console.log(retval)
                    res.status(200).json(retval)
                }
            }
        )
    }


    getFeaturedBooks = (req: express.Request, res: express.Response) => {
        BookModel.find(
            { successfullyAdded: true },
            null,
            {
                sort: { timesRead: -1 },
                limit: numFeaturedBooks

            },
            (error, result) => {
                if (error) {
                    console.error(`Error processing get featured books request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
                else {
                    result.forEach(res => {
                        res.coverImagePath = res.coverImagePath ? res.coverImagePath : defaultCoverPath
                    })
                    console.log(`Getting featured books succeeded`)
                    console.log(result)
                    res.status(200).json(result)
                }
            }
        )
    }


    getAllBooks = (req: express.Request, res: express.Response) => {
        BookModel.find(
            null,
            null,
            {
                sort: { _id: -1 },
            },
            (error, result) => {
                if (error) {
                    console.error(`Error processing get all books request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
                else {
                    result.forEach(res => {
                        res.coverImagePath = res.coverImagePath ? res.coverImagePath : defaultCoverPath
                    })
                    console.log(`Getting all books succeeded`)
                    console.log(result)
                    res.status(200).json(result)
                }
            }
        )
    }

    newBook = (req: express.Request, res: express.Response) => {
        let newBook = req.body.book

        console.log('New book request: ' + newBook)
        UserModel.findById(
            newBook.userWhoRequested, 
            null,
            (error, result) => {
            if (error) {
                console.error(`Error processing new book request: ${error}`)
                res.status(500).json({ message: `Error: ${error}` })
            }
            else {
                if (result == null) {
                    console.log(`New book failed - no such user.`)
                    res.status(400).json({ message: `New book failed - no such user.` })
                    return
                }
                else {
                    UtilsModel.findOne({tag: genresTag})
                    .then(
                        (result) => {
                            console.log(`Genres got - ${result}`)
                            newBook.genres.forEach(element => {
                                let index = result.data.indexOf(element)
                                if(index == -1){
                                    result.data.push(element)
                                    console.log(`found new genre - ${element}`)
                                }
                            });
                            result.markModified('data')
                            return result.save()
                        }
                    ).then(
                        () => {
                            let book = new BookModel({
                                _id : new mongoose.Types.ObjectId(),
                                title: newBook.title,
                                authors: newBook.authors,
                                genres: newBook.genres,
                                publisher: newBook.publisher,
                                yearPublished: newBook.yearPublished,
                                language: newBook.language,
                                timesRated: 0,
                                averageRating: 0.0,
                                timesRead: 0,
                                copiesAvailable: newBook.copiesAvailable,
                                successfullyAdded: newBook.successfullyAdded,
                                userWhoRequested: newBook.userWhoRequested,
                                waitingUsers: []
                            })

                            return book.save()
                        }
                    ).then(
                        (book) => {
                            console.log(`New book succeeded - ${book}`)
                            res.status(200).json({ bookId: book._id })
                        }
                    ).catch(
                        error => {
                                console.error(`Error processing new book request: ${error}`)
                                res.status(500).json({ message: `Error: ${error}` })
                            }
                    )
                }
            }
        })
    }

    uploadCover(req: express.Request, res: express.Response) {
        let bookId = req.body.bookId
        let coverImagePath = req.body.coverImagePath

        console.log('cover upload request: ' + bookId + ' ' + coverImagePath)

        BookModel.findOne({
            _id: bookId
        }, (error, result) => {
            if (error) {
                console.error(`Error processing cover upload request: ${error}`)
                if (coverImagePath != null)
                    unlink(`${coversPath}\\${coverImagePath}`, (err) => {
                        if(err) {
                            console.log(`Error deleting file at ${coversPath}\\${coverImagePath} - ${err}`)
                        }
                    })
                res.status(500).json({ message: `Error: ${error}` })
            }
            else {
                if (result != null) {
                    if (result.coverImagePath != null
                        && result.coverImagePath != coverImagePath)
                        unlink(`${coversPath}\\${result.coverImagePath}`, (err) => {
                            if(err) {
                                console.log(`Error deleting file at ${coversPath}\\${coverImagePath} - ${err}`)
                            }
                        })

                    BookModel.updateOne({
                        _id: bookId
                    }, {
                        coverImagePath: coverImagePath
                    }, (error, result) => {
                        if (error) {
                            console.error(`Error processing cover upload request: ${error}`)
                            if (coverImagePath != null)
                                unlink(`${coversPath}\\${coverImagePath}`, (err) => {
                                    if(err) {
                                        console.log(`Error deleting file at ${coversPath}\\${coverImagePath} - ${err}`)
                                    }
                                })
                            res.status(500).json({ message: `Error: ${error}` })
                        }
                        else {
                            console.log(`Cover upload succeeded`)
                            res.status(200).json({ message: `Success` })
                        }
                    })
                }
                else {
                    console.log(`Cover upload failed - no such book.`)
                    if (coverImagePath != null)
                        unlink(`${coversPath}/${coverImagePath}`, (err) => {
                            console.error(`Error deleting file: ${error}`)
                        })
                    res.status(400).json({ message: `Cover upload failed - no such book.` })
                    return
                }
            }
        })
    }


    updateBook = (req: express.Request, res: express.Response) => {
        let bookId = req.body.bookId
        let book = req.body.book

        console.log(req.body)

        console.log('Update book request: ' + bookId + ' ' + book)

        BookModel.findById(
            bookId,
            null,
            (error, oldBook) => {
            if (error) {
                console.error(`Error processing update book request: ${error}`)
                res.status(500).json({ message: `Error: ${error}` })
            }
            else {
                if (oldBook != null) {
                    let genreDiff = []

                    oldBook.genres.forEach(element => {
                        let index = book.genres.indexOf(element)
                        if(index == -1){
                            genreDiff.push(element)
                            console.log(`found different genre - ${element}`)
                        }
                    })

                    UtilsModel.findOne({tag: genresTag})
                    .then(
                        (genres) => {
                            console.log(`Genres got - ${genres}`)
                            book.genres.forEach(element => {
                                let index = genres.data.indexOf(element)
                                if(index == -1){
                                    genres.data.push(element)
                                    console.log(`found new genre - ${element}`)
                                }
                            });
                            let checkAndRemoveGenre = (i: number) =>
                                BookModel.findOne(
                                    {
                                        genres: genreDiff[i],
                                        _id: {$ne: bookId}
                                    }
                                ).then(
                                    r => {
                                        console.log(r)
                                        if (r == null){
                                            var index = genres.data.indexOf(genreDiff[i]);
                                            if (index > -1) {
                                                genres.data.splice(index, 1);
                                                console.log(`Removing genre ${genreDiff[i]}`)
                                            }
                                        }
                                        i++
                                        if (i < genreDiff.length){
                                            console.log(`Looking for more genres ${genreDiff[i]}`)
                                            return checkAndRemoveGenre(i)
                                        }
                                        else {
                                            console.log(`Returning with new genres array ${genres.data}`)
                                            genres.markModified('data')
                                            return genres.save()
                                        }
                                    }
                                )

                            if (genreDiff.length != 0)
                                return checkAndRemoveGenre(0)
                            else {    
                                genres.markModified('data')
                                return genres.save()
                            }
                        }
                    ).then(
                        () => {
                            oldBook.title = book.title
                            oldBook.authors = book.authors
                            oldBook.genres = book.genres
                            oldBook.yearPublished = book.yearPublished
                            oldBook.publisher = book.publisher 
                            oldBook.language = book.language
                            oldBook.copiesAvailable = book.copiesAvailable
                            oldBook.successfullyAdded = book.successfullyAdded

                            oldBook.markModified('authors')
                            oldBook.markModified('genres')

                            return oldBook.save()
                        }
                    ).then(
                        (saved) => {
                            console.log(saved)
                            console.log(`Update book succeeded`)
                            res.status(200).json({ bookId: saved._id })
                            }
                        ).catch(
                            error => {
                                console.error(`Error processing update book request: ${error}`)
                                res.status(500).json({ message: `Error: ${error}` })
                            }
                        )

                }
                else {
                    console.log(`Update book failed - no such book.`)
                    res.status(400).json({ message: `Update user book - no such book.` })
                    return
                }
            }
        })
    }

    removeBook = (req: express.Request, res: express.Response) => {
        let bookId = req.body.bookId
        
        LoanModel.find(
            {
                book: bookId,
                dateReturned: null
            },
            (error, result) => {
                if (error) {
                    console.error(`Error processing remove book request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                } else {
                    console.log(result)

                    let book = null
                    if (result != null && result.length == 0) {
                        BookModel.findById(
                            bookId
                        ).then(
                            _book => {
                                if (_book == null) {
                                    console.log(`Delete book failed - no such book.`)
                                    res.status(400).json({ message: `Delete book failed - no such book.` })
                                    return
                                }
                                book = _book
                                return UtilsModel.findOne({ tag: genresTag })
                            }
                        ).then(
                            (genres) => {
                                console.log(`Genres got - ${genres}`)

                                let checkAndRemoveGenre = (i: number) =>
                                    BookModel.findOne(
                                        {
                                            genres: book.genres[i],
                                            _id: { $ne: bookId }
                                        }
                                    ).then(
                                        r => {
                                            console.log(r)
                                            if (r == null) {
                                                var index = genres.data.indexOf(book.genres[i]);
                                                if (index > -1) {
                                                    genres.data.splice(index, 1);
                                                    console.log(`Removing genre ${book.genres[i]}`)
                                                }
                                            }
                                            i++
                                            if (i < book.genres.length) {
                                                console.log(`Looking for more genres ${book.genres[i]}`)
                                                return checkAndRemoveGenre(i)
                                            }
                                            else {
                                                console.log(`Returning with new genres array ${genres.data}`)
                                                genres.markModified('data')
                                                return genres.save()
                                            }
                                        }
                                    )

                                if (book.genres.length != 0)
                                    return checkAndRemoveGenre(0)
                                else {
                                    genres.markModified('data')
                                    return genres.save()
                                }
                            }
                        ).then(
                            () => BookModel.findByIdAndDelete(bookId)
                        ).then(
                            (result) => {
                                if (result != null) {
                                    if (result.coverImagePath != null)
                                        console.log(result.coverImagePath)
                                        unlink(`${coversPath}\\${result.coverImagePath}`, (err) => {
                                            console.log(`Error deleting file at ${coversPath}\\${result.coverImagePath} - ${err}`)
                                        })
                
                                    return ReviewModel.deleteMany(
                                        {
                                            bookId: bookId
                                        }
                                    )
                                }
                                else 
                                    return Promise.resolve(null)
                            }

                        ).then(
                            (result) => {
                                if(result == null) {
                                    console.log(`Delete book failed - no such book.`)
                                    res.status(400).json({ message: `Delete book failed - no such book.` })
                                }
                                else {
                                    console.log(`Delete book succeeded.`)
                                    res.status(200).json({ message: `Success` })
                                }
                            }
                        ).catch(
                            error => {
                                console.error(`Error processing delete book request: ${error}`)
                                res.status(500).json({ message: `Error: ${error}` })
                            }
                        )
                    } else {
                        console.log(`Delete book failed - there are active loans of this book.`)
                        res.status(400).json({ message: `Delete book failed - there are active loans of this book.` })
                        return
                    }
                }
            }
        )
    }

}
