import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { LoginPage } from './../pages/login/login';

import { HomePage } from '../pages/home/home';

import { BulletinPage } from '../pages/bulletin/bulletin';

import { EventManagementPage } from './../pages/event-management/event-management';

import { GameManagementPage } from './../pages/game-management/game-management';

import { RestApiProvider } from '../providers/rest-api/rest-api';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  rootPage: any = LoginPage;

  private user: firebase.User;

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
  goToBulletin(params){
    if (!params) params = {};
    this.navCtrl.setRoot(BulletinPage);
  }
  goToEvent(params){
    if (!params) params = {};
    this.navCtrl.setRoot(EventManagementPage);
  }
  goToGame(params){
    if (!params) params = {};
    this.navCtrl.setRoot(GameManagementPage);
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
