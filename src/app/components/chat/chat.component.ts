import {Component, OnDestroy, OnInit} from '@angular/core';
import {DbService} from '../../services/db/db.service';
import {ActivatedRoute} from '@angular/router';
import {StoreService} from '../../services/store/store.service';
import {Title} from '@angular/platform-browser';
import 'firebase/storage';
import {IMessage} from '../../models/IMessage';
import {IMyUser} from '../../models/IMyUser';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages$: Observable<IMessage[]>;
  newContent = '';
  usersInChat: string;
  myneLogin: string;

  private onDestroyStream$ = new Subject<boolean>();

  constructor(public  db: DbService,
              private storeService: StoreService,
              public route: ActivatedRoute,
              private titleService: Title) {
  }

  ngOnInit() {
    this.titleService.setTitle('Чат');
    this.storeService.user.takeUntil(this.onDestroyStream$).subscribe((user: IMyUser) => {
      this.myneLogin = user.login;
    });
    this.route.paramMap.takeUntil(this.onDestroyStream$).subscribe(id => {
      this.usersInChat = id.get('id');
      this.initChat();
    });
  }

  initChat(): void {
    this.messages$ = this.db.selectDB<IMessage>(`/chats/${this.usersInChat}/messages/`, ref => {
      return ref.orderByChild('date');
    });
  }

  checkDate(mesDate: Date): string {
    return `${new Date(mesDate).getHours()}:${new Date(mesDate).getMinutes()}`;
  }

  addNewContent(): void {
    this.db.sendMessage('text', this.newContent, this.usersInChat, this.myneLogin);
    this.newContent = '';
  }

  addFile(target: HTMLInputElement): void {
    const file = target.files.item(0);
    if (file) {
      this.db.addFile(file, this.usersInChat, this.myneLogin);
    }
  }

  ngOnDestroy(): void {
    this.onDestroyStream$.next(true);
  }
}
