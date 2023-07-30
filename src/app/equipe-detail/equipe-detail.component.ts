import { Component, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, Validators, FormArray, NgForm } from '@angular/forms';
import { Observable, map, of } from 'rxjs';
import { FormGroup, FormBuilder} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from './../services/auth.service';
import { User } from './../models/user';
import { CollaborateurService } from './../services/collaborateur.service';
import { Collaborateur } from './../models/collaborateur';
import { EquipeService } from './../services/equipe.service';
import { Equipe } from './../models/equipe';

@Component({
  selector: 'app-equipe-detail',
  templateUrl: './equipe-detail.component.html',
  styleUrls: ['./equipe-detail.component.scss']
})

export class EquipeDetailComponent {
    equipe!: Equipe;
    equipes$!: Observable<Equipe>;
    public equipeForm!: FormGroup;
    public parametreForm!: FormGroup;
    displayShiftHoraire = true;
    displayCollaborateursAbsent = false;
    //collaborateursNamesList = [''];
    //collaborateursAbsentList = [''];

    @ViewChild("formDirective") formDirective!: NgForm;
    collaborateurs$!: Observable<Collaborateur[]>;
    userId!: Pick<User, "id">;
    collaborateursNamesList = ['']; // List des noms des collaborateurs
    collaborateursIdList = [0]; // List des id des collaborateurs
    collaborateursAbsentList = [''];
    collaborateursAbsentIdList = [0];
    collaborateursPresentList = [''];
    semaine = [1,2,3,4,5,6,0];
  
    colors = [ 'bleu', 'rouge', 'vert', 'jaune', 'gris'];
      
    // Lists des couleurs
    colors1 = [ 'rgb(255,230, 160)', 'rgb(210, 235, 190)', 'rgb(190, 225, 250)'];
    colors2 = [ 'rgb(200, 220, 225)', 'rgb(225, 225, 255)', 'rgb(230, 210, 240)'];
    colors3 = [ 'rgb(15, 125, 80)', 'rgb(15, 90, 190)', 'rgb(35, 95, 110)'];
    colors4 = [ 'rgb(100, 100, 100)'];
  
  
    constructor(
      private router: Router,
      private changeDetectorRef: ChangeDetectorRef,
      private equipeService: EquipeService,
      private collaborateurService: CollaborateurService,
      private authService: AuthService,
      private fb: FormBuilder, 
      private route: ActivatedRoute
      ) {}
  
    ngOnInit() { 
      this.userId = this.authService.userId;
      this.collaborateurs$ = this.collaborateurService.fetchAll(this.userId);
      this.getCollaborateurNames();
      this.getEquipe();

      this.equipeForm = this.fb.group({
        name: ['', Validators.required],
        creneauHours: this.fb.array([]),
        creneauText: this.fb.array([]), 
        collaborateursId: [[""]],
        list2: this.fb.array([]),
        list3: this.fb.array([]),
        contraintesC: this.fb.array([]),
        contraintesH: this.fb.array([]) 
      });


     this.parametreForm = this.fb.group({
        equipe: ['', Validators.required],
        parametresList: [['Total'], Validators.required],
        parametre: this.fb.array([]), 
      });
      
    }

    // Créé la liste des noms des collaborateurs
    private getCollaborateurNames(): void {
      this.collaborateursIdList.pop();
      this.collaborateursNamesList.pop();
      this.collaborateurs$.subscribe(collaborateurs => {
        for (let collab of collaborateurs) {
          this.collaborateursIdList.push(collab['id']);
          this.collaborateursNamesList.push(collab['name']);
        }
      });
      //this.collaborateursNamesList = this.dataService.getCollaborateurNames();
    }
  
    /** Remplissage automatique du formulaire pour la modification d'une équipe */
    private getEquipe(): void {
      const name = String(this.route.snapshot.paramMap.get('name'));
      this.equipes$ = this.fetch(this.userId, parseInt(name));
 
      this.equipes$.subscribe(equipes => {
        this.equipe = JSON.parse(JSON.stringify(equipes).slice(1,-1));
        if ( this.equipe.collaborateursId != undefined) {
          this.equipe.collaborateursId = JSON.parse(this.equipe.collaborateursId.toString());
        }
        if ( this.equipe.creneauHours != undefined) {
          this.equipe.creneauHours = JSON.parse(this.equipe.creneauHours.toString());
        }
        if ( this.equipe.creneauText != undefined) {
          this.equipe.creneauText = JSON.parse(this.equipe.creneauText.toString());
        }
        if ( this.equipe.list2 != undefined) {
          this.equipe.list2 = JSON.parse(this.equipe.list2.toString());
        }
        if ( this.equipe.list3 != undefined) {
          this.equipe.list3 = JSON.parse(this.equipe.list3.toString());
        }
        this.setData(this.equipe);
        this.setCollaborateurs();
      });
    }

    fetch(userId: Pick<User, "id">, equipeId: number): Observable<Equipe> {
      return this.equipeService.fetch(userId, equipeId);
    }
  
    private setData(equipe: Equipe): void {
      if ( equipe.creneauHours ) {    
        for (let i = 0; i < equipe.creneauHours.length; i++) {
          this.addCreneauHours();
      }}
  
      if ( equipe.creneauText ) {    
        for (let i = 0; i < equipe.creneauText.length; i++) {
          this.addCreneauText();
      }}
  
      if ( equipe.list2 ) {    
        for (let i = 0; i < equipe.list2.length; i++) {
          this.addDeux();
      }}
  
      if ( equipe.list3 ) {    
        for (let i = 0; i < equipe.list3.length; i++) {
          this.addTrois();
      }};

      if ( equipe.contraintesC ) {    
        let contrainteC = JSON.parse(equipe.contraintesC.toString());
        for (let i = 0; i < contrainteC.length; i++) {
          this.addContrainteCollaborateur(contrainteC[i]['creneau']);
      }
        this.equipeForm.patchValue({
          contraintesC: contrainteC,
        });
    };

    if ( equipe.contraintesH ) {    
      let contrainteH = JSON.parse(equipe.contraintesH.toString());
      for (let i = 0; i < contrainteH.length; i++) {
        this.addContrainteH(contrainteH[i]['horaire']);
    }
      this.equipeForm.patchValue({
        contraintesH: contrainteH,
      });
  };
  
      this.equipeForm.patchValue({
        name: equipe.name,
        creneauHours: equipe.creneauHours,
        creneauText: equipe.creneauText, 
        collaborateursId: equipe.collaborateursId,
        list2: equipe.list2,
        list3: equipe.list3,
       // contraintesC: contraintesC,
        //contraintesH: equipe.contraintesH,
      });
      this.colorInitCreneau();
    }


    /** Remplissage des collaborateurs */
    setCollaborateurs(): void  {
      this.collaborateursAbsentList = [];
      this.collaborateursAbsentIdList = [];
      this.collaborateursPresentList = [];
      for (let j = 0; j < this.collaborateursNamesList.length; j++) {
        let absent = true;
        for (let i = 0; i < this.equipeForm.get('collaborateursId')?.value.length; i++) {
          if ( parseInt(this.equipeForm.get('collaborateursId')?.value[i]) === this.collaborateursIdList[j] ) {
            absent = false;
          }
        }
        if (absent) {
          this.collaborateursAbsentList.push(this.collaborateursNamesList[j]);
          this.collaborateursAbsentIdList.push(this.collaborateursIdList[j]);
        } else {
          this.collaborateursPresentList.push(this.collaborateursNamesList[j]);
        }
      }
    }
    
    checkedChange($event: boolean, id: number): void {
      if ($event) {
        if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
          this.equipe.collaborateursId.push(id.toString());
          this.equipeForm.patchValue({
            collaborateursId: this.equipe.collaborateursId,
          })
        } else {
          this.equipeForm.patchValue({
            collaborateursId: [id.toString()],
          })
        }

      } else {
        if ( this.equipe != undefined && this.equipe.collaborateursId != undefined ) {
          let newCollaborateurs = [""];
          for (let i = 0; i < this.equipe.collaborateursId.length; i++) {
            if ( this.equipe.collaborateursId[i] != id.toString() ) {
              newCollaborateurs.push(this.equipe.collaborateursId[i]);
            }
          }
          newCollaborateurs.shift();
          this.equipe.collaborateursId = newCollaborateurs;
          this.equipeForm.patchValue({
            collaborateursId: this.equipe.collaborateursId,
          })
        }

      }
      this.setCollaborateurs();
    }

    changeOrder(direction: string, i: number): void {
      let list = this.equipeForm?.get('collaborateursId')?.value;
      let memo = list[i];
      if (direction === "up") {
        let memo1 = list[i-1];
        delete list[i];
        list[i] = memo1;
        delete list [i-1];
        list[i-1] = memo;
      } else if (direction === "down") {
        let memo1 = list[i+1];
        delete list[i];
        list[i] = memo1;
        delete list [i+1];
        list[i+1] = memo;
      }
    }
  
    
    /** Ajout de l'équipe à la base de données */
    onSubmit(formData: Pick<Equipe, "name" | "creneauHours" | "creneauText" | "collaborateursId" | "list2" | "list3" | "contraintesC" | "contraintesH" | "resume">) : void {
      console.log('submit', this.userId);
      console.log(formData.collaborateursId);

      for( let j = 0; j< this.collaborateursIdList.length; j++ ) {
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
                    } else {
                    equipeList.splice(k, k+1);
                  }
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
      }
      console.log(formData);
      this.equipeService.updateEquipe(formData, this.equipe.id, this.userId).subscribe();
      this.router.navigate(["/planning"]);
    }

    retour(): void {
      this.router.navigate(["/planning"]);
    }


    private createContraintesEntGroup(jour: number, horaire: string, value: string = '0'): FormGroup {
      return this.fb.group({
        jour: [jour, Validators.required],
        horaire: [horaire, Validators.required],
        valeur: [value, Validators.required],
      })
    }

    public get contrainteEntList(): FormArray {
      return <FormArray>this.equipeForm.get('contraintesH');
    }

    public get horaireContrainteList(): string[] {
      let list = [];
        for (let i=0; i < this.contrainteEntList.length; i++) {
        let creneau = this.contrainteEntList.value[i]['horaire'];
        if (creneau.length === 5 && creneau.indexOf(":") === 2) {
          let absent = true;
          for (let j=0; j < list.length; j++) {
            if (list[j] === creneau) {
              absent = false;
            }
          }
          if (absent) {
            list.push(creneau);
          }
        } 
    
      }

      return list;
    }

    public get creneauxContrainteList(): string[] {
      let list = [];
      for (let i=0; i < this.contrainteEntList.length; i++) {
        let creneau = this.contrainteEntList.value[i]['horaire'];
        if (creneau.length != 5 || creneau.indexOf(":") != 2) {
          let absent = true;
          for (let j=0; j < list.length; j++) {
            if (list[j] === creneau) {
              absent = false;
            }
          }
          if (absent) {
            list.push(creneau);
          }
        }
      }
      return list;
    }

    public addContrainteH(horaire: string): void {
      for (let i =0; i < this.semaine.length; i++) {
        this.contrainteEntList.push(this.createContraintesEntGroup(this.semaine[i], horaire));
      }
    }

    public removeHoraireContrainte(horaire: string): void {
      for (let i= this.contrainteEntList.length -1; -1 < i; i--) {
        if (this.contrainteEntList.value[i]['horaire'] === horaire ) {
          this.contrainteEntList.removeAt(i);
        }
      }
    }

    initialValueHoraire(jour: number, horaire: string): string | undefined {
      for (let i=0; i < this.contrainteEntList.length; i++) {
        if (this.contrainteEntList.value[i]['jour'] === jour && this.contrainteEntList.value[i]['horaire'] === horaire ) {
          return this.contrainteEntList.value[i]['valeur']; 
        }
      }
      return '0'
    }

    setContrainteHoraire(event: Event, jour: number, horaire: string): void {
      const element = event.target;

      if (element instanceof HTMLInputElement) { 
        const valeur = element.value;
        for (let i=0; i < this.contrainteEntList.length; i++) {
          if (this.contrainteEntList.value[i]['jour'] === jour && this.contrainteEntList.value[i]['horaire'] === horaire ) {
            this.contrainteEntList.value[i]['valeur'] = valeur;
          }
        }
      }
    }

    onHoraireAdd(event: Event): void {
      const element = event.target;
  
      if (element instanceof HTMLSelectElement || element instanceof HTMLInputElement ) { 
        const valeur = element.value;
        this.addContrainteH(valeur);
      }
    }




    /** FormArray : contraintes des collaborateurs */
    private createContraintesCollabGroup(cId: string, creneau: string, value: string = '0'): FormGroup {
      return this.fb.group({
        cId: [cId, Validators.required],
        creneau: [creneau, Validators.required],
        valeur: [value, Validators.required],
      })
    }

    public get contrainteCollaborateurList(): FormArray{
      return <FormArray>this.equipeForm.get('contraintesC');
    }

    public get creneauxContrainteCollaborateurList(): string[] {
      let list = [];
      for (let i=0; i < this.contrainteCollaborateurList.length; i++) {
        let creneau = this.contrainteCollaborateurList.value[i]['creneau'];
        let absent = true;
        for (let j=0; j < list.length; j++) {
          if (list[j] === creneau) {
            absent = false;
          }
        }
        if (absent) {
          list.push(creneau);
        }
      }
      return list;
    }

    public addContrainteCollaborateur(creneau: string): void {
      if (this.equipeForm.get('collaborateursId')?.value != undefined ) {
        for (let i =0; i < this.equipeForm.get('collaborateursId')?.value.length; i++) {
          this.contrainteCollaborateurList.push(this.createContraintesCollabGroup(this.equipeForm.get('collaborateursId')?.value[i], creneau));
        }
      } 
    }

    public addContrainteCollaborateurUnique(creneau: string, value: string, cId: string): void {
      this.contrainteCollaborateurList.push(this.createContraintesCollabGroup(cId, creneau, value)); 
    }

    public removeContrainteCollaborateur(creneau: string): void {
      for (let i= this.contrainteCollaborateurList.length -1; -1 < i; i--) {
        if (this.contrainteCollaborateurList.value[i]['creneau'] === creneau ) {
          this.contrainteCollaborateurList.removeAt(i);
        }
      }
    }

    onCreneauAdd(event: Event): void {
      const element = event.target;
  
      if (element instanceof HTMLSelectElement) { 
        const valeur = element.value;
        this.addContrainteCollaborateur(valeur);
      }
    }

    initialValue(cId: string, creneau: string): string | undefined {
      for (let i=0; i < this.contrainteCollaborateurList.length; i++) {
        if (this.contrainteCollaborateurList.value[i]['cId'] === cId && this.contrainteCollaborateurList.value[i]['creneau'] === creneau ) {
          return this.contrainteCollaborateurList.value[i]['valeur']; 
        }
      }
      return '0'
    }

    setContrainte(event: Event, cId: string, creneau: string): void {
      const element = event.target;

      if (element instanceof HTMLInputElement) { 
        const valeur = element.value;
        let notExist = true;
        for (let i=0; i < this.contrainteCollaborateurList.length; i++) {
          if (this.contrainteCollaborateurList.value[i]['cId'] === cId && this.contrainteCollaborateurList.value[i]['creneau'] === creneau ) {
            this.contrainteCollaborateurList.value[i]['valeur'] = valeur;
            notExist = false;
          }
        }
        if (notExist) {
          this.addContrainteCollaborateurUnique(creneau, valeur, cId);
        }
      }
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
        creneau1: ['', Validators.required],
        creneau2: ['', Validators.required],
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

    public get listCreneauxColor(): string[] {
      let list = [];
      let color = "";
      for (let i = 0; i < this.creneauList.controls.length; i++) {
        color = this.creneauList.controls[i].get('cColor')?.value;
        list.push(color)
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
    traducteurCouleur(couleur: string): string {
      let couleurs = [ 'bleu', 'rouge', 'vert', 'jaune', 'gris'];
      let colors = [ 'blue', 'red', 'green', 'yellow', 'gray'];
      for (let i = 0; i < couleurs.length; i++) {
        if (couleurs[i] === couleur) {
          return colors[i]
        }
      }
      return 'gray'
    }
  
  
    onClickColor(couleur: string, i: number, nom: string): void {      
      if (nom === 'cColorT' ) {
        this.colorInit();
        this.onClickColor(couleur, i, 'cBegin');
        this.onClickColor(couleur, i, 'cEnd');
        this.onClickColor(couleur, i, 'cColor');
      } else {
        if ( nom === 'cTextColor' ) {
          this.onClickColor(couleur, i, 'cTextName');
        }
        let monElement = document.getElementById(nom +' + ' + i);
        if (monElement) {
          monElement.style.backgroundColor = this.traducteurCouleur(couleur);
        } 
      }
    }

    traducteurCouleur2(id: number): string {
      let couleur = this.listCreneauxColor[id];
      let couleurs = [ 'bleu', 'rouge', 'vert', 'jaune', 'gris'];
      let colors = [ 'blue', 'red', 'green', 'yellow', 'gray'];
      for (let i = 0; i < couleurs.length; i++) {
        if (couleurs[i] === couleur) {
          return colors[i]
        }
      }
      return 'gray'
    }
  
  
    onClickColor2(id: number, color: string, nom: string): void {
      let monElement = document.getElementById(nom + ' + ' + id);
      if (monElement) {
        monElement.style.backgroundColor = color;
      }
    }
  
    colorInit(): void {
      if (this.equipe != undefined && this.equipe.list2 != undefined ){
        for (let i = 0; i < this.equipe.list2.length; i++) {
          for (let j = 0; j < this.listCreneaux.length; j++) {
            if ( this.deuxList.controls[i].value["creneau1"] === this.listCreneaux[j]) {    
              setTimeout(() => {
                this.onClickColor2(i, this.listColorCreneaux[j], 'cA1');
              }, 1);
            }
            if ( this.deuxList.controls[i].value["creneau2"] === this.listCreneaux[j] ) {       
              setTimeout(() => {
                this.onClickColor2(i, this.listColorCreneaux[j], 'cB1');
              }, 1);
            }
          }
        }
      }
      
      if (this.equipe != undefined && this.equipe.list3 != undefined ) {
        for (let i = 0; i < this.equipe.list3.length; i++) {
          for (let j = 0; j < this.listCreneaux.length; j++) {
            if ( this.troisList.controls[i].value["creneau1"] === this.listCreneaux[j] ) {       
              setTimeout(() => {
                this.onClickColor2(i, this.listColorCreneaux[j], 'cA2');
              }, 1);
            }
            if ( this.troisList.controls[i].value["creneau2"] === this.listCreneaux[j] ) {       
              setTimeout(() => {
                this.onClickColor2(i, this.listColorCreneaux[j], 'cB2');
              }, 1);
            }
            if ( this.troisList.controls[i].value["creneau3"] === this.listCreneaux[j]) {       
              setTimeout(() => {
                this.onClickColor2(i, this.listColorCreneaux[j], 'cC2');
              }, 1);
            }
          }
        }
      } 
    }

    colorInitCreneau(): void {
      if (this.equipe != undefined && this.equipe.creneauHours != undefined ) {
        for (let i = 0; i < this.equipe.creneauHours.length; i++) {
          let couleur = this.creneauList.controls[i].value["cColor"];
          setTimeout(() => {
            this.onClickCouleur(couleur, i, 'cColor');
          }, 1);
          
          setTimeout(() => {
            this.onClickCouleur(couleur, i, 'cBegin');
            this.onClickCouleur(couleur, i, 'cEnd');
            this.cache( i, 'cColor');
          }, 1);
        }
      }

      if (this.equipe != undefined && this.equipe.creneauText != undefined ) {
        for (let i = 0; i < this.equipe.creneauText.length; i++) {
          let couleur = this.creneauTList.controls[i].value["cTextColor"];
          setTimeout(() => {
            this.onClickCouleur(couleur, i, 'cTextColor');
          }, 1);
          setTimeout(() => {
            this.onClickCouleur(couleur, i, 'cTextName');
            this.cache( i, 'cTextColor');
          }, 1);
        }
      }
    }

    /** Affichage de la pallette de couleur */
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

    cache(i: number, nom: string): void {
      let monElement = document.getElementById('table' + nom + i);
      let monElement1 = document.getElementById('icon1' + nom + i);
      let monElement2 = document.getElementById('icon2' + nom + i);
      if (monElement && monElement1 && monElement2) {
          monElement.style.display = 'none';
          monElement1.style.display = 'flex';
          monElement2.style.display = 'none';
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
    if (nom === 'cColorT' ) {
        this.onClickCouleur(color, i, 'cBegin');
        this.onClickCouleur(color, i, 'cEnd');
        this.onClickCouleur(color, i, 'cColor');
      } else {
        if ( nom === 'cTextColor' ) {
          this.onClickCouleur(color, i, 'cTextName');
        }
        let monElement = document.getElementById(nom +' + ' + i);
        let monElement2 = document.getElementById('button'+ nom + i);
        if (monElement) {
          monElement.style.backgroundColor = color;
        }
        if (monElement2) {
          monElement2.style.backgroundColor = color;
        }
        this.display(i, nom);
    
        if (nom === 'cColor' ) {
          let list = this.creneauList.value;  
          list[i]['cColor'] = color;
          this.equipeForm.patchValue({
            creneauHours: list
          });
        } else if (nom === 'cTextColor') {
          let list = this.creneauTList.value;  
          list[i]['cTextColor'] = color;
          this.equipeForm.patchValue({
            creneauText: list
          });
        }
      }
      this.colorInit();
  }

    
}
