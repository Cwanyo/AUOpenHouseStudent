import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

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
  private myDate: String = new Date().toString();

  constructor(public navCtrl: NavController, public navParams: NavParams,private afAuth: AngularFireAuth,) {
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

  splitTime(time: string){
    let temp = time.split(" ");
    return temp[0]+" "+temp[1]+" "+temp[2]+" "+temp[3]
  }

}
