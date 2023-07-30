import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipeDetailComponent } from './equipe-detail.component';

describe('EquipeDetailComponent', () => {
  let component: EquipeDetailComponent;
  let fixture: ComponentFixture<EquipeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EquipeDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
