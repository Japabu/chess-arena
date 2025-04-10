import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket | null = null;
  private socketSubjects: { [event: string]: Subject<any> } = {};
  private connectedSignal = signal(false);

  public readonly connected = this.connectedSignal.asReadonly();

  constructor() {}

  connect(token?: string): void {
    if (this.socket) {
      this.socket.close();
    }

    // Extract base URL without the /api path
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');

    // Initialize socket connection
    this.socket = io(baseUrl, {
      auth: token ? { token } : undefined,
    });

    // Set up connection handlers
    this.socket.on('connect', () => {
      this.connectedSignal.set(true);
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      this.connectedSignal.set(false);
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectedSignal.set(false);
    }
  }

  emit(event: string, data?: any): void {
    if (!this.socket) {
      console.warn('Cannot emit event: socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  on<T>(event: string): Observable<T> {
    if (!this.socketSubjects[event]) {
      this.socketSubjects[event] = new Subject<T>();

      if (this.socket) {
        this.socket.on(event, (data: T) => {
          this.socketSubjects[event].next(data);
        });
      }
    }

    return this.socketSubjects[event].asObservable();
  }
}
