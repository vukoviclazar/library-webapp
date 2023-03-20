import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, zip } from 'rxjs';
import { concatMap, mergeMap, map, tap } from 'rxjs/operators';
import { User } from '../models/user';
import { projectBackendUri } from './constants';

const uri = `${projectBackendUri}/users`

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private _httpClient: HttpClient) { }

  registerUser(file: File, user: User) {
    console.log(`Calling registerUser for ${user.username}, with data ${user}`)

    let request = this._httpClient.post(`${uri}/register`, user)

    if (file != null) {
      let imageData = new FormData()

      let imgName = `avatar_${user.username}` + '.' + file.name.split('.').pop()
      console.log(imgName)
      imageData.append(imgName, file)
      imageData.append('avatarImagePath', imgName)
      imageData.append('username', user.username)

      return request.pipe(concatMap((response1) => this._httpClient.post(`${uri}/uploadAvatar`, imageData)
        .pipe(map(() => (response1["avatarImagePath"] = imgName)), map(((response2) => ({user: response1, message: response2}))))))
    }
    return request.pipe(map((response1) => ({user: response1})));
  }

  updateUser(oldUsername: string, file: File, user: User) {
    console.log(`Calling updateUser for ${oldUsername}, with data ${user}`)

    let data = {
      user: user,
      oldUsername: oldUsername
    }

    let request = this._httpClient.post(`${uri}/updateUser`, data);

    if (file != null) {
      let imageData = new FormData()

      let imgName = `avatar_${user.username}` + '.' + file.name.split('.').pop()
      console.log(imgName)
      imageData.append(imgName, file)
      imageData.append('avatarImagePath', imgName)
      imageData.append('username', user.username)

      return request.pipe(concatMap((response1) => this._httpClient.post(`${uri}/uploadAvatar`, imageData)
        .pipe(map(() => (response1["avatarImagePath"] = imgName)), map(((response2) => ({user: response1, message: response2}))))))
    }
    return request.pipe(map((response1) => ({user: response1})));
  }

  removeUser(id: string) {
    const data = {
      userId: id
    }

    console.log(`Removing user ${id}`)
    return this._httpClient.post(`${uri}/removeUser`, data).pipe(
      tap(payload => console.log(`Remove user response - ${payload}`))
    )
  }

  searchForUsers(searchParam: string, pageNum: number, pageSize: number, showOnlyPending: boolean) {
    console.log(`Calling searchForUsers with parameter ${searchParam}, looking for page ${pageNum}`)

    let data = {
      searchParam : searchParam,
      pageNum : pageNum,
      pageSize: pageSize,
      registeredSuccessfully: !showOnlyPending
    }

    return this._httpClient.post(`${uri}/searchForUsers`, data)
  }

  getUser(username: string): Observable<User> {
    let data = {username : username}
    return this._httpClient.post<User>(`${uri}/getUser`, data)
  }

  getLoanLength() {
    return this._httpClient.post(`${uri}/getLoanLength`, null)
  }

  setLoanLength(len: number) {
    const data = {length: len}
    return this._httpClient.post(`${uri}/setLoanLength`, data)
  }

  getNotificationsForUser(id: string) {
    const data = {userId: id}
    return this._httpClient.post(`${uri}/getNotificationsForUser`, data)
  }
}

