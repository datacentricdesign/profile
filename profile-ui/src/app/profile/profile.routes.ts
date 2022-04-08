import { Routes, RouterModule } from '@angular/router';

import { PersonComponent } from './person/person.component';
import { AuthGuard } from '../shared/auth/auth.guard';
import { ProfileComponent } from './profile.component';
import { AppsComponent } from './apps/apps.component';
import { GroupsComponent } from './groups/groups.component';

export const ProfileRoutes: Routes = [
    {
        path: '',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'dashboard',
            component: PersonComponent
          },
          {
            path: 'apps',
            component: AppsComponent
          },
          {
            path: 'groups',
            component: GroupsComponent
          }
        ]
      }
];

export let ProfileRouterModule = RouterModule.forChild(
    ProfileRoutes
);
