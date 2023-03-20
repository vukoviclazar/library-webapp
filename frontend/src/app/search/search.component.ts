import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { switchMap, debounceTime, catchError, distinctUntilChanged, tap, map, skip } from 'rxjs/operators';
import { Book } from '../models/book';
import { AuthenticationService } from '../services/authentication.service';
import { BooksService } from '../services/books.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(
    private _router: Router,
    private _booksService: BooksService,
    private _snackBar: MatSnackBar,
    private _authService: AuthenticationService
  ) { }

  ngOnInit(): void {

    let user = this._authService.getLoggedInUser()
    if (user == null)
      this.userRole = 'guest'
    else if (user.blocked)
      this.userRole = 'blocked'
    else 
      this.userRole = user.role

    this.currentGenres.registerOnChange(this.genresChanged);

    this._booksService.getAllGenres().subscribe(
      result => {
        if (result != null && result['genres'] != null) {
          console.log(`Got genres in component - ${result['genres']}`)
          this.allGenres = result['genres']
        }
        else
          console.log(`Error getting genres in component - result is null`)
      },
      error => {
        console.log(`Error getting genres in component - ${error}`)
      }
    )

    this.books$ = merge(
      this.titleSubj.asObservable().pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => this.currentPageNum = 1),
        tap((value) =>
          console.log(`Calling because of title param changing - ${value}`)
        ),
        switchMap(
          searchParam => merge(of(null), this.fetchBooks())
        )),
      this.transformInputObservable(this.authorSubj.asObservable(), 'author'),
      this.transformInputObservable(this.publisherSubj.asObservable(), 'publisher'),
      this.transformInputObservable(this.yearFromSubj.asObservable(), 'year from'),
      this.transformInputObservable(this.yearToSubj.asObservable(), 'year to'),
      this.transformInputObservable(this.genresSubj.asObservable(), 'genres'),
      this.transformInputObservable(this.searchForRequestsSubj.asObservable(), 'search for requests'),
      this.pageNumSubj.asObservable().pipe(
        skip(1),
        tap((value) => this.currentPageNum = value),
        tap((value) =>
          console.log(`Calling because of page number parameter changing - ${value}`)
        ),
        switchMap(
          searchParam => merge(of(null), this.fetchBooks())
        )
      ))
  }

  @ViewChild('authorsParamInput') authorsParamInp: ElementRef<HTMLInputElement>
  @ViewChild('titleParamInput') titleParamInp: ElementRef<HTMLInputElement>
  @ViewChild('publisherParamInput') publisherParamInp: ElementRef<HTMLInputElement>

  currentGenres: FormControl = new FormControl([])

  titleSubj: BehaviorSubject<string> = new BehaviorSubject("")
  authorSubj: BehaviorSubject<string[]> = new BehaviorSubject([])
  genresSubj: BehaviorSubject<string[]> = new BehaviorSubject([])
  yearFromSubj: BehaviorSubject<string> = new BehaviorSubject("")
  yearToSubj: BehaviorSubject<string> = new BehaviorSubject("")
  publisherSubj: BehaviorSubject<string> = new BehaviorSubject("")
  pageNumSubj: BehaviorSubject<number> = new BehaviorSubject<number>(1)
  searchForRequestsSubj: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  currentPageNum: number = 1
  allGenres: string[] = []
  books$: Observable<Book[]>

  avatarUri: string
  pageSize: number = 6
  errorFetchingData: boolean
  pageCount: number = 1

  userRole: string

  currentYear = new Date(Date.now()).getFullYear()
  minYear = 1900
  intRegex = new RegExp('^[0-9]+$')

  transformInputObservable(input: Observable<any>, type: string): Observable<any> {
    return input.pipe(
      skip(1),
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => this.currentPageNum = 1),
      tap((value) =>
        console.log(`Calling because of ${type} param changing - ${value}`)
      ),
      switchMap(
        searchParam => merge(of(null), this.fetchBooks())
      ))
  }

  yearValid(year: string): boolean {
    console.log(`year valid called for string ${year}`)
    if(year == "" || year == null)
      return true
    if (this.intRegex.test(year)) {
    console.log(`year valid valid for string ${year}`)
      const num = parseInt(year)
      return num > this.minYear && num <= this.currentYear
    }
    return false
  }

  searchForRequestsChanged(elem: HTMLInputElement) {
    console.log(`Search for requests param changed - new value ${elem.checked}`)
    this.searchForRequestsSubj.next(elem.checked)
  }

  genresChanged() {
    console.log(`Genres param changed - new value ${this.currentGenres.value}`)
    this.genresSubj.next(this.currentGenres.value)
  }

  publisherChanged() {
    console.log(`Publisher param changed - new value ${this.publisherParamInp.nativeElement.value}`)
    this.publisherSubj.next(this.publisherParamInp.nativeElement.value)
  }

  yearFromChanged(year: string) {
    console.log(`Year from param changed - new value ${year}`)
    this.yearFromSubj.next(year)
  }

  yearToChanged(year: string) {
    console.log(`Year to param changed - new value ${year}`)
    this.yearToSubj.next(year)
  }

  titleChanged() {
    console.log(`Title param changed - new value ${this.titleParamInp.nativeElement.value}`)
    this.titleSubj.next(this.titleParamInp.nativeElement.value)
  }

  authorsChanged() {
    const arr = this.authorsParamInp.nativeElement.value.split(" ")
      .filter(element => element != "" && element != " ")
    console.log(`Authors param changed - new value ${arr}`)
    this.authorSubj.next(arr)
  }

  fetchBooks(titleParam: string = this.titleSubj.getValue(), authorsParam: string[] = this.authorSubj.getValue(),
    publisherParam: string = this.publisherSubj.getValue(), yearFromParam: string = this.yearFromSubj.getValue(),
    yearToParam: string = this.yearToSubj.getValue(), genresParam: string[] = this.genresSubj.getValue(), 
    searchForRequests: boolean = this.searchForRequestsSubj.getValue()) {
    console.log('Fetch books called.')
    return this._booksService.searchForBooks(titleParam, authorsParam, publisherParam, yearFromParam,
      yearToParam, genresParam, searchForRequests, this.currentPageNum, this.pageSize)
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
        map(response => response['books']))
  }

  incPage() {
    this.pageNumSubj.next(this.currentPageNum + 1)
  }

  decPage() {
    this.pageNumSubj.next(this.currentPageNum - 1)
  }

}
