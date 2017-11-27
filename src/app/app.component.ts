import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

//Pages for staff and admin
import { LoginPage } from './../pages/login/login';
import { HomePage } from '../pages/home/home';
import { EventManagementPage } from './../pages/event-management/event-management';
import { GameManagementPage } from './../pages/game-management/game-management';

//Pages for admin only
import { AdminAccountManagementPage } from '../pages/admin-account-management/admin-account-management';
import { AdminAccountApprovalPage } from '../pages/admin-account-approval/admin-account-approval';

import { RestApiProvider } from '../providers/rest-api/rest-api';

import {Observable} from 'rxjs/Rx';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  rootPage: any = LoginPage;

  private user: firebase.User;
  private userRole: string;

  constructor(
    public platform: Platform, 
    public menu: MenuController,
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    private afAuth: AngularFireAuth,
    private restApiProvider: RestApiProvider
  ) {
    this.initializeApp();
    this.userAuth();
    this.checkUserRole();
  }

  userAuth(){
    this.afAuth.authState.subscribe(user => {
      if (!user) {
        this.user = null;
        return;
      }
      this.user = user;
    });
  }

  checkUserRole() {
    console.log("checkUserRole");
    Observable.interval(1000).subscribe(() => {
      if(!sessionStorage.getItem('userRole')){
        this.userRole = "NONE";
        return;
      }
      this.userRole = sessionStorage.getItem('userRole').toUpperCase();
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  goToHome(params){
    if (!params) params = {};
    this.navCtrl.setRoot(HomePage);
  }
  goToEventManagement(params){
    if (!params) params = {};
    this.navCtrl.setRoot(EventManagementPage);
  }
  goToGameManagement(params){
    if (!params) params = {};
    this.navCtrl.setRoot(GameManagementPage);
  }
  goToAccountManagement(params){
    if (!params) params = {};
    this.navCtrl.setRoot(AdminAccountManagementPage);
  }
  goToAdminAccountApproval(params){
    if (!params) params = {};
    this.navCtrl.setRoot(AdminAccountApprovalPage);
  }
  
  logout() {
    this.afAuth.auth.signOut()
    .then(result => console.log("Sign-out",result))
    .then(() => {
      this.restApiProvider.logout()
      .then(result => {
        console.log("Logout from api");
        //clear session
        sessionStorage.clear();
        this.navCtrl.setRoot(LoginPage);
      })
      .catch(error => console.log("Error logout from api"));
    })
    .catch(error => console.log("Error Sing-out",error));
  }
  
}
