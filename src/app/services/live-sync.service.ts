import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';

export interface StockUpdateEvent {
  medicineId: string;
  newQuantity: number;
  newStatus: 'InStock' | 'LowStock' | 'OutOfStock';
}

@Injectable({ providedIn: 'root' })
export class LiveSyncService {
  private platformId = inject(PLATFORM_ID);
  private connection: HubConnection | null = null;
  private eventsSubject = new Subject<StockUpdateEvent>();
  
  events$ = this.eventsSubject.asObservable();
  connectionState = signal<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

  connect() {
    if (this.connection || !isPlatformBrowser(this.platformId)) return;

    this.connection = new HubConnectionBuilder()
      .withUrl('/hubs/medstock')
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveStockUpdate', (medicineId: string, newQuantity: number, newStatus: 'InStock' | 'LowStock' | 'OutOfStock') => {
      this.eventsSubject.next({ medicineId, newQuantity, newStatus });
    });

    this.connection.onreconnecting(() => this.connectionState.set('reconnecting'));
    this.connection.onreconnected(() => this.connectionState.set('connected'));
    this.connection.onclose(() => this.connectionState.set('disconnected'));

    this.connection.start()
      .then(() => this.connectionState.set('connected'))
      .catch((err: any) => console.error('SignalR connection error occurred:', err)); 
  }
}
