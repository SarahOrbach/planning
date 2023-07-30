import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    private authService: AuthService,     
    private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.createFormGroup();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl("", [Validators.required, Validators.minLength(2)]),
      password: new FormControl("", [Validators.required, Validators.minLength(4)]),
    })
  }

  login(): void {
    if (this.loginForm != undefined) {
      //this.router.navigate(["/planning"]);
      this.authService.login(this.loginForm.value.name, this.loginForm.value.password).subscribe(
        () => {
          this.router.navigate(["/planning"]);
        })
    }
  }

  auth(): boolean {
    return window.location.href.indexOf('signup') === -1
  }

  /** Pour monter le mot de passe */
  showPassword = false;

  getInputType() {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
