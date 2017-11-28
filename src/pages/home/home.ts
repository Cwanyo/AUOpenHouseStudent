import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { RestApiProvider } from './../../providers/rest-api/rest-api';

/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  
  private user: firebase.User;
  private point;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private restApiProvider: RestApiProvider,
    private afAuth: AngularFireAuth
  ) {
      this.userAuth();
  }

  userAuth(){
    this.afAuth.authState.subscribe(user => {
      if (!user) {
        this.user = null;
        return;
      }
      this.user = user;
      this.getMyPoints();
    });
  }

  getMyPoints(){
    this.restApiProvider.getMyPoints()
    .then(result => {
      console.log("get points success");
      if((result as any).length == 0){
        //not play
        this.point = null;
      }else{
        this.point = result[0].Points;
      }
    })
    .catch(error =>{
      console.log("ERROR API : getMyPoints",error);
    });
  }

  splitTime(){
    let time = new Date().toString();
    let temp = time.split(" ");
    return temp[2]+" "+temp[1]+" "+temp[3];
  }

}
