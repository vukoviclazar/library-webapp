import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs' 
import { User } from '../models/user';
import { AuthenticationService } from '../services/authentication.service';
import { userAvatarsUri } from '../services/constants';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit, OnDestroy {

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthenticationService,
    private _usersService: UsersService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this._routeParamSub = this._activatedRoute.params.subscribe(params => { 
      console.log('Edit user parameter changed, now it is ' + params['username'])
      if (params['username'] == this._authService.getLoggedInUser().username)
        this._updateUserFlag = true
      else 
        this._updateUserFlag = false
      this._usersService.getUser(params['username']).subscribe(
        (user) => {
          console.log('Edit user updated, new user is ' + user.username)
          this.user = user
          this.newUser = {... this.user}
          this.avatarUri = userAvatarsUri + '/' + this.user.avatarImagePath + '?updated=' + Date.now()
          this.image = null
          this.editingEnabled = false
          this.errorFetchingData = false
        },
        (error) => {
          this.errorFetchingData = true
          console.log(error.error)
          this._snackBar.open('Došlo je do greške na serveru.')
        }
      )
    });    
  }

  ngOnDestroy(): void {
    this._routeParamSub.unsubscribe()
  }

  @Output() userUpdate = new EventEmitter();

  private _routeParamSub: Subscription
  private _updateUserFlag: boolean
  errorFetchingData: boolean

  image: File
  user: User
  newUser: User
  avatarUri: string
  editingEnabled: boolean

  onFileSelected(event) {
    if (event.target.files.length > 0)
      this.image = event.target.files[0];
  }

  deleteUser() {
    this._usersService.removeUser(this.user._id).subscribe(
      response => {
        console.log(response)
        if (response["message"] == 'Success') {
          console.log(`Deleted user successfully.`)
          this._snackBar.open('Korisnik uspešno obrisan!');
          this._router.navigate(['/admin/manage-users'])
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
            case "Remove user failed - no such user.":
              message = "Ne postoji korisnik sa datim identifikatorom!"
              break
            case "Remove user failed - there are active loans for this user.":
              message = "Korisnik ne može biti obrisan jer ima knjige na pozajmici!"
              break
            default: break
          }
        }
        this._snackBar.open(message)
      }
    )
  }

  updateUserData() {
    this._usersService.updateUser(this.user.username, this.image, this.newUser).subscribe(
      (result) => {
        if (result != null) {
          console.log(result)
          if (result["user"] != null) {
            if(this._updateUserFlag) {
              this._authService.setLoggedInUser(<User>result.user)
              this.userUpdate.emit()
            }
            this._snackBar.open('Podaci uspešno izmenjeni!')
            console.log(`User updated.`)
            this.refreshComponent(result['user']['username'])
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

  resetUser() {
    this.newUser = {... this.user}
  }

  refreshComponent(username : string) {
    this.newUser = null
    this._router.navigate(['/home'], {skipLocationChange: true}).then(() => {
      this._router.navigate([`/admin/user-profile`, username])
    });
  }
}
