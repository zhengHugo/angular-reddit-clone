import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SignupRequestPayload } from '../signup/signup-request.payload';
import { Observable, Subscription } from 'rxjs';
import { LoginRequestPayload } from '../login/login.request.payload';
import { LocalStorageService } from 'ngx-webstorage';
import { LoginResponse } from '../login/login.response';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  @Output() loggedIn: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() username: EventEmitter<string> = new EventEmitter<string>();

  refreshTokenPayload = {
    refreshToken: this.getRefreshToken(),
    username: this.getUserName()
  };

  constructor(private httpClient: HttpClient, private localStorage: LocalStorageService) {
  }

  signup(signupRequestPayload: SignupRequestPayload): Observable<string> {
    return this.httpClient.post(
      'http://localhost:8080/api/auth/signup', signupRequestPayload, {responseType: 'text'});
  }

  login(loginRequestPayload: LoginRequestPayload): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(
      'http://localhost:8080/api/auth/login', loginRequestPayload).pipe(
      tap(data => {
        this.localStorage.store('authenticationToken', data.authenticationToken);
        this.localStorage.store('username', data.username);
        this.localStorage.store('refreshToken', data.refreshToken);
        this.localStorage.store('expiresAt', data.expiresAt);

        this.loggedIn.emit(true);
        this.username.emit(data.username);
      }));
  }

  refreshToken(): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(
      'http://localhost:8080/api/auth/login', this.refreshTokenPayload).pipe(
      tap(response => {
        this.localStorage.clear('authenticationToken');
        this.localStorage.clear('expiresAt');
        this.localStorage.store('authenticationToken', response.authenticationToken);
        this.localStorage.store('expiresAt', response.expiresAt);
      })
    );
  }

  getJwtToken(): string {
    return this.localStorage.retrieve('authenticationToken');
  }

  getUserName(): string {
    return this.localStorage.retrieve('username');
  }

  getRefreshToken(): string {
    return this.localStorage.retrieve('refreshToken');
  }

}
