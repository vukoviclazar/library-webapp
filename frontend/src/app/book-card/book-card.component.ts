import { Component, OnInit, Input } from '@angular/core';
import { Book } from '../models/book';
import { bookCoversUri } from '../services/constants';
import { authorsToString } from '../services/function.utils'
import { genresToString } from '../services/function.utils'

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.css']
})
export class BookCardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() book: Book
  coverUri: string = bookCoversUri

  authorsToString: Function = authorsToString
  genresToString: Function = genresToString
}
