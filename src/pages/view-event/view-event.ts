import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Loading } from 'ionic-angular/components/loading/loading';

import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Event } from './../../interface/event';

import { RestApiProvider } from './../../providers/rest-api/rest-api';
import {} from '@types/googlemaps';
/**
 * Generated class for the ViewEventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-view-event',
  templateUrl: 'view-event.html',
})
export class ViewEventPage {

  @ViewChild("map") mapRef: ElementRef;
  private map: google.maps.Map;
  private eventMapMarker: google.maps.Marker;

  public event: Event;

  public listEventTimeAttendess = [];

  private loader: Loading;

  public eventForm: FormGroup;

  public minSelectabledate;
  public maxSelectabledate;

  public listFaculties;
  public listMajors;

  public Image: string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private restApiProvider: RestApiProvider,
    public formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController
  ) {
  }

  ngOnInit(){
    this.event = this.navParams.get("event");
    console.log("Event",this.event);

    this.showMap();
    this.getListOfFaculties();

    let d = new Date();
    this.minSelectabledate = d.getFullYear();
    this.maxSelectabledate = d.getFullYear()+1;

    this.initEvent();
    this.eventForm.disable();
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

  initEvent(){
    //Change NULL to empty 
    if(this.event.Image == null){
      this.event.Image = "";
    }else{
      this.Image = this.event.Image;
    }
    if(this.event.Location_Latitude&&this.event.Location_Longitude){
      this.placeMarker(new google.maps.LatLng(Number(this.event.Location_Latitude),Number(this.event.Location_Longitude)),this.map);
      this.map.setCenter(this.eventMapMarker.getPosition());
    }else{
      this.event.Location_Latitude = "";
      this.event.Location_Longitude = "";
    }
    if(this.event.FID == null){
      this.event.FID = "-1";
    }
    if(this.event.MID == null){
      this.event.MID = "-1";
    }
    //--
    this.eventForm = this.formBuilder.group({
      EID: this.event.EID.toString(),
      Name: this.event.Name.toString(),
      Info: this.event.Info.toString(),
      Image: this.event.Image.toString(),
      Location_Latitude: this.event.Location_Latitude.toString(),
      Location_Longitude: this.event.Location_Longitude.toString(),
      TID: this.event.TID.toString(),
      Time_Start: this.convertTime(this.event.Time_Start),
      Time_End: this.convertTime(this.event.Time_End),
      MID: this.event.MID.toString(),
      FID: this.event.FID.toString()
    });
    //set major 
    this.hintMajors(Number(this.event.FID));
    this.eventForm.patchValue({MID: this.event.MID.toString()});
  }

  convertTime(time: string){
    let temp = time.split(" ");
    return temp[0]+"T"+temp[1]+".000Z"
  }

  getNumberOfEventTimeAttendess(tid: number){
    this.restApiProvider.getEventTimeAttendess(0,tid)
    .then(result => {
      //this.listEventTimeAttendess.push(result);
      this.listEventTimeAttendess[tid.toString()] = result;
      console.log(this.listEventTimeAttendess);
    })
    .catch(error =>{
      //this.listEventTimeAttendess.push([]);
      this.listEventTimeAttendess[tid.toString()] = [];
      console.log("ERROR API : getEventTimeAttendess",error);
    });
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
    this.eventForm.patchValue({MID:"-1"});
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

  joinEvent(){
    console.log("joinEvent",this.event.TID);
    let confirm = this.alertCtrl.create({
      title: "Alert!",
      message: "Are you sure that you want to join this event time?",
      enableBackdropDismiss: false,
      buttons: [{
        text: "Disagree"
      },{
        text: "Agree",
        handler: () => {
          //TODO - delete the game (use api)
          console.log('Agree clicked');
          this.presentLoading();
          this.restApiProvider.joinEvent(Number(this.event.TID))
          .then(result => {
            console.log("join event time success");
            this.loader.dismiss();
            var jsonData: any = result;
            if(jsonData.isSuccess){
              this.presentAlert(jsonData.message);
            }
          })
          .catch(error =>{
            this.loader.dismiss();
            console.log("ERROR API : joinEvent",error);
            if(error.status == 0){
              //show error message
              this.presentAlert("Cannot connect to server");
            }else{
              var jsonData = JSON.parse(error.error);
              //show error message
              this.presentAlert(jsonData.message);
            }
          });
        }
      }]
    });
    confirm.present();
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
