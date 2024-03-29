import {ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MenuItem, MessageService} from 'primeng/api';
import {combineLatest, EMPTY, from, Observable, Subject, zip} from 'rxjs';
import {
  bufferTime,
  catchError,
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  finalize,
  map,
  sampleTime,
  tap,
  throttleTime
} from 'rxjs/operators';
import {ServerMessageModel} from "../../../api/server-message.model";
import {ChatClientTypingModel} from "../../../api/chat-client.model";
import {VideoSourceUpdateModel} from "../../../api/video-source-update.model";
import {UserPrincipalService} from "../../../services/user-principal.service";
import {ChatSnapshotService} from "../../../services/chat-snapshot.service";
import {WsService} from "../../../services/ws.service";
import {UuidFactoryService} from "../../../services/uuid-factory.service";
import {AttachmentService} from "../../../services/attachment.service";
import {HttpService} from "../../../services/http.service";
import {TypingService} from "../../../services/typing.service";
import {UrlFactoryService} from "../../../services/url-factory.service";
import {MessageWithAttachment} from "./message-input/message-input.component";
import {AttachmentModel} from "../../../api/rich-message.model";
import {UserModel} from "../../../api/user.model";
import {HttpEventType} from "@angular/common/http";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [MessageService]
})
export class ChatComponent implements OnInit, OnDestroy {

  cornerMenuItems!: MenuItem[];
  messages: ServerMessageModel[] = [];
  users: ChatClientTypingModel[] = [];
  progress:any = null;
  fixedScroll = false;

  scrollEmitter = new EventEmitter<number>();

  nick: string= '';
  nickChanged: Subject<string> = new Subject();
  videoSourceUpdates$: Observable<VideoSourceUpdateModel> = this.ws.incoming.pipe(
    filter(m => m.type === 'videoSource'),
    map(m => JSON.parse(m.payload) as VideoSourceUpdateModel)
  );

  @ViewChild('messagesScroll') private msgScroll: ElementRef | undefined;

  constructor(private userPrincipalService: UserPrincipalService,
              private router: Router,
              private ws: WsService,
              private snapshotService: ChatSnapshotService,
              private uuidFactory: UuidFactoryService,
              private downloadService: AttachmentService,
              private messageService: MessageService,
              private typingService: TypingService,
              private urlFactory: UrlFactoryService,
              private httpService: HttpService,
              private changeDetectionRef: ChangeDetectorRef
  ) {
  }

  get principal(): UserModel {
    return this.userPrincipalService.getUser() ;
  }

  get thumbsUrl(): string {
    return this.urlFactory.getThumbsUrl();
  }

  ngOnInit(): void {
    this.nick = this.principal.nick;
    this.setCornerMenuHandlers();
    this.setIncomingMessageHandlers();
    this.setNickChangedHandler();
    this.setUsersListHandlers();
    this.setMessageHistoryHandler();
  }

// ====== CORNER MENU UI EVENTS ========
  setCornerMenuHandlers() {
    this.cornerMenuItems = [
      {label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout()},
    ];
  }

  logout() {
    this.userPrincipalService.removePrincipal();
    this.router.navigate(['/']);
  }

// ====== INCOMING WS MESSAGES ========
  setIncomingMessageHandlers() {
    this.ws.incoming.pipe(
      tap(m => this.snapshotService.handle(m)),
      tap(m => this.typingService.handle(m)),
      tap(m => {
          if (m.id === 'internal' && m.type === 'command' && m.payload === 'clearChatAppender') {
            this.messages = [];
          }
        }
      ),
      filter(m => m.type === 'msg' || m.type === 'richMsg' || m.type === 'info'),
      bufferTime(600),
      filter(buffer => buffer.length > 0),
      tap(m => {
        this.messages.push(...m);
        this.changeDetectionRef.detectChanges();
        this.scrollToBottom(false);
      })
    ).subscribe();
  }

  scrollToBottom(force: boolean) {
    if (!force && this.fixedScroll) {
      return;
    }
    try {
      const el = this?.msgScroll?.nativeElement;
      el.scrollTop = el.scrollHeight - el.clientHeight;
    } catch (err) {
    }
  }

// ====== NICK CHANGED UI EVENT ========
  setNickChangedHandler() {
    this.nickChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      filter(nick => nick !== null && this.nick.length !== 0),
      tap(nick => {
        this.userPrincipalService.setNick(nick);
        this.ws.sendUpdateMe();
      })
    ).subscribe();
  }

// ====== USERS LIST UPDATE ========
  setUsersListHandlers() {
    // combine a users list managed by the snapshot service with a typingMap managed by the typing service
    // and sort the resulting list
    combineLatest([this.snapshotService.getClientsList$(), this.typingService.getTypingMap$()]).pipe(
      sampleTime(700)
    ).subscribe(([users, typingMap]) => {
      this.users = users.map(user => ({
        ...user,
        isTyping: (typingMap.get(user.clientId) !== undefined)
      })).sort((a, b) => a.nick.localeCompare(b.nick));
    });
  }


// ====== OUTGOING MESSAGES UI EVENT ========
  sendMessage(payload: MessageWithAttachment) {
    // no attachments
    if (payload.files.length === 0) {
      this.ws.sendMsg(payload.message);
      return;
    }

    this.progress = 0;

    // prepare form data
    const formData: FormData = new FormData();
    const attachments: AttachmentModel[] = [];
    payload.files.forEach(file => {
      const attachment: AttachmentModel = {
        fileId: this.uuidFactory.newUuid(),
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        type: file.type
      };
      formData.append('file', file, attachment.fileId);
      attachments.push(attachment);
    });

    // upload from date and handle progress bar
    this.downloadService.uploadFormData(formData).pipe(
      tap((e: any) => {
        if (e.type === HttpEventType.Response && e.status === 200) {
          attachments.forEach(a => a.fileId = e.body[a.fileId]);
          this.ws.sendRichMsg({message: payload.message, attachments});
        }
      }),
      filter(e => e.type === HttpEventType.UploadProgress),
      map(e => e.type === HttpEventType.UploadProgress ? Math.floor(100 * e.loaded / e?.total) : null),
      throttleTime(1000),
      finalize(() => this.progress = null)
    ).subscribe(v => this.progress = v);
  }

// ====== DOWNLOAD ATTACHMENT UI EVENT ========
  downloadAttachment(attachment: AttachmentModel) {
    this.downloadService.downloadAttachment(attachment).pipe(
      catchError(e => {
        this.messageService.add({
          key: 'toast',
          severity: 'error',
          summary: 'Error ' + e.status + ': ' + e.statusText,
          detail: attachment.name
        });
        return EMPTY;
      })
    ).subscribe();
  }

// ====== USER TYPING UI EVENT ========
  userTyping() {
    this.ws.sendSetTyping();
  }

// ====== SCROLL UI EVENT ========
  onScroll() {
    const el = this?.msgScroll?.nativeElement;
    this.fixedScroll = el.scrollTop < el.scrollHeight - el.clientHeight * 1.1;
    this.scrollEmitter.emit(el.scrollTop);
  }

  private setMessageHistoryHandler() { // fires when a scroll position reaches the top of the chat
    this.scrollEmitter.pipe(
      debounceTime(200),
      filter(pos => pos === 0),
      map(_ => this.messages.find(m => m.id !== 'internal')),
      filter(m => m !== undefined && m.id !== undefined),
      exhaustMap(m => zip(from([m]), this.httpService.getMessageHistory(m)))
    ).subscribe(z => {
      const [mes, res] = [...z];
      if (res.length > 0) {
        const pos = this.messages.findIndex(m => m.id === mes?.id);
//        this.messages.splice(pos, 0, ...res); // this will NOT remove internal messages
        this.messages.splice(0, pos, ...res); // this WILL remove internal messages
        this.changeDetectionRef.detectChanges();
        document.getElementById(`m${mes?.id}`)?.scrollIntoView();
      }
    });
  }

  ngOnDestroy(): void {
    // this also cancels all subscriptions to the ws subject
    // so a manual unsubscription is unnecessary
    this.ws.closeConnection();
  }
}
