import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
    if (!this.authService.isUserLoggedIn$.value) {
      this.router.navigate(["login"])
    }
    return this.authService.isUserLoggedIn$;
  }
}
