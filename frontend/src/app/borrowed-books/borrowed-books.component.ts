import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Loan } from '../models/loan';
import { User } from '../models/user';
import { AuthenticationService } from '../services/authentication.service';
import { BooksService } from '../services/books.service';
import { authorsToString, daysBetween, todaysDate } from '../services/function.utils';
import { tap } from 'rxjs/operators'
import { bookCoversUri } from '../services/constants';

@Component({
  selector: 'app-borrowed-books',
  templateUrl: './borrowed-books.component.html',
  styleUrls: ['./borrowed-books.component.css']
})
export class BorrowedBooksComponent implements OnInit {

  constructor(
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private _booksService: BooksService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.user = this._authenticationService.getLoggedInUser()
    this._booksService.getActiveLoansForUser(this.user._id).pipe(
      tap(loanPayload => {
        console.log(loanPayload["loanLength"])
        this.loanLength = <number>(loanPayload["loanLength"]);
        (<Loan[]>loanPayload['loans']).forEach( loan => {
          loan['remainingDays'] = this.loanLength + (loan.extended ? this.loanLength : 0) - daysBetween(loan.dateBorrowed,todaysDate())
        })
      })
    ).subscribe(
      (loanPayload) => {
        console.log('Loans fetched - ' + loanPayload)
        this.loans = loanPayload['loans']
      },
      (error) => {
        console.log(error)
        console.log(error.error)
        this._snackBar.open('Došlo je do greške na serveru.')
      }
    )
  }

  user: User
  loans: Loan[]
  loanLength: number = 0
  daysBetween: Function = daysBetween
  authorsToString: Function = authorsToString
  coversUri = bookCoversUri

  extendDeadline(loan: Loan) {
    this._booksService.extendLoan(loan.book._id, this.user._id).subscribe(
      (result) => {
        if (result != null && result['message'] == 'Success') {
          this._snackBar.open("Uspešno produžena pozajmica!")
          this.refreshComponent()
        }
        else
          this._snackBar.open("Došlo je do greške na serveru!")
      },
      (error) => {
        console.log(error)
        let message: string = 'Došlo je do greške na serveru.'
        if (error.status == 400) {
          switch (error.error.message) {
            case "Extend loan failed - no active loan found for this user and this book.":
              message = "Ne postoji tražena pozajmica!"
              break
            default: break
          }
        }
        this._snackBar.open(message)
      }
    )
  }

  returnBook(loan: Loan) {
    this._booksService.returnBook(loan.book._id, this.user._id).subscribe(
      (result) => {
        if (result != null && result['message'] == 'Success') {
          this._snackBar.open("Uspešno vraćena knjiga!")
          this.refreshComponent()
        }
        else
          this._snackBar.open("Došlo je do greške na serveru!")
      },
      (error) => {
        console.log(error)
        let message: string = 'Došlo je do greške na serveru.'
        if (error.status == 400) {
          switch (error.error.message) {
            case "Return book failed - no active loan found for this user and this book.":
              message = "Ne postoji tražena pozajmica!"
              break
            case "Return book failed - user has multiple copies of this book loaned.":
              message = "Postoji više pozajmica za datog korisnika i datu knjigu!"
              break
            default: break
          }
        }
        this._snackBar.open(message)
      }
    )
  }

  refreshComponent() {
    this.user = this._authenticationService.getLoggedInUser()
    console.log('Refreshing borrowed books.');    
    this._booksService.getActiveLoansForUser(this.user._id).pipe(
      tap(loanPayload => {
        console.log(loanPayload["loanLength"])
        this.loanLength = <number>(loanPayload["loanLength"]);
        (<Loan[]>loanPayload['loans']).forEach( loan => {
          loan['remainingDays'] = this.loanLength + (loan.extended ? this.loanLength : 0) - daysBetween(loan.dateBorrowed,todaysDate())
        })
      })
    ).subscribe(
      (loanPayload) => {
        console.log('Loans fetched - ' + loanPayload)
        this.loans = loanPayload['loans']
      },
      (error) => {
        console.log(error)
        console.log(error.error)
        this._snackBar.open('Došlo je do greške na serveru.')
      }
    )

  }
}
