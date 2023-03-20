import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, of, pipe, merge } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { EditBookComponent } from '../edit-book/edit-book.component';
import { Book } from '../models/book';
import { Review } from '../models/review';
import { User } from '../models/user';
import { AuthenticationService } from '../services/authentication.service';
import { BooksService } from '../services/books.service';
import { bookCoversUri } from '../services/constants';
import { authorsToString, doubleCompare, genresToString } from '../services/function.utils';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css']
})
export class BookDetailsComponent implements OnInit, OnDestroy {

  constructor(
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private _booksService: BooksService,
    private _activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this._routeParamSub = this._activatedRoute.params.subscribe(
      params => {
        console.log('Edit user parameter changed, now it is ' + params['bookid'])
        this.refreshComponent(params['bookid'])
      }
    )
  }

  book: Book
  reviews: Review[]

  user: User

  usernameWhoRequested: string = ""

  genresToString: Function = genresToString
  doubleCompare: Function = doubleCompare
  coverUri: string = bookCoversUri

  alreadyLoaned: boolean = false
  alreadyReviewed: boolean = false
  canReview = false

  editBook: boolean = false

  errorFetchingData: boolean

  private _routeParamSub: Subscription

  
  authorsToString(book: Book): string {
    let retval: string = ''
    book.authors.forEach((author) => {
      retval = String().concat(retval, author.firstName + ' ' + author.lastName)
      if (book.authors[book.authors.length - 1] != author)
        retval = String().concat(retval, ', ')
    })
    return retval
  }

  
  borrowBook(book) {
    this._booksService.borrowBook(book._id, this.user._id).subscribe(
      result => {
        if (result != null && result['message'] == 'Success') {
          this._snackBar.open("Uspešno pozajmljena knjiga!")
          this.refreshComponent(book._id)
        }
        else
          this._snackBar.open("Došlo je do greške na serveru!")
      },
      error => {
        console.log(error)
        let message: string = 'Došlo je do greške na serveru.'
        if (error.status == 400) {
          switch (error.error.message) {
            case "Borrow book failed - book not found.":
              message = "Ne postoji tražena knjiga!"
              break
            case "Borrow book failed - no copies available.":
              message = "Na stanju nema primeraka ove knjige!"
              break
            case "Borrow book failed - user not found.":
              message = "Ne postoji traženi korisnik!"
              break
            case "Borrow book failed - user has exceeded the deadline for a book.":
              message = "Morate prvo vratiti knjigu kojoj je istekao rok za vraćanje!"
              break
            case "Borrow book failed - user already has the requested book.":
              message = "Već ste zadužili ovu knjigu!"
              break
            case "Borrow book failed - user has maximum books loaned.":
              message = "Zadužili ste maksimalan broj knjiga!"
              break
            default: break
          }
        }
        this._snackBar.open(message)
      }
    )
  }

  refreshComponent(bookId: string) {
    this.user = this._authenticationService.getLoggedInUser()
    this.errorFetchingData = false
    this.alreadyReviewed = false
    this.alreadyLoaned = false
    this.canReview = false

    console.log('Refreshing book details')
    this.book = null
    this.reviews = null
    this._booksService.getBookById(bookId, this.user._id)
      .subscribe(
        (bookPayload) => {
          console.log(`Received book ${bookPayload}`)
          this.book = bookPayload['book']
          this.alreadyLoaned = bookPayload['alreadyLoaned']
          this.usernameWhoRequested = bookPayload['username']
          this.editBook = false
        },
        (error: HttpErrorResponse) => {
          this.errorFetchingData = true
          console.log(error.error)
          let message: string = 'Došlo je do greške na serveru.'
          if (error.status == 400 && error.error.message == "Get book by id failed - book not found.")
            message = 'Knjiga sa traženim identifikatorom ne postoji!'
          this._snackBar.open(message)
        }
      )
    this._booksService.getReviewsForBook(bookId, this.user._id)
      .subscribe(
        (reviewsPayload) => {
          console.log(`Received reviews ${reviewsPayload}`)
          if(reviewsPayload['reviews'] != null){
            this.reviews = <Review[]>reviewsPayload['reviews']
            this.reviews.forEach(
              review => {
                if(review.user != null && review.user._id == this.user._id)
                  this.alreadyReviewed = true
              }
            )
          }
          if(reviewsPayload['canReview'] != null)
            this.canReview = reviewsPayload['canReview']
        },
        (error: HttpErrorResponse) => {
          this.errorFetchingData = true
          console.log(error.error)
          let message: string = 'Došlo je do greške na serveru.'
          if (error.status == 400 && error.error.message == "Get book by id failed - book not found.")
            message = 'Knjiga sa traženim identifikatorom ne postoji!'
          this._snackBar.open(message)
        }
      )
  } 

  ngOnDestroy(): void {
    this._routeParamSub.unsubscribe()
  }
}
