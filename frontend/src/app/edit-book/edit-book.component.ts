import { ViewChildren, Component, OnInit, Output, EventEmitter, Input, ElementRef, QueryList } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Author } from '../models/author';
import { Book } from '../models/book';
import { User } from '../models/user';
import { AuthenticationService } from '../services/authentication.service';
import { BooksService } from '../services/books.service';

@Component({
  selector: 'app-edit-book',
  templateUrl: './edit-book.component.html',
  styleUrls: ['./edit-book.component.css']
})
export class EditBookComponent implements OnInit {

  constructor(
    private _router: Router,
    private _authService: AuthenticationService,
    private _booksService: BooksService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.user = this._authService.getLoggedInUser()
    if (this.currentBook != null){
      this.isNew = false
    }
    else {
      this.isNew = true
    }
    this.resetNewUser()
  }

  @ViewChildren('genre') genres: QueryList<ElementRef>
  @ViewChildren('firstname') firstnames: QueryList<ElementRef>
  @ViewChildren('lastname') lastnames: QueryList<ElementRef>

  @Input() currentBook: Book
  @Output() bookUpdate = new EventEmitter();
  
  newBook: Book

  isNew: boolean

  yearPublishedString: string
  currentYear = new Date(Date.now()).getFullYear()
  minYear = 1900
  intRegex = new RegExp('^[0-9]+$')

  user: User
  image: File
  
  submitForm(registerForm: NgForm) {
    if(this.isNew)
      this.addBook(registerForm)
    else
      this.submitChanges()
  } 

  resetNewUser() {
    this.image = null
    if(this.isNew){
      this.newBook = new Book()
      this.addAuthor()
      this.addGenre()
    } else {
      this.newBook = JSON.parse(JSON.stringify(this.currentBook)) as Book
      this.newBook.yearPublished = new Date(this.currentBook.yearPublished)
      this.yearPublishedString = this.newBook.yearPublished.getFullYear().toString()
    }
  }



  deleteBook() {
    this._booksService.removeBook(this.currentBook._id).subscribe(
      response => {
        console.log(response)
        if (response["message"] == 'Success') {
          console.log(`Deleted book successfully.`)
          this._snackBar.open('Knjiga uspešno obrisana!');
          this._router.navigate(['/search'])
        }
        else {
          this._snackBar.open('Došlo je do greške na serveru.')
        }
      },
      error => {
        console.log(error.error)
        let message = 'Došlo je do greške na serveru.'
        if (error.status == 400) {
          switch (error.error.message) {
            case "Delete book failed - there are active loans of this book.":
              message = "Knjiga ne može biti obrisana jer postoje primerci na pozajmici!"
              break
            case "Delete book failed - no such book.":
              message = "Ne postoji knjiga sa datim identifikatorom!"
              break
            default: break
          }
        }
        this._snackBar.open(message)
      }
    )
  }

  submitChanges() {
    this._booksService.updateBook(this.currentBook._id, this.image, this.newBook).subscribe(
      response => {
        console.log(response)
        if (response["bookId"] != null) {
          console.log(`Updated book successfully.`)
          this._snackBar.open('Knjiga uspešno izmenjena!');
          this.bookUpdate.emit()
        }
      },
      error => {
        console.log(error.error)
        this._snackBar.open('Došlo je do greške na serveru.')
      }
    )
  }

  addBook(registerForm: NgForm) {
    this.newBook.userWhoRequested = this.user._id
    this._booksService.addNewBook(this.image, this.newBook).subscribe(
      response => {
        console.log(response)
        if (response["bookId"] != null) {
          console.log(`Register sent successfully.`)
          if(this.user.role == 'admin' || this.user.role == 'moderator')
            this._snackBar.open('Knjiga uspešno dodata!');
          else
            this._snackBar.open('Uspešan zahtev za novu knjigu!');
          registerForm.resetForm()
          this.resetNewUser()
        }
      },
      error => {
        console.log(error.error)
        this._snackBar.open('Došlo je do greške na serveru.')
      }
    )
  }

  onFileSelected(event) {
    if (event.target.files.length > 0)
      this.image = event.target.files[0];
  }

  formValid() {
    let retval: boolean = this.yearValid()
    console.log(retval)
    if(!retval) return retval
    
    this.setYear()
    
    this.genres.forEach((elem, i) => {
      this.newBook.genres[i] = elem.nativeElement.value
      if(elem.nativeElement.value == '')
        retval = false
    })
    console.log(retval)
    if(!retval) return retval
    this.lastnames.forEach((elem, i) => {
      this.newBook.authors[i].lastName = elem.nativeElement.value
      if(elem.nativeElement.value == '')
        retval = false
    })
    console.log(retval)
    if(!retval) return retval
    this.firstnames.forEach((elem, i) => {
      this.newBook.authors[i].firstName = elem.nativeElement.value
      if(elem.nativeElement.value == '')
        retval = false
    })
    console.log(retval)
    return retval
  }

  yearValid(): boolean {
    if (this.intRegex.test(this.yearPublishedString)) {
      console.log(`year valid valid for string ${this.yearPublishedString}`)
      const num = parseInt(this.yearPublishedString)
      return num > this.minYear && num <= this.currentYear
    }
    return false
  }

  setYear() {
    this.newBook.yearPublished = new Date(`${this.yearPublishedString}-01-01`)
    console.log(`Datum postavljen ${this.newBook.yearPublished}`)
  }

  addAuthor() {
    let author = new Author()
    author.firstName = ''
    author.lastName = ''
    this.newBook.authors.push(author)
  }

  removeAuthor() {
    this.newBook.authors.pop()
  }

  addGenre() {
    this.newBook.genres.push('')
  }

  removeGenre() {
    this.newBook.genres.pop()
  }
}
