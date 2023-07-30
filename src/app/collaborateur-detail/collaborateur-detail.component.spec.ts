import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborateurDetailComponent } from './collaborateur-detail.component';

describe('CollaborateurDetailComponent', () => {
  let component: CollaborateurDetailComponent;
  let fixture: ComponentFixture<CollaborateurDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollaborateurDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollaborateurDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
