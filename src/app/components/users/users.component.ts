import {Component, OnDestroy, OnInit} from '@angular/core';
import {StoreService} from '../../services/store/store.service';
import {DataBaseService} from '../../services/db/dataBase.service';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {FormControl} from '@angular/forms';
import {IMyUser} from '../../config/interfaces/IMyUser';
import {IDictionary} from '../../config/dictionaris/IDictionary';
import {IMessage} from '../chat/config/interfaces/IMessage';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators';
import {combineLatest} from 'rxjs/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/first';

const USERS = 'users';
const CHATS = 'chats';
const CHAT = 'chat';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.less']
})

export class UsersComponent implements OnInit, OnDestroy {

  users$: Observable<IMyUser[]>;
  usersStart$: Observable<IMyUser[]>;
  currentUser$: Observable<IMyUser>;
  find = new FormControl();
  currentUserChat: IMyUser;

  private onDestroy$ = new Subject<void>();

  constructor(public dbService: DataBaseService,
              private storeService: StoreService,
              private router: Router,
              private titleService: Title) {
  }

  ngOnInit() {
    this.titleService.setTitle('Пользователи');
    this.users$ = combineLatest(this.find.valueChanges.pipe(startWith('')), this.dbService.selectDB(USERS))
      .map(([searchString, users = []]: [string, IMyUser[]]) => users.filter(({login}: IMyUser) => login.toLowerCase()
        .includes(searchString.toLowerCase())));
    this.usersStart$ = this.dbService.selectDB<IMyUser>(USERS);
    this.currentUser$ = this.storeService.user;
  }

  checkChat(user: IMyUser) {
    this.currentUserChat = user;
    this.currentUser$
      .first()
      .subscribe(data => {
        data.chats[user.id]
          ? this.enterInRealChat(data.chats[user.id])
          : this.createChat(user.id);
      })
    ;
  }

  enterInRealChat(check: string) {
    this.dbService.selectDB(`${CHATS}/` + check, ref => ref)
      .map((items: (string | IDictionary<IMessage>)[]) => items.find(element => typeof element === 'string'))
      .first()
      .subscribe(id => this.router.navigate([`/${USERS}/${CHAT}/${id}`]));
  }

  createChat(chat: string) {
    const newPostKey = this.dbService.getNewId(`${CHATS}`);
    const updates = {};
    const postData = {
      idChat: newPostKey,
      messages: {}
    };

    this.currentUser$
      .first()
      .subscribe(data => {
        data.chats[chat] = newPostKey;
        this.storeService.setUser(data);
        this.addChatToClient(chat, data.id, newPostKey);

        if (chat !== data.id) {
          this.addChatToClient(data.id, chat, newPostKey);
        }
      });

    updates[`/${CHATS}/` + newPostKey] = postData;
    this.dbService.updateDB(updates).then(res => {
      if (res) {
        this.enterInRealChat(newPostKey);
      }
    });
  }

  addChatToClient(id1: string, id2: string, key: string) {
    const updates = {};

    updates[`/${USERS}/${id1}/${CHATS}/${id2}`] = key;
    this.dbService.addNewChat(updates);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
