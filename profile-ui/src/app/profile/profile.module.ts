import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProfileRouterModule } from './profile.routes';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { PersonService } from './services/person.service';
import { SharedModule } from 'app/shared/shared.module';
import { PersonComponent } from './person/person.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    ProfileRouterModule
  ],
  declarations: [
    PersonComponent
  ],
  providers: [PersonService],
})

export class ProfileModule { }
