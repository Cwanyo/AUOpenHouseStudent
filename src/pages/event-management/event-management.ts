import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular'
import { Loading } from 'ionic-angular/components/loading/loading';

import { ViewEventPage } from './../view-event/view-event';

import { Event } from './../../interface/event';

import { RestApiProvider } from './../../providers/rest-api/rest-api';

/**
 * Generated class for the EventManagementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-event-management',
  templateUrl: 'event-management.html',
})
export class EventManagementPage {

  private loader: Loading;

  public eventState = "1";

  public events = [];
  public faculties = [];

  public rawListOfEvents;
  public listOfMyEvents;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private restApiProvider: RestApiProvider,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController
  ) {
  }

  ngOnInit(){
    this.getListOfEvents();
  }

  doRefresh(refresher){
    if(this.eventState == "1"){
      this.restApiProvider.getUpEvents()
      .then(result => {
        this.rawListOfEvents = result;
        this.faculties = Object.keys(this.groupByFaculty(result));
        this.events = this.groupByFaculty(result);
        refresher.complete();
      })
      .catch(error =>{
        console.log("ERROR API : getUpEvents",error);
        refresher.complete();
      })
    }else if(this.eventState == "0"){
      this.restApiProvider.getMyEvents()
      .then(result => {
        this.listOfMyEvents = result;
        refresher.complete();
      })
      .catch(error =>{
        console.log("ERROR API : getMyEvents",error);
        refresher.complete();
      })
    }
  }

  getListOfEvents(){
    if(this.eventState == "1"){
      this.getUpComingEvents();
    }else if(this.eventState == "0"){
      this.getMyEvents();
    }
  }

  getUpComingEvents(){
    this.presentLoading();
    this.restApiProvider.getUpEvents()
    .then(result => {
      this.loader.dismiss();
      this.rawListOfEvents = result;
      this.faculties = Object.keys(this.groupByFaculty(result));
      this.events = this.groupByFaculty(result);
    })
    .catch(error =>{
      this.loader.dismiss();
      console.log("ERROR API : getUpEvents",error);
    })
  }

  getMyEvents(){
    this.presentLoading();
    this.restApiProvider.getMyEvents()
    .then(result => {
      this.loader.dismiss();
      this.listOfMyEvents = result;
    })
    .catch(error =>{
      this.loader.dismiss();
      console.log("ERROR API : getMyEvents",error);
    })
  }

  groupByFaculty(facultyValues){
    return facultyValues.reduce((groups, facultyed) => {
      let key = "All";
      if(facultyed.Faculty_Name){
        key = facultyed.Faculty_Name;
      }
      if (groups[key]) {
        groups[key].push(facultyed);
      } else {
        groups[key] = [facultyed];
      }
      return groups;
    }, {});
  }

  eventDetails(tid: number){
    console.log("eventDetails",tid);
    let event: Event;
    if(this.eventState == "1"){
      event = this.rawListOfEvents.find(i => i.TID === tid);
      this.navCtrl.push(ViewEventPage, {event: event, "parentPage": this});
    }else if(this.eventState == "0"){
      event = this.listOfMyEvents.find(i => i.TID === tid);
      this.navCtrl.push(ViewEventPage, {event: event, "parentPage": this});
    }
    
  }

  getDate(date: string){
    let d = new Date(date).toString().split(" ");
    let t = d[4].split(":");
    return d[2]+" "+d[1]+" "+t[0]+":"+t[1];
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

