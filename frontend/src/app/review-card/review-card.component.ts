import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Review } from '../models/review';
import { User } from '../models/user';
import { BooksService } from '../services/books.service';
import { userAvatarsUri } from '../services/constants';

const defaultAvatarName = 'defaultavatar.jpg'

@Component({
  selector: 'app-review-card',
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.css']
})
export class ReviewCardComponent implements OnInit {

  constructor(
    private _booksService: BooksService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.review == null)
      this.isNew = true
    else 
      this.isNew = false
    this.setupCard()
  }

  @Input() review: Review
  @Input() curUser: User
  @Input() bookId: string
  @Output() bookUpdate = new EventEmitter();

  avatarPath: string
  username: string
  comment: string
  rating: number
  date: Date
  isNew: boolean
  isEditable: boolean

  maxCommentLength: number = 1000
  arrayRating = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  reviewValid(): boolean {
    if (this.comment.length < this.maxCommentLength && this.rating != 0){
      if ( this.review == null || this.comment != this.review.comment || this.rating != this.review.rating)
        return true
      this._snackBar.open('Niste izmenili recenziju!')
      return false
    } else {
      this._snackBar.open('Ocena mora biti od 1 do 10, a tekst komentara manji od 1000 karaktera!')
      return false  
    }
    }

  updateReview() {
    this._booksService.editReview(this.bookId, this.curUser._id, this.comment, this.rating).subscribe(
      response => {
        if(response != null && response['message'] == 'Success') {
          console.log(`Updated review successfully.`)
          this._snackBar.open('Recenzija uspešno izmenjena!');
          this.bookUpdate.emit()
        }
        else {
          this._snackBar.open('Došlo je do greške na serveru.')
        }
      },
      error => {
        console.log(error.error)
        let message = 'Došlo je do greške na serveru.'
        this._snackBar.open(message)
      }
    )
  }

  submitReview() {
    this._booksService.addReview(this.bookId, this.curUser._id, this.comment, this.rating).subscribe(
      response => {
        if(response != null && response['message'] == 'Success') {
          console.log(`Added review successfully.`)
          this._snackBar.open('Recenzija uspešno dodata!');
          this.bookUpdate.emit()
        }
        else {
          this._snackBar.open('Došlo je do greške na serveru.')
        }
      },
      error => {
        console.log(error.error)
        let message = 'Došlo je do greške na serveru.'
        this._snackBar.open(message)
      }
    )
  }

  setupCard() {
    console.log(this.curUser)
    if(this.review != null)
      console.log(this.review.user)
    if(this.isNew) {
      this.avatarPath = userAvatarsUri + '/' + this.curUser.avatarImagePath
      this.username = this.curUser.username
      this.comment = ''
      this.rating = 0
      this.date = null
      this.isEditable = true
    }
    else {
      this.avatarPath = userAvatarsUri + '/' + ((this.review.user == null) ? defaultAvatarName : this.review.user.avatarImagePath)
      this.username = (this.review.user == null) ? '(obrisani)' : this.review.user.username
      this.comment = this.review.comment
      this.rating = this.review.rating
      this.date = this.review.dateRated
      this.isEditable = false
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleString('en',
      {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }
    )
  }

  renderStar(index: number) {
    if (this.rating >= index) 
      return 'star'
    else
      return 'star_border'
  }

  updateRating(rating: number) {
    console.log(`New rating - ${rating}`)
    this.rating = rating
  }
}
