import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Loading } from 'ionic-angular/components/loading/loading';

import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Game } from './../../interface/Game';

import { RestApiProvider } from './../../providers/rest-api/rest-api';
import {} from '@types/googlemaps';
/**
 * Generated class for the ViewGamePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-view-game',
  templateUrl: 'view-game.html',
})
export class ViewGamePage {

  @ViewChild("map") mapRef: ElementRef;
  private map: google.maps.Map;
  private eventMapMarker: google.maps.Marker;

  public game: Game;
  public deleteGameQuestion = [];

  private loader: Loading;
  
  public gameForm: FormGroup;

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
    this.game = this.navParams.get("game");
    console.log("Game",this.game);

    this.showMap();
    this.getListOfFaculties();

    let d = new Date();
    this.minSelectabledate = d.getFullYear();
    this.maxSelectabledate = d.getFullYear()+1;

    this.initGame();
    this.gameForm.disable();
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

  initGame(){
    //Change NULL to empty 
    if(this.game.Image == null){
      this.game.Image = "";
    }else{
      this.Image = this.game.Image;
    }
    if(this.game.Location_Latitude&&this.game.Location_Longitude){
      this.placeMarker(new google.maps.LatLng(Number(this.game.Location_Latitude),Number(this.game.Location_Longitude)),this.map);
      this.map.setCenter(this.eventMapMarker.getPosition());
    }else{
      this.game.Location_Latitude = "";
      this.game.Location_Longitude = "";
    }
    if(this.game.FID == null){
      this.game.FID = "-1";
    }
    if(this.game.MID == null){
      this.game.MID = "-1";
    }
    //--
    this.gameForm = this.formBuilder.group({
      GID: this.game.GID.toString(),
      Name: [this.game.Name.toString(), [Validators.required]],
      Info: [this.game.Info.toString(), [Validators.required]],
      Image: this.game.Image.toString(),
      Time_Start: [this.convertTime(this.game.Time_Start), [Validators.required]],
      Time_End: [this.convertTime(this.game.Time_End), [Validators.required]],
      State: [this.game.State.toString(), [Validators.required]],
      Location_Latitude: this.game.Location_Latitude.toString(),
      Location_Longitude: this.game.Location_Longitude.toString(),
      Game_Question: this.formBuilder.array([]),
      MID: [this.game.MID.toString(), [Validators.required]],
      FID: [this.game.FID.toString(), [Validators.required]]
    });
    //set major 
    this.hintMajors(Number(this.game.FID));
    this.gameForm.patchValue({MID: this.game.MID.toString()});
    //set game question
    this.initGameQuestion();
  }

  convertTime(time: string){
    let temp = time.split(" ");
    return temp[0]+"T"+temp[1]+".000Z"
  }

  initGameQuestion(){
    this.restApiProvider.getGameQuestion(Number(this.game.GID))
    .then(result => {
      let json: any = result;
      const gameControl = <FormArray>this.gameForm.controls["Game_Question"];
      json.forEach(q => {
        let gq = this.formBuilder.group({
          QID: q.QID.toString(),
          Question: [q.Question.toString(), [Validators.required]],
          Answer_Choice: this.formBuilder.array([]),
          Right_Choice: [q.Right_Choice.toString(), [Validators.required]]
        });
        
        this.initAnswerChoice(q.QID, gq);
        
        gameControl.push(gq);
      });
      gameControl.disable();
    })
    .catch(error =>{
      console.log("ERROR API : getGameQuestion",error);
    })
  }

  initAnswerChoice(qid: number, gq: FormGroup){
    this.restApiProvider.getAnswerChoice(0,qid)
    .then(result => {
      let json: any = result;
      const choiceControl = <FormArray>gq.controls["Answer_Choice"];
      json.forEach(c => {
        choiceControl.push(this.formBuilder.group({
          CID: c.CID.toString(),
          Choice: [c.Choice.toString(), [Validators.required]],
        }));
      });
      choiceControl.disable();
    })
    .catch(error =>{
      console.log("ERROR API : getAnswerChoice",error);
    })
  }

  initNewGameQuestion(){
    return this.formBuilder.group({
      Question: ["", [Validators.required]],
      Answer_Choice: this.formBuilder.array([
        this.initNewAnswerChoice(),this.initNewAnswerChoice(),this.initNewAnswerChoice(),this.initNewAnswerChoice(),
      ]),
      Right_Choice: ["", [Validators.required]]
    });
  }

  initNewAnswerChoice(){
    return this.formBuilder.group({
      Choice: ["", [Validators.required]],
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
    this.gameForm.patchValue({MID:"-1"});
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
