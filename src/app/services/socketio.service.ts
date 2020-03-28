import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  constructor(private _Socket : Socket) {
  }

  listen (eventName : string) {
    return new Observable((subscriber) => {
      this._Socket.on(eventName, (data) => {
        subscriber.next(data);
      });
    });
  }

  emit (eventName : string, data : any) {
    this._Socket.emit(eventName,data);
  }

}
