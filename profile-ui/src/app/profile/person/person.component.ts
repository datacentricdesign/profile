import { Component, OnInit } from '@angular/core';
import { PersonService } from 'app/profile/services/person.service';
import { ActivatedRoute } from '@angular/router';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Person, DTOPerson } from '@datacentricdesign/types';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppService } from 'app/app.service';
import { OAuthService } from 'angular-oauth2-oidc';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css']
})
export class PersonComponent implements OnInit {

  private apiURL: string
  person$: Observable<Person>;
  person: Person
  userProfile: UserProfile

  updatePerson: DTOPerson = {
    id: '',
    name: '',
    email: '',
    password: ''
  }

  constructor(
    private oauthService: OAuthService, private personService: PersonService, private _Activatedroute: ActivatedRoute, private appService: AppService,
    private http: HttpClient) {
    this.apiURL = appService.settings.apiURL
  }

  ngOnInit(): void {
    this._Activatedroute.paramMap.subscribe(params => {
      if (this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken()) {
        const claim: any = this.oauthService.getIdentityClaims()
        this.userProfile = {
          id: claim.sub,
          name: claim.name,
          email: claim.email
        }
      }

      let headers = new HttpHeaders().set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
      this.person$ = this.http.get<Person>(this.apiURL + "/persons/" + this.userProfile.id, { headers }).pipe(
        map((data: Person) => {
          this.person = data
          return data;
        }), catchError(error => {
          return throwError('Person not found!');
        })
      )
    });
  }

  editName() {
    this.personService.edit(this.person.id, { name: this.updatePerson.name })
  }

  editEmail() {
    this.personService.edit(this.person.id, { email: this.updatePerson.email })
  }


  delete() {
    this.personService.delete(this.userProfile.id)
  }
}
