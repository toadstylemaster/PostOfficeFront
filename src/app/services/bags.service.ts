import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface IBag{
  id?: string;
  bagNumber?: string;
  shipmentId?: string;
}

export interface IBagWithLetters extends IBag{
  countOfLetters?: number;
  weight?: number;
  price?: number;
}

export interface IBagWithParcels extends IBag{
  listOfParcels?: IParcel[];
}

export interface IParcel{
  id?: string;
  parcelNumber?: string;
  recipientName?: string;
  destinationCountry?: string;
  weight?: number;
  price?: number;
  bagWithParcelsId?: string;
}
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BagsService {
  private bagWithLettersUrl: string = 'https://localhost:7212/api/v1/bagwithletters';
  private bagWithParcelsUrl: string = 'https://localhost:7212/api/v1/bagwithparcels';
  private shipmentsUrl: string = 'https://localhost:7212/api/v1/shipments';
  private bagsUrl: string = 'https://localhost:7212/api/v1/shipments/bags';
  private parcelsUrl: string = 'https://localhost:7212/api/v1/parcels';
  

  constructor(private http: HttpClient) { }

  getBagNumbers(): Observable<IBag[]> {
    return this.http.get<IBag[]>(this.bagsUrl + "/getbags", { headers: { 'Content-Type': 'application/json' }})
  }

  getAllParcels(): Observable<IParcel[]> {
    return this.http.get<IParcel[]>(this.parcelsUrl, { headers: { 'Content-Type': 'application/json' }});
  }

  postBagWithParcels(bag: IBagWithParcels): Observable<IBagWithParcels | HttpErrorResponse> {
    return this.http.post<IBagWithParcels>(this.bagWithParcelsUrl, bag, { headers: { 'Content-Type': 'application/json' }}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('An error occurred:', error.error);
        if(error.error === "Bag with same bag number already exists!"){
          alert("Bag with the same bag number already exists!")
        }
        return of(error);
      })
    );
  }

  postBagWithLetters(bag: IBagWithLetters): Observable<IBagWithLetters | HttpErrorResponse> {
    return this.http.post<IBagWithLetters>(this.bagWithLettersUrl, bag, { headers: { 'Content-Type': 'application/json' }}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('An error occurred:', error.error);
        if(error.error === "Bag with same bag number already exists!"){
          alert("Bag with the same bag number already exists!")
        }
        return of(error);
      })
    );
  }

  postParcels(parcel: IParcel): Observable<any | HttpErrorResponse> {
    return this.http.post(this.parcelsUrl, parcel, { headers: { 'Content-Type': 'application/json' }}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('An error occurred:', error.error);
        return of(error);
      })
    );
  }

  putBagsToShipment(shipmentId: string, bags: IBag[]): Observable<any | HttpErrorResponse> {
    return this.http.put(this.shipmentsUrl + `/${shipmentId}/Bags`, bags, { headers: { 'Content-Type': 'application/json' }}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('An error occurred:', error.error);
        return of(error);
      })
    );
  }

  putParcesToBag(bagWithParcelsId: string, parcels: IParcel[]): Observable<any | HttpErrorResponse> {
    return this.http.put(this.bagWithParcelsUrl + `/${bagWithParcelsId}/Parcels`, parcels, { headers: { 'Content-Type': 'application/json' }}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('An error occurred:', error.error);
        return of(error);
      })
    );
  }

  deleteBagWithParcels(bagWithParcelsId: string): void {
    this.http.delete(this.bagWithParcelsUrl + `/${bagWithParcelsId}`, { headers: { 'Content-Type': 'application/json' }}).pipe(
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

  deleteBagWithLetters(bagWithLettersId: string): void {
    console.log("Im hereeee!!!!");
    this.http.delete(this.bagWithLettersUrl + `/${bagWithLettersId}`, { headers: { 'Content-Type': 'application/json' }}).pipe(
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

  deleteParcels(parcelsId: string): void {
    this.http.delete(this.parcelsUrl + `/${parcelsId}`, { headers: { 'Content-Type': 'application/json' }}).pipe(
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
