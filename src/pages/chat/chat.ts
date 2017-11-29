import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import {Observable} from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  @ViewChild(Content) content: Content;
  
  private user: firebase.User;
  private username: string;

  private messageRef: string;

  public subLogin: Subscription;
  public subMess: Subscription;
  public subAuSc: Subscription;

  public eid: number = 0;

  public messages: Observable<any[]>;

  public message: string = "";

  constructor(
    public navCtrl: NavController, 
    private afAuth: AngularFireAuth,
    private afDB:AngularFireDatabase,
    public navParams: NavParams
  ) {
  }

  ngOnInit(){
    this.eid = this.navParams.get('eid');
    this.messageRef = "Chats/Events/"+this.eid;

    this.userAuth();
    this.subMessage();
    this.subAutoScoll();
  }

  ngOnDestroy(){
    this.subAuSc.unsubscribe();
    this.subMess.unsubscribe();
    this.leaveChat();
    this.subLogin.unsubscribe();
  }

  userAuth(){
    this.subLogin = this.afAuth.authState.subscribe(user => {
      if (!user) {
        this.user = null;
        return;
      }
      this.user = user;
      this.username = user.displayName;
      this.enterChat();
    });
  }

  subMessage(){
    this.messages = this.afDB.list(this.messageRef).valueChanges();
  
    this.subMess = this.messages.subscribe(data => {
    });
  }

  subAutoScoll(){
    this.subAuSc = Observable.interval(400).subscribe(() => {
      this.content.scrollToBottom();
    });
  }

  enterChat(){
    this.afDB.list(this.messageRef).push({
      specialMessage: true,
      message: `${this.user.displayName} has joined the chat`
    });
  }

  leaveChat(){
    this.afDB.list(this.messageRef).push({
      specialMessage: true,
      message: `${this.user.displayName} has left the chat`
    });
  }

  sendMessage(){
    this.afDB.list(this.messageRef).push({
      username: this.user.displayName,
      message: this.message
    }).then(()=>{

    });
    this.message = "";
  }

  isValid(): boolean{
    if(this.message==""){
      return false;
    }else{
      return true;
    }
  }

}
