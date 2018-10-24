import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
/*
  Generated class for the RestApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestApiProvider {

  public url = 'https://auopenhouse-loadbalancer.herokuapp.com/api/student';
  // public url = 'https://auopenhouse.herokuapp.com/api/student';
  // public url = 'http://localhost:8080/api/student';

  constructor(public http: HttpClient) {
    console.log('Hello RestApiProvider Provider');
  }

  login(idToken: string){
    let path = this.url+'/login';

    return new Promise((resolve, reject) => {
      this.http.post(path, {idToken: idToken}, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  logout(){
    let path = this.url+'/logout';

    return new Promise((resolve, reject) => {
      this.http.delete(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getFaculties(){
    let path = this.url+'/faculties';
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getMajorsInFaculty(fid: number){
    let path = this.url+'/faculties/'+fid+'/majors';
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getUpEvents(){
    let path = this.url+'/upevents';
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }
  
  getMyEvents(){
    let path = this.url+'/myevents';
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  joinEvent(tid: number){
    let path = this.url+'/myevents/'+tid;
    
    return new Promise((resolve, reject) => {
      this.http.post(path, null, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  leaveEvent(tid: number){
    let path = this.url+'/myevents/'+tid;
    
    return new Promise((resolve, reject) => {
      this.http.delete(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  checkMyEventAttend(tid: number){
    let path = this.url+'/myevents/'+tid;
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getEvents(state: number){
    let path = this.url+'/upevents/'+state;
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getEventTime(eid: number){
    let path = this.url+'/events/'+eid+'/times';

    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getEventTimeAttendess(eid:number, tid: number){
    let path = this.url+'/events/'+eid+'/times/'+tid+'/attendees';

    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getMyPoints(){
    let path = this.url+'/mygamepoints';
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getUpGames(){
    let path = this.url+'/upgames';
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getMyGames(){
    let path = this.url+'/mygames';
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getGameQuestion(gid: number){
    let path = this.url+'/games/'+gid+'/questions';

    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  getAnswerChoice(gid: number, qid: number){
    let path = this.url+'/games/'+gid+'/questions/'+qid+'/choices';
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  submitGameAnswer(answer){
    let path = this.url+'/mygames';
    
    return new Promise((resolve, reject) => {
      this.http.post(path, {answer: answer}, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  checkMyGamePlay(gid: number){
    let path = this.url+'/mygames/'+gid;
    
    return new Promise((resolve, reject) => {
      this.http.get(path, {withCredentials: true})
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

}
