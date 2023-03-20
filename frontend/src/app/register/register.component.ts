import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { Roles } from '../services/roles.enum';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(
    private _usersService: UsersService,
    private _router: Router,
    private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    if (this._router.url == '/admin/create-user')
      this.isAdmin = true;
    else 
      this.isAdmin = false;
  }

  newUser: User = new User()
  image: File = null
  isAdmin: boolean

  roleValid(): boolean {
    return !this.isAdmin || (this.newUser.role == 'admin' 
      || this.newUser.role == 'reader'
      || this.newUser.role == 'moderator')
  }

  onFileSelected(event) {
    if (event.target.files.length > 0)
      this.image = event.target.files[0];
  }

  makeRegistrationRequest(registerForm: NgForm) {
    if (!this.isAdmin) {
      this.newUser.blocked = false
      this.newUser.role = Roles.READER
      this.newUser.registeredSuccessfully = false;
    } else if (this.newUser.role == 'moderator') {
      this.newUser.blocked = false
      this.newUser.registeredSuccessfully = true;
    }

    this._usersService.registerUser(this.image, this.newUser).subscribe(
      (result) => {
        if (result != null) {
          console.log(result)
          if (result["user"] != null) {
            console.log(`Register sent successfully.`)
            if(this.isAdmin)
              this._snackBar.open('Korisnik uspešno dodat!');
            else
              this._snackBar.open('Uspešan zahtev za registraciju!');
            registerForm.resetForm()
            this.image = null
          }
        }
      },
        (error: HttpErrorResponse) => {
          switch (error.status) {
            case 400:
              let message: string = 'Došlo je do greške na serveru.'
              console.log(error.error)
              if (error.error.message == "Registration failed - username already exists.")
                message = 'Korisnik sa zadatim korisničkim imenom već postoji!'
              else if (error.error.message == "Registration failed - email already exists.")
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
