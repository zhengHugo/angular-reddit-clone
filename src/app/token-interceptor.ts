import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { AuthService } from './auth/shared/auth.service';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { LoginResponse } from './auth/login/login.response';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptor implements HttpInterceptor {

  isTokenRefreshing = false;
  refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  private static addToken(req: HttpRequest<any>, jwtToken: string): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + jwtToken)
    });
  }

  constructor(public authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('refresh') || req.url.includes('login')) {
      // request is to refresh token or login
      return next.handle(req);
    }
    const jwtToken = this.authService.getJwtToken();

    if (jwtToken) {
      return next.handle(TokenInterceptor.addToken(req, jwtToken));
    }

    return next.handle(req).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        return this.handleAuthErrors(req, next);
      } else {
        return throwError(error);
      }
    }));
  }

  private handleAuthErrors(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.isTokenRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refreshToken().pipe(
      switchMap((refreshTokenResponse: LoginResponse) => {
        this.isTokenRefreshing = false;
        this.refreshTokenSubject.next(refreshTokenResponse.authenticationToken);
        return next.handle(TokenInterceptor.addToken(req, refreshTokenResponse.authenticationToken));
      })
    );
  }


}
