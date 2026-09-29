import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface LogMessage {
  type: 'stdout' | 'stderr' | 'status' | 'error';
  message: string;
  code?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket?: WebSocket;
  private logSubject = new Subject<LogMessage>();

  public connectJobLogs(jobId: string): Observable<LogMessage> {
    const wsUrl = `ws://localhost:8000/ws/execution/${jobId}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.logSubject.next({ type: 'status', message: 'WebSocket Connected' });
    };

    this.socket.onmessage = (event) => {
      try {
        const data: LogMessage = JSON.parse(event.data);
        this.logSubject.next(data);
      } catch (err) {
        this.logSubject.next({ type: 'stdout', message: event.data });
      }
    };

    this.socket.onerror = (error) => {
      this.logSubject.next({ type: 'error', message: 'WebSocket Connection Error' });
    };

    this.socket.onclose = () => {
      this.logSubject.next({ type: 'status', message: 'WebSocket Connection Closed' });
    };

    return this.logSubject.asObservable();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
  }
}
