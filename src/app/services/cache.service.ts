import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, any>();
  private cacheSubject = new BehaviorSubject<Map<string, any>>(new Map());

  constructor() {}

  set(key: string, value: any, ttl?: number): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl || 300000 // 5 minutes default
    };
    this.cache.set(key, item);
    this.cacheSubject.next(new Map(this.cache));
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.cacheSubject.next(new Map(this.cache));
      return null;
    }

    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.cacheSubject.next(new Map(this.cache));
  }

  clear(): void {
    this.cache.clear();
    this.cacheSubject.next(new Map(this.cache));
  }

  getCacheObservable(): Observable<Map<string, any>> {
    return this.cacheSubject.asObservable();
  }
}







































