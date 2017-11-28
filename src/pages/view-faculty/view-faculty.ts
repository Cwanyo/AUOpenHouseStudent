import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular'
import { Loading } from 'ionic-angular/components/loading/loading';

import { Faculty } from '../../interface/faculty';

import { RestApiProvider } from './../../providers/rest-api/rest-api';
import {} from '@types/googlemaps';
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

  @ViewChild("map") mapRef: ElementRef;
  private map: google.maps.Map;
  private eventMapMarker: google.maps.Marker;

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
    this.showMap();
  }

  showMap(){
    //set default map location
    const location = new google.maps.LatLng(13.612111, 100.837667);
    //set map options
    const options = {
      center: location,
      zoom: 17
    };

    this.map = new google.maps.Map(this.mapRef.nativeElement,options);

    if(this.faculty.Location_Latitude&&this.faculty.Location_Longitude){
      this.placeMarker(new google.maps.LatLng(Number(this.faculty.Location_Latitude),Number(this.faculty.Location_Longitude)),this.map);
      this.map.setCenter(this.eventMapMarker.getPosition());
    }
  }

  placeMarker(location, map){
    if(this.eventMapMarker){
      this.eventMapMarker.setPosition(location);
    }else{
      this.eventMapMarker = new google.maps.Marker({
        position: location,
        map: map
      });
    }
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
