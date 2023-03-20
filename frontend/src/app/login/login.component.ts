import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { Roles } from '../services/roles.enum';
import { concatMap } from 'rxjs/operators'
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private _authService: AuthenticationService,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _userService: UsersService) { }

  ngOnInit(): void {
    if (this._router.url == '/adminLogin'){
      this.isAdminLogin = true;
      this._types = ['admin']
    }  else {
      this.isAdminLogin = false;
      this._types = ['reader', 'moderator']
    }
  }

  @Output() userUpdate = new EventEmitter();

  _types: string[]

  isAdminLogin: boolean;
  identifier: string;
  password: string;

  login(): void {
    this._authService.login(this.identifier, this.password, this._types).pipe(
      concatMap(
        newUser => {
          console.log(newUser)
          return this._userService.getNotificationsForUser(newUser._id)
        }
      )
    ).subscribe(
      (payload) => {
        if (payload['notifications'] != null) {
          this._snackBar.open('Uspešna prijava!');
          if(this.isAdminLogin)
            this._router.navigate(['/reader/home']);
          this.userUpdate.emit(payload['notifications'])
        }
        // else {
        //   this._snackBar.open('Došlo je do greške.')
        // }
      },
      (error) => {
        switch (error.status) {
          case 400:
            this._snackBar.open(`Korisnik sa zadatim kredencijalima ne postoji.`)
            break;
          case 500:
            this._snackBar.open('Došlo je do greške na serveru.')
            break;
        }
      }
    )
  }

}
