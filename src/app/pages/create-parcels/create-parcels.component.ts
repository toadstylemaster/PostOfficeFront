import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ValidatorFn, Validators } from '@angular/forms';
import { BagsService, IBagWithParcels, IParcel } from '../../services/bags.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IShipment, ShipmentsService } from '../../services/shipments.service';

@Component({
  selector: 'app-create-parcels',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-parcels.component.html',
  styleUrl: './create-parcels.component.css'
})
export class CreateParcelsComponent implements OnInit {

  parcelsForm: FormGroup;
  parcel: IParcel = {};
  addedParcels: IParcel[] = [];
  existingParcels: IParcel[] = [];
  shipmentId: string = "";
  bagWithParcelsId: string = "";
  bagWithParcelsList: IBagWithParcels[] = [];

  constructor(private bagsService: BagsService, private shipmentsService: ShipmentsService, private route: ActivatedRoute, private fb: FormBuilder, private router: Router){
    this.parcelsForm = this.parcelsForm = this.fb.group({
      parcelNumber: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[A-Za-z]{2}\d{6}[A-Za-z]{2}$/)]],
      recipientName: ['', [Validators.required, Validators.max(100)]],
      destinationCountry: ['', [Validators.required, Validators.max(2), Validators.min(2), Validators.pattern(/^[A-Z]{2}$/)]],
      weight: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,3})?$/), Validators.min(0)]],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0)]]
    });;
  }


  ngOnInit(): void {
    this.getParcels();
    if(this.route.snapshot.paramMap.get('id') === null || this.route.snapshot.paramMap.get('id') === undefined){
      throw new Error("Shipment id not provided!")
    }else{
      this.shipmentId = this.route.snapshot.paramMap.get('id') as string;
    }
    this.checkIfShipmentFinalized();
    this.getBagsWithParcelsByShipmentId(this.shipmentId);

  }

  checkIfShipmentFinalized(){
    let isFinalized: boolean;
    this.shipmentsService.getShipmentById(this.shipmentId).subscribe((data: IShipment) =>{
      isFinalized = data.isFinalized!;

      if(isFinalized){
        this.router.navigate([`/`]);
        alert("Shipment is already finalized! Cannot add parcels anymore!")
      }
    });
  }

  ngOnDestroy(){
    console.log(this.addedParcels.length);
    if(this.addedParcels.length !== 0){
      this.addedParcels.forEach(p => this.bagsService.deleteParcels(p.id!))
    }
  }

  getParcels(): void {
    this.bagsService.getAllParcels().subscribe((data: IParcel[]) =>{
      this.existingParcels = data;
      this.parcelsForm = this.fb.group({
        parcelNumber: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[A-Za-z]{2}\d{6}[A-Za-z]{2}$/), this.parcelNumberValidator(this.existingParcels)]],
        recipientName: ['', [Validators.required, Validators.max(100)]],
        destinationCountry: ['', [Validators.required, Validators.max(2), Validators.min(2), Validators.pattern(/^[A-Z]{2}$/)]],
        weight: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,3})?$/), Validators.min(0)]],
        price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0)]]
      });
    });
  }
  
  getBagsWithParcelsByShipmentId(shipmentId: string): void {
    this.shipmentsService.getBagWithParcelsByShipmentId(shipmentId).subscribe((data: IParcel[]) =>{
      this.bagWithParcelsList = data;
    });
  }

  createParcels(): void {
    if (this.parcelsForm.valid) {
      this.bagsService.postParcels(this.parcelsForm.value).subscribe(
        (response: IParcel | HttpErrorResponse) => {
          if (response instanceof HttpErrorResponse) {
            console.error('An error occurred:', response.error);
          } else {
            let parcel: IParcel = {
              id: response.id,
              parcelNumber: response.parcelNumber,
              recipientName: response.recipientName,
              destinationCountry: response.destinationCountry,
              weight: response.weight,
              price: response.price,
              bagWithParcelsId: response.bagWithParcelsId
            }
            this.addedParcels.push(parcel);
            this.clearParcelsForm();
            console.log(response.parcelNumber);
          }
        }
      );
    } else {
      console.error('Bag with parcels form is invalid');
    }
  }

  clearParcelsForm(): void {
    (<HTMLFormElement>document.getElementById("parcelsFormId")).reset();
   }

  getParcelNumbers(parcels: any[]): string {
    return parcels.map(parcel => parcel.parcelNumber).join(', ');
  }

  addParcelsToBag(bagWithParcelsId: string, parcels: IParcel[]): void {
    console.log(bagWithParcelsId);
    this.bagsService.putParcesToBag(bagWithParcelsId, parcels).subscribe(response => {
      console.log(response);
    });
    this.clearParcelsForm
  }

  checkIfFieldIsTouched(form: FormGroup<any>, fieldName: string): boolean{
    if(form.get(fieldName) !== null && form.get(fieldName)?.errors !== null  && form.get(fieldName)?.errors?.required && form.get(fieldName)?.touched){
        return true;
    }
    return false;
  }

  checkIfFieldIsValidated(form: FormGroup<any>, fieldName: string): boolean{
    if(form.get(fieldName) !== null && fieldName === "flightDate" && form.get(fieldName)?.errors?.pastDate && form.get(fieldName)?.errors !== null && form.get(fieldName)?.touched){ 
        return true;
    }
    else if(form.get(fieldName) !== null && form.get(fieldName)?.errors?.pattern && form.get(fieldName)?.touched){
        return true;
    }
    return false;
  }

  checkIfNegative(form: FormGroup<any>, fieldName: string): boolean{
    if(form.get(fieldName) !== null && form.get(fieldName)?.errors?.min){
        return true;
    }
    return false;
  }

  checkIfUnique(form: FormGroup<any>, fieldName: string): boolean{
    if(form.get(fieldName) !== null && form.get(fieldName)?.errors?.existingParcelNumber){
        return true;
    }
    return false;
  }

  parcelNumberValidator(existingParcels: IParcel[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const isExistingParcelNumber = (existingParcels.some(parcel => parcel.parcelNumber === control.value) || this.addedParcels.some(parcel => parcel.parcelNumber === control.value));
      return isExistingParcelNumber ? { 'existingParcelNumber': { value: control.value } } : null;
    };
  }

}
