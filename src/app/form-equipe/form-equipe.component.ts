import { Component, ViewChild, Input } from '@angular/core';

import { AbstractControl, Validators, FormArray } from '@angular/forms';
import { Observable, map, of } from 'rxjs';
import { FormGroup, FormBuilder} from '@angular/forms';
import { NgForm } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from './../services/auth.service';
import { User } from './../models/user';
import { CollaborateurService } from './../services/collaborateur.service';
import { Collaborateur } from './../models/collaborateur';
import { EquipeService } from './../services/equipe.service';
import { Equipe } from './../models/equipe';


@Component({
  selector: 'app-form-equipe',
  templateUrl: './form-equipe.component.html',
  styleUrls: ['./form-equipe.component.scss']
})

export class FormEquipeComponent {
  @ViewChild("formDirective") formDirective!: NgForm;
  public equipeForm!: FormGroup;

  collaborateurs$!: Observable<Collaborateur[]>;
  userId!: Pick<User, "id">;

  collaborateursNamesList = ['']; // List des noms des collaborateurs
  collaborateursIdList = [0]; // List des noms des collaborateurs
  // Lists des couleurs
  colors1 = [ 'rgb(255,230, 160)', 'rgb(210, 235, 190)', 'rgb(190, 225, 250)'];
  colors2 = [ 'rgb(200, 220, 225)', 'rgb(225, 225, 255)', 'rgb(230, 210, 240)'];
  colors3 = [ 'rgb(15, 125, 80)', 'rgb(15, 90, 190)', 'rgb(35, 95, 110)'];
  colors4 = [ 'rgb(100, 100, 100)'];

  // Creneaux d'exemple à l'initialisation 
  exemple = [
    {
        cTextName: 'Repos',
        cTextColor: 'rgb(225, 225, 255)',
        cTextHours: '00:00',
        V: true
    },
    {
        cTextName: 'Formation',
        cTextColor: 'rgb(200, 220, 225)',
        cTextHours: '07:00',
        V: true
    }
];

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
    this.collaborateurs$ = this.fetchAll(this.userId);
    this.getCollaborateurNames();
    
    this.equipeForm = this.fb.group({
      name: ['', Validators.required],
      creneauHours: this.fb.array([]),
      creneauText: this.fb.array([]), 
      collaborateursId: [[""]],
      list2: this.fb.array([]),
      list3: this.fb.array([]),
      contraintesC: [''],
      contraintesH: [''],
      resume: ['']
    });

    // Creation de creneau text d'exemple
    this.addCreneauText();
    this.addCreneauText();
    this.equipeForm.patchValue({
      creneauText: this.exemple, 
    });

    setTimeout(() => {
      this.setCouleurInit(this.exemple[0]['cTextColor'], 0);
      this.setCouleurInit(this.exemple[1]['cTextColor'], 1);
    }, 1);
  }
  
  /** Ajout de l'équipe à la base de données */
  onSubmit(formData: Pick<Equipe, "name" | "creneauHours" | "creneauText" | "collaborateursId" | "list2" | "list3" | "contraintesC" | "contraintesH" | "resume">) : void {
    console.log('submit', this.userId);

    /*for( let j = 0; j< this.collaborateursIdList.length; j++ ) {
      console.log('try add equipe')
      this.collaborateurService.fetch(this.userId, this.collaborateursIdList[j]).subscribe(
        collab => {
          let equipeList =JSON.parse(JSON.stringify(collab).slice(1,-1)).teams.slice(1, -1).split(",");
          let collabId = JSON.parse(JSON.stringify(collab).slice(1,-1)).id;
          if(formData.collaborateursId != undefined) {
            let present = false; 
            for( let i = 0; i< formData.collaborateursId.length; i++ ) {
              if (parseInt(formData.collaborateursId[i]) === collabId) {
                present = true;
              }
            } 
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

            if (actualPresent != present) {
              if (actualPresent) {
                equipeList.splice(position, position+1);
              } else if (present) {
                equipeList.push(this.equipe.id)
              }
              this.collaborateurService.updateEq(equipeList,collabId).subscribe();
            }
          }
        }
      )
  }*/

    console.log(formData);
    this.equipeService.createEquipe(formData, this.userId).subscribe(res => {
      let equipeId = JSON.parse(JSON.stringify(res))['message'][0]['insertId'];
      if (formData.collaborateursId != undefined ) {
        for( let j = 0; j< formData.collaborateursId.length; j++ ) {
          this.collaborateurService.fetch(this.userId, parseInt(formData.collaborateursId[j])).subscribe(
            collaborateur => {
              let equipeList =JSON.parse(JSON.stringify(collaborateur).slice(1,-1)).teams.slice(1, -1).split(",");
              let collaborateurId = JSON.parse(JSON.stringify(collaborateur).slice(1,-1)).id;
              console.log('equipeList', equipeList);
                if (equipeList[0] === '""' || equipeList.length === 0) {
                  equipeList = [equipeId];
                } else {
                  for( let k = 0; k< equipeList.length; k++ ) {
                    if (equipeList[0] != '""' || equipeList.length != 0) {
                      equipeList[k] = parseInt(equipeList[k].slice(1, -1));
                    }
                  } 
                equipeList.push(equipeId);         
              }
            this.collaborateurService.updateEq(equipeList, collaborateurId).subscribe();
          }
        )
      }
    }
    });
    this.equipeForm.reset();
    this.formDirective.resetForm();
    this.router.navigate(["/planning"]);
  }

  afficher(): boolean {
    return window.location.href.indexOf('detail') === -1 && window.location.href.indexOf('collaborateur') === -1 
    && window.location.href.indexOf('auth') === -1 && window.location.href.indexOf('login') === -1
    && window.location.href.indexOf('signup') === -1 && window.location.href.indexOf('planning') === -1
  }

  // Créé la liste de collaborateurs
  fetchAll(userId: Pick<User, "id">): Observable<Collaborateur[]> {
    return this.collaborateurService.fetchAll(userId);
  }

  private getCollaborateurNames() {
    this.collaborateursIdList.pop();
    this.collaborateursNamesList.pop();
    this.collaborateurs$.subscribe(collaborateurs => {
      for (let collab of collaborateurs) {
        this.collaborateursIdList.push(collab['id']);
        this.collaborateursNamesList.push(collab['name']);
      }
    });
  }

  /** FormArray : Gestion des éléments groupés des créneaux horaires */
  private createCreneauHoursGroup(): FormGroup {
    return this.fb.group({
      cBegin: ['', Validators.required],
      cEnd: ['', Validators.required],
      cPause: ['0', Validators.required],
      cTime: ['00:00', Validators.pattern("[0-9]{2}:[0-9]{2}")],
      cColor: ['gris'],
      cDescription: [''],
      V: [true] // Visibilité du créneau
    })
  }

  public get creneauList(): FormArray{
    return <FormArray>this.equipeForm.get('creneauHours');
  }

  public addCreneauHours(): void {
    this.creneauList.push(this.createCreneauHoursGroup());
  }

  public removeCreneauHours(i: number): void {
    this.creneauList.removeAt(i);
  }

  /** FormArray : Gestion des éléments groupés des créneaux textes */
  private createCreneauTextGroup(): FormGroup {
    return this.fb.group({
      cTextName: ['', Validators.required],
      cTextColor: ['Gris'],
      cTextHours: ['00:00', Validators.required], 
      tDescription: [''], 
      V: [true] // Visibilité du créneau
      })
  }

  public get creneauTList(): FormArray{
    return <FormArray>this.equipeForm.get('creneauText');
  }

  public addCreneauText(): void {
    this.creneauTList.push(this.createCreneauTextGroup());
  }

  public removeCreneauText(i: number): void {
    this.creneauTList.removeAt(i);
  }

  /** FormArray : Gestion des éléments groupés deux créneaux déconseillés/interdits */
  private createDeuxGroup(): FormGroup {
    return this.fb.group({
      creneau1: ["", Validators.required],
      creneau2: ["", Validators.required],
      interdit: false
      })
  }

  public get deuxList(): FormArray{
    return <FormArray>this.equipeForm.get('list2');
  }

  public addDeux(): void {
    this.deuxList.push(this.createDeuxGroup());
  }

  public removeDeux(i: number): void {
    this.deuxList.removeAt(i);
  }

  /** FormArray : Gestion des éléments groupés trois créneaux déconseillés/interdits */
  private createTroisGroup(): FormGroup {
    return this.fb.group({
      creneau1: ["", Validators.required],
      creneau2: ["", Validators.required],
      creneau3: ["", Validators.required],
      interdit: false
      })
  }

  public get troisList(): FormArray{
    return <FormArray>this.equipeForm.get('list3');
  }

  public addTrois(): void {
    this.troisList.push(this.createTroisGroup());
  }

  public removeTrois(i: number): void {
    this.troisList.removeAt(i);
  }

  /** List des creneaux disponibles */
  public get listCreneaux(): string[] {
    let list = [];
    let begin = "";
    let end = "";
    for (let i = 0; i < this.creneauList.controls.length; i++) {
      begin = this.creneauList.controls[i].get('cBegin')?.value;
      end = this.creneauList.controls[i].get('cEnd')?.value;
      list.push(begin + ' ' + end);
    }
    for (let i = 0; i < this.creneauTList.controls.length; i++) {
      let name = this.creneauTList.controls[i].get('cTextName')?.value;
      list.push(name);
    }
    return list
  }

  public get listColorCreneaux(): string[] {
    let list = [];
    for (let i = 0; i < this.creneauList.controls.length; i++) {
      list.push(this.creneauList.controls[i].get('cColor')?.value);
    }
    for (let i = 0; i < this.creneauTList.controls.length; i++) {
      list.push(this.creneauTList.controls[i].get('cTextColor')?.value);
    }
    return list
  }

  /** Gestion des messages d'erreur */
  public getControls(creneau: AbstractControl<any, any>, index: string): boolean {
    let path = creneau.get(index);
    return (path?.touched && !path?.valid) || false
  }

  public errorMsgTemps: string = '';

  /** Function and variables for cTextName / Nom du créneau */
  absences: string[] = [ 'Repos', 'Congé', 'Formation'];
  filteredAbsences$: Observable<string[]> | undefined;

  @ViewChild('autoInput') input: { nativeElement: { value: string; }; } | undefined;
  
  ngOninit() {
    this.absences = [ 'Repos', 'Congé', 'Formation'];
    this.filteredAbsences$ = of(this.absences);
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.absences.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
  }

  getFilteredOptions(value: string): Observable<string[]> {
    return of(value).pipe(
      map((filterString: string) => this.filter(filterString)),
    );
  }

  onChange() {
    if (this.input !== undefined) {
    this.filteredAbsences$ = this.getFilteredOptions(this.input.nativeElement.value);
  }
}

  onSelectionChange($event: string) {
    this.filteredAbsences$ = this.getFilteredOptions($event);
  }

  /** Function to go to the next time form */
  entier = 0;
  public checkAndMoveToNextField(currentField: any, index: string, nextFieldId: string): void {
    if (currentField.value[index] !== '' && this.entier >=3) {
    var nextField = document.getElementById(nextFieldId);
    if (nextField !== null) {
      nextField.focus();
      this.entier = 0;
      }
    } else {this.entier +=1;}
  }

  /** Function to calculate the work time */
  public calcul(i: number, Pause: string, End: any, Begin: any): string {
    if (Begin === null || End === null || Pause === null) {
      return ''
    }
    let hPause = 0;
    let mPause = parseInt(Pause);
    while (mPause > 59) {
      mPause -= 60
      hPause++
    }

    let hBegin = parseInt(Begin.slice(0,2));
    let hEnd = parseInt(End.slice(0,2));
    let mBegin = parseInt(Begin.slice(3,5));
    let mEnd = parseInt(End.slice(3,5));
    if (hEnd <hBegin || (hBegin === hEnd && mEnd < mBegin )) {
      hEnd +=24;
    }
    let hTotal = hEnd-hBegin-hPause;
    let mTotal = mEnd-mBegin-mPause;
    if (mTotal < 0) {
      hTotal -=1;
      mTotal = 60+mTotal;
    }
    let stringMTotal = '';
    let stringHTotal = '';
    if (mTotal < 0 || hTotal < 0) {
      this.errorMsgTemps = "Veuillez vérifier le début, la fin et le temps de pause de créneau.";
      return 'Temps invalide'
    } else {
      this.errorMsgTemps = ""
    }
    if (mTotal < 10) {
      stringMTotal = '0'+mTotal.toString();
    } else {
      stringMTotal = mTotal.toString();
    }

    if (hTotal < 10) {
      stringHTotal = '0'+hTotal.toString();
    } else {
      stringHTotal = hTotal.toString();
    }

    this.creneauList.controls[i].patchValue({
      cTime: stringHTotal+':'+stringMTotal,
    });

    return stringHTotal+':'+stringMTotal
  }

  /** Fonction pour afficher les bonnes couleurs pour le formulaire de couleur */
  setCouleurInit(color: string, i: number): void {
    let monElement = document.getElementById('buttoncTextColor' + i);
    if (monElement) {
      monElement.style.backgroundColor = color;
    }
  }

  setCouleur(l: number, id: number): string {
    let couleur= 'blue';
    if (l === 1) {
      couleur = 'green';
    } else if (l === 2) {
      couleur = 'yellow';
    }
        return couleur+id
  }

  onClickCouleur(color: string, i: number, nom: string): void {
    let monElement = document.getElementById(nom +' + ' + i);
    let monElement2 = document.getElementById('button'+ nom + i);
    if (monElement && monElement2) {
      monElement.style.backgroundColor = color;
      monElement2.style.backgroundColor = color;
    }
    this.display(i, nom);

    if (nom === 'cColor' ) {
      let list = this.creneauList?.value;  
      list[i]['cColor'] = color;
      this.equipeForm.patchValue({
        creneauHours: list
      });
    } else if (nom === 'cTextColor') {
      let list = this.creneauTList?.value;  
      list[i]['cTextColor'] = color;
      this.equipeForm.patchValue({
        creneauText: list
      });
    }
    this.colorUpdate();
  }

  onSelectCouleur(color: string, i: number, nom: string): void {
    let monElement = document.getElementById(nom +' + ' + i);
    if (monElement) {
      monElement.style.backgroundColor = color;
    }
  }

  display(i: number, nom: string): void {
    let monElement = document.getElementById('table' + nom + i);
    let monElement1 = document.getElementById('icon1' + nom + i);
    let monElement2 = document.getElementById('icon2' + nom + i);
    if (monElement && monElement1 && monElement2) {
      if (monElement.style.display === 'none') {
        monElement.style.display = 'inline'; 
        monElement1.style.display = 'none';
        monElement2.style.display = 'flex';
      } else {
        monElement.style.display = 'none';
        monElement1.style.display = 'flex';
        monElement2.style.display = 'none';
      }
    }
  }

  colorUpdate(): void {
    if (this.equipeForm != undefined && this.equipeForm.get('list2')?.value != undefined ){
      for (let i = 0; i < this.equipeForm.get('list2')?.value.length; i++) {
        for (let j = 0; j < this.listCreneaux.length; j++) {
          if ( this.equipeForm.get('list2')?.value[i]['creneau1'] === this.listCreneaux[j]) {    
            setTimeout(() => {
              this.onSelectCouleur(this.listColorCreneaux[j], i, '21');
            }, 1);
          }
          if ( this.equipeForm.get('list2')?.value[i]['creneau2'] === this.listCreneaux[j]) {       
            setTimeout(() => {
              this.onSelectCouleur(this.listColorCreneaux[j], i, '22');
            }, 1);
          }
        }
      }
    }
    
    if (this.equipeForm != undefined && this.equipeForm.get('list3')?.value != undefined ) {
      for (let i = 0; i < this.equipeForm.get('list3')?.value.length; i++) {
        for (let j = 0; j < this.listCreneaux.length; j++) {
          if ( this.equipeForm.get('list3')?.value[i]['creneau1'] === this.listCreneaux[j] ) {       
            setTimeout(() => {
              this.onSelectCouleur( this.listColorCreneaux[j], i, '31');
            }, 1);
          }
          if ( this.equipeForm.get('list3')?.value[i]['creneau2']=== this.listCreneaux[j]) {       
            setTimeout(() => {
              this.onSelectCouleur( this.listColorCreneaux[j], i, '32');
            }, 1);
          }
          if ( this.equipeForm.get('list3')?.value[i]['creneau3'] === this.listCreneaux[j]) {       
            setTimeout(() => {
              this.onSelectCouleur(this.listColorCreneaux[j], i, '33');
            }, 1);
          }
        }
      }
    } 
  }

}
