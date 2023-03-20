import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { BorrowHistoryComponent } from './borrow-history/borrow-history.component';
import { BorrowedBooksComponent } from './borrowed-books/borrowed-books.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { HomeComponent } from './home/home.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { SearchComponent } from './search/search.component';
import { Roles } from './services/roles.enum';
import { AuthGuard } from './services/auth.guard';
import { BookDetailsComponent } from './book-details/book-details.component';
import { EditBookComponent } from './edit-book/edit-book.component';

const routes: Routes = [
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [Roles.GUEST]
    },
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'adminLogin',
    component: LoginComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [Roles.GUEST]
    },
  },
  {
    path: 'search',
    component: SearchComponent,
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: {
      roles: [Roles.ADMIN]
    },
    children: [
      {
        path: 'manage-users',
        component: ManageUsersComponent
      },
      {
        path: 'user-profile/:username',
        component: EditUserComponent
      },
      {
        path: 'create-user',
        component: RegisterComponent
      },
      {
        path: '**',
        redirectTo: '/home'
      }
    ],
  },
  {
    path: 'reader/borrow-history',
    component: BorrowHistoryComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [Roles.READER, Roles.MODERATOR, Roles.ADMIN, Roles.BLOCKED]
    }
  },
  {
    path: 'reader/borrowed-books',
    component: BorrowedBooksComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [Roles.READER, Roles.MODERATOR, Roles.ADMIN, Roles.BLOCKED]
    }
  },
  {
    path: 'reader/profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [Roles.READER, Roles.MODERATOR, Roles.ADMIN, Roles.BLOCKED]
    }
  },
  {
    path: 'reader',
    canActivate: [AuthGuard],
    data: {
      roles: [Roles.READER, Roles.MODERATOR, Roles.ADMIN]
    },
    children: [
      {
        path: 'add-book',
        component: EditBookComponent
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
      },
      {
        path: 'book-details/:bookid',
        component: BookDetailsComponent,
      },
      {
        path: '**',
        redirectTo: '/home'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
