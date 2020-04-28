import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable,Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeoPoligonService {
  private _apiKey: string = 'qwerty12345';
  private _polygonSubject = new Subject<any>();

  constructor(private _httpClient: HttpClient) { }

  getPolygons(outline, path = 'api/v1/polygon', apiKey = this._apiKey) {
    let options = new HttpParams()
      .set('xcode', apiKey)
      .set('ulx', outline.ulx)
      .set('uly', outline.uly)
      .set('lrx', outline.lrx)
      .set('lry', outline.lry);
    return this._httpClient.post('http://localhost:8000/' + path, options);
  }

  updatePolygons(polygons) {
    this._polygonSubject.next(polygons);
  }

  polygonListener(): Observable<any> {
    return this._polygonSubject.asObservable();
  }
}
