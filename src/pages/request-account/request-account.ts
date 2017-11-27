import { Component } from '@angular/core';
import { NavController, NavParams, MenuController, Platform, AlertController, LoadingController   } from 'ionic-angular';
import { Loading } from 'ionic-angular/components/loading/loading';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { RestApiProvider } from './../../providers/rest-api/rest-api';
import { Subscription } from 'rxjs/Subscription';
/**
 * Generated class for the RequestAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-request-account',
  templateUrl: 'request-account.html',
})
export class RequestAccountPage {

  private loader: Loading;

  private subAuth: Subscription;
  private user: firebase.User;

  private auAccount: boolean = false;
  private accountInfo = {
    ID: "", 
    Name: "",
    Role: "staff",
    FID: "-1",
    MID: "-1"
  };

  public listFaculties;
  public listMajors;

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
    this.getListOfFaculties();
  }

  ngOnDestroy(){
    console.log("ngOnDestroy request-account");
    //unsub auth
    this.subAuth.unsubscribe();
    //logout
    this.logout();
    //reactive sub auth on login page
    this.navParams.get("parentPage").userAuth();
  }

  userAuth(){
    this.subAuth = this.afAuth.authState.subscribe(user => {
      if (!user) {
        this.user = null;
        return;
      }
      this.user = user;
      this.validateAuAccount();
    });
  }

  validateAuAccount(){
    //u5715298@au.edu
    let temp = this.user.email.split("@");
    if(temp[1] == "au.edu"){
      this.auAccount = true;  
      this.accountInfo.ID = temp[0];
      this.accountInfo.Name = this.user.displayName;
    }else{
      this.auAccount = false;
    }
  }

  submitRequest(){
    let confirm = this.alertCtrl.create({
      title: "Alert!",
      message: "Are you sure that you want to request for this account?",
      enableBackdropDismiss: false,
      buttons: [{
        text: "Disagree"
      },{
        text: "Agree",
        handler: () => {
         this.getUserToken();
        }
      }]
    });
    confirm.present();
  }

  getUserToken(){
    this.user.getIdToken(true)
    .then(idToken => {
      this.requestAccount(idToken);
    })
    .catch(err => {
      this.loader.dismiss();
      console.log("ERROR : geting token",err);
    });
  }

  requestAccount(idToken){
    //get form data
    let request = {
      idToken : idToken,
      Role: this.accountInfo.Role,
      FID: this.accountInfo.FID,
      MID: this.accountInfo.MID
    }
    
    //Change empty to NULL
    if(request.FID == "-1"){
      request.FID = null;
    }
    if(request.MID == "-1"){
      request.MID = null;
    }
    //--
    this.presentLoading();
    this.restApiProvider.requestAccount(request)
    .then(result => {
      this.loader.dismiss();
      console.log("request account success");
      var jsonData: any = result;
      if(jsonData.isSuccess){
        this.presentAlert(jsonData.message);
        //this.navCtrl.pop();
      }
    })
    .catch(error =>{
      this.loader.dismiss();
      console.log("ERROR API : requestAccount",error);
      if(error.status == 0){
        //show error message
        this.presentAlert("Cannot connect to server");
      }else{
        var jsonData = JSON.parse(error.error);
        //show error message
        this.presentAlert(jsonData.message);
      }
    })
  }

  getListOfFaculties(){
    this.restApiProvider.getFaculties()
    .then(result => {
      this.listFaculties = result;
    })
    .catch(error =>{
      console.log("ERROR API : getFaculties",error);
    })
  }

  hintMajors(fid: number){
    this.accountInfo.MID = "-1";
    if(fid == -1){
      this.listMajors = null;
      return;
    }
    this.restApiProvider.getMajorsInFaculty(fid)
    .then(result => {
      this.listMajors = result;
    })
    .catch(error =>{
      console.log("ERROR API : getMajorsInFaculty",error);
    })
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
        .catch(error => console.log("Error Sing-in with "+provider,error));
      });
    }else{
      this.afAuth.auth.signInWithPopup(signInProvider)
      .then(result => console.log("Logged-in with "+provider,result))
      .catch(error => console.log("Error Sing-in with "+provider,error));
    }

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

  presentAlert(message) {
    let alert = this.alertCtrl.create({
      title: 'Alert!',
      subTitle: message,
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Ok'
      }]
    });
    alert.present();
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    this.loader.present();
  }

}
