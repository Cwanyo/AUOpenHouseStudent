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
    let errorMessage = error.message;
    var email = error.email;
    var pendingCred = error.credential;
    if(errorCode == "auth/account-exists-with-different-credential"){
      let alert = this.alertCtrl.create({
        title: 'Alert!',
        subTitle: "Account already exist for provided e-mail("+email+").",
        enableBackdropDismiss: false,
        buttons: [{
          text: 'Link Account',
          handler: () => {
            this.linkAccount(email, pendingCred);
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

  linkAccount(email, pendingCred){
    this.afAuth.auth.fetchProvidersForEmail(email)
    .then(providers => {

      let provider = null;
      
      switch (providers[0]) {
        case "facebook":
          provider = new firebase.auth.FacebookAuthProvider();
          break;
        case "google":
          provider = new firebase.auth.GoogleAuthProvider();
          break;
      }

      if (this.platform.is('cordova')){
        this.afAuth.auth.signInWithRedirect(provider)
        .then(() => {
          this.afAuth.auth.getRedirectResult()
          .then(result => {
            result.user.link(pendingCred)
            .then(()=>{
              console.log("Account linked",result);
            });
          })
          .catch(error => {
            console.log("Error account link",error);
          });
        });
      }else{
        this.afAuth.auth.signInWithPopup(provider)
        .then(result => {
          result.user.link(pendingCred)
          .then(()=>{
            console.log("Account linked",result);
          });
        })
        .catch(error => {
          console.log("Error account link",error);
        });
      }
    });
  }

  logout() {
    this.afAuth.auth.signOut()
    .then(result => {
      console.log("Sign-out",result);
      //clear session
      sessionStorage.clear();
    })
    .catch(error => console.log("Error Sing-out",error));
  }

}
