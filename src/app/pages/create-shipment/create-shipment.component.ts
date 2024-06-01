import { Component, OnInit } from '@angular/core';
import { IShipment, ShipmentsService } from '../../services/shipments.service';
import { AbstractControl, FormBuilder, FormGroup, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-shipment',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './create-shipment.component.html',
  styleUrl: './create-shipment.component.css'
})
export class CreateShipmentComponent implements OnInit {

  existingShipments: IShipment[] = [];
  shipmentForm: FormGroup;
  goToBags: boolean = false;

  constructor(private shipmentsService: ShipmentsService, private router: Router, private fb: FormBuilder){
    this.shipmentForm = this.fb.group({
      shipmentNumber: ['', [Validators.required, Validators.max(10), Validators.pattern(/^[A-Za-z0-9]{3}-[A-Za-z0-9]{6}$/)]],
      airport: ['', [Validators.required]],
      flightNumber: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}\d{4}$/)]],
      flightDate: ['', [Validators.required, this.futureDateValidator()]],
    });
  }
  
  ngOnInit(): void {
    this.getShipments();
  }
  
  getShipments(): void {
    this.shipmentsService.getAllShipments().subscribe((data: IShipment[]) =>{
      this.existingShipments = data;
      this.shipmentForm = this.fb.group({
        shipmentNumber: ['', [Validators.required, Validators.max(10), Validators.pattern(/^[A-Za-z0-9]{3}-[A-Za-z0-9]{6}$/), this.shipmentNumberValidator(this.existingShipments)]],
        airport: ['', [Validators.required]],
        flightNumber: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}\d{4}$/)]],
        flightDate: ['', [Validators.required, this.futureDateValidator()]],
      });
    });
  }

  postShipment(): void {
    if (this.shipmentForm.valid) {
      this.shipmentsService.createShipment(this.shipmentForm.value).subscribe(
        (response: any | HttpErrorResponse) => {
          if (response instanceof HttpErrorResponse) {
            console.error('An error occurred:', response.error);
          } else {
            this.router.navigate([`/`]);
          }
        }
      );
    } else {
      alert("Form is invalid");
    }
  }

  postAndContinueToAddingBags(): void{
    if (this.shipmentForm.valid) {
      this.shipmentsService.createShipment(this.shipmentForm.value).subscribe(
        (response: any | HttpErrorResponse) => {
          if (response instanceof HttpErrorResponse) {
            console.error('An error occurred:', response.error);
          } else {
            this.router.navigate([`/createBags/${response.id}`]);
          }
        }
      );
    } else {
      alert("Form is invalid");
    }
  }

  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const controlDate = new Date(control.value);
      const currentDate = new Date();
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);
      const forbidden = controlDate < currentDate;
      return forbidden ? { 'pastDate': {value: control.value} } : null;
    };
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
        console.log(!form.get(fieldName)?.errors?.pattern)
        return true;
    }
    return false;
  }

  checkIfUnique(form: FormGroup<any>, fieldName: string): boolean{
    if(form.get(fieldName) !== null && form.get(fieldName)?.errors?.existingShipmentNumber){
        return true;
    }
    return false;
  }

  shipmentNumberValidator(existingShipments: IShipment[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const isExistingShipmentNumber = (existingShipments.some(shipment => shipment.shipmentNumber === control.value) || this.existingShipments.some(shipment => shipment.shipmentNumber === control.value));
      return isExistingShipmentNumber ? { 'existingShipmentNumber': { value: control.value } } : null;
    };
  }

  buttonClicked(button: string): void {
    if(button === "addingBagsBtn"){
      this.goToBags = true;
    }
    this.postShipment();
  }
}
