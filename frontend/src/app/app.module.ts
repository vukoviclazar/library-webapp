import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialDesignModule } from './material-design/material-design.module';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SearchComponent } from './search/search.component';
import { FeaturedBooksComponent } from './featured-books/featured-books.component';
import { BorrowedBooksComponent } from './borrowed-books/borrowed-books.component';
import { BorrowHistoryComponent } from './borrow-history/borrow-history.component';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { UserCardComponent } from './user-card/user-card.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { BookCardComponent } from './book-card/book-card.component';
import { BookDetailsComponent } from './book-details/book-details.component';
import { EditBookComponent } from './edit-book/edit-book.component';
import { ReviewCardComponent } from './review-card/review-card.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    NavbarComponent,
    SearchComponent,
    FeaturedBooksComponent,
    BorrowedBooksComponent,
    BorrowHistoryComponent,
    ProfileComponent,
    ChangePasswordComponent,
    ManageUsersComponent,
    UserCardComponent,
    EditUserComponent,
    BookCardComponent,
    BookDetailsComponent,
    EditBookComponent,
    ReviewCardComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialDesignModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
