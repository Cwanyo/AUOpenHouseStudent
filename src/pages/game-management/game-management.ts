import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular'
import { Loading } from 'ionic-angular/components/loading/loading';

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
  public listOfMyGames;

  public emptylistOfMyGames = false;

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
    // add refresher.complete();
    if(this.gameState == "1"){
      this.restApiProvider.getUpGames()
      .then(result => {
        this.rawListOfGames = result;
        this.faculties = Object.keys(this.groupByFaculty(result));
        this.games = this.groupByFaculty(result);
        refresher.complete();
      })
      .catch(error =>{
        console.log("ERROR API : getUpGames",error);
        refresher.complete();
      });
    }else if(this.gameState == "0"){
      this.restApiProvider.getMyGames()
      .then(result => {
        if((result as any).length != 0){
          this.listOfMyGames = result;
        }else{
          this.listOfMyGames = null;
        }
        refresher.complete();
      })
      .catch(error =>{
        console.log("ERROR API : getMyGames",error);
        refresher.complete();
      });
    }
  }

  getListOfGames(){
    if(this.gameState == "1"){
      this.getUpComingGames();
    }else if(this.gameState == "0"){
      this.getMyGames();
    }
  }

  getUpComingGames(){
    this.presentLoading();
    this.restApiProvider.getUpGames()
    .then(result => {
      this.loader.dismiss();
      this.rawListOfGames = result;
      this.faculties = Object.keys(this.groupByFaculty(result));
      this.games = this.groupByFaculty(result);
    })
    .catch(error =>{
      this.loader.dismiss();
      console.log("ERROR API : getUpGames",error);
    });
  }

  getMyGames(){
    this.presentLoading();
    this.restApiProvider.getMyGames()
    .then(result => {
      this.loader.dismiss();
      if((result as any).length != 0){
        this.listOfMyGames = result;
      }else{
        this.listOfMyGames = null;
      }
    })
    .catch(error =>{
      this.loader.dismiss();
      console.log("ERROR API : getMyGames",error);
    });
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

  gameDetails(gid: number){
    console.log("gameDetails",gid);
    let game: Game;
    if(this.gameState == "1"){
      game = this.rawListOfGames.find(i => i.GID === gid);
      this.navCtrl.push(ViewGamePage, {game: game, "parentPage": this});
    }else if(this.gameState == "0"){
      game = this.listOfMyGames.find(i => i.GID === gid);
      this.navCtrl.push(ViewGamePage, {game: game, "parentPage": this});
    }
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
