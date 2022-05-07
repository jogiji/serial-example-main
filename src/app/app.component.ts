import { Component } from '@angular/core';
import { tapOnFirstEmit, fromWebSerial } from "@rxjs-ninja/rxjs-utility";
import { fromEvent, merge, Observable, Subject } from "rxjs";
import { delay, finalize, tap } from "rxjs/operators";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Serial Communication';
  message: string = '';
  port: any;

  // Emitter for our message from the input
  sendMessage$ = new Subject<Uint8Array>();
  decoder = new TextDecoder("utf-8");
  encoder = new TextEncoder();
  endCtrl: AbortController = new AbortController();
  tempMessage:string='';
  connection:Observable<Uint8Array> | undefined = undefined;
  constructor() {

  }

  async connect() {
    await this.startConnection();
  }


  async startConnection() {
    this.endCtrl = new AbortController();
    this.port = await navigator.serial.requestPort();
    /**
     * Pass out port, input and signal for ending the connection
     */
    this.connection = fromWebSerial(this.port, this.sendMessage$.asObservable(),undefined, this.endCtrl.signal);
    this.connection.subscribe((value) => {
      let msg = this.decoder.decode(value);
      this.tempMessage += msg;
      if(msg.includes('\n')){
        this.message = this.tempMessage;
        //this.tempMessage = '';
      }
    });
  }

  toggleL1() {
    // this.connection?.subscribe((value) => { 
    //   console.log('RA',this.decoder.decode(value));
    // });
    if (this.port)
      this.sendMessage$.next(this.encoder.encode("ON\n"));
  }
  toggleL2() {
    if (this.port)
      this.sendMessage$.next(this.encoder.encode("OFF\n"));
  }

  close() {
    if(this.port)
      this.endCtrl.abort();
  }
}