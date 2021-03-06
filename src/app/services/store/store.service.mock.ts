import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {IMyUser} from '../../config/interfaces/IMyUser';

@Injectable()
export class StoreServiceMock {

  get user(): Observable<IMyUser> {
    return Observable.of({
      id: '0',
      login: 'Test',
      mail: 'test@gmail.com',
      password: 'testtest',
      chats: {},
    });
  }
}
