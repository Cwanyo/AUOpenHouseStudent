import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ViewAttendeesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-view-attendees',
  templateUrl: 'view-attendees.html',
})
export class ViewAttendeesPage {

  private listEventTimeAttendess;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams
  ) {
  }

  //TODO - it can make as attended checker have to edit database by adding extra col in student_attend_event_time
  ngOnInit(){
    this.listEventTimeAttendess = this.navParams.get("attendees");
  }
}
