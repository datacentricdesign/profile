import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { Property } from '@datacentricdesign/types';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PersonService } from '../services/person.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html'
})
export class GroupsComponent implements OnInit {

  groupModel = {
    groupId: '',
    members: []
  }

  groups$: Observable<any>

  constructor(private personService: PersonService,
    private toastr: ToastrService) {
  }

  ngOnInit(): void {
    const userProfile = this.personService.getUserProfile()
    if (userProfile !== undefined) {
      this.groupModel.members = [userProfile.id]
    }
    this.groups$ = this.personService.listGroups()
  }

  async createGroup() {
    if (this.groupModel.groupId !== '') {
      const groupId = 'dcd:groups:' + this.groupModel.groupId
      const result = await this.personService.checkIfGroupIdExists(groupId).then(result => {
        this.toast('This group id is already in use.', 'danger')
      }).catch(error => {
        this.personService.createAGroup(groupId, this.groupModel.members).then(result => {
          window.location.reload(true)
        }).catch(error => {
          console.log(error)
        })
      })
    }
  }

  deleteGroup(event) {
    const groupId = event.target.id.replace('deleteGroup-', '')
    this.personService.deleteAGroup(groupId).then(result => {
      window.location.reload(true)
    }).catch(error => {
      console.log(error)
    })
  }

  addMember(event) {
    const groupId = event.target.id.replace('newMemberInGroup-', '')
    const typeSubject = (document.getElementById('typeNewMemberInGroup-' + groupId) as HTMLInputElement).value
    const subjectId = (document.getElementById('nameNewMemberInGroup-' + groupId) as HTMLInputElement).value
    if (subjectId !== '') {
      console.log(subjectId)
      let subject = subjectId
      if (!subject.startsWith('dcd:')) {
        subject = typeSubject + ':' + subject
      }
      this.personService.addMembersToAGroup(groupId, [subject]).then(result => {
        window.location.reload(true)
      }).catch(error => {
        console.log(error)
      })
    }
  }

  removeMember(event) {
    const idArray = event.target.id.replace('removeMember-', '').split('-FromGroup-')
    const groupId = idArray[1]
    const personId = idArray[0]
    this.personService.removeAMemberFromAGroup(groupId, personId).then(result => {
      window.location.reload(true)
    }).catch(error => {
      console.log(error)
    })
  }

  toast(message:string, type:string, icon:string = 'nc-alert-circle-i') {
    this.toastr.info(
      '<span data-notify="icon" class="nc-icon '+icon+'"></span><span data-notify="message">'+message+'</span>',
        "",
        {
          timeOut: 4000,
          closeButton: true,
          enableHtml: true,
          toastClass: "alert alert-"+type+" alert-with-icon",
          positionClass: "toast-top-center"
        }
      );
  }

}
