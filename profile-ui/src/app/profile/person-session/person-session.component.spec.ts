import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonSessionComponent } from './person-session.component';

describe('PersonSessionComponent', () => {
  let component: PersonSessionComponent;
  let fixture: ComponentFixture<PersonSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
