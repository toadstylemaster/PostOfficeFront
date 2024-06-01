import { Component, OnInit } from '@angular/core';
import { BagsService, IBag, IBagWithLetters, IBagWithParcels, IParcel } from '../../services/bags.service';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { IShipment, ShipmentsService } from '../../services/shipments.service';

@Component({
  selector: 'app-bags',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './bags.component.html',
  styleUrl: './bags.component.css'
})
export class BagsComponent implements OnInit{
  bagWithLettersForm: FormGroup;
  bagWithParcelsForm: FormGroup;
  addedBags: IBag[] = [];
  existingBags: IBag[] = [];
  addedBagWithParcels: IBagWithParcels[] = [];
  addedBagWithLetters: IBagWithLetters[] = [];
  shipmentId: string = "";

  constructor(private bagsService: BagsService, private shipmentsService: ShipmentsService, private route: ActivatedRoute, private fb: FormBuilder, private router: Router) {
    this.bagWithLettersForm = this.fb.group({
      bagNumber: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[a-zA-Z0-9]*$/)]],
      countOfLetters: ['', [Validators.required, Validators.min(1)]],
      weight: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,3})?$/), Validators.min(0)]],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0)]]
    });
    this.bagWithParcelsForm = this.fb.group({
      bagNumber: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[a-zA-Z0-9]*$/), this.bagNumberValidator(this.existingBags)]]
    });
   }


  ngOnInit(): void {
    this.getAllBagNumbers();
    console.log(this.existingBags.toString());
    if(this.route.snapshot.paramMap.get('id') === null || this.route.snapshot.paramMap.get('id') === undefined){
      throw new Error("Shipment id not provided!")
    }else{
      this.shipmentId = this.route.snapshot.paramMap.get('id') as string;
      this.checkIfShipmentFinalized();
    }
  }

  ngOnDestroy(){
    if(this.addedBags.length !== 0){
      this.addedBagWithLetters.forEach(b => this.bagsService.deleteBagWithLetters(b.id!))
      this.addedBagWithParcels.forEach(b => this.bagsService.deleteBagWithParcels(b.id!));
    }
  }

  checkIfShipmentFinalized(){
    let isFinalized: boolean;
    this.shipmentsService.getShipmentById(this.shipmentId).subscribe((data: IShipment) =>{
      isFinalized = data.isFinalized!;

      if(isFinalized){
        this.router.navigate([`/`]);
        alert("Shipment is already finalized! Cannot add bags anymore!")
      }
    });
  }

  getAllBagNumbers(): void {
    this.bagsService.getBagNumbers().subscribe((data: IBag[]) =>{
      this.existingBags = data;
      this.bagWithLettersForm = this.fb.group({
        bagNumber: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[a-zA-Z0-9]*$/), this.bagNumberValidator(this.existingBags)]],
        countOfLetters: ['', [Validators.required, Validators.min(1)]],
        weight: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,3})?$/), Validators.min(0)]],
        price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0)]]
      });
      this.bagWithParcelsForm = this.fb.group({
        bagNumber: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[a-zA-Z0-9]*$/), this.bagNumberValidator(this.existingBags)]]
      });
    });
  }

  createBagWithParcels(): void {
    if (this.bagWithParcelsForm.valid) {
      this.bagsService.postBagWithParcels(this.bagWithParcelsForm.value).subscribe(
        (response: IBagWithParcels | HttpErrorResponse) => {
          if (response instanceof HttpErrorResponse) {
            console.error('An error occurred:', response.error);
          } else {
            let bag: IBag = {
              id: response.id,
              bagNumber: response.bagNumber,
              shipmentId: response.shipmentId
            }
            this.addedBags.push(bag);
            this.addedBagWithParcels.push(response);
            this.clearBagWithParcelsForm();
          }
        }
      );
    } else {
      console.error('Bag with parcels form is invalid');
    }
  }  

  clearBagWithParcelsForm(): void {
    (<HTMLFormElement>document.getElementById("bagWithParcelsFormId")).reset();
   }

  createBagWithLetters(): void {
    if (this.bagWithLettersForm.valid) {
      this.bagsService.postBagWithLetters(this.bagWithLettersForm.value).subscribe(
        (response: IBagWithLetters | HttpErrorResponse) => {
          if (response instanceof HttpErrorResponse) {
            console.error('An error occurred:', response.error);
          } else {
            let bag: IBag = {
              id: response.id,
              bagNumber: response.bagNumber,
              shipmentId: response.shipmentId
            }
            this.addedBags.push(bag);
            this.addedBagWithLetters.push(response);
            this.clearBagWithLettersForm();
          }
        }
      );
    } else {
      console.error('Bag with letters form is invalid');
    }
  }
  
  clearBagWithLettersForm(): void {
    (<HTMLFormElement>document.getElementById("bagWithLettersFormId")).reset();
   }

  addBagsToShipment(shipmentId: string, bags: IBag[]): void {
    console.log(shipmentId);
    this.bagsService.putBagsToShipment(shipmentId, this.addedBags).subscribe(response => {
      console.log(response);
    });
    this.addedBags = [];
  }

  getBagNumbers(bags: any[]): string {
    return bags.map(bag => bag.bagNumber).join(', ');
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
    if(form.get(fieldName) !== null && form.get(fieldName)?.errors?.existingBagNumber){
        return true;
    }
    return false;
  }

  bagNumberValidator(existingBags: IBag[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const isExistingBagNumber = (existingBags.some(bag => bag.bagNumber === control.value) || this.addedBags.some(bag => bag.bagNumber === control.value));
      return isExistingBagNumber ? { 'existingBagNumber': { value: control.value } } : null;
    };
  }
}
