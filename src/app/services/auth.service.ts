import { Router } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { first, catchError, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http';

import { User } from "../models/user";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = "http://127.0.0.1:3000/auth";

  isUserLoggedIn$ = new BehaviorSubject<boolean>(false);
  userId!: Pick<User, "id">;
  userName!: string;

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders ({ "Content-Type": "application/json"}),
  }

  constructor(private http: HttpClient,
    private errorHandlerService: ErrorHandlerService,
    private router: Router) { }

  signup(user: Omit<User, "id">): Observable<User> {
    return this.http.post<User>(`${this.url}/signup`, user, this.httpOptions).pipe(
      first(), 
      catchError(this.errorHandlerService.handleError<User>("signup"))
    )
  }

  login(name: Pick<User, "name">, password: Pick<User, "password">): Observable<{
    token: string; 
    userId: Pick<User, "id">;
  }> {
    return this.http.post<{token: string; 
      userId: Pick<User, "id">;}> (`${this.url}/login`,{name, password}, this.httpOptions).pipe(
      first(), 
      tap((tokenObject: {token: string; userId: Pick<User, "id">; }) => {
        this.userId = tokenObject.userId;
        this.userName = JSON.parse(JSON.stringify(tokenObject)).userName;
        console.log('login', tokenObject);
        localStorage.setItem("token", tokenObject.token);
        this.isUserLoggedIn$.next(true);
        this.router.navigate(["planning"]);
      }),
      catchError(this.errorHandlerService.handleError<{
        token: string; userId: Pick<User, "id">;
      }>("login"))
    )
  }
}
