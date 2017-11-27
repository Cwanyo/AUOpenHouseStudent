import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular'
import { Loading } from 'ionic-angular/components/loading/loading';

import { CreateGamePage } from '../create-game/create-game';
import { EditGamePage } from './../edit-game/edit-game';
import { ViewGamePage } from '../view-game/view-game';

import { Game } from './../../interface/game';

import { RestApiProvider } from './../../providers/rest-api/rest-api';

/**
 * Generated class for the GameManagementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-game-management',
  templateUrl: 'game-management.html',
})
export class GameManagementPage {

  private loader: Loading;

  public gameState = "1";
  
  public games = [];
  public faculties = [];

  public rawListOfGames;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private restApiProvider: RestApiProvider,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController
  ) {
  }

  ngOnInit(){
    this.getListOfGames();
  }

  doRefresh(refresher) {
    this.restApiProvider.getGames(Number(this.gameState))
    .then(result => {
      this.rawListOfGames = result;
      this.faculties = Object.keys(this.groupByFaculty(result));
      this.games = this.groupByFaculty(result);
      refresher.complete();
    })
    .catch(error =>{
      console.log("ERROR API : getGames",error);
      refresher.complete();
    })
  }

  getListOfGames(){
    this.presentLoading();
    this.restApiProvider.getGames(Number(this.gameState))
    .then(result => {
      this.loader.dismiss();
      this.rawListOfGames = result;
      this.faculties = Object.keys(this.groupByFaculty(result));
      this.games = this.groupByFaculty(result);
    })
    .catch(error =>{
      this.loader.dismiss();
      console.log("ERROR API : getGames",error);
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

  createGame(param){
    if (!param) param = {};
    console.log("createGame")
    this.navCtrl.push(CreateGamePage, {"parentPage": this});
  }

  gameDetails(gid: number){
    console.log("viewGame",gid);
    let game: Game = this.rawListOfGames.find(i => i.GID === gid);
    
    this.navCtrl.push(ViewGamePage, {game: game, "parentPage": this});
  }

  gameEdit(gid: number){
    console.log("editGame",gid);
    let game: Game = this.rawListOfGames.find(i => i.GID === gid);
    
    this.navCtrl.push(EditGamePage, {game: game, "parentPage": this});
  }

  gameDelete(gid: number){
    console.log("Delete game:",gid);
    let confirm = this.alertCtrl.create({
      title: "Alert!",
      message: "Are you sure that you want to delete this game?",
      enableBackdropDismiss: false,
      buttons: [{
        text: "Disagree"
      },{
        text: "Agree",
        handler: () => {
          //TODO - delete the game (use api)
          console.log('Agree clicked');
          this.presentLoading();
          this.restApiProvider.deleteGame(gid)
          .then(result => {
            console.log("delete game success");
            this.loader.dismiss();
            this.getListOfGames();
            var jsonData: any = result;
            if(jsonData.isSuccess){
              this.presentAlert(jsonData.message);
            }
          })
          .catch(error =>{
            this.loader.dismiss();
            console.log("ERROR API : deleteGame",error);
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
