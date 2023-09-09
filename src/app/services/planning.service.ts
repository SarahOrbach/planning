import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { User } from "../models/user";
import { Planning } from '../models/planning';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private url = "http://162.19.25.189:3333/planning";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders ({ "Content-Type": "application/json"}),
  }

  constructor(private http: HttpClient,
    private errorHandlerService: ErrorHandlerService,
    ) { }

  /*  fetchAll(userId: Pick<User, "id">): Observable<Planning[]> {
      return this.http
        .get<Planning[]>(`${this.url}/${userId}`, { responseType: "json" })
        .pipe(
          catchError(this.errorHandlerService.handleError<Planning[]>("fetchAll", []))
      )
    }
  
    fetch(userId: Pick<User, "id">, date: Date): Observable<Planning> {
      return this.http
        .get<Planning>(`${this.url}/${userId}/${date}`, { responseType: "json" })
        .pipe(
          catchError(this.errorHandlerService.handleError<Planning>("fetch"))
      )
    }*/

    find(userId: Pick<User, "id">, date: string, equipeId: number, collaborateurId: number): Observable<Planning> {
      return this.http
        .get<Planning>(`${this.url}/${date}/${userId}/${equipeId}/${collaborateurId}`, { responseType: "json" })
        .pipe(
          catchError(this.errorHandlerService.handleError<Planning>("fetch"))
      )
    }

    createPlanning(date: string, equipeId: number, locked: boolean, collaborateurId: number, creneau: string[], userId: Pick<User, "id">): Observable<Planning> {
      let lockedValue = 0;
      if (locked ) {
        lockedValue = 1;
      }
      return this.http
        .post<Planning>(`${this.url}`, { date: date, user: userId, equipeId: equipeId, locked: lockedValue, collaborateurId: collaborateurId, creneau: creneau }, this.httpOptions)
        .pipe(
          catchError(this.errorHandlerService.handleError<Planning>("createPlanning"))
      );
    }
  
    updatePlanning(planningId: number, locked: boolean, creneau: string[]): Observable<Planning> {
      //let creneau = JSON.stringify(formData.creneau);
      let lockedValue = 0;
      if (locked ) {
        lockedValue = 1;
      }
      return this.http
        .put<Planning>(`${this.url}`, { id: planningId, locked: lockedValue, creneau: creneau }, this.httpOptions)
        .pipe(
          catchError(this.errorHandlerService.handleError<Planning>("createPlanning"))
      );
    }

  
    deletePlanning(equipeId: number): Observable<{}> {
      console.log('deletePlanning');
      return this.http.delete<Planning>(`${this.url}/${equipeId}`, this.httpOptions).pipe(
        catchError(this.errorHandlerService.handleError<Planning>("deletePlanning"))
      )
    }
}
