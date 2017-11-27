import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Loading } from 'ionic-angular/components/loading/loading';

import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Event } from './../../interface/event';

import { RestApiProvider } from './../../providers/rest-api/rest-api';

import firebase from 'firebase';
import {} from '@types/googlemaps';

/**
 * Generated class for the EditEventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-edit-event',
  templateUrl: 'edit-event.html',
})
export class EditEventPage {

  @ViewChild("map") mapRef: ElementRef;
  private map: google.maps.Map;
  private eventMapMarker: google.maps.Marker;

  public event: Event;
  public deleteEventTime = [];

  private loader: Loading;

  public eventForm: FormGroup;

  public minSelectabledate;
  public maxSelectabledate;

  public listFaculties;
  public listMajors;

  public storage = firebase.storage();
  
  public ImageOrientation: number;
  public Image: string;
  public gotImage: boolean = false;

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

    google.maps.event.addListener(this.map, 'click', event => {
      this.placeMarker(event.latLng, this.map);
    });
  }

  placeMarker(location, map){
    if(this.eventMapMarker){
      this.eventMapMarker.setPosition(location);
    }else{
      this.eventMapMarker = new google.maps.Marker({
        position: location,
        draggable: true,
        map: map
      });
    }
  }

  removeLocation(){
    this.eventMapMarker.setMap(null);
    this.eventMapMarker = null;
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
      Name: [this.event.Name.toString(), [Validators.required]],
      Info: [this.event.Info.toString(), [Validators.required]],
      Image: this.event.Image.toString(),
      State: [this.event.State.toString(), [Validators.required]],
      Location_Latitude: this.event.Location_Latitude.toString(),
      Location_Longitude: this.event.Location_Longitude.toString(),
      Event_Time: this.formBuilder.array([]),
      MID: [this.event.MID.toString(), [Validators.required]],
      FID: [this.event.FID.toString(), [Validators.required]]
    });
    //set major 
    this.hintMajors(Number(this.event.FID));
    this.eventForm.patchValue({MID: this.event.MID.toString()});
    //set event time
    this.initEventTime();
  }

  convertTime(time: string){
    let temp = time.split(" ");
    return temp[0]+"T"+temp[1]+".000Z"
  }

  initEventTime(){
    this.restApiProvider.getEventTime(Number(this.event.EID))
    .then(result => {
      let json: any = result;
      const control = <FormArray>this.eventForm.controls["Event_Time"];
      json.forEach(t => {
        control.push(this.formBuilder.group({
          TID: t.TID.toString(),
          Time_Start: [this.convertTime(t.Time_Start), [Validators.required]],
          Time_End: [this.convertTime(t.Time_End), [Validators.required]]
        }));
      });
    })
    .catch(error =>{
      console.log("ERROR API : getEventTime",error);
    })
  }

  addEventTime() {
    const control = <FormArray>this.eventForm.controls["Event_Time"];
    control.push(this.formBuilder.group({
      Time_Start: ["", [Validators.required]],
      Time_End: ["", [Validators.required]]
    }));
  }

  removeEventTime(i: number) {
    if(this.eventForm.get('Event_Time').value[i].TID){
      //if TID is exits and be removed 
      this.deleteEventTime.push(this.eventForm.get('Event_Time').value[i].TID);
    }
    const control = <FormArray>this.eventForm.controls["Event_Time"];
    control.removeAt(i);
  }

  submitEvent(){
    let confirm = this.alertCtrl.create({
      title: "Alert!",
      message: "Are you sure that you want to edit this event?",
      enableBackdropDismiss: false,
      buttons: [{
        text: "Disagree"
      },{
        text: "Agree",
        handler: () => {
          //get form data
          let event: Event = this.eventForm.value;
          
          //Change empty to NULL
          if(event.Image == ""){
            event.Image = null;
          }
          if(this.eventMapMarker){
            event.Location_Latitude = this.eventMapMarker.getPosition().lat().toString();
            event.Location_Longitude = this.eventMapMarker.getPosition().lng().toString();
          }else{
            event.Location_Latitude = null;
            event.Location_Longitude = null;
          }
          if(event.FID == "-1"){
            event.FID = null;
          }
          if(event.MID == "-1"){
            event.MID = null;
          }
          //--
          this.presentLoading();
          //delete event time if exist in bin
          this.deleteTime(Number(event.EID));
          //edit event
          this.editEvent(event);
        }
      }]
    });
    confirm.present();
    
  }

  deleteTime(eid: number){
    this.deleteEventTime.forEach(tid => {
      this.restApiProvider.deleteEventTime(eid, tid)
      .then(result => {
        console.log("delete event time success");
      })
      .catch(error =>{
        console.log("ERROR API : deleteEventTime",error);
      });
    });
  }

  editEvent(event: Event){
    this.restApiProvider.editEvent(event)
    .then(result => {
      this.loader.dismiss();
      console.log("edit event success");
      var jsonData: any = result;
      if(jsonData.isSuccess){
        this.presentAlert(jsonData.message);
        //refresth list of event on the main event page
        this.navParams.get("parentPage").getListOfEvents();
        this.navCtrl.popToRoot();
      }
    })
    .catch(error =>{
      this.loader.dismiss();
      console.log("ERROR API : editEvent",error);
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

  resetImage(){
    this.ImageOrientation = null;
    this.Image = null;
    this.gotImage = false;
  }

  removeImage(){
    this.eventForm.patchValue({Image: ""})
    this.resetImage();
    console.log("remove image");
  }

  uploadImage(event){
    //reset first
    this.resetImage();

    let pic = event.target.files[0];
    if(pic == null || pic.type!="image/jpeg"){
      console.log("image not in jpeg");
      return;
    }
    //GET orientation
    this.orientationReader(pic);
    //RESET picture orientation
    this.resetOrientationPhoto(pic);
  }

  orientationReader(picture){
    var reader = new FileReader();
    reader.onload = this._handleOrientationLoaded.bind(this);
    reader.readAsArrayBuffer(picture);
  }

  _handleOrientationLoaded(readerEvt){
    var view = new DataView(readerEvt.target.result);
    if (view.getUint16(0, false) != 0xFFD8){
      console.log("Error Picture not jped");
      return -2;
    }
    var length = view.byteLength, offset = 2;
    while (offset < length) {
      var marker = view.getUint16(offset, false);
      offset += 2;
      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966){
          console.log("Error Picture not defined");
          return -1;
        } 
        var little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;
        for (var i = 0; i < tags; i++)
          if (view.getUint16(offset + (i * 12), little) == 0x0112){
            let orientation = view.getUint16(offset + (i * 12) + 8, little);
            console.log("Picture orientation",orientation);
            this.ImageOrientation = orientation;
            return orientation;
          }
      }
      else if ((marker & 0xFF00) != 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
  }

  resetOrientationPhoto(picture){
    var img = new Image();
    img.onload = this._handleResetOrientationPhotoLoaded.bind(this);
    img.src = URL.createObjectURL(picture);
  }

  _handleResetOrientationPhotoLoaded(readerEvt){
    var img = readerEvt.path[0];
    var width = img.width,
    height = img.height,
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext("2d");

     if (4 < this.ImageOrientation && this.ImageOrientation < 9) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    switch (this.ImageOrientation) {
      case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, width, height ); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, height ); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, height , 0); break;
      case 7: ctx.transform(0, -1, -1, 0, height , width); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
      default: break;
    }

    ctx.drawImage(img, 0, 0);

    //export to base64 jpeg and set image quality  25%
    let imageData = canvas.toDataURL("image/jpeg",0.25);

    this.Image = imageData;
    console.log("Got Image");
    this.gotImage = true;
    this.uploadImageToFirestore();
  }

  uploadImageToFirestore(){
    if(this.gotImage==false){
      console.log("no image to upload");
      return;
    }
    this.presentLoading();
    let photoPath = "Images/Events/"+new Date().getTime()+".jpg";
    const storageRef = this.storage.ref(photoPath);
    storageRef.putString(this.Image, "data_url")
    .then(() =>{
      console.log("Uploaded image");
    })
    .then(() => {
      //get image URL
      const storageRef = this.storage.ref(photoPath);
      storageRef.getDownloadURL()
      .then(url =>{
        this.eventForm.patchValue({Image: url})
        console.log("Got image URL", url);
        this.loader.dismiss();
      });
    })
    .catch(error => {
      this.loader.dismiss();
      console.log("Error",error);
    });
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
