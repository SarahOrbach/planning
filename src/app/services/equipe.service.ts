import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { User } from "../models/user";
import { Equipe } from './../models/equipe';


@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  private url = "http://127.0.0.1:3000/ajoutEquipe";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders ({ "Content-Type": "application/json"}),
  }

  constructor(private http: HttpClient,
    private errorHandlerService: ErrorHandlerService,
    ) { }

  fetchAll(userId: Pick<User, "id">): Observable<Equipe[]> {
    return this.http
      .get<Equipe[]>(`${this.url}/${userId}`, { responseType: "json" })
      .pipe(
        catchError(this.errorHandlerService.handleError<Equipe[]>("fetchAll", []))
    )
  }

  fetch(userId: Pick<User, "id">, equipeId: number): Observable<Equipe> {
    return this.http
      .get<Equipe>(`${this.url}/${userId}/${equipeId}`, { responseType: "json" })
      .pipe(
        catchError(this.errorHandlerService.handleError<Equipe>("fetch"))
    )
  }
  
  createEquipe(formData: Partial<Equipe>, userId: Pick<User, "id">): Observable<Equipe> {
    //console.log('create');
    //console.log(formData);
    //console.log(formData.creneauHours?.values);
    let collab = JSON.stringify(formData.collaborateursId);
    let text = JSON.stringify(formData.creneauText);
    let hours = JSON.stringify(formData.creneauHours);
    let list2 = JSON.stringify(formData.list2);
    let list3 = JSON.stringify(formData.list3);
    //console.log(formData.creneauText);
    return this.http
      .post<Equipe>(`${this.url}`, { name: formData.name, user: userId, creneauHours: hours, creneauText: text, collaborateursId: collab, list2: list2, list3: list3, contraintesC: formData.contraintesC, contraintesH: formData.contraintesH }, this.httpOptions)
      .pipe(
        catchError(this.errorHandlerService.handleError<Equipe>("createEquipe"))
    );
  }

  updateEquipe(formData: Partial<Equipe>, equipeId: number, userId: Pick<User, "id">): Observable<Equipe> {

    //console.log(formData);
    //console.log(formData.creneauHours?.values);
    let collab = JSON.stringify(formData.collaborateursId);
    let text = JSON.stringify(formData.creneauText);
    let hours = JSON.stringify(formData.creneauHours);
    let list2 = JSON.stringify(formData.list2);
    let list3 = JSON.stringify(formData.list3);
    let contraintesC = JSON.stringify(formData.contraintesC);
    let contraintesH = JSON.stringify(formData.contraintesH);
    //console.log(formData.creneauText);
    return this.http
      .put<Equipe>(`${this.url}/general`, { id: equipeId, name: formData.name, user: userId, creneauHours: hours, creneauText: text, collaborateursId: collab, list2: list2, list3: list3, contraintesC: contraintesC, contraintesH: contraintesH }, this.httpOptions)
      .pipe(
        catchError(this.errorHandlerService.handleError<Equipe>("createEquipe"))
    );
  }

  updateCollab(collaborateurList: number[], equipeId: number): Observable<Equipe> {
    console.log('update Collab');
    return this.http
      .put<Equipe>(`${this.url}/collab`, {id: equipeId, collaborateursId: collaborateurList}, this.httpOptions)
      .pipe(
        catchError(this.errorHandlerService.handleError<Equipe>("createCollaborateur"))
    );
  }

  deleteEquipe(equipeId: number): Observable<{}> {
    console.log('deleteEquipe');
    return this.http.delete<Equipe>(`${this.url}/${equipeId}`, this.httpOptions).pipe(
      catchError(this.errorHandlerService.handleError<Equipe>("deleteEquipe"))
    )
  }
}
