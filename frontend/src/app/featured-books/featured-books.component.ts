import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Book } from '../models/book';

@Component({
  selector: 'app-featured-books',
  templateUrl: './featured-books.component.html',
  styleUrls: ['./featured-books.component.css']
})
export class FeaturedBooksComponent implements OnInit {

  constructor() { }
  
  ngOnInit(): void {
    if (this.books.length < this.numElem)
      this.dataError = true
    else
      this.dataError = false
  }

  @ViewChild('book1') r1: ElementRef<HTMLInputElement>
  @ViewChild('book2') r2: ElementRef<HTMLInputElement>
  @ViewChild('book3') r3: ElementRef<HTMLInputElement>

  @Input() books: Book[]
  dataError: boolean
  numElem: number = 3

  nextBook() {
    if(this.r1.nativeElement.checked)
      this.r2.nativeElement.click()
    else if(this.r2.nativeElement.checked)
      this.r3.nativeElement.click()
    else if(this.r3.nativeElement.checked)
      this.r1.nativeElement.click()
  }

  prevBook() {
    if(this.r1.nativeElement.checked)
      this.r3.nativeElement.click()
    else if(this.r2.nativeElement.checked)
      this.r1.nativeElement.click()
    else if(this.r3.nativeElement.checked)
      this.r2.nativeElement.click()
  }
}
