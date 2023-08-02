import { AuthService } from './../services/auth.service';
import { EquipeService } from './../services/equipe.service';
import { Equipe } from './../models/equipe';
import { CollaborateurService } from './../services/collaborateur.service';
import { Collaborateur } from './../models/collaborateur';
import { User } from './../models/user';

import { Component, Input, ViewChild, Output, EventEmitter  } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DeleteConfirmationComponent } from './../delete-confirmation/delete-confirmation.component';
import { NbDialogService } from '@nebular/theme';

import { ActivatedRoute } from '@angular/router';

import { AbstractControl, Validators, FormArray } from '@angular/forms';
import { Observable, map, of } from 'rxjs';
import { FormGroup, FormBuilder} from '@angular/forms';


@Component({
  selector: 'app-collaborateur-detail',
  templateUrl: './collaborateur-detail.component.html',
  styleUrls: ['./collaborateur-detail.component.scss']
})

export class CollaborateurDetailComponent {
  @Input() collaborateurId: number = 0;
  @Input() Y: number = 0;
  public collaborateurForm!: FormGroup;


  @ViewChild("formDirective") formDirective!: NgForm;
  equipesNames = ['']; // List des noms des équipes
  equipesId = [0]; // List des id des équipes

  equipes$!: Observable<Equipe[]>;
  userId!: Pick<User, "id">;
  collaborateur!: Collaborateur;
  collaborateur$!: Observable<Collaborateur>;


  constructor(
    private dialogService: NbDialogService,  
    private equipeService: EquipeService,
    private collaborateurService: CollaborateurService,
    private authService: AuthService,
    private fb: FormBuilder, 
    private route: ActivatedRoute
    ) {}

  ngOnInit() { 
    this.userId = this.authService.userId;   
    this.getCollaborateur(); 
    this.equipes$ = this.fetchAll(this.userId);
    this.getEquipeNames();

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

  // Initialisation de valeurs
  private setData(collaborateur: Collaborateur): void {
    this.collaborateurForm.patchValue({
      name: collaborateur.name,
      firstName: collaborateur.firstName,
      lastName: collaborateur.lastName,
      mail: collaborateur.mail,
      phone: collaborateur.phone,
      teams: collaborateur.teams,
      hours: collaborateur.hours,
      days:collaborateur.days
    });
  }

  onSubmit(formData: Pick<Collaborateur, "name" | "firstName" | "lastName" | "mail" | "phone" | "teams" | "hours" | "days">) : void {
    console.log('submit', this.userId);

    for( let j = 0; j< this.equipesId.length; j++ ) {
        console.log('try add collaborateur')
        this.equipeService.fetch(this.userId, this.equipesId[j]).subscribe(
          equipe => {
            let collabList =JSON.parse(JSON.stringify(equipe).slice(1,-1)).collaborateursId.slice(1, -1).split(",");
            let equipeId = JSON.parse(JSON.stringify(equipe).slice(1,-1)).id;
            if(formData.teams != undefined) {
              let present = false; 
              for( let i = 0; i< formData.teams.length; i++ ) {
                if (parseInt(formData.teams[i]) === equipeId) {
                  present = true;
                }
              } 
              let actualPresent = false;
              let position = 0;
              if (collabList[0] === '""' || collabList.length === 0) {
                collabList = [];
              } else {
                for( let k = 0; k< collabList.length; k++ ) {
                if (collabList[0] != '""' || collabList.length != 0) {
                  collabList[k] = parseInt(collabList[k].slice(1, -1));
                  if ( collabList[k] === this.collaborateur.id) {
                    actualPresent = true;
                    position = k;
                  } else {
                  collabList.splice(k, k+1);
                  }
                } 
                 
              }
              }

              if (actualPresent != present) {
                if (actualPresent) {
                  collabList.splice(position, position+1);
                } else if (present) {
                  collabList.push(this.collaborateur.id)
                }
                this.equipeService.updateCollab(collabList,equipeId).subscribe();
              }
            }
          }
        )
    }
    console.log(formData);
    this.collaborateurService.updateCollaborateur(formData, this.collaborateur.id, this.userId).subscribe();

  }

  
  // Confirmation de suppression
  open() {
    this.dialogService.open(DeleteConfirmationComponent)
      .onClose.subscribe(result => {
        console.log(result[0]);
        if ( result[0]) {
          if ( this.collaborateur != undefined && this.collaborateur.teams != undefined ) {
            for( let j = 0; j< this.collaborateur.teams.length; j++ ) {
              console.log('try add collaborateur')
              this.equipeService.fetch(this.userId, this.equipesId[j]).subscribe(
                equipe => {
                  let collabList =JSON.parse(JSON.stringify(equipe).slice(1,-1)).collaborateursId.slice(1, -1).split(",");
                  let equipeId = JSON.parse(JSON.stringify(equipe).slice(1,-1)).id;
  
                  let actualPresent = false;
                  let position = 0;
                  if (collabList[0] === '""' || collabList.length === 0) {
                    collabList = [];
                  } else {
                    for( let k = 0; k< collabList.length; k++ ) {
                    if (collabList[0] != '""' || collabList.length != 0) {
                      collabList[k] = parseInt(collabList[k].slice(1, -1));
                      if ( collabList[k] === this.collaborateur.id) {
                        actualPresent = true;
                        position = k;
                      }
                    } else {
                      collabList.splice(k, k+1);
                    }
                     
                  }
                }
    
                if (actualPresent) {
                  collabList.splice(position, position+1);
                  this.equipeService.updateCollab(collabList,equipeId).subscribe();
                }
              }
            )
          }
        }  
        this.collaborateurService.deleteCollaborateur(this.collaborateurId).subscribe();
        }  
      }
    );
  }

  // Récupérer la valeur du collaborateur
  fetch(userId: Pick<User, "id">, collaborateurId: number): Observable<Equipe> {
    return this.collaborateurService.fetch(userId, collaborateurId);
  }

  getCollaborateur(): void {
    this.collaborateur$ = this.fetch(this.userId, this.collaborateurId);

    this.collaborateur$.subscribe(collaborateurs => {
      this.collaborateur = JSON.parse(JSON.stringify(collaborateurs).slice(1,-1));
      
      if ( this.collaborateur.teams != undefined) {
        this.collaborateur.teams = JSON.parse(this.collaborateur.teams.toString());
      }
      this.setData(this.collaborateur);
    });

  }
  
  // Créé la liste de équipes
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

