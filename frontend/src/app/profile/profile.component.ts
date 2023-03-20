import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { AuthenticationService } from '../services/authentication.service';
import { userAvatarsUri } from '../services/constants';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(
    private _router: Router,
    private _authService: AuthenticationService,
    private _usersService: UsersService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.user = this._authService.getLoggedInUser()
    this.avatarUri = userAvatarsUri + '/' + this.user.avatarImagePath + '?updated=' + Date.now()
    this.newUser = this.user
  }

  @Output() userUpdate = new EventEmitter();

  image: File
  user: User
  newUser: User
  avatarUri: string
  editingEnabled: boolean

  onFileSelected(event) {
    if (event.target.files.length > 0)
      this.image = event.target.files[0];
  }

  updateUserData() {
    this._usersService.updateUser(this.user.username, this.image, this.newUser).subscribe(
      (result) => {
        if (result != null) {
          console.log(result)
          if (result["user"] != null) {
            this._authService.setLoggedInUser(<User>result.user)
            this._snackBar.open('Podaci uspešno izmenjeni!')
            console.log(`User updated.`)
            this.userUpdate.emit()
            this.refreshComponent()
          }
        }
      },
      (error: HttpErrorResponse) => {
        switch (error.status) {
          case 400:
            let message: string = 'Došlo je do greške na serveru.'
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

  refreshComponent() {
    this.user = this._authService.getLoggedInUser()
    this.avatarUri = userAvatarsUri + '/' + this.user.avatarImagePath + '?updated=' + Date.now()
    this.newUser = this.user
    this.editingEnabled = false
  }

  resetUser() {
    this.newUser = this.user
  }

}
