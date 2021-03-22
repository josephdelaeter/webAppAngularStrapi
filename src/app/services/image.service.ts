import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {tap} from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private url = 'http://localhost:1337/upload';

  constructor(private http: HttpClient) {}

  uploadImage(formData: FormData): Observable<any> {
    return this.http
      .post(this.url, formData)
      .pipe(tap(() => console.log(formData)));
  }
}
