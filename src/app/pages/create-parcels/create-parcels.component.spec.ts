import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateParcelsComponent } from './create-parcels.component';

describe('CreateParcelsComponent', () => {
  let component: CreateParcelsComponent;
  let fixture: ComponentFixture<CreateParcelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateParcelsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateParcelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
