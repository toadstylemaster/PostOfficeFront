import { Routes } from '@angular/router';
import { ShipmentsComponent } from './pages/shipments/shipments.component';
import { CreateShipmentComponent } from './pages/create-shipment/create-shipment.component';
import { BagsComponent } from './pages/bags/bags.component';
import { CreateParcelsComponent } from './pages/create-parcels/create-parcels.component';

export const routes: Routes = [
    { path: '', component:ShipmentsComponent },
    { path: 'createShipment', component:CreateShipmentComponent },
    { path: 'createBags/:id', component:BagsComponent },
    { path: 'createParcels/:id', component:CreateParcelsComponent },
];