import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { User } from '../models/user';
import { currentUserKey, projectBackendUri } from './constants';
import { Roles } from './roles.enum';

const uri = `${projectBackendUri}/users`

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  constructor(private _httpClient: HttpClient) { }

  getLoggedInUser(): User {
    let user = <User>JSON.parse(localStorage.getItem(currentUserKey))
    return user
  }

  getLoggedInUserRole(): Roles {
    let user: User = this.getLoggedInUser()
    if (user != null) {
      return <Roles>user.role
    } else {
      return Roles.GUEST;
    }
  }

  setLoggedInUser(user: User): void {
    console.log(`Setting user: ${JSON.stringify(user)}`)
    localStorage.setItem(currentUserKey, JSON.stringify(user))
  }

  isAuthorized(roles: Roles[]): boolean {
    console.log(roles)
    console.log(localStorage.getItem(currentUserKey))
    let user = <User>JSON.parse(localStorage.getItem(currentUserKey));
    console.log(user)

    if(user != null && user.blocked) {
      if(roles.includes(Roles.BLOCKED))
        return true
      else
        return false
    }

    return (user == null && roles.includes(Roles.GUEST))
      || (user != null && roles.indexOf(<Roles>user.role) != -1)
  }

  login(identifier: string, password: string, types: string[]): Observable<User> {
    let credentials = {
      identifier: identifier,
      password: password,
      types: types
    }

    console.log("Login called.")

    let response = this._httpClient.post<User>(`${uri}/login`, credentials).pipe(shareReplay())

    response.subscribe(
      (authenticatedUser: User) => {
        if (authenticatedUser != null)
          this.setLoggedInUser(authenticatedUser)
        console.log(`Response: ${JSON.stringify(authenticatedUser)}`)
      },
      (error) => {
        console.error(error)
      })

    return response;
  }

  logout(): void {
    localStorage.removeItem(currentUserKey);
  }
}
