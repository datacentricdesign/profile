import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { NgModule, APP_INITIALIZER } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ToastrModule } from "ngx-toastr"

import { SidebarModule } from './sidebar/sidebar.module'
import { FooterModule } from './shared/footer/footer.module'
import { NavbarModule} from './shared/navbar/navbar.module'
import { FixedPluginModule} from './shared/fixedplugin/fixedplugin.module'

import { AppComponent } from './app.component'
import { AppRoutes } from './app.routes'

import { HttpClientModule } from '@angular/common/http'
import { OAuthModule } from 'angular-oauth2-oidc';
import { MatDialogModule } from "@angular/material/dialog"

import { FormsModule }   from '@angular/forms';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SignInPageComponent } from './pages/sign-in-page/sign-in-page.component';
import { SignUpPageComponent } from './pages/sign-up-page/sign-up-page.component';
import { SignOutPageComponent } from './pages/sign-out-page/sign-out-page.component';
import { ConsentPageComponent } from './pages/consent-page/consent-page.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { AppService } from './app.service';
import { ProfileComponent } from './profile/profile.component'
import { BrowserModule } from '@angular/platform-browser'
import { SharedModule } from './shared/shared.module';
import { PersonAppComponent } from './profile/person-app/person-app.component'
import { GroupsComponent } from './profile/groups/groups.component'

export function init_app(appService: AppService) {
  return () => appService.load();
}

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    SignInPageComponent,
    SignUpPageComponent,
    SignOutPageComponent,
    ConsentPageComponent,
    ErrorPageComponent,
    ProfileComponent,
    PersonAppComponent,
    GroupsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(AppRoutes, {
      useHash: false,
      initialNavigation: true
    }),
    SidebarModule,
    NavbarModule,
    ToastrModule.forRoot(),
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['https://dwd.tudelft.nl'],
        sendAccessToken: true
      }
    }),
    FooterModule,
    FixedPluginModule,
    HttpClientModule,
    MatDialogModule,
    FormsModule,
    SharedModule.forRoot(),
  ],
  providers: [{ 
    provide: APP_INITIALIZER, 
    useFactory: init_app, 
    deps: [ AppService ], 
    multi: true
  }],
  bootstrap: [AppComponent],
  entryComponents: []
})
export class AppModule { }



