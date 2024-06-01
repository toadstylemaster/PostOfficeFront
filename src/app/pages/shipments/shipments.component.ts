import { Component, OnInit } from '@angular/core';
import { IShipment, ShipmentsService } from '../../services/shipments.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { IBagWithLetters, IBagWithParcels } from '../../services/bags.service';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shipments.component.html',
  styleUrl: './shipments.component.css'
})
export class ShipmentsComponent implements OnInit{

  shipments: IShipment[] = [];
  detailsShipment: IShipment = {};
  bagsWithLetters: IBagWithLetters[] = [];
  bagWithParcels: IBagWithParcels[]= [];
  isDetailsPage: boolean = false;
  shipmentTotalPrice: number = 0;
  amountOfLetters: number = 0;
  amountOfParcels: number = 0;

  constructor(private shipmentsService: ShipmentsService){

  }

  ngOnInit(): void {
      this.getShipments();
  }

  getShipments(): void {
    this.shipmentsService.getAllShipments().subscribe((data: IShipment[]) =>{
      this.shipments = data;
    });
  }

  showDetails(shipmentId: string): void {
    console.log(shipmentId);
    this.isDetailsPage = true;
    this.shipmentTotalPrice = 0;
    this.amountOfLetters = 0;
    this.amountOfParcels = 0;

    this.shipmentsService.getShipmentById(shipmentId).subscribe((data: IShipment) => {
      this.detailsShipment = data;;
    });
  
    this.shipmentsService.getBagWithLettersByShipmentId(shipmentId).subscribe((data: IBagWithLetters[]) => {
      this.bagsWithLetters = data;
      this.bagsWithLetters.forEach(a => {
        this.shipmentTotalPrice += a.price!;
        this.amountOfLetters += a.countOfLetters!;
      });
    });
  
    this.shipmentsService.getBagWithParcelsByShipmentId(shipmentId).subscribe((data: IBagWithParcels[]) => {
      this.bagWithParcels = data;
      this.bagWithParcels.forEach(b => {
        this.amountOfParcels += b.listOfParcels!.length;
        b.listOfParcels?.forEach(p => this.shipmentTotalPrice += p.price!);
      });
    });
  }

  deleteShipment(shipmentId: string){
    this.shipmentsService.deleteShipment(shipmentId);
  }


  closeDetails(){
      this.isDetailsPage = false;
      this.bagWithParcels = [];
      this.bagsWithLetters = [];
      this.shipmentTotalPrice = 0;

    
  }

  getBagsWithLetters(shipmentId: string){
    this.shipmentsService.getBagWithLettersByShipmentId(shipmentId).subscribe((data: IBagWithLetters[]) => {
      this.bagsWithLetters = data;
    });
  }


  getBagsWithParcels(shipmentId: string): void {
    this.shipmentsService.getBagWithParcelsByShipmentId(shipmentId).subscribe((data: IBagWithParcels[]) => {
      this.bagWithParcels = data;
    });
  }

  finalizeShipment(shipmentId: string): void {
    this.shipmentsService.finalizeShipment(shipmentId);
  }

  formatDate(date: Date): string {
    var finalDate = date.toString()?.split("-")?.at(2)!.split("T").at(0) + "." + date.toString()?.split("-")?.at(1) + "." + date.toString()?.split("-")?.at(0) + " - " + date.toString()?.split("T")?.at(1)!.split(".").at(0)

    return finalDate;
  }
}
