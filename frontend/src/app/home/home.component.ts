import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BooksService } from '../services/books.service';
import { Observable, merge, of } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Book } from '../models/book';
import { AuthenticationService } from '../services/authentication.service';
import { Roles } from '../services/roles.enum';
import { bookCoversUri } from '../services/constants';
import { authorsToString, doubleCompare } from '../services/function.utils';

@Component({
  selector: 'app-guest',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @Output() userUpdate = new EventEmitter();

  constructor(
    private _authService: AuthenticationService,
    private _booksService: BooksService
  ) { }

  ngOnInit(): void {
    this.userRole = this._authService.getLoggedInUserRole()
    this.featuredBooks$ = merge(of(null),this._booksService.getFeaturedBooks())
    this.bookOfTheDay$ = merge(of(null),this._booksService.getBookOfTheDay())
    }

  refreshComponent() {
    this.userRole = this._authService.getLoggedInUserRole()
  }

  delegateUserUpdate(event){
    this.refreshComponent()
    this.userUpdate.emit(event)
  }

  bookOfTheDay$: Observable<Book>
  featuredBooks$: Observable<Book[]>
  userRole: Roles
  coverUri: string = bookCoversUri

  doubleCompare = doubleCompare
  authorsToString = authorsToString

}
