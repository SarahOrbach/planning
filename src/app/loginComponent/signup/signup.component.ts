import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router
    ) {}

  ngOnInit(): void {
    this.signupForm = this.createFormGroup();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl("", [Validators.required, Validators.minLength(2)]),
      password: new FormControl("", [Validators.required, Validators.minLength(4)]),
    })
  }

  signup(): void {
    if (this.signupForm != undefined) {
      this.authService.signup(this.signupForm.value)
                      .subscribe( () => this.router.navigate(["/login"]));
    }
  }
  
  auth(): boolean {
    return window.location.href.indexOf('login') === -1
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
