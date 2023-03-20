import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { AuthenticationService } from '../services/authentication.service';
import { pipe } from 'rxjs'
import { tap } from 'rxjs/operators'
import { BooksService } from '../services/books.service';
import { Loan } from '../models/loan';
import { authorsToString } from '../services/function.utils';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-borrow-history',
  templateUrl: './borrow-history.component.html',
  styleUrls: ['./borrow-history.component.css']
})
export class BorrowHistoryComponent implements OnInit, AfterViewInit {

  constructor(  
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private _booksService: BooksService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.user = this._authenticationService.getLoggedInUser()
    
  }

  ngAfterViewInit() {
    this._booksService.getFinishedLoansForUser(this.user._id).pipe(
      tap(loans => {
        console.log(`Got loans in component - ${loans}`);
      })
    ).subscribe(
      (loans: Loan[]) => {
        if (loans != null){
          this.loans = loans
          this.sortedLoans = loans.slice()
          console.log(this.tableSortElem)
        }
        else 
          this._snackBar.open('Došlo je do greške na serveru.')
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
  sortedLoans: Loan[]

  dataOk: boolean
  tableSortElem: MatSort

  @ViewChild(MatSort, { static: false }) set sortLoaded(val: MatSort) {
    if (val) {
      this.tableSortElem = val;
      console.log("table sort element set")
      this.sortData()
    }
  }
  authorsToString(loan: Loan): string {
    let retval: string = ''
    loan.backupAuthors.forEach((author) => {
      retval = String().concat(retval, author.lastName)
      if (loan.backupAuthors[loan.backupAuthors.length - 1] != author)
        retval = String().concat(retval, ', ')
    })
    return retval
  }

  sortData() {
    console.log('Something happened')
    const data = this.loans.slice()
    if (!this.tableSortElem.active || this.tableSortElem.direction === '') {
      this.sortedLoans = data;
      return;
    }

    this.sortedLoans = data.sort((a, b) => {
      const isAsc = this.tableSortElem.direction === 'asc';
      switch (this.tableSortElem.active) {
        case 'title':
          return compare(a.backupTitle, b.backupTitle, isAsc);
        case 'authors':
          return compare(a.backupAuthors[0].lastName, b.backupAuthors[0].lastName, isAsc);
        case 'dateBorrowed':
          return compare(a.dateBorrowed, b.dateBorrowed, isAsc);
        case 'dateReturned':
          return compare(a.dateReturned, b.dateReturned, isAsc);
        default:
          return 0;
      }
    });
  }
}

function compare(a: Date | string, b: Date | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}