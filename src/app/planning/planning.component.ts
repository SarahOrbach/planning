import { catchError } from 'rxjs/operators';
import { Observable, map } from 'rxjs';
import { FormBuilder, FormGroup, NgForm, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit, ViewChild, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { DeleteConfirmationComponent } from './../delete-confirmation/delete-confirmation.component';
import { NbDialogService } from '@nebular/theme';

import { CollaborateurService } from './../services/collaborateur.service';
import { Collaborateur } from './../models/collaborateur';
import { EquipeService } from './../services/equipe.service';
import { Equipe } from './../models/equipe';
import { PlanningService } from './../services/planning.service';
import { Planning } from './../models/planning';
import { AuthService } from './../services/auth.service';
import { User } from './../models/user';


@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss'],
})

export class PlanningComponent implements OnInit {
  @ViewChild("formDirective") formDirective!: NgForm;
  equipe!: Equipe;
  equipes$!: Observable<Equipe>;
  collaborateurs$!: Observable<Collaborateur[]>;
  collaborateursNamesList = [''];
  @Input() equipeId: number = 0;
  @Input() equipeCollab: string[] | undefined = [""];
  @Input() Z: number = 0;
  @Input() week: Date[][] = [[new Date()]];
  @Input() semaine: boolean[] = [false,false,false,false,false,false,false];
  @Input() weekNumber: number = 0;
  userId!: Pick<User, "id">;
  collaborateurId: string[] | undefined;

  calendrierForm0!: FormGroup;
  calendrierForm1!: FormGroup;
  calendrierForm2!: FormGroup;
  calendrierForm3!: FormGroup;
  showResume = [false, false, false, false];
  showContraintes = [false, false, false, false];
  creneauList = [["",""]];
  calendrierArray = [this.calendrierForm0];
  bandeAnnulerCopy = false;
  bandeAnnulerSwap = false;
  dureeAffichage = 3000;
  daySelected = [-1,-1];
  weekSelected = -1;
  collabSelected = [-1,-1];

  contraintesCList = [[0]];
  contraintesCreneauxList = [""];
  contraintesHList = [[""]];

  /** Annulation des copiers/collers */
  creneauCopy = [""];
  iCopy = 1;
  jCopy = 1;
  kCopy = 1;
  dayCopy = new Date();
  creneauSwap = [""];
  iSwap = 0;
  jSwap = 0;
  kSwap = 0;
  daySwap = new Date();
  creneauSwap2 = [""];
  iSwap2 = 0;
  jSwap2 = 0;
  kSwap2 = 0;
  daySwap2 = new Date();
  

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dialogService: NbDialogService,  
    private equipeService: EquipeService,
    private collaborateurService: CollaborateurService,
    private planningService: PlanningService,
    private authService: AuthService,
    private route: ActivatedRoute,  
    private fb: FormBuilder
    ) {}

  async ngOnInit() {
    this.userId = this.authService.userId;
    let test = await this.getEquipe();
    this.getCreneauList();
    this.collaborateurService.fetchAll(this.userId)
    .subscribe((collab) => {
      this.collaborateursNamesList.pop();
      if (this.equipe.collaborateursId != undefined ) {
        for (let j =0; j < this.equipe.collaborateursId.length; j++) {
          for (let i = 0; i < collab.length; i++) {
            if (collab[i]['id'] === parseInt(this.equipe.collaborateursId[j])) {
              this.collaborateursNamesList.push(collab[i]['name']);
            }
          }
        }
      }
    });
    this.calendrierArray.pop();
    
      for (let i = 0; i < this.weekNumber; i++) { 
        if ( i === 0 ) {
          this.calendrierForm0 = this.fb.group({
            days: this.fb.array([]),
          });
          this.calendrierArray.push(this.calendrierForm0);
          this.addDays(i);
        } else if ( i === 1 ) {
          this.add1();
        } else if ( i === 2 ) {
          this.add2();
        } else {
          this.add3();
        } 
      }

      this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['week'].previousValue != undefined && changes['week'].previousValue != changes['week'].currentValue)) {
      this.ngOnInit();
      this.showResume = [false, false, false, false];
      this.showContraintes = [false, false, false, false];
    }
  }

  fetch(userId: Pick<User, "id">, equipeId: number): Observable<Equipe> {
    return this.equipeService.fetch(userId, equipeId);
  }

  async getEquipe() {
    return new Promise((resolve, reject) => {
      this.fetch(this.userId, this.equipeId).subscribe(equipes => {
        this.equipe = JSON.parse(JSON.stringify(equipes).slice(1,-1));
        if ( this.equipe.collaborateursId != undefined && this.equipe.collaborateursId.length != 0) {
          this.equipe.collaborateursId = JSON.parse(this.equipe.collaborateursId.toString());
        }
        if ( this.equipe.creneauHours != undefined && this.equipe.creneauHours.length != 0) {
          this.equipe.creneauHours = JSON.parse(this.equipe.creneauHours.toString());
        }
        if ( this.equipe.creneauText != undefined && this.equipe.creneauText.length != 0) {
          this.equipe.creneauText = JSON.parse(this.equipe.creneauText.toString());
        }
        if ( this.equipe.list2 != undefined && this.equipe.list2.length != 0) {
          this.equipe.list2 = JSON.parse(this.equipe.list2.toString());
        }
        if ( this.equipe.list3 != undefined && this.equipe.list3.length != 0) {
          this.equipe.list3 = JSON.parse(this.equipe.list3.toString());
        }
        if ( this.equipe.contraintesC != undefined && this.equipe.contraintesC.length != 0) {
          let equipe = JSON.parse(this.equipe.contraintesC.toString())
          this.contraintesCList.pop();
          this.contraintesCreneauxList.pop();
          
          for (let i = 0; i< equipe.length; i++ ) {
            let notExist = true;
            for (let j =0; j< this.contraintesCreneauxList.length; j++ ) {
              if (this.contraintesCreneauxList[j] === equipe[i].C){
                notExist = false;
              } 
            }
            if (notExist) {
              this.contraintesCreneauxList.push(equipe[i].C);
            }
          }
          
          if ( this.equipe.collaborateursId != undefined) {
            this.contraintesCList = Array.from({ length: this.equipe.collaborateursId.length }, () => [0]);
            for (let j =0; j< this.contraintesCList.length; j++ ) {
              this.contraintesCList[j] = Array.from({ length: this.contraintesCreneauxList.length }, () => 0);
            }

            for (let i = 0; i< equipe.length; i++ ) {
              for (let k =0; k< this.equipe.collaborateursId.length; k++ ) {
                for (let j =0; j< this.contraintesCreneauxList.length; j++ ) {
                  if (this.contraintesCreneauxList[j] === equipe[i].C && this.equipe.collaborateursId[k] === equipe[i].Id ){
                    this.contraintesCList[k][j] = equipe[i].V;
                  } 
                }
              }

            }
          }    
          this.equipe.contraintesC = JSON.parse(this.equipe.contraintesC.toString());
        }

        if ( this.equipe.contraintesH != undefined && this.equipe.contraintesH.length != 0) {
          this.contraintesHList.pop();
          let premier = JSON.stringify(this.equipe.contraintesH).slice(3,-3).split("},{");
          
          for (let i =0; i< premier.length; i++ ){
            let second = premier[i].split('\\\"');
            
            let notExist = true;
            for (let j =0; j< this.contraintesHList.length; j++ ) {
              if (this.contraintesHList[j][0] === second[5]){
                this.contraintesHList[j][parseInt(second[2].slice(1, -1))+1] = second[9];
                notExist = false;
              } 
            }
            if (notExist) {
              this.contraintesHList.push([second[5], '0','0','0','0','0','0','0']);
              for (let j =0; j< this.contraintesHList.length; j++ ) {
                if (this.contraintesHList[j][0] === second[5]){
                  this.contraintesHList[j][parseInt(second[2].slice(1, -1))+1] = second[9];
                } 
              }
            }
          }
          this.equipe.contraintesH = JSON.parse(this.equipe.contraintesH.toString());

        }
        resolve(equipes);
      },
      (error) => {
        reject(error);
      }
      );
    });
  }
  

  /** Formulaire des jours */
  private createDaysGroup(day: Date, collaborateurId: number, locked: boolean, creneau: string[]): FormGroup {
    return this.fb.group({
      date: [day],
      userId: this.userId,
      equipeId: this.equipeId,
      locked: [locked],
      collaborateurId: [collaborateurId],
      creneau: [creneau], //["", 'white', '00:00']
    }) 
  }

  public get daysList0(): FormArray{
    this.add1();
    this.add2();
    this.add3();
  //  console.log('daysList0', this.calendrierArray);
  //  console.log('daysList01', this.calendrierArray[0]);
    return <FormArray>this.calendrierArray[0].get('days');
  }

  public get daysList1(): FormArray{
    this.add2();
    this.add3();
    return <FormArray>this.calendrierArray[1].get('days');
  }

  public get daysList2(): FormArray{
    this.add3();
    return <FormArray>this.calendrierArray[2].get('days');
  }

  public get daysList3(): FormArray{
    return <FormArray>this.calendrierArray[3].get('days');
  }

  public dateFormat(date: Date): string {
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    return year+'-'+month+'-'+day
  }

  async checkDays(id: string, day: Date, k: number, j: number) {
    return new Promise((resolve, reject) => {
      this.planningService.find(this.userId, this.dateFormat(day), this.equipeId, parseInt(id)).subscribe(
        (res) => {
           let trueDay = JSON.parse(JSON.stringify(res));
           if (trueDay.length != 0 ) {
           trueDay = JSON.parse(JSON.stringify(res).slice(1,-1));
           let locked = false;
           if (trueDay['locked'] === 1) {
              locked = true;
           }
           let creneau = JSON.parse('["","white","00:00"]');
           if (trueDay['creneau'].indexOf('[') != 0) {
            creneau = trueDay['creneau'].split(',');
           }
           
          if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
            let daysList = this.findDaysList(k);
            let i = (day.getDay() + 6) % 7;
            let pos = i * this.equipe.collaborateursId.length + j;
            daysList.value[pos]['creneau'] = trueDay['creneau'];
            daysList.value[pos]['locked'] = locked;
            let id="color"+ j + k + i + this.Z;
            let selectElement = document.getElementById(id);
            //this.numberChange(day, trueDay['creneau'], k, j);                           // Initialise les valeurs des contraintes

       
            if (selectElement instanceof HTMLSelectElement && selectElement.options.namedItem(creneau[0]+j+k+i+this.Z)) {
              selectElement.options.namedItem(creneau[0]+j+k+i+this.Z)!.selected=true;  // Mise en place de la valeur du creneau
              selectElement.style.backgroundColor = creneau[1];                         // Mise en place de la couleur du creneau
            }
 
            if (locked) {
              id="lock"+ j + k + i + this.Z;
              let lockElement = document.getElementById(id);

              if (lockElement) {
                lockElement.style.color = 'darkslateblue';                              // Mise en place de la couleur du locker
              }
            }

            //if (i === 2 || i === 4 || i === 0 ) {
              this.verifContrainteList(trueDay['creneau'], i, j, k, day); // Initialisation des couleurs des contraites (orange et rouge)
            //}
            
           /* for (let l =0; l< this.contraintesHList.length; l++) {
              this.numberChange(this.week[k][(i+1)%7], this.contraintesHList[l], k, l);
            }*/
            
            
          }
        } else {
          this.planningService.createPlanning(this.dateFormat(day), this.equipeId, false, parseInt(id), ["", 'white', '00:00'], this.userId).subscribe();
        }

        
       // this.numberChangeInit(k);
          resolve(res);
        },
        (error) => {
          reject(error);
        }
        );
      });
    }

  async addDays(k: number) {
    // Une boucle pour initialiser les valeurs
    if ( this.equipe != undefined && this.week[k] != undefined && this.equipe.collaborateursId != undefined) {
      for (let i = 0; i < this.week[k].length; i++) {
        for (let j = 0; j < this.equipe.collaborateursId.length; j++) {
          let day = this.week[k][i];
          let id = this.equipe.collaborateursId[j];
          if ( k === 0 ) {
            this.daysList0.push(this.createDaysGroup(day, parseInt(id), false, ["", 'white', '00:00']));
          } else if ( k === 1 ) {
            this.daysList1.push(this.createDaysGroup(day, parseInt(id), false, ["", 'white', '00:00']));
          } else if ( k === 2 ) {
            this.daysList2.push(this.createDaysGroup(day, parseInt(id), false, ["", 'white', '00:00']));
          } else {
            this.daysList3.push(this.createDaysGroup(day, parseInt(id), false, ["", 'white', '00:00']));
          }
        }
      }
    }

    // Une autre boucle pour mettre les bonnes valeurs
    if ( this.equipe != undefined && this.week[k] != undefined && this.equipe.collaborateursId != undefined) {
      for (let i = 0; i < this.week[k].length; i++) {
        for (let j = 0; j < this.equipe.collaborateursId.length; j++) {
          let day = this.week[k][i];
          let id = this.equipe.collaborateursId[j];
          const element$ = await this.checkDays(id, day, k, j);
        }
      }
    }
  }

  add1(): void {
    if (this.weekNumber>1) {
      if (this.calendrierArray[1] === undefined ) {
       this.calendrierForm1 = this.fb.group({
         days: this.fb.array([]),
       });
       this.calendrierArray.push(this.calendrierForm1);
       this.addDays(1);
 } 
 }
  }

  add2(): void {
    if (this.weekNumber>2) {
      if (this.calendrierArray[2] === undefined ) {
       this.calendrierForm2 = this.fb.group({
         days: this.fb.array([]),
       });
       this.calendrierArray.push(this.calendrierForm2);
       this.addDays(2);
 } 
 }
  }

  add3(): void {
    if (this.weekNumber>3) {
      if (this.calendrierArray[3] === undefined ) {
       this.calendrierForm3 = this.fb.group({
         days: this.fb.array([]),
       });
       this.calendrierArray.push(this.calendrierForm3);
       this.addDays(3);
    } 
    }
  }

  /** Mise à jour du calendrier dans la base de données */
  onSubmit(formData: FormGroup) : void {
    console.log('submit', this.userId);
    console.log(formData.value);
    for (let i=0; i < formData.value['days'].length; i++) {
      let element = formData.value['days'][i];
      this.planningService.find(this.userId, this.dateFormat(element['date']), this.equipeId, element['collaborateurId']).subscribe(
      (res) => {
        let trueDay = JSON.parse(JSON.stringify(res));
        if (trueDay.length != 0 ) {
          trueDay = JSON.parse(JSON.stringify(res).slice(1,-1));
          this.planningService.updatePlanning(trueDay['id'], element['locked'], element['creneau']).subscribe();
        } 
      }
      )
    }
  }

  // Confirmation de suppression
  open() {
    this.dialogService.open(DeleteConfirmationComponent)
      .onClose.subscribe(result => {
        console.log(result[0]);
        if ( result[0]) {
          if ( this.collaborateurId != undefined ) {
            for( let j = 0; j< this.collaborateurId.length; j++ ) {
            this.collaborateurService.fetch(this.userId, parseInt(this.collaborateurId[j])).subscribe(
              collab => {
                let equipeList =JSON.parse(JSON.stringify(collab).slice(1,-1)).teams.slice(1, -1).split(",");
                let collabId = JSON.parse(JSON.stringify(collab).slice(1,-1)).id;
              
              
                  let actualPresent = false;
                  let position = 0;
                  if (equipeList[0] === '""' || equipeList.length === 0) {
                    equipeList = [];
                  } else {
                    for( let k = 0; k< equipeList.length; k++ ) {
                    if (equipeList[0] != '""' || equipeList.length != 0) {
                      equipeList[k] = parseInt(equipeList[k].slice(1, -1));
                      if ( equipeList[k] === this.equipe.id) {
                        actualPresent = true;
                        position = k;
                      }
                    } else {
                      equipeList.splice(k, k+1);
                    }
                     
                  }
                  }
  
                  if (actualPresent) {
                    equipeList.splice(position, position+1);
                    this.collaborateurService.updateEq(equipeList,collabId).subscribe();
                  }
                
              }
            )
          }
        }
          this.equipeService.deleteEquipe(this.equipeId).subscribe();
          this.planningService.deletePlanning(this.equipeId).subscribe();
        }
        

      }
      );
  }

  /** Créneaux à afficher dans les cellules */
  getCreneauList(): void {
    let begin: string;
    let end: string;
    this.creneauList = [["", 'white', '00:00']];
    
    if (this.equipe  != undefined ) {
      if ( this.equipe.creneauHours != undefined ) {
        for (let i = 0; i < this.equipe.creneauHours.length; i++) {
          let hours = JSON.stringify(this.equipe.creneauHours[i]).split('"');
          if (hours[26].indexOf('true') != -1) {
            begin = hours[3];
            end = hours[7];
            this.creneauList.push([begin + ' ' + end, hours[19], hours[15]]); 
          }
        }
      }
      if ( this.equipe.creneauText != undefined ) {
        for (let i = 0; i < this.equipe.creneauText.length; i++) {
          let text = JSON.stringify(this.equipe.creneauText[i]).split('"');
          if (text[18].indexOf('true') != -1) {
            this.creneauList.push([text[3], text[7], text[11]]);
          }            
        }
      }
    }
  }

  onClickColor(element: string[], i: number, j: number, k: number, day: Date): void {
    let monElement = document.getElementById('color'+j+ k +i+ this.Z);

   /* if ( element.length > 3 ) {
      element[1] = element[1]+ ',' + element[2] + ',' + element[3];
      element.splice(2, 2);
    }*/
    if (monElement) {
      monElement.style.backgroundColor = element[1];
    }
    this.verifContrainteList(element[0], i,j,k,day);
    for(let l=0; l< this.contraintesHList.length; l++) {
      let creneau = this.contraintesHList[l];
      this.numberChange(day, creneau, k, l);
    }
  }

  /*addValueResume(element: string[], j: number, k: number): void {
    let monElement = document.getElementById('resume'+j+ k + this.Z);
    if (monElement) {
      monElement.style.backgroundColor = element[1];
    }
  }*/

  /** Fonction des jours à afficher */
  findDaysList(k: number): FormArray<any> {
    let daysList = this.daysList0;
    if ( k === 1 ) {
      daysList = this.daysList1;
    } else if ( k === 2 ) {
      daysList = this.daysList2;
    } else if ( k === 3 ) {
      daysList = this.daysList3;
    }      
    return daysList
  }    
           
  /** Gestion du résumé des semaines */
  showResumeFun(k: number): void {
    this.showResume[k] = !this.showResume[k];
  }

  /*onSelectionChange(event: Event, k: number, j: number): void {
    const element = event.target;

    if (element instanceof HTMLSelectElement) {
      let list = this.calendrierArray[k].get('resumeVisible')?.value;  
      const valeur = element.value;
      list[j] = valeur;
      this.calendrierArray[k].patchValue({
        resumeVisible: list
      });
    }
  }*/

/*  addResume(k: number): void {
    let list = this.calendrierArray[k].get('resumeVisible')?.value;
    list.push('');
    this.calendrierArray[k].patchValue({
      resumeVisible: list
    });
  }

  deleteResume(k: number, j: number): void {
    let list = this.calendrierArray[k].get('resumeVisible')?.value;
    if ( j != 0) {
      list.splice(j, j);
    } else {
      list.splice(0, 1);
    }
    this.calendrierArray[k].patchValue({
      resumeVisible: list
    });
  }*/

  setTotal(balise: string, i: number, k: number, target: number): void {
    const id = balise + i.toString() + k.toString() + this.Z;
    let total = '00h00';
    let daysList = this.findDaysList(k);
    let max = this.equipe?.collaborateursId?.length;
    if ( max === undefined ) {
      max = 0;
    }
    let weekShift = new Array(max);   
    for (let j = 0; j<max; j++) {
      weekShift[j] = new Array(7);  
    }  
    for (let j = 0; j<7*max; j++) {
      weekShift[j%max][Math.floor(j / max)] = daysList.value[j].creneau;
    }

    if (balise === 'Total Horaire' ) {
      for (let j = 0; j<7; j++) {
        if ( typeof weekShift[i][j] === "string" ) {
          total = this.addition(total, weekShift[i][j]);
        }
      }
    } else {
      let compte = 0;
      for (let j = 0; j<7; j++) {
        if ( typeof weekShift[i][j] === "string" ) {
          if ( balise === weekShift[i][j].slice(0,11)) {
            compte += 1;
          }
        }
      }
      total = compte.toString();
    }
    

    const maDiv = document.getElementById(id); 

    let color = 'blue'; 
    let backgroundColor = 'white'; 
    let delta = parseInt(total) - target;
    let diff = delta.toString();
    if (delta === 0) {
      color = '#458e74';
    } else if (delta > 0) {
      color = '#458e74';
      backgroundColor = '#e6f5f0ff';
      diff = '+' + delta;
    } else {
      color = '#be0000';
      backgroundColor = '#faebebff';
    }

    if ( maDiv != null) {
      maDiv.style.backgroundColor = backgroundColor;
      maDiv.style.color = color;
      maDiv.innerHTML = diff;
    }
  }

  addition(num: string, element: string): string {
    let temps = element.slice(-5);
    if (element[0] === '[') {
      temps = element.slice(-7, -2);
    }
    let minute = parseInt(temps.slice(-2)) + parseInt(num.slice(-2));
    let heure = parseInt(temps.slice(0,2)) + parseInt(num.slice(0,2));
    if ( minute > 59 ) {
      minute -= 60;
      heure += 1;
    }
    let min = minute.toString();
    let h = heure.toString();
    if (min.length === 0) {
      min = '00';
    } else if ( min.length === 1) {
      min = '0' + min;
    }
    if (h.length === 0) {
      h = '00';
    } else if ( h.length === 1) {
      h = '0' + h;
    }
    return h +'h'+ min
  }

  /** Gestion des contraintes sur le nombre de creneaux */
  showContrainteFun(k: number): void {
    this.showContraintes[k] = !this.showContraintes[k];
    if (this.showContraintes[k]) {
      this.numberChangeInit(k);
    }
  }

  /**addContrainteC(k: number): void {
    let list = this.calendrierArray[k].get('contraintesC')?.value;
    list.push(["", 0, 0, 0, 0, 0, 0, 0]);
    this.calendrierArray[k].patchValue({
      contraintesC: list
    });
  }

  deleteContrainteC(k: number, j: number): void {
    let list = this.calendrierArray[k].get('contraintesC')?.value;
    if ( j != 0) {
      list.splice(j, j);
    } else {
      list.splice(0, 1);
    }
    this.calendrierArray[k].patchValue({
      contraintesC: list
    });
  } */

  /*addContrainteH(k: number): void {
    let list = this.calendrierArray[k].get('contraintesH')?.value;
    list.push(["", 0, 0, 0, 0, 0, 0, 0]);
    this.calendrierArray[k].patchValue({
      contraintesH: list
    });
  }

  deleteContrainteH(k: number, j: number): void {
    let list = this.calendrierArray[k].get('contraintesH')?.value;
    if ( j != 0) {
      list.splice(j, j);
    } else {
      list.splice(0, 1);
    }
    this.calendrierArray[k].patchValue({
      contraintesH: list
    });
  } */


  /*onContrainteHChange(event: Event, k: number, j: number): void {
    const element = event.target;
    if (element instanceof HTMLInputElement) {
      let list = this.calendrierArray[k].get('contraintesH')?.value;
      const valeur = element.value;
      list[j][0] = valeur;
      this.calendrierArray[k].patchValue({
        contraintesH: list
      });
        this.collaborateursTime(list[j], k, j);
    }
  }*/

  /*onContrainteCChange(event: Event, k: number, j: number): void {
    const element = event.target;
    if (element instanceof HTMLSelectElement) {
      let list = this.calendrierArray[k].get('contraintesC')?.value;
      const valeur = element.value;
      list[j][0] = valeur;
      this.calendrierArray[k].patchValue({
        contraintesC: list
      });
      let daysList = this.findDaysList(k);
      for(let i=0; i<daysList.value.length; i++) {
        let horaire = daysList.controls[i].value['date'];
        this.calcul(horaire, list[j], k, j);
      }
    }
  }*/

  numberChange(day: Date, creneau: string[], k: number, j: number): void {
    if (creneau[0].length === 5 && creneau[0].indexOf(":")=== 2 ) {
      this.collaborateursTime(creneau, k, j);
    } else {
      this.calcul(day, creneau, k, j);
    }
  }

  numberChangeInit(k: number): void {
    for (let j =0; j < this.contraintesHList.length; j++) {
        for (let i = 0; i<7; i++) {
          setTimeout(() => {
          this.numberChange(this.week[k][i], this.contraintesHList[j], k, j);
        }, 10);
        }

      }
  }

  calcul(day: Date, creneau: string[], k: number, l:number): void {
    let i = day.getDay()-1;
    if (i<0) { i = 6; }
    let id = 'time'+k+i+l + this.Z;
    let compte = 0;
    let daysList = this.findDaysList(k);
    for(let j=0; j < daysList.controls.length; j++) {
      let date = daysList.controls[j].value['date'];
      let horaire = daysList.controls[j].value['creneau'];
      if ( date === day && typeof horaire === "string" && horaire.slice(0,horaire.search(",")) === creneau[0] ) {
        compte += 1;
      }
    }
    let jour = i+1;

    const maDiv = document.getElementById(id); 

    let color = 'blue'; 
    let backgroundColor = 'white'; 
    let value = parseInt(creneau[jour]);
    if (typeof value === "string") {
      value = parseInt(value);
    }
    console.log('dif', compte, value, creneau, creneau[jour], jour);
    let delta = compte - value;
    let diff = delta.toString();
    if (delta === 0) {
      color = '#458e74';
    } else if (delta > 0) {
      color = '#458e74';
      backgroundColor = '#e6f5f0ff';
      diff = '+' + delta;
    } else {
      color = '#be0000';
      backgroundColor = '#faebebff';
    }

    if ( maDiv != null) {
      maDiv.style.backgroundColor = backgroundColor;
      maDiv.style.color = color;
      maDiv.innerHTML = diff;
    }
    
   /* let color = 'blue';
    if (compte === parseInt(creneau[i])) {
      color = 'green';
    } else {
      color = 'red';
    }
    let value = parseInt(creneau[i]);
    if (typeof value === "string") {
      value = parseInt(value);
    }
    
   
      let delta = compte - value;
      if ( maDiv != null) {
        maDiv.style.color = color;
        maDiv.innerHTML = compte + ' [' + delta + ']';
      }*/
  }

  /** Afficher le nombre de collaborateurs à une heure donnée */
  async collaborateursTime(creneau: string[], k: number, l:number) {
 
      let time = creneau[0];
      let daysList = this.findDaysList(k);
      let compte = [0,0,0,0,0,0,0];
      for(let j=0; j < daysList.controls.length; j++) {
        let day = daysList.controls[j].value['date'];
        let i = day.getDay()-1; // lundi : 0 et dimanche : 6
        if (i<0) { i = 6; }
        let horaire = daysList.controls[j].value['creneau'];
        if (typeof horaire === "string" && this.isInRange(horaire, time)) {                   // on compte les creneaux de la journée
          compte[i] += 1;
        }
        if ( i < 6 && typeof horaire === "string" && this.isInRange(horaire, time, true)) {   // on compte le jour d'avant pour les créneaux qui chevauchent deux jours de la semaine
          compte[i+1] += 1;
        } else if (i === 6 && k > 0) {                                                        // on compte le jour d'avant pour les créneaux du dimanche de la semaine d'avant quand elle est affichée
          let daysListInf = this.findDaysList(k-1);
          let dayInf = daysListInf.controls[j].value['date'];
          let m = dayInf.getDay();
          if ( m === 0) {
            let horaireInf = daysListInf.controls[j].value['creneau'];
            if (typeof horaireInf === "string" && this.isInRange(horaireInf, time, true)) {
              compte[0] += 1;
            }
          }
        }
      }

      if ( k === 0) {  //userId: Pick<User, "id">, date: string, equipeId: number, collaborateurId: number // on compte le jour d'avant quand on est sur le lundi de la première semaine
        //newDate.setDate(this.date.getDate() - 1)
        if (this.equipe != undefined && this.equipe.collaborateursId != undefined) {
          let newDay = new Date(this.week[k][0]);
          newDay.setDate(newDay.getDate() - 1);
          
          for (let m=0; m < this.equipe.collaborateursId.length; m++) {
          
          let anterieur =  await this.jourAnterieur(this.userId, this.dateFormat(newDay), this.equipeId, parseInt(this.equipe.collaborateursId[m]), time);
          if (anterieur) {
            compte[0] += 1;
          }
          }

        }
      }

      let list = daysList.get('contraintesH')?.value;
      for(let i=0; i<7; i++) {
        let color = 'blue'; 
        let backgroundColor = 'white';
        let value = parseInt(creneau[i+1]);
        let delta = compte[i] - value ;
        let diff = delta.toString();
        if (compte[i] === parseInt(creneau[i+1])) {
          color = '#458e74';
        } else if  (compte[i] > parseInt(creneau[i+1])) {
          color = '#458e74';
          backgroundColor = '#e6f5f0ff';
          diff = '+' + delta;
        } else {
          color = '#be0000';
          backgroundColor = '#faebebff';
        }

        let id = 'time'+k+i +l + this.Z;
        const maDiv = document.getElementById(id);
        if ( maDiv != null) {
          maDiv.style.backgroundColor = backgroundColor;
          maDiv.style.color = color;
          maDiv.innerHTML = diff;
        } 
      }
  }

  async jourAnterieur(userId: Pick<User, "id">, date: string, equipeId: number, collaborateurId: number, time: string) {
    return new Promise ((resolve, reject) => {
      this.planningService.find(userId, date, this.equipeId, collaborateurId).subscribe(
        (res)  => {
          let compte = false;
          let newDay = JSON.parse(JSON.stringify(res));
          if (newDay.length != 0 ) {
           newDay = JSON.parse(JSON.stringify(res).slice(1,-1));
           let horaire = newDay['creneau'];
           if (typeof horaire === "string" && this.isInRange(horaire, time, true)) {
            compte = true;
            }
          }
      resolve(compte);
        },
        (error) => {
          reject(error);
      }
       );
       });
    }

  isInRange(interval: string, heure: string, lendemain: boolean = false): boolean {
    let debuth = parseInt(interval.slice(0,2));
    let debutmin = parseInt(interval.slice(3,5));
    let finh = parseInt(interval.slice(6,8));
    let finmin = parseInt(interval.slice(9,11));
    let h = parseInt(heure.slice(0,2));
    let min = parseInt(heure.slice(3,5)); 
    let pasNuit = true;

    if ((finh < debuth) || ((finh === debuth) && (finmin <= debutmin))) {
      if (lendemain) {
        debuth = 0;
        debutmin = 0;
        pasNuit = false;
      } else {
        finh = 24;
        finmin = 0;
      }
    }

    if ( lendemain && pasNuit ) {
      return false
    }

    if ((debuth < h) || ((debuth === h) && (debutmin <= min))) {
      if ((finh > h) || ((finh === h) && (finmin > min))) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  /** Drag and drop */
  /**
   * ev contient l'identifiant de la case que l'on déplace.
   * La fonction drag permet de transmettre l'identifiant.
   * Les fonctions allow et leave changent l'aspect des cases lorqu'on fait glisser l'élément dragé dessus.
   * Drop est la case générale, Copy et Swap sont les demie-cases pour copier ou échanger les valeurs des cases.  
   * Les fonctions getCreneau, getSwapDay et setCreneau permettent de récupérer les créneaux et les jours à partir des identifiants et de changer la valeur du créneau.
   * Les fonction promptAnnuler[], annuler[] et click[] codent la possibilité d'annulation de la copy ou de l'échange.
   * Les fonctions drop permettent de copier ou d'échanger les créneaux.
   */

  drag(ev: DragEvent, j: number, k: number, i: number): void {
    let id = 'color' + j + k + i + this.Z;
    ev?.dataTransfer?.setData("text", id);
  }

  allowDrop(ev: DragEvent, j: number, k: number, i: number): void {
    var data = ev?.dataTransfer?.getData("text");
    let id = 'color' + j + k + i + this.Z;
    let id2 = 'drop' + j + k + i + this.Z;
    let id3 = 'lock' + j + k + i + this.Z;
    if ( id != data ) {
      ev.preventDefault();
      const maDiv = document.getElementById(id);
      const maDiv2 = document.getElementById(id2);
      const maDiv3 = document.getElementById(id3);
      if ( maDiv != null && maDiv2 != null && maDiv3 != null ) {
        maDiv.style.display = 'none';
        maDiv2.style.display = 'flex';
        maDiv3.style.display = 'none';
      }
    }

  }

  leaveDrop(ev: DragEvent, j: number, k: number, i: number): void {
    ev.preventDefault();
    let id = 'color' + j + k + i + this.Z;
    let id2 = 'drop' + j + k + i + this.Z;
    let id3 = 'lock' + j + k + i + this.Z;
    const maDiv = document.getElementById(id);
    const maDiv2 = document.getElementById(id2);
    const maDiv3 = document.getElementById(id3);
    if ( maDiv != null && maDiv2 != null && maDiv3 != null ) {
      maDiv.style.display = 'flex';
      maDiv2.style.display = 'none';
      maDiv3.style.display = 'flex';
    }
  }

  allowCopy(ev: DragEvent, j: number, k: number, i: number): void {
    ev.preventDefault();
    let id = 'copy' + j + k + i + this.Z;
    const maDiv = document.getElementById(id);
    if ( maDiv != null ) {
      maDiv.style.backgroundColor = 'rgba(235, 233, 233, 0.8)';
    }
  }

  leaveCopy(ev: DragEvent, j: number, k: number, i: number): void {
    ev.preventDefault();
    let id = 'copy' + j + k + i+ this.Z;
    const maDiv = document.getElementById(id);
    if ( maDiv != null ) {
      maDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    }
  }

  allowSwap(ev: DragEvent, j: number, k: number, i: number): void {
    ev.preventDefault();
    let id = 'swap' + j + k + i + this.Z;
    const maDiv = document.getElementById(id);
    if ( maDiv != null ) {
      maDiv.style.backgroundColor = 'rgba(235, 233, 233, 0.8)';
    }
  }

  leaveSwap(ev: DragEvent, j: number, k: number, i: number): void {
    ev.preventDefault();
    let id = 'swap' + j + k + i + this.Z;
    const maDiv = document.getElementById(id);
    if ( maDiv != null ) {
      maDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    }
  }

  getCreneau(j: number, k: number, i: number): [string, string, string] {
   // console.log('getCreneauFun', j, k, i)
    let daysList = this.findDaysList(k);
    if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
      let collaborateur = this.equipe.collaborateursId[j];
     // console.log('test1');
      for(let l=0; l < daysList.controls.length; l++) {
        let date = daysList.controls[l].value['date'];
     //   console.log('test2');
        if ( date.getDay() === ((i + 1) % 7) && daysList.controls[l].value['collaborateurId'] === parseInt(collaborateur)) {
          let creneau = daysList.controls[l].value['creneau'];
       //   console.log('test3', creneau);
          if ( typeof creneau === "string" ) {
            creneau = creneau.split(",");
          }
        //  console.log('test4', creneau);
          return creneau;
        } 
      }
    }
  //  console.log('test5')
    return ["", 'white', '00:00']
    }

  getSwapDay(j: number, k: number, i: number): Date {
    let daysList = this.findDaysList(k);
    if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
      let collaborateur = this.equipe.collaborateursId[j];
      for(let l=0; l < daysList.controls.length; l++) {
        let date = daysList.controls[l].value['date'];
        if ( date.getDay() === ((i + 1) % 7) && daysList.controls[l].value['collaborateurId'] === collaborateur) {
          return date;
        } 
      }
    }
    return new Date()
  }

  setCreneau(setCreneau: string[], i: number, j: number, k: number, day: Date): void {
    let daysList = this.findDaysList(k);
    if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
      daysList.value[i * this.equipe.collaborateursId.length + j]['creneau'] = setCreneau;
      this.calendrierArray[k].patchValue({
        days: daysList.value,
      });
    }
  }

  promptAnnulerCopy(): void {    
    this.bandeAnnulerCopy = true;
      const maDiv = document.getElementById('annulerCopy'+ this.Z);
      if ( maDiv != null ) {
        maDiv.style.display = 'flex';
      }
    setTimeout(() => {
      if ( maDiv != null ) {
        maDiv.style.display = 'none';
      }
    }, this.dureeAffichage);
  }

  annulerCopy(creneau: string[], i: number, j: number, k: number, day: Date): void {
    this.bandeAnnulerCopy = false;
   // console.log('annulerCopy', creneau, this.creneauCopy);
    this.onClickColor(creneau, i, j, k, day);
    this.setCreneau(creneau, i, j, k, day);
  }

  clickCopy(): void {
    this.bandeAnnulerCopy = false;
    const maDiv = document.getElementById('annulerCopy'+ this.Z);
  //  console.log('clickCopy',this.creneauCopy, this.iCopy, this.jCopy, this.kCopy, this.dayCopy);
    this.annulerCopy(this.creneauCopy, this.iCopy, this.jCopy, this.kCopy, this.dayCopy);
    if ( maDiv != null ) {
      maDiv.style.display = 'none';
    }
  }

  promptAnnulerSwap(): void {    
    this.bandeAnnulerSwap = true;
      const maDiv = document.getElementById('annulerSwap'+ this.Z);
      if ( maDiv != null ) {
        maDiv.style.display = 'flex';
      }
    setTimeout(() => {
      if ( maDiv != null ) {
        maDiv.style.display = 'none';
      }
    }, this.dureeAffichage);
  }

  annulerSwap(creneau2: string[], i: number, j: number, k: number, day2: Date, creneau: string[], i2: number, j2: number, k2: number, day: Date): void {
    this.bandeAnnulerSwap = false;
    this.onClickColor(creneau, i, j, k, day2);
    this.setCreneau(creneau, i, j, k, day2);
    
    this.onClickColor(creneau2, i2, j2, k2, day);
    this.setCreneau(creneau2, i2, j2, k2, day);
  }

  clickSwap(): void {
    this.bandeAnnulerSwap = false;
    const maDiv = document.getElementById('annulerSwap'+ this.Z);
    this.annulerSwap(this.creneauSwap, this.iSwap, this.jSwap, this.kSwap, this.daySwap, this.creneauSwap2, this.iSwap2, this.jSwap2, this.kSwap2, this.daySwap2);
    if ( maDiv != null ) {
      maDiv.style.display = 'none';
    }
  }

  dropCopy(ev: DragEvent, j: number, k: number, i: number): void {
    let id = 'color' + j + k + i + this.Z;
    let id2 = 'drop' + j + k + i + this.Z;
    let id3 = 'lock' + j + k + i + this.Z;
    const maDiv = document.getElementById(id);
    const maDiv2 = document.getElementById(id2);
    const maDiv3 = document.getElementById(id3);
    if ( maDiv != null && maDiv2 != null && maDiv3 != null ) {
      maDiv.style.display = 'flex';
      maDiv2.style.display = 'none';
      maDiv3.style.display = 'flex';
    }
    ev.preventDefault();
    var data = ev?.dataTransfer?.getData("text");

    if ( data != undefined ) {
      let j2 = parseInt(data.slice(-4, -3));
      let k2 = parseInt(data.slice(-3, -2));
      let i2 = parseInt(data.slice(-2, -1));
      if (this.Z > 9) {
        let j2 = parseInt(data.slice(-5, -4));
        let k2 = parseInt(data.slice(-4, -3));
        let i2 = parseInt(data.slice(-3, -2));
      }
      //console.log('getCreneau', j, k, i, j2, k2, i2);
      let creneau2 = this.getCreneau(j2, k2, i2);
      let day2 = this.getSwapDay(j, k, i);

      let creneau = this.getCreneau(j, k, i);
    //  console.log('creneau', creneau);
      if (creneau[0] === '[""') {
        creneau[0] = '""';
      }
      let day = this.getSwapDay(j2, k2, i2);

      this.onClickColor(creneau2, i, j, k, day2);
      this.setCreneau(creneau2, i, j, k, day2);
      
      this.creneauCopy = creneau;
    //  console.log('creneauCopy', this.creneauCopy);
      this.iCopy = i;
      this.jCopy = j;
      this.kCopy = k;
      this.dayCopy = day2;
      this.promptAnnulerCopy();
    }
  }

  dropSwap(ev: DragEvent, j: number, k: number, i: number): void {
    let id = 'color' + j + k + i + this.Z;
    let id2 = 'drop' + j + k + i + this.Z;
    let id3 = 'lock' + j + k + i + this.Z;
    const maDiv = document.getElementById(id);
    const maDiv2 = document.getElementById(id2);
    const maDiv3 = document.getElementById(id3);
    if ( maDiv != null && maDiv2 != null && maDiv3 != null ) {
      maDiv.style.display = 'flex';
      maDiv2.style.display = 'none';
      maDiv3.style.display = 'flex';
    }
    ev.preventDefault();
    var data = ev?.dataTransfer?.getData("text");

    if ( data != undefined ) {
      let j2 = parseInt(data.slice(-4, -3));
      let k2 = parseInt(data.slice(-3, -2));
      let i2 = parseInt(data.slice(-2, -1));
      if (this.Z > 9) {
        let j2 = parseInt(data.slice(-5, -4));
        let k2 = parseInt(data.slice(-4, -3));
        let i2 = parseInt(data.slice(-3, -2));
      }
      let creneau2 = this.getCreneau(j2, k2, i2);
      let day2 = this.getSwapDay(j, k, i);

      let creneau = this.getCreneau(j, k, i);
      let day = this.getSwapDay(j2, k2, i2);

      this.onClickColor(creneau2, i, j, k, day2);
      this.setCreneau(creneau2, i, j, k, day2);
      
      this.onClickColor(creneau, i2, j2, k2, day);
      this.setCreneau(creneau, i2, j2, k2, day);

      this.creneauSwap = creneau2;
      this.iSwap = i;
      this.jSwap = j;
      this.kSwap = k;
      this.daySwap = day2;
      this.creneauSwap2 = creneau;
      this.iSwap2 = i2;
      this.jSwap2 = j2;
      this.kSwap2 = k2;
      this.daySwap2 = day;

      this.promptAnnulerSwap();
    }
  }


  /** Copier-Coller d'un jour ou d'un collaborateur */
  /**
   * Il y a trois types de copier-coller, par jour, par collaborateur ou par semaine.
   * Quand l'élément []Selected à des valeurs à -1, rien n'est selectionné.
   * Quand on sélectionne un élément, le bouton change de couleur et l'objet []Selected contient les coordonnées du bouton
   * Quand on clique sur un autre bouton, les valeurs des éléments sont copiées une à une.
   */

  selectDays(k: number, i: number): void {
    if ( this.daySelected[0] >= 0 ) {
      let ks = this.daySelected[0];
      let is = this.daySelected[1];
      let id = 'button' + k + i + this.Z;
      const maDiv = document.getElementById(id);
      let idS = 'button' + ks + is + this.Z;
      const maDivS = document.getElementById(idS);
      if ( maDiv != null && maDivS != null ) {
        maDiv.style.backgroundColor = 'white';
        maDivS.style.backgroundColor = 'white';
        maDiv.style.color = '#90a0c4';
        //maDivS.style.color = '#90a0c4';
      }
      if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
        for(let j = 0; j< this.equipe.collaborateursId.length; j++) {
          let id2 = 'drag' + j + k + i + this.Z;
          const maDiv2 = document.getElementById(id2);
          let id2S = 'drag' + j + ks + is + this.Z;
          const maDiv2S = document.getElementById(id2S);
          if ( maDiv2 != null && maDiv2S != null ) {
            maDiv2.style.backgroundColor = 'white';
            maDiv2.style.color = 'darkslateblue';
            maDiv2S.style.backgroundColor = 'white';
            //maDiv2S.style.color = 'darkslateblue';
          }
          let creneau = this.getCreneau(j, ks, is);
          let day = this.getSwapDay(j, k, i);
          this.onClickColor(creneau, i, j, k, day);
          this.setCreneau(creneau, i, j, k, day);

        }
      this.daySelected = [-1,-1];
      }
    } else {
      let id = 'button' + k + i + this.Z;
      const maDiv = document.getElementById(id);
      if ( maDiv != null ) {
        maDiv.style.backgroundColor = '#90a0c4';
        maDiv.style.color = 'white';
      }
      if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
        for(let j = 0; j< this.equipe.collaborateursId.length; j++) {
          let id2 = 'drag' + j + k + i + this.Z;
          const maDiv2 = document.getElementById(id2);
          if ( maDiv2 != null ) {
            maDiv2.style.backgroundColor = '#90a0c4';
            //maDiv2.style.color = 'white';
          }
        }
      this.daySelected = [k, i];
      }
    }
  }

  selectCollab(k: number, j1: number): void {
    let j = 0;
    if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
      j = (j1-1+this.equipe.collaborateursId.length)%this.equipe.collaborateursId.length;
    }
    if ( this.collabSelected[0] >= 0 ) {
      let ks = this.collabSelected[0];
      let js = this.collabSelected[1];
      let jb = this.collabSelected[1];
      if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
        jb = (js+1)%this.equipe.collaborateursId.length;
      }
      let id = 'collab' + k + j1 + this.Z;
      const maDiv = document.getElementById(id);
      let idS = 'collab' + ks + jb + this.Z;
      const maDivS = document.getElementById(idS);
      if ( maDiv != null && maDivS != null ) {
        maDiv.style.backgroundColor = 'white';
        maDivS.style.backgroundColor = 'white';
        maDiv.style.color = '#90a0c4';
        //maDivS.style.color = '#90a0c4';
      }

      for(let i = 0; i < 7; i++) {
        let id2 = 'drag' + j + k + i + this.Z;
        const maDiv2 = document.getElementById(id2);
        let id2S = 'drag' + js + ks + i + this.Z;
        const maDiv2S = document.getElementById(id2S);
        if ( maDiv2 != null && maDiv2S != null ) {
          maDiv2.style.backgroundColor = 'white';
          maDiv2.style.color = 'darkslateblue';
          maDiv2S.style.backgroundColor = 'white';
          //maDiv2S.style.color = 'darkslateblue';
        }
        let creneau = this.getCreneau(js, ks, i);
        let day = this.getSwapDay(j, k, i);
        this.onClickColor(creneau, i, j, k, day);
        this.setCreneau(creneau, i, j, k, day);
      }

      this.collabSelected = [-1,-1];
    } else {
      let id = 'collab' + k + j1 + this.Z;
      const maDiv = document.getElementById(id);
      if ( maDiv != null ) {
        maDiv.style.backgroundColor = '#90a0c4';
        maDiv.style.color = 'white';
      }
      for(let i = 0; i< 7; i++) {
        let id2 = 'drag' + j + k + i + this.Z;
        const maDiv2 = document.getElementById(id2);
        if ( maDiv2 != null ) {
          maDiv2.style.backgroundColor = '#90a0c4';
          //maDiv2.style.color = 'white';
        }
        this.collabSelected = [k, j];
      }
    }
  }


  selectWeek(k: number): void {
    if ( this.weekSelected >= 0 ) {
      let ks = this.weekSelected;
      let id = 'week' + k + this.Z;
      const maDiv = document.getElementById(id);
      let idS = 'week' + ks + this.Z;
      const maDivS = document.getElementById(idS);
      if ( maDiv != null && maDivS != null) {
        maDiv.style.backgroundColor = 'white';
        maDivS.style.backgroundColor = 'white';
        maDiv.style.color = '#90a0c4';
        //maDivS.style.color = '#90a0c4';
      }
      if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
        for(let j = 0; j< this.equipe.collaborateursId.length; j++) {
          for(let i = 0; i<7; i++ ) {
            let id2 = 'drag' + j + k + i + this.Z;
            const maDiv2 = document.getElementById(id2);
            let id2S = 'drag' + j + ks + i + this.Z;
            const maDiv2S = document.getElementById(id2S);
            if ( maDiv2 != null && maDiv2S != null ) {
              maDiv2.style.backgroundColor = 'white';
              maDiv2.style.color = 'darkslateblue';
              maDiv2S.style.backgroundColor = 'white';
              //maDiv2S.style.color = 'darkslateblue';
            }
            let creneau = this.getCreneau(j, ks, i);
            let day = this.getSwapDay(j, k, i);
            this.onClickColor(creneau, i, j, k, day);
            this.setCreneau(creneau, i, j, k, day);
          }
        }
      this.weekSelected = -1;
      }
    } else {
      let id = 'week' + k + this.Z;
      const maDiv = document.getElementById(id);
      if ( maDiv != null ) {
        maDiv.style.backgroundColor = '#90a0c4';
        maDiv.style.color = 'white';
      }
      if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
        for(let j = 0; j< this.equipe.collaborateursId.length; j++) {
          for(let i = 0; i<7; i++ ) {
            let id2 = 'drag' + j + k + i + this.Z;
            const maDiv2 = document.getElementById(id2);
            if ( maDiv2 != null ) {
              maDiv2.style.backgroundColor = '#90a0c4';
              //maDiv2.style.color = 'white';
            } 
          }
        }
      this.weekSelected = k;
      }
    }
  }

  /** Gestion des contraintes sur 2 ou 3 creneaux */
  /**
   * L'idée c'est que à chaque fois qu'on modifie un créneau (onClickColor(creneau, i, j, k, day)), 
   * ça peut avoir un impact sur les deux créneaux avant ou après.
   * On a une liste de 5 créneaux [0,1,2,3,4].
   * Le créneau modifié est le 2.
   * On regarde les contraintes de 3 à partir de 0,1,2.
   * On regarde les contraintes de 2 à partir de 1,2.
   * Le problème c'est que s'il est bleu, il devient orange ou rouge, il entraine les créneaux avec lui.
   * S'il rétrograde, il faut vérifier qu'il n'y a pas d'autres contraintes sur les autres créneaux qui les empêches de rétrograder.
   * C'est-à-dire, [0,1,2,3, 4 ,5,6,7,8]
   * On ne peut changer que la couleur de [2,3, 4 ,5,6]
   * 
   * Une fonction récupère les 9 créneaux
   * On ne peut pas changer la couleur de [0,1,  ,7,8]
   * C'est comme si [2,3,4,5,6] étaient verts et on les change si on voit qu'il y a un problème.
   * Une fonction 2 vérifie s'il y a des contraintes sur 2 créneaux.
   * Une fonction 3 vérifie s'il y a des contraintes sur 3 créneaux.
   * Une fonction fait passer les fonctions 2 et 3 sur la séquence de créneaux.
   * Dans l'ordre :
   * 6 f3, 6 f2 (si non rouge), 5 f3, 5 f2...
   * 
   * 
   * Pour 0 et 1, si les créneaux sont rouges, on n'y touche pas.
   * S'ils sont oranges, on les touche que pour les mettre au rouge
   * 
   * On prend la liste de 5 créneaux
   * 
   */

  async verifContrainteList(creneau: string, i: number, j: number, k: number, day: Date) {
    let CList = ["","","","", this.getCreneau(j,k,i)[0], "", "", "", ""];
    let coordonneesList = [[8,8],[8,8],[8,8],[8,8],[k,i],[8,8],[8,8],[8,8],[8,8]];
    let couleurList = ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'];
    let currentDay = new Date(day);
    let pos = 5 ; // position dans la liste CList;

    // Remplissage des creneaux suivant le nouveau creneau
    for(let l=0; l+i+1<7 && l+5<9; l++) {
      pos += 1;

      let shift = this.getCreneau(j,k,i+l+1)[0];
      if (shift.length > 0) {
        CList[5+l] = shift;
        coordonneesList[5+l] = [k, i+l+1];
      } else {
        CList[5+l] = "-";
      }
    }
    if ( CList[8].length === 0 && k<(this.weekNumber-1) ) {
      for(let l=0; 11-i+l<9; l++) {
        let shift = this.getCreneau(j,k+1,l)[0];
        if (shift.length > 0) {
          CList[11-i+l] = shift;
          coordonneesList[11-i+l] = [k+1, l];
        } else {
          CList[11-i+l] = "-";
        }
      }
    } else if ( CList[8].length === 0 ) {
      for (let index= pos; index < 9; index++) {  
        currentDay.setDate(day.getDate() + index-4);
        if (currentDay.getMonth() != day.getMonth() ) {  // Pour les erreurs de javascript au changement de mois
          currentDay.setMonth(day.getMonth() + 1);
        }

        if (this.equipe != undefined && this.equipe.collaborateursId != undefined) {
          let newCreneau = await this.getCreneauOut(this.dateFormat(currentDay), parseInt(this.equipe.collaborateursId[j])); // jour, this.userId, collaborateurId this.equipeId this.equipe.collaborateurId[j]
          if (typeof newCreneau === 'string') {
            CList[index] = newCreneau.toString();
          }  
        }
      }
    }
    
    // Remplissage des creneaux precedant le nouveau creneau
    pos = 3;
    for(let l=3; i-3+l>0 && l>-1; l--) {
      pos--
      let shift = this.getCreneau(j,k,i-4+l)[0];
      if (shift.length > 0) {
        CList[l] = shift;
        coordonneesList[l] = [k, i-4+l];
      } else {
        CList[l] = "-";
      }
    }
    if ( CList[0].length === 0 && 0<k ) {
      for(let l=6; l-i-2>0 && l>0; l--) {
        let shift = this.getCreneau(j,k-1,l)[0];
        if (shift.length > 0) {
          CList[-3-i+l] = shift;
          coordonneesList[3-i+l] = [k, l];
        } else {
          CList[-3-i+l] = "-";
        }
      }
    } else if ( CList[0].length === 0) {
      for (let index= pos; index >-1; index--) {  
        currentDay.setDate(day.getDate() + index-4);
        if (currentDay.getMonth() != day.getMonth() ) {  // Pour les erreurs de javascript au changement de mois
          currentDay.setMonth(day.getMonth() + 1);
        }

        if (this.equipe != undefined && this.equipe.collaborateursId != undefined) {
          let newCreneau = await this.getCreneauOut(this.dateFormat(currentDay), parseInt(this.equipe.collaborateursId[j])); // jour, this.userId, collaborateurId this.equipeId this.equipe.collaborateurId[j]
          if (typeof newCreneau === 'string') {
            CList[index] = newCreneau.toString();
          }  
        }
      }
    }
    this.verif(CList, couleurList);
    this.setColors(couleurList, coordonneesList, j);
  }

  // Fonction pour récupérer les jours hors du calendrier apparent sur l'écran
  async getCreneauOut(jour: string, collabId: number ) {
    return new Promise ((resolve, reject) => {
      this.planningService.find(this.userId, jour, this.equipeId, collabId).subscribe(
        (res)  => {
          let jourPlanning = JSON.parse(JSON.stringify(res));
          let creneau = "";
          if (jourPlanning.length != 0 ) {
            let jourSimplifie = JSON.parse(JSON.stringify(res).slice(1,-1));
            creneau = jourSimplifie['creneau'].toString().split(",")[0];
          }
          resolve(creneau);
          },
          (error) => {
            reject(error);
          }
        );
      });
    }
  

  setColors(couleurList: string[], coordonneesList: number[][], j: number): void {
    for(let i = 2; i < couleurList.length -2; i++ ) {
      if ( coordonneesList[i][0] != 8 ) {
          let id = 'drag' + j + coordonneesList[i][0] + coordonneesList[i][1] + this.Z;
          const maDiv = document.getElementById(id);
          if ( maDiv != null ) {
            maDiv.style.backgroundColor = couleurList[i] //'1px solid rgba(235, 233, 233, 0.8)'; // '3px solid ' + couleurList[i];
          }
      }
    }
  }

  verif(CList: string[], couleurList: string[]): string[] {
    if ( this.equipe != undefined && this.equipe.list2 != undefined ) {
      for(let l=0; l<this.equipe.list2.length; l++) {
        let list2 = JSON.stringify(this.equipe.list2[l]).split('"');
        for( let m=1; m<CList.length-2; m++) {
          if ( list2[3] === CList[m] && list2[7] === CList[m+1] ) {
            console.log(list2)
            if ( list2[10] === ':true}') {
              couleurList[m] = '#ec6a6a';
              couleurList[m+1] = '#ec6a6a';
            } else {
              if (couleurList[m] != '#ec6a6a') {
                couleurList[m] = 'rgb(252, 181, 87)';
              } 
              if (couleurList[m+1] != '#ec6a6a') {
                couleurList[m+1] = 'rgb(252, 181, 87)';
              }
            }
          }
        }
      }
    }

    if ( this.equipe != undefined && this.equipe.list3 != undefined ) {
      for(let l=0; l<this.equipe.list3.length; l++) {
        let list3 = JSON.stringify(this.equipe.list3[l]).split('"');
        for( let m=0; m<CList.length-2; m++) {
          if ( list3[3] === CList[m] && list3[7] === CList[m+1] && list3[11] === CList[m+2] ) {
            console.log(list3)
            if ( list3[14] === ':true}') {
              couleurList[m] = '#ec6a6a';
              couleurList[m+1] = '#ec6a6a';
              couleurList[m+2] = '#ec6a6a';
            } else {
              if (couleurList[m] != '#ec6a6a') {
                couleurList[m] = 'rgb(252, 181, 87)';
              } 
              if (couleurList[m+1] != '#ec6a6a') {
                couleurList[m+1] = 'rgb(252, 181, 87)';
              }
              if (couleurList[m+2] != '#ec6a6a') {
                couleurList[m+2] = 'rgb(252, 181, 87)';
              }
            }
          }
        }
      }
    }
    return couleurList
  }

  /** Fonction pour l'aspect */
  giveDay(date: Date): string {
    let days = [ 'Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    return days[date.getDay()]
  }

  giveDate(date: Date): string {
    let day = date.getDate().toString();
    let monthInt = date.getMonth() + 1;
    let month = monthInt.toString();
    if (day.length === 1 ) {
      day = '0'+day;
    }
    if (month.length === 1 ) {
      month = '0'+month;
    }
    return day+'/'+month
  }

  lock(j: number, k: number, i: number): void {
    let daysList = this.findDaysList(k);
    
    if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
      let currentLock = daysList.value[i * this.equipe.collaborateursId.length + j]['locked'];
      if (currentLock) {

        let id = 'lock' + j + k + i + this.Z;
        const maDiv = document.getElementById(id);
        if ( maDiv != null ) {
        maDiv.style.color = '#e7e8ea';
        }
      daysList.value[i * this.equipe.collaborateursId.length + j]['locked'] = false;
      this.calendrierArray[k].patchValue({
        days: daysList.value,
      });
      } else {
        let id = 'lock' + j + k + i + this.Z;
        const maDiv = document.getElementById(id);
        if ( maDiv != null ) {
        maDiv.style.color = 'darkslateblue';
        }
        daysList.value[i * this.equipe.collaborateursId.length + j]['locked'] = true;

        this.calendrierArray[k].patchValue({
          days: daysList.value,
        });
      }
    }
  }

}
