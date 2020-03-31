import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import { State } from '../reducers/index';
import { addGlobalConnection, NamespaceConnection, newNamespaceConnection } from '../reducers/actions/sockets.action';
import { getGlobalConnection, getNamespacesArray } from '../reducers/selectors/sockets.selector';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  globalConnection : SocketIOClient.Socket;
  namespacesArray : NamespaceConnection[];

  constructor(private store : Store<State>) {
    this.store.select(getGlobalConnection).subscribe((connection : SocketIOClient.Socket) => this.globalConnection = connection);
    this.store.select(getNamespacesArray).subscribe((namespaces : NamespaceConnection[]) => this.namespacesArray = namespaces);
  }

  globalConnect () {
    this.globalConnection = io(environment.baseUrl);
    this.store.dispatch(addGlobalConnection({connection: this.globalConnection}));
  }

  connectToNamespace (path : string) {
    let namespaceConnection : NamespaceConnection = {
      path,
      connection: io(environment.baseUrl,{path})
    }
    this.store.dispatch(newNamespaceConnection({namespace: namespaceConnection}));
  }

  listen (eventName : string) {
    return new Observable((subscriber) => {
      this.globalConnection.on(eventName, (data) => {
        subscriber.next(data);
      });
    });
  }

  emit (eventName : string, data : any) {
    this.globalConnection.emit(eventName,data);
  }

  disconnect () : void {
    this.globalConnection = this.globalConnection.disconnect();
    this.store.dispatch(addGlobalConnection({connection: this.globalConnection}));
  }

}
