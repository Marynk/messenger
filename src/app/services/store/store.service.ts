import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {AngularFireDatabase} from 'angularfire2/database';
import {IMyUser} from '../../models/IMyUser';

@Injectable()
export class StoreService {
  private myUser = new ReplaySubject<IMyUser>();

  constructor(public  db: AngularFireDatabase) {}

  setUser(user: IMyUser): void {
    this.myUser.next({chats: {}, ...user});
    localStorage.setItem('userInMyApp', JSON.stringify(user));
  }

  get user(): Observable<IMyUser> {
    return this.myUser.asObservable();
  }
}
