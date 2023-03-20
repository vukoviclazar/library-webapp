import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, Observable, fromEvent, Subscription, merge, of } from 'rxjs'
import { map, switchMap, startWith, debounceTime, distinctUntilChanged, tap, catchError } from 'rxjs/operators'
import { User } from '../models/user';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from '../services/users.service';
import { userAvatarsUri } from '../services/constants';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private _router: Router,
    private _usersService: UsersService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.pageSize = 5
    this.avatarUri = userAvatarsUri
    this.errorFetchingData = false
    this.fetchNumDays()
  }

  ngAfterViewInit(): void {
    this.searchParam$ = fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        map(event => (event.target as HTMLInputElement).value),
        debounceTime(400),
        distinctUntilChanged(),
        tap(val => console.log(`Search param changed ${val}`)),
        tap(() => this.currentPageNum = 1))

    this.showOnlyPending$ = fromEvent(this.check.nativeElement, 'change')
      .pipe(
        map(event => (event.target as HTMLInputElement).checked),
        debounceTime(100),
        distinctUntilChanged(),
        tap(val => console.log(`Bool param changed ${val}`)),
        tap(() => this.currentPageNum = 1))

    this.stringSubscription = this.searchParam$.subscribe(
      data => this.currentSearchParam = data
    )

    this.boolSubscription = this.showOnlyPending$.subscribe(
      data => this.currentShowOnlyPending = data
    )

    this.numberSubscription = this.pageNum$.subscribe(
      data => this.currentPageNum = data
    )

    this.users$ = merge(
      this.searchParam$.pipe(
      tap(() =>
        console.log('Calling because of search param changing')
      ),
      switchMap(
        searchParam => merge(of(null), this.fetchUsers(searchParam, this.currentPageNum, this.currentShowOnlyPending))
      )
    ), 
    this.showOnlyPending$.pipe(
      tap(() =>
        console.log('Calling because of bool param changing')
      ),
      switchMap(
        value => merge(of(null), this.fetchUsers(this.currentSearchParam, this.currentPageNum, value))
      )
    ),
    this.pageNum$.pipe(
      tap(() =>
        console.log('Calling because of page number changing')
      ),
      switchMap(
        pageNum => merge(of(null), this.fetchUsers(this.currentSearchParam, pageNum, this.currentShowOnlyPending))
      )
    ))
  }

  @ViewChild('searchParamVar') input: ElementRef<HTMLInputElement>
  @ViewChild('showOnlyPending') check: ElementRef<HTMLInputElement>

  pageNumSubject: BehaviorSubject<number> = new BehaviorSubject<number>(1)

  pageNum$: Observable<number> = this.pageNumSubject.asObservable()
  searchParam$: Observable<string>
  showOnlyPending$: Observable<boolean>
  users$: Observable<User[]>

  currentPageNum: number = 1
  currentSearchParam: string = ''
  currentShowOnlyPending: boolean = false

  stringSubscription: Subscription
  boolSubscription: Subscription
  numberSubscription: Subscription

  avatarUri: string
  pageSize: number
  errorFetchingData: boolean

  pageCount: number = 1

  /*********/
  numDaysString: string = "0"
  numDays: number = 0
  intRegex = new RegExp('^[0-9]+$')

  fetchNumDays() {
    this._usersService.getLoanLength().subscribe(
      (result) => {
        this.numDays = result['length']
        this.numDaysString = this.numDays.toString()
        console.log(`Got ${this.numDaysString} days`)
      },
      (error) => {
        console.log(error.error)
        this._snackBar.open('Došlo je do greške na serveru.')
      }
    )
  }

  submitNumDays() {
    this._usersService.setLoanLength( this.numDays ).subscribe(
      (result) => {
        console.log(result)
        this.numDays = result['length']
        this.numDaysString = this.numDays.toString()
        console.log(`Got ${this.numDaysString} days`)
      },
      (error) => {
        console.log(error.error)
        this._snackBar.open('Došlo je do greške na serveru.')
      }
    )
  }

  numDaysValid() {
    if (this.intRegex.test(this.numDaysString)){
      this.numDays = parseInt(this.numDaysString)
      return true;
    }
    this._snackBar.open('Morate uneti validan broj dana')
    return false
  }
  /*********/

  fetchUsers(searchParam: string, pageNum: number, showOnlyPending: boolean) {
    console.log('Fetch users called.')
    return this._usersService.searchForUsers(searchParam, pageNum, this.pageSize, showOnlyPending)
      .pipe(catchError((error: HttpErrorResponse) => {
        this.errorFetchingData = true
        console.log(error.error)
        this._snackBar.open('Došlo je do greške na serveru.')
        return of(null)
      }),
        tap(response => {
          this.pageCount = response['pageCount']
          console.log(`Got ${this.pageCount} pages`)
        }),
        map(response => response['users']))
  }

  incPage() {
    this.pageNumSubject.next(this.currentPageNum + 1)
  }

  decPage() {
    this.pageNumSubject.next(this.currentPageNum - 1)
  }

  ngOnDestroy(): void {
    this.numberSubscription.unsubscribe
    this.stringSubscription.unsubscribe
    this.boolSubscription.unsubscribe
  }
}
