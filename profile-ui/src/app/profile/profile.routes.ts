import { Routes, RouterModule } from '@angular/router';

import { PersonComponent } from './person/person.component';
import { AuthGuard } from '../shared/auth/auth.guard';
import { ProfileComponent } from './profile.component';
import { PersonSessionComponent } from './person-session/person-session.component';

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
            path: 'sessions',
            component: PersonSessionComponent
          }
        ]
      }
];

export let ProfileRouterModule = RouterModule.forChild(
    ProfileRoutes
);
