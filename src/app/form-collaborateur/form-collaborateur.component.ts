import { AuthService } from './../services/auth.service';
import { EquipeService } from './../services/equipe.service';
import { Equipe } from './../models/equipe';
import { CollaborateurService } from './../services/collaborateur.service';
import { Collaborateur } from './../models/collaborateur';
import { User } from './../models/user';
import { Router } from '@angular/router';

import { Component, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';

import { AbstractControl, Validators, FormArray } from '@angular/forms';
import { Observable, map, of } from 'rxjs';
import { FormGroup, FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-form-collaborateur',
  templateUrl: './form-collaborateur.component.html',
  styleUrls: ['./form-collaborateur.component.scss']
})
export class FormCollaborateurComponent {
  @ViewChild("formDirective") formDirective!: NgForm;
  public collaborateurForm!: FormGroup;
  equipesNames = ['']; // List des noms des équipes
  equipesId = [0]; // List des id des équipes

  equipes$!: Observable<Collaborateur[]>;
  userId!: Pick<User, "id">;

  constructor(
    private equipeService: EquipeService,
    private collaborateurService: CollaborateurService,
    private authService: AuthService,
    private fb: FormBuilder, 
    private route: ActivatedRoute,
    private router: Router,
    ) {}

  ngOnInit() { 
    this.userId = this.authService.userId;    
    this.equipes$ = this.fetchAll(this.userId);
    this.getEquipeNames();

    // Initialise le formGroup
    this.collaborateurForm = this.fb.group({
      name: ['', Validators.required],
      firstName: [""],
      lastName: [""],
      idEnt: [""],
      mail: [""],
      phone: [""],
      teams:  [[""]],
      hours: [],
      days:[]
    });
  }

  // Sauvegarde le collaborateur et l'ajoute à la base de données
  onSubmit(formData: Pick<Collaborateur, "name" | "firstName" | "lastName" | "idEnt" | "mail" | "phone" | "teams" | "hours" | "days">) : void {
    console.log('submit', this.userId);
    console.log(formData);
    this.collaborateurService.createCollaborateur(formData, this.userId).subscribe(res => {
      let collabId = JSON.parse(JSON.stringify(res))['message'][0]['insertId'];
      if (formData.teams != undefined ) {
        for( let j = 0; j< formData.teams.length; j++ ) {
          console.log('try add collaborateur')
          this.equipeService.fetch(this.userId, parseInt(formData.teams[j])).subscribe(
            equipe => {
              let collabList =JSON.parse(JSON.stringify(equipe).slice(1,-1)).collaborateursId.slice(1, -1).split(",");
              let equipeId = JSON.parse(JSON.stringify(equipe).slice(1,-1)).id;
                if (collabList[0] === '""' || collabList.length === 0) {
                  collabList = [collabId];
                } else {
                  for( let k = 0; k< collabList.length; k++ ) {
                    if (collabList[0] != '""' || collabList.length != 0) {
                      collabList[k] = parseInt(collabList[k].slice(1, -1));
                    }
                  } 
                collabList.push(collabId);         
              }
            this.equipeService.updateCollab(collabList,equipeId).subscribe();
          }
        )
      }
    }

    })
    this.collaborateurForm.reset();
    this.formDirective.resetForm();
    this.router.navigate(["/planning"]);
  }

  afficher(): boolean {
    return window.location.href.indexOf('detail') === -1 && window.location.href.indexOf('equipe') === -1 
    && window.location.href.indexOf('auth') === -1 && window.location.href.indexOf('login') === -1
    && window.location.href.indexOf('signup') === -1 && window.location.href.indexOf('planning') === -1
  }

  // Créé la liste de 
  fetchAll(userId: Pick<User, "id">): Observable<Equipe[]> {
    return this.equipeService.fetchAll(userId);
  }

  private getEquipeNames() {
    this.equipesId.pop();
    this.equipesNames.pop();
    this.equipes$.subscribe(equipes => {
      for (let eq of equipes) {
        this.equipesId.push(eq['id']);
        this.equipesNames.push(eq['name']);
      }
    });
  }

}
