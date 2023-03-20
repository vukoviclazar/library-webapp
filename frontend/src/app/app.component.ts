import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginComponent } from './login/login.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProfileComponent } from './profile/profile.component';
import { Notification } from './models/notification';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  @ViewChild(NavbarComponent) navBar: NavbarComponent
  
  title = 'frontend';
  subscription: Subscription
  notifications: Notification[]

  resetNotifications(){
    this.notifications = []
  }

  subscribeToEmmiter(componentRef) {
    if(componentRef instanceof HomeComponent) {
      const child: HomeComponent = componentRef
      child.userUpdate.subscribe( (event) => {
        this.notifications = event
        this.navBar.refreshComponent()
      })  
    } 
    else if(componentRef instanceof ProfileComponent) {
      const child: ProfileComponent = componentRef
      child.userUpdate.subscribe( () => {
        this.navBar.refreshComponent()
      })  
    }
    else if(componentRef instanceof LoginComponent) {
      const child: LoginComponent = componentRef
      child.userUpdate.subscribe( (event) => {
        this.notifications = event
        this.navBar.refreshComponent()
      })  
    }
    else if(componentRef instanceof EditUserComponent) {
      const child: EditUserComponent = componentRef
      child.userUpdate.subscribe( () => {
        this.navBar.refreshComponent()
      })  
    }
  }

  unsubscribe() {
    if (this.subscription)
      this.subscription.unsubscribe()
  }
}
