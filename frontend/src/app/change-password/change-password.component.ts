import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { AuthenticationService } from '../services/authentication.service';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  constructor(
    private _router: Router,
    private _authService: AuthenticationService,
    private _usersService: UsersService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this._user = this._authService.getLoggedInUser()
    this.currentPassword = this._user.password
    }

    private _user: User
    currentPassword: string
    newPassword: string

    changePassword(registerForm: NgForm) {
      this._user.password = this.newPassword
      this._usersService.updateUser(this._user.username, null, this._user).subscribe(
        (result) => {
          if (result != null) {
            console.log(result)
            if (result["user"] != null)  {
              this._authService.setLoggedInUser(<User>result.user)
              this._snackBar.open('Lozinka uspešno izmenjena!')
              console.log(`Password updated.`)
              registerForm.resetForm()
            }
          }
        },
        (error: HttpErrorResponse) => {
          switch (error.status) {
            case 400:
              let message : string = 'Došlo je do greške na serveru.'
              console.log(error.error)
              if (error.error.message == "Update user failed - username already exists.")
                message = 'Korisnik sa zadatim korisničkim imenom već postoji!'
              else if (error.error.message == "Update user failed - email already exists.")
                message = 'Korisnik sa zadatom adresom elektronske pošte već postoji!'
              this._snackBar.open(message)
              break;
            case 500:
              this._snackBar.open('Došlo je do greške na serveru.')
              break;
          }
        }
      )

    }

}
