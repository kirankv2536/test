import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";

const BASE_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&';
const APIKEY = "50d2b7ca9df5d9299a5b32e047e0e8c4";

@Injectable()
export class ImageService {
  
  constructor(private http: HttpClient) { }

  getImages(term,page) {
    return this.http.get(`${BASE_URL}api_key=${APIKEY}&text=${term}&per_page=5&page=${page}&format=json&nojsoncallback=1`);
  }
}