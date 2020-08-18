import { Routes, RouterModule } from '@angular/router';

import { PersonComponent } from './person/person.component';
import { AuthGuard } from '../shared/auth/auth.guard';
import { ProfileComponent } from './profile.component';
import { PersonAppComponent } from './person-app/person-app.component';

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
            component: PersonAppComponent
          }
        ]
      }
];

export let ProfileRouterModule = RouterModule.forChild(
    ProfileRoutes
);
