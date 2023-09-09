import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { User } from "../models/user";
import { Collaborateur } from './../models/collaborateur';

@Injectable({
  providedIn: 'root'
})

export class CollaborateurService {
  private url = "http://162.19.25.189:3333/ajoutCollaborateur";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders ({ "Content-Type": "application/json"}),
  }

  constructor(private http: HttpClient,
    private errorHandlerService: ErrorHandlerService,
    ) { }

  fetchAll(userId: Pick<User, "id">): Observable<Collaborateur[]> {
    return this.http
      .get<Collaborateur[]>(`${this.url}/${userId}`, { responseType: "json" })
      .pipe(
        catchError(this.errorHandlerService.handleError<Collaborateur[]>("fetchAll", []))
    )
  }

  fetch(userId: Pick<User, "id">, collaborateurId: number): Observable<Collaborateur> {
    return this.http
      .get<Collaborateur>(`${this.url}/${userId}/${collaborateurId}`, { responseType: "json" })
      .pipe(
        catchError(this.errorHandlerService.handleError<Collaborateur>("fetch"))
    )
  }
  
  createCollaborateur(formData: Partial<Collaborateur>, userId: Pick<User, "id">): Observable<Collaborateur> {
    console.log('create');
    return this.http
      .post<Collaborateur>(`${this.url}`, { name: formData.name, user: userId, firstName: formData.firstName, lastName: formData.lastName, idEnt: formData.idEnt, mail: formData.mail, phone: formData.phone, teams: formData.teams, hours: formData.hours, days: formData.days }, this.httpOptions)
      .pipe(
        catchError(this.errorHandlerService.handleError<Collaborateur>("createCollaborateur"))
    );
  }

  updateCollaborateur(formData: Partial<Collaborateur>, collaborateurId: number, userId: Pick<User, "id">): Observable<Collaborateur> {
    console.log('update');
    return this.http
      .put<Collaborateur>(`${this.url}/general`, {id: collaborateurId, name: formData.name, user: userId, firstName: formData.firstName, lastName: formData.lastName, idEnt: formData.idEnt, mail: formData.mail, phone: formData.phone, teams: formData.teams, hours: formData.hours, days: formData.days }, this.httpOptions)
      .pipe(
        catchError(this.errorHandlerService.handleError<Collaborateur>("createCollaborateur"))
    );
  }

  updateEq(equipeList: number[], collaborateurId: number): Observable<Collaborateur> {
    console.log('update Equipe', equipeList, collaborateurId);
    return this.http
      .put<Collaborateur>(`${this.url}/eq`, {id: collaborateurId, teams: equipeList}, this.httpOptions)
      .pipe(
        catchError(this.errorHandlerService.handleError<Collaborateur>("createCollaborateur"))
    );
  }

  deleteCollaborateur(collaborateurId: number): Observable<{}> {
    return this.http.delete<Collaborateur>(`${this.url}/${collaborateurId}`, this.httpOptions).pipe(
      catchError(this.errorHandlerService.handleError<Collaborateur>("deleteCollaborateur"))
    )
  }

}
