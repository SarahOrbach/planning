
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { EquipeService } from './services/equipe.service';
import { Equipe } from './models/equipe';
import { Component, OnInit } from '@angular/core';
import { User } from './models/user';

import { NbDialogService } from '@nebular/theme';
import { PdfGeneratorComponent } from './pdf-generator/pdf-generator.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  /** Variables de definition de la semaine */
  date = new Date();
  semaine = [true,true,true,true,true,true,true]; // Quelles jours de la semaine doivent-être affichés
  weekNumber = 1;                                 // Nombre de semaines à afficher
  week = [[this.date]];                           // List des jours de la semaine

  /** Informations de l'équipe et de l'utilisateur connecté */
  equipes!: Equipe[];
  userId!: Pick<User, "id">;
  userName!: string;

  /** Affichage du menu */
  menu = false;
  equipesShow = [true];

  constructor(
    private dialogService: NbDialogService, 
    private equipeService: EquipeService,
    private router: Router,
    private authService: AuthService) {}
  
  ngOnInit(): void {
    this.authService.isUserLoggedIn$.subscribe((isLoggedIn) => {
      this.isAuthenticated = isLoggedIn;
      if (!this.isAuthenticated ) {
        console.log('non Authenticated');
        this.router.navigate(["/login"]);
      } else {
        console.log('authenticated');
        this.userId = this.authService.userId;
        this.userName = this.authService.userName;
        this.getEquipes();
      }
    })
    
    this.setWeek();
  }

  logout(): void {
    localStorage.removeItem("token");
    this.authService.isUserLoggedIn$.next(false);
  }

  // Récupère toutes les équipes à partir de l'utilisateur
  fetchAll(userId: Pick<User, "id">): Observable<Equipe[]> {
    return this.equipeService.fetchAll(userId);
  }

  // Récupère les équipes à afficher
  getEquipes(): void {
    this.equipeService.fetchAll(this.userId).subscribe(
      equipes => { 
        this.equipesShow.pop();
        let equipeNotExist = true;
        for (const [i, eq] of equipes.entries()) {
          if ( i === 0) {
            this.equipes = [eq];
            this.equipesShow.push(true);
            equipeNotExist = false;
          } else {
            this.equipes.push(eq);
            this.equipesShow.push(true);
          }
          
        }
      if (equipeNotExist) {
        this.router.navigate(["/ajoutEquipe"]);
      }
     } 
    );
  }

  /** Affichage du menu et affichage des équipes */
  afficherMenu(): void {
    this.menu = !this.menu;
  }

  rangerMenu(): void {
    this.menu = false;
  }

  equipeShow($event: boolean, i: number): void {
      this.equipesShow[i] = !this.equipesShow[i];
  }

  /** Fonctions pour gérer l'affichage des différentes composants en fonction de l'url */
  detail(): boolean {
    return window.location.href.indexOf('detail') === -1 && window.location.href.indexOf('ajout') === -1 
    && window.location.href.indexOf('auth') === -1 && window.location.href.indexOf('login') === -1
    && window.location.href.indexOf('signup') === -1
  }

  header(): boolean {
    return this.isAuthenticated
  }

  /** Gestion de la date et des jours à afficher */
  getDate(date?: Date){
    if (date != undefined ) {
      if (date != null) {
        this.date = date;
      } else {
        this.date = new Date();
      }
    } else {
      this.date = new Date();
    }
    this.setWeek();
  }

  changeDate(sens: string): void {
    if (sens === '+' ) {
      let newDate = new Date(this.date);
      newDate.setDate(this.date.getDate() +7);
      this.date = newDate;
    } else if (sens === '-' ) {
      let newDate = new Date(this.date);
      newDate.setDate(this.date.getDate() -7);
      this.date = newDate;
    }
    this.setWeek();
  }

  setSemaine(day: number) {
    const maDiv = document.getElementById('jour'+day);
    if (this.semaine[day]) {
      if ( maDiv != null ) {
        maDiv.style.backgroundColor = 'white';
        maDiv.style.color = 'rgba(220, 220, 220, 1)';
        maDiv.style.border = '1px solid rgb(220, 220, 220)';
      }
    } else {
      if ( maDiv != null ) {
        maDiv.style.backgroundColor = 'rgb(70, 130, 240)';
        maDiv.style.color = 'white';
        maDiv.style.border = 'none';
      }
    }
    this.semaine[day] =!this.semaine[day];
    this.setWeek();
  }

  setWeek(): void {
    let day = this.date.getDay();  
    if (day === 0) {
      day = 7;
    }
    let firstDate = new Date(this.date);
    firstDate.setDate(this.date.getDate() - day+1)
    let currentDate = new Date(firstDate);
    this.week = [[firstDate]];
    for (let i=1; i<7; i++) {
      currentDate.setDate(firstDate.getDate() + i);
      if (currentDate.getMonth() != firstDate.getMonth() ) {         // Pour les erreurs de javascript au changement de mois
        currentDate.setMonth(firstDate.getMonth() + 1);
      }
      let newDate = new Date(currentDate);
      this.week[0].push(newDate);
    }
    for (let j=1; j< this.weekNumber; j++) {
      currentDate.setDate(firstDate.getDate() + j*7);
      if (currentDate.getMonth() != firstDate.getMonth() ) {
        currentDate.setMonth(firstDate.getMonth() + 1);
      }
      let newDate = new Date(currentDate);
      this.week.push([newDate]);
      for (let i=1; i<7; i++) {
        currentDate.setDate(currentDate.getDate() + 1)
        if (currentDate.getMonth() != firstDate.getMonth() ) {
          currentDate.setMonth(firstDate.getMonth() + 1);
        }
        let newDate = new Date(currentDate);
        console.log(currentDate, newDate, i+j*7);
        this.week[j].push(newDate);
      }
    }
    console.log('setweek', this.week);
  }

  setWeekNumber(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.weekNumber = parseInt(event.target.value);
      this.setWeek();
    }
    
  }

  filterFn = (date: Date) => ((date.getDay() === 0 && this.semaine[0]) 
                              || (date.getDay() === 1 && this.semaine[1])
                              || (date.getDay() === 2 && this.semaine[2]) 
                              || (date.getDay() === 3 && this.semaine[3]) 
                              || (date.getDay() === 4 && this.semaine[4]) 
                              || (date.getDay() === 5 && this.semaine[5]) 
                              || (date.getDay() === 6 && this.semaine[6]));

  /** Génération du PDF */
  generate() {
    let listEquipeId = [[0,"", [""], undefined]];
    listEquipeId.pop();
    for (let i = 0; i< this.equipes.length; i++ ) {
      if (this.equipesShow[i] && this.equipes[i].collaborateursId != undefined) {
       /* let collabId = [""];
        if (this.equipes[i].collaborateursId != undefined) {
          collabId = this.equipes[i].collaborateursId;
        }*/
        listEquipeId.push([this.equipes[i].id, this.equipes[i].name, this.equipes[i].collaborateursId]);
      }
    }

    const dataToSend = { userId: this.userId, listEquipeId: listEquipeId, week: this.week };
    this.dialogService.open(PdfGeneratorComponent, { context: { data: dataToSend }})
  }
}
