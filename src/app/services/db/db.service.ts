import {Injectable, OnDestroy} from '@angular/core';
import {AngularFireDatabase, AngularFireList, QueryFn} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {ThenableReference} from 'firebase/database';
import {AngularFireStorage} from 'angularfire2/storage';
import 'rxjs/add/operator/takeUntil';
import {Subject} from 'rxjs/Subject';
import {IMessage} from '../../models/IMessage';

@Injectable()
export class DbService implements OnDestroy {

  private onDestroyStream$ = new Subject<boolean>();

  constructor(public  db: AngularFireDatabase, public afStor: AngularFireStorage) {
  }

  selectDB<T>(from: string, callback: QueryFn = ref => ref): Observable<T[]> {
    const list: AngularFireList<T> = this.db.list(from, callback);
    return list.valueChanges();
  }

  updateDB(updates: any): Observable<any> {
    this.db.database.ref().update(updates);
    return new Observable();
  }

  insertDB(from: string, objToPush: any): ThenableReference {
    return this.db.list(from).push(objToPush);
  }

  getNewId(from: string): string {
    return this.db.database.ref().child(from).push().key;
  }

  addNewChat(newChat: any): void {
    this.db.database.ref().update({...newChat});
  }

  addFile(file: File, chat: string, user: string): void {
    this.afStor
      .ref(file.name)
      .put(file)
      .downloadURL()
      .takeUntil(this.onDestroyStream$)
      .subscribe(response => {
        this.sendMessage('img', response, chat, user);
      });
  }

  sendMessage(type: string, text: string, chat: string, user: string): void {
    this.insertDB(`/chats/${chat}/messages/`, {
      text,
      date: Date.now(),
      user,
      type
    });
  }

  getMesasges(chatId: string) {
    return this.selectDB<IMessage>(`/chats/${chatId}/messages/`, ref => {
      return ref.orderByChild('date');
    });
  }

  ngOnDestroy(): void {
    this.onDestroyStream$.next(true);
  }
}
