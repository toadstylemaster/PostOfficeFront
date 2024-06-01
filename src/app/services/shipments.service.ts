import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IBag, IBagWithLetters, IBagWithParcels } from './bags.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface IShipment{
  id?: string;
  shipmentNumber?: string;
  airport?: string;
  flightNumber?: string;
  flightDate?: Date;
  listOfBags?: IBag[];
  isFinalized?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class ShipmentsService {

  private apiUrl: string = 'https://localhost:7212/api/v1/shipments';
  private bagWithParcelsUrl: string = 'https://localhost:7212/api/v1/bagwithparcels';
  private bagWithLettersUrl: string = 'https://localhost:7212/api/v1/bagwithletters';


  constructor(private http: HttpClient) { }

  getAllShipments(): Observable<IShipment[]>{
    console.log("getAll");
    return this.http.get<IShipment[]>(this.apiUrl, { headers: { 'Content-Type': 'application/json' }});
  }

  getShipmentById(id: string){
    return this.http.get(this.apiUrl + `/${id}`, { headers: { 'Content-Type': 'application/json' }});
  }

  getBagWithLettersByShipmentId(shipmentId: string): Observable<IBagWithLetters[]>{
    return this.http.get<IBagWithLetters[]>(this.bagWithLettersUrl + `/Bags/byShipments?shipmentId=${shipmentId}`, { headers: { 'Content-Type': 'application/json' }});
  }

  getBagWithParcelsByShipmentId(shipmentId: string): Observable<IBagWithParcels[]>{
    return this.http.get<IBagWithParcels[]>(this.bagWithParcelsUrl + `/Bags/byShipments?shipmentId=${shipmentId}`, { headers: { 'Content-Type': 'application/json' }});
  }

  createShipment(shipment: IShipment): Observable<any | HttpErrorResponse>{
    return this.http.post(this.apiUrl, shipment, { headers: { 'Content-Type': 'application/json' }}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('An error occurred:', error.error);
        return of(error);
      })
    );
  }

  finalizeShipment(id: string): void {
    console.log(id);
    this.http.put(this.apiUrl + `/finalize/${id}`, "", { headers: { 'Content-Type': 'application/json' }}).subscribe(
      response => {
        console.log('Update is successful ', response);
      },
      error => {
        console.log('Error', error);
      }
    );
  }

  deleteShipment(shipmentId: string): void {
    this.http.delete(this.apiUrl + `/${shipmentId}`, { headers: { 'Content-Type': 'application/json' }}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('An error occurred:', error.error);
        return of(error);
      })
    ).subscribe(() => {
      console.log('Delete request is successful ');
    }, error => {
      console.log('Error', error);
    });
  }
}
