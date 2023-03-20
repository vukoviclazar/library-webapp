import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { AuthenticationService } from '../services/authentication.service';
import { userAvatarsUri } from '../services/constants';
import { Roles } from '../services/roles.enum';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    private _authService: AuthenticationService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.userRole = this._authService.getLoggedInUserRole()
    if (this.userRole != Roles.GUEST) {
      this.user = this._authService.getLoggedInUser()
      this.userAvatarUri = userAvatarsUri + '/' + this.user.avatarImagePath + '?updated=' + Date.now()
    }
  }

  refreshComponent(){
    this.userRole = this._authService.getLoggedInUserRole()
    if (this.userRole != Roles.GUEST) {
      this.user = this._authService.getLoggedInUser()
      this.userAvatarUri = userAvatarsUri + '/' + this.user.avatarImagePath + '?updated=' + Date.now()
    }
  }

  roleToString(): string {
    return <string>this.userRole
  }

  userAvatarUri: string
  userRole: Roles
  user: User

  @Output() userUpdate = new EventEmitter();

  logout() {
    this._authService.logout()
    this.refreshComponent()
    this.reloadCurrentRoute()
    this.userUpdate.emit()
  }
  
  reloadCurrentRoute() {
    const currentUrl = this._router.url;
    this._router.navigateByUrl('/register', {skipLocationChange: true}).then(() => {
        this._router.navigate([currentUrl]);
    });
}
}
