import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '../models/book';
import { Observable } from 'rxjs'
import { tap, concatMap, map } from 'rxjs/operators'
import { projectBackendUri } from './constants';
import { Loan } from '../models/loan';

const uri = `${projectBackendUri}/books`

@Injectable({
  providedIn: 'root'
})
export class BooksService {

  constructor(private _httpClient: HttpClient) { }

  getAllGenres() {
    return this._httpClient.post(`${uri}/getAllGenres`, null).pipe(
      tap(res => console.log(`Got genres - ${res}`))
    )
  }

  searchForBooks(titleParam: string, authorsParam: string[], publisherParam: string, yearFromParam: string, 
    yearToParam: string, genresParam: string[], searchForRequests: boolean, pageNum: number, pageSize: number) {
    console.log(`Calling searchForBooks with parameter ${titleParam} and ${authorsParam}, looking for page ${pageNum}`)

    let data = {
      titleParam : titleParam,
      authorsParam: authorsParam,
      publisherParam: publisherParam,
      yearTo: yearToParam,
      yearFrom: yearFromParam,
      genresParam: genresParam,
      searchForRequests: searchForRequests,
      pageNum : pageNum,
      pageSize: pageSize
    }

    return this._httpClient.post(`${uri}/searchForBooks`, data).pipe(
      tap(bookPayload => {
        (<Book[]>bookPayload['books']).forEach( book => {
          book.yearPublished = new Date(book.yearPublished)
        })
      }),
      tap(response => console.log(response))
    )
  }

  getFinishedLoansForUser(userId: string) {
    const data = {
      userId: userId
    }
    return this._httpClient.post(`${uri}/getFinishedLoansForUser`, data).pipe(
      tap(loans => {
        (<Loan[]>loans).forEach( loan => {
          loan.dateBorrowed = new Date(loan.dateBorrowed)
          loan.dateReturned = new Date(loan.dateReturned)
        })
      }),
      tap(response => console.log(response))
    )
  }

  getActiveLoansForUser(userId: string) {
    const data = {
      userId: userId
    }
    return this._httpClient.post(`${uri}/getActiveLoansForUser`, data).pipe(
      tap(loanPayload => {
        (<Loan[]>loanPayload['loans']).forEach( loan => {
          loan.dateBorrowed = new Date(loan.dateBorrowed)
        })
      }),
      tap(response => console.log(response))
    )
  }

  extendLoan(bookId: string, userId: string) {
    const data = {
      bookId: bookId,
      userId: userId
    }

    return this._httpClient.post(`${uri}/extendLoan`, data).pipe(
      tap(response => console.log(response))
    )
  }

  returnBook(bookId: string, userId: string) {
    const data = {
      bookId: bookId,
      userId: userId
    }

    return this._httpClient.post(`${uri}/returnBook`, data).pipe(
      tap(response => console.log(response))
    )
  }

  borrowBook(bookId: string, userId: string) {
    const data = {
      bookId: bookId,
      userId: userId
    }

    return this._httpClient.post(`${uri}/borrowBook`, data).pipe(
      tap(response => console.log(response))
    )
  }

  getBookById(id: string, userId: string) {
    const data = {
      bookId: id,
      userId: userId
    }

    console.log('Fetching book by id')
    return <Observable<Book>>this._httpClient.post(`${uri}/getBookById`, data).pipe(
      tap(bookPayload => {
        bookPayload['book']['yearPublished'] = new Date(bookPayload['book']['yearPublished'])
      }),
      tap(bookPayload => console.log(bookPayload))
    )
  }
  
  getBookOfTheDay(): Observable<Book> {
    console.log('Fetching book of the day')
    return <Observable<Book>>this._httpClient.post(`${uri}/bookOfTheDay`, null).pipe(
      tap(books => console.log(books)),
      tap(book => {
        book['yearPublished'] = new Date(book['yearPublished'])
      }),
    )
  }

  getFeaturedBooks(): Observable<Book[]> {
    console.log('Fetching featured books')
    return <Observable<Book[]>>this._httpClient.post(`${uri}/getFeaturedBooks`, null).pipe(
      tap(books => (<Object[]>books).forEach(element => {
        element['yearPublished'] = new Date(element['yearPublished'])
      })),
      tap(books => console.log(books))
    )
  }

  getAllBooks(): Observable<Book[]> {
    console.log('Fetching all books')
    return <Observable<Book[]>>this._httpClient.post(`${uri}/getAllBooks`, null).pipe(
      tap(books => (<Object[]>books).forEach(element => {
        element['yearPublished'] = new Date(element['yearPublished'])
      })),
      tap(books => console.log(books))
    )
  }

  addNewBook(file: File, book: Book) {
    console.log(`Calling addNewBook for ${book.title}, with data ${book}`)

    const data = {
      book: book
    }

    let request = this._httpClient.post(`${uri}/newBook`, data)

    if (file != null) {
      let imageData = new FormData()

      let bookId = null
      return request.pipe(
        concatMap(
          (response) => {
            bookId = response['bookId']

            let imgName = `cover_${bookId}` + '.' + file.name.split('.').pop()
            console.log(imgName)
            imageData.append(imgName, file)
            imageData.append('coverImagePath', imgName)
            imageData.append('bookId', bookId)
            return this._httpClient.post(`${uri}/uploadCover`, imageData)
            }
          ),
          map(
            (response) => {return {bookId: bookId, message: response['message']}}
          )
      )
    }
    return request;
  }

  updateBook(bookId: string, file: File, book: Book) {
    console.log(`Calling addNewBook for ${book.title} , with data ${book}`)

    const data = {
      bookId: bookId,
      book: book
    }

    let request = this._httpClient.post(`${uri}/updateBook`, data)

    if (file != null) {
      let imageData = new FormData()

      let bookId = null
      return request.pipe(
        concatMap(
          (response) => {
            bookId = response['bookId']

            let imgName = `cover_${bookId}` + '.' + file.name.split('.').pop()
            console.log(imgName)
            imageData.append(imgName, file)
            imageData.append('coverImagePath', imgName)
            imageData.append('bookId', bookId)
            return this._httpClient.post(`${uri}/uploadCover`, imageData)
            }
          ),
          map(
            (response) => {return {bookId: bookId, message: response['message']}}
          )
      )
    }
    return request;
  }

  removeBook(id: string) {
    const data = {
      bookId: id
    }

    console.log(`Removing book ${id}`)
    return this._httpClient.post(`${uri}/removeBook`, data).pipe(
      tap(payload => console.log(`Remove book response - ${payload}`))
    )
  }

  getReviewsForBook(id: string, userId: string) {
    const data = { bookId: id, userId: userId }

    return this._httpClient.post(`${uri}/getReviews`, data).pipe(
      tap(reviewsPayload => (<Object[]>reviewsPayload['reviews']).forEach(element => {
        element['dateRated'] = new Date(element['dateRated'])
      })),
      tap(reviewsPayload => console.log(`Get reviews response - ${reviewsPayload}`)),
      tap(reviewsPayload => console.log(reviewsPayload))
    )
  }

  addReview(bookId: string, userId: string, comment: string, rating: number) {
    const data = {
      bookId: bookId,
      userId: userId,
      comment: comment,
      rating: rating
    }

    return this._httpClient.post(`${uri}/addReview`, data).pipe(
      tap(response => console.log(`Add review response - ${response}`))
    )
  }

  editReview(bookId: string, userId: string, comment: string, rating: number) {
    const data = {
      bookId: bookId,
      userId: userId,
      comment: comment,
      rating: rating
    }

    return this._httpClient.post(`${uri}/editReview`, data).pipe(
      tap(response => console.log(`Edit review response - ${response}`))
    )
  }
}
