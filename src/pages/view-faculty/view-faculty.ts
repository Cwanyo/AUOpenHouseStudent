import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular'
import { Loading } from 'ionic-angular/components/loading/loading';

import { Faculty } from '../../interface/faculty';

import { RestApiProvider } from './../../providers/rest-api/rest-api';

/**
 * Generated class for the ViewFacultyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-view-faculty',
  templateUrl: 'view-faculty.html',
})
export class ViewFacultyPage {

  private loader: Loading;

  private faculty: Faculty;
  
  private listOfMajors;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private restApiProvider: RestApiProvider,
    public loadingCtrl: LoadingController
  ) {
  }

  ngOnInit(){
    this.faculty = this.navParams.get("faculty");
    console.log("Faculty", this.faculty);

    this.getListOfMajors();
  }

  getListOfMajors(){
    this.presentLoading();
    this.restApiProvider.getMajorsInFaculty(Number(this.faculty.FID))
    .then(result => {
      this.loader.dismiss();
      this.listOfMajors = result;
    })
    .catch(error =>{
      this.loader.dismiss();
      console.log("ERROR API : getMajorsInFaculty",error);
    })
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    this.loader.present();
  }

}
