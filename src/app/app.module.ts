import { AuthInterceptorService } from './services/auth-interceptor.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbInputModule, NbFormFieldModule, NbSidebarModule, NbIconModule, NbDialogModule, NbButtonModule, NbThemeModule, NbLayoutModule, NbCardModule, NbAutocompleteModule, NbToggleModule, NbSelectModule, NbAccordionModule, NbCheckboxModule, NbDatepickerModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FormCollaborateurComponent } from './form-collaborateur/form-collaborateur.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormEquipeComponent } from './form-equipe/form-equipe.component';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';
import { PlanningComponent } from './planning/planning.component';
import { EquipeDetailComponent } from './equipe-detail/equipe-detail.component';
import { CollaborateurDetailComponent } from './collaborateur-detail/collaborateur-detail.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './loginComponent/login/login.component';
import { SignupComponent } from './loginComponent/signup/signup.component';
import { PdfGeneratorComponent } from './pdf-generator/pdf-generator.component';

@NgModule({
  declarations: [
    AppComponent,
    PlanningComponent,
    FormCollaborateurComponent,
    FormEquipeComponent,
    DeleteConfirmationComponent,
    EquipeDetailComponent,
    CollaborateurDetailComponent,
    LoginComponent,
    SignupComponent,
    PdfGeneratorComponent
  ],
  imports: [
    NbInputModule,
    NbFormFieldModule,
    HttpClientModule,
    NbSidebarModule,
    NbIconModule,
    NbCheckboxModule,
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbButtonModule,
    NbAccordionModule,
    NbSelectModule,
    NbToggleModule,
    ReactiveFormsModule,
    NbAutocompleteModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    NbCardModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbEvaIconsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
