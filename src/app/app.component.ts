import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import {
    debounceTime,
    map,
    distinctUntilChanged,
    filter
} from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { ImageService } from './image.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
    photoList = [];
    pagenum = 1;
    itemData;
    closeResult: string;
    allCookies;


    constructor(
        public imageService: ImageService,
        private modalService: NgbModal,
        private cookieService: CookieService
    ) {


    }
// modal close function
    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }
    ngOnInit() {

        // to get all cookies to show as tags
        this.allCookies = this.cookieService.getAll();

        fromEvent(this.searchInput.nativeElement, 'keyup').pipe(

            // get value
            map((event: any) => {
                return event.target.value;
            })
            // if character length greater then 2
            , filter(res => res.length > 2)

            // Time in milliseconds between key events
            , debounceTime(1000)

            // If previous query is diffent from current   
            , distinctUntilChanged()

            // subscription for response
        ).subscribe((text: string) => {

            this.searchGetCall(text, this.pagenum)

        });
    }

    searchGetCall(term: string, pagenum) {

        if (term === '') {
           this.photoList = [];
        }
        this.imageService.getImages(this.searchInput.nativeElement.value, pagenum).subscribe((res) => {
            this.photoList =[];

            res["photos"].photo.forEach(item => {
                this.photoList.push(item);
            });
        
            // to  store data in cookies
             const cookieExists: boolean = this.cookieService.check(term);
            if (!cookieExists) {
                this.cookieService.set(term, JSON.stringify(res["photos"].photo));
            }

        }, (err) => {
            console.log('error', err);
        });;
    }
// Calls this function on scrolling
    onScroll() {
        this.pagenum += this.pagenum;
        this.searchGetCall(this.searchInput.nativeElement.value, this.pagenum)
    }

// To show image details in modal
    showImage(name, data) {
        this.modalService.open(name, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;

        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
        this.itemData = data;

    }

    // to get stored data in cookies
    getCookieData(key) {
        this.photoList =[];
        const value = this.cookieService.get(key);
        this.photoList= JSON.parse(value);
        this.searchInput.nativeElement.value = key;
    }

}