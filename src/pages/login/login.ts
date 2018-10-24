import { Component } from '@angular/core';
import { NavController, NavParams, MenuController, Platform, AlertController, LoadingController   } from 'ionic-angular';
import { Loading } from 'ionic-angular/components/loading/loading';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { HomePage } from './../home/home';

import { RestApiProvider } from './../../providers/rest-api/rest-api';
import { Subscription } from 'rxjs/Subscription';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private loader: Loading;

  private subAuth: Subscription;

  private user: firebase.User;

  private checkLinkAccount: boolean = false;
  private pendingCred;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public menu: MenuController,
    private afAuth: AngularFireAuth,
    private restApiProvider: RestApiProvider,
    private platform: Platform,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController
  ) {
    this.userAuth();
  }

  ngOnInit(){
    //TODO - disable menu bar on login page
    this.menu.enable(false);
  }

  ngOnDestroy(){
    console.log("ngOnDestroy login")
    this.subAuth.unsubscribe();
  }

  userAuth(){
    this.subAuth = this.afAuth.authState.subscribe(user => {
      if (!user) {
        this.user = null;
        return;
      }
      this.user = user;
      if(this.checkLinkAccount){
        return;
      }
      this.checkBackend();
    });
  }

  checkBackend(){
    //show loding
    this.presentLoading();
    //TODO - summit to backend /login
    this.user.getIdToken(true)
    .then(idToken => {
      this.restApiProvider.login(idToken)
      .then(data => {
        var jsonData: any = data;
        if(jsonData.isSuccess){
          //remove loding
          this.loader.dismiss();
          //if account verify then Re-direct to Home
          this.menu.enable(true);
          this.navCtrl.setRoot(HomePage);
        }
      }).catch(error => {
        this.loader.dismiss();
        console.log("ERROR API : login",error);
        if(error.status == 0){
          //show error message
          this.presentAlert("Cannot connect to server");
        }else{
          var jsonData = JSON.parse(error.error);
          //show error message
          this.presentAlert(jsonData.message);
        }
      });
    
    })
    .catch(err => {
      this.loader.dismiss();
      console.log("ERROR : geting token",err);
    });
  }

  presentAlert(message) {
    let alert = this.alertCtrl.create({
      title: 'Alert!',
      subTitle: message,
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Logout',
        handler: () => {
          this.logout();
        }
      }]
    });
    alert.present();
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Please wait...",
      dismissOnPageChange: true
    });
    this.loader.present();
  }

  login(provider){

    let signInProvider = null;

    switch (provider) {
      case "facebook":
        signInProvider = new firebase.auth.FacebookAuthProvider();
        break;
      case "google":
        signInProvider = new firebase.auth.GoogleAuthProvider();
        break;
    }

    if (this.platform.is('cordova')){
      this.afAuth.auth.signInWithRedirect(signInProvider)
      .then(() => {
        this.afAuth.auth.getRedirectResult()
        .then(result => console.log("Logged-in with "+provider,result))
        .catch(error => {
          console.log("Error Sing-in with "+provider,error);
          this.errorLogin(error);
        });
      });
    }else{
      this.afAuth.auth.signInWithPopup(signInProvider)
      .then(result => console.log("Logged-in with "+provider,result))
      .catch(error => {
        console.log("Error Sing-in with "+provider,error);
        this.errorLogin(error);
      });
    }

  }

  errorLogin(error){
    let errorCode = error.code;
    var email = error.email;

    if(errorCode == "auth/account-exists-with-different-credential"){
      let alert = this.alertCtrl.create({
        title: 'Alert!',
        message: "Account already exist for provided e-mail. Login with this email address("+email+")\nOR\nLink this account to the existing account.",
        enableBackdropDismiss: false,
        buttons: [{
          text: 'Link Account',
          handler: () => {
            this.checkLinkAccount = true;
            this.pendingCred = error.credential;
            this.linkAccount(email);
          }
          },{
          text: 'Logout',
          handler: () => {
            this.logout();
          }
        }]
      });
      alert.present();
    }
  }

  linkAccount(email){
    this.afAuth.auth.fetchProvidersForEmail(email)
    .then(providers => {

      let provider = null;
      
      console.log(providers);

      switch (providers[0]) {
        case "facebook.com":
          provider = new firebase.auth.FacebookAuthProvider();
          break;
        case "google.com":
          provider = new firebase.auth.GoogleAuthProvider();
          break;
      }

      let alert = this.alertCtrl.create({
        title: 'Alert!',
        message: "Are you sure that you want to link this account with ("+providers[0]+")?",
        enableBackdropDismiss: false,
        buttons: [{
          text: 'No',
          handler: () => {
            this.pendingCred = null;
          }
          },{
          text: 'Yes',
          handler: () => {
            this.confirmLinkAccount(provider);
          }
        }]
      });
      alert.present();
      
    });
  }

  confirmLinkAccount(provider){
    if (this.platform.is('cordova')){
      this.afAuth.auth.signInWithRedirect(provider)
      .then(() => {
        this.afAuth.auth.getRedirectResult()
        .then(result => {
          result.user.linkWithCredential(this.pendingCred)
          .then(()=>{
            console.log("Account linked",result);
            this.presentAlert("Account linked");
            this.checkLinkAccount = false;
          });
        })
        .catch(error => {
          console.log("Error account link",error);
          this.presentAlert("Fail to link Account");
        });
      });
    }else{
      this.afAuth.auth.signInWithPopup(provider)
      .then(result => {
        result.user.linkWithCredential(this.pendingCred)
        .then(()=>{
          console.log("Account linked",result);
          this.presentAlert("Account linked");
          this.checkLinkAccount = false;
        });
      })
      .catch(error => {
        console.log("Error account link",error);
        this.presentAlert("Fail to link Account");
      });
    }
  }

  logout() {
    this.afAuth.auth.signOut()
    .then(result => {
      console.log("Sign-out",result);
      //clear session
      sessionStorage.clear();
      //set checkLink
      this.checkLinkAccount = false;
    })
    .catch(error => console.log("Error Sing-out",error));
  }

}