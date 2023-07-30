import { AuthGuard } from "./services/auth-guard.service";
import { SignupComponent } from './loginComponent/signup/signup.component';
import { LoginComponent } from './loginComponent/login/login.component';

import { EquipeDetailComponent } from './equipe-detail/equipe-detail.component';
import { PlanningComponent } from './planning/planning.component';
import { AppComponent } from './app.component';
import { FormEquipeComponent } from './form-equipe/form-equipe.component';
import { FormCollaborateurComponent } from './form-collaborateur/form-collaborateur.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/planning', pathMatch: 'full' },
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: 'planning', component: PlanningComponent,
  canActivate: [AuthGuard]
  },
  { path: 'ajoutEquipe', component: FormEquipeComponent, 
  canActivate: [AuthGuard]
  },
  { path: 'ajoutCollaborateur', component: FormCollaborateurComponent, 
  canActivate: [AuthGuard]
  },
  { path: 'detail/:name', component: EquipeDetailComponent, 
  canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
