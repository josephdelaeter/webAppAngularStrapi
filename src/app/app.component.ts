import { Component, OnDestroy } from '@angular/core';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Observable, Subject, Observer, Subscription } from 'rxjs';
import { ImageService } from './services/image.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  title = 'pictureProject';

  constructor(private ImageService: ImageService) {}

  public videoOptions: MediaTrackConstraints = {
    width: 1024,
    height: 576,
  };

  imageFile: File;
  sub: Subscription;
  pleaseWait = false;
  isPreviewVisible = true;
  togglePreviewMessage = 'prévisualisation activée';
  pictureUploaded = false;
  message:string = ""

  public errors: WebcamInitError[] = [];

  //latest snapshot

  public webcamImage: WebcamImage = null;

  generatedImage: string;

  //webcam snapshot trigger

  private trigger: Subject<void> = new Subject<void>();

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
    console.error('errors', this.errors);
  }

  public handleImage(webcamImage: WebcamImage) {
    console.log('received webcamImage', webcamImage);
    this.pictureUploaded = false;
    this.webcamImage = webcamImage;
    this.dataURIToBlob(webcamImage.imageAsBase64).subscribe(
      (blob) => {
        const imageBlob: Blob = blob;
        const imageName: string = `${new Date().toISOString()}.jpeg`;
        this.imageFile = new File([imageBlob], imageName, {
          type: 'image/jpeg',
        });

        this.generatedImage = window.URL.createObjectURL(this.imageFile);
        //window.open(this.generatedImage);
      },
      (err) => console.error(err),
      () => console.log('completed')
    );
  }
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  dataURIToBlob(dataURI: string): Observable<Blob> {
    return Observable.create((observer: Observer<Blob>) => {
      const byteString: string = window.atob(dataURI);
      const arrayBuffer: ArrayBuffer = new ArrayBuffer(byteString.length);
      const Int8Array: Uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        Int8Array[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([Int8Array], { type: 'image/jpeg' });
      observer.next(blob);
      observer.complete();
    });
  }

  upload() {
    this.pleaseWait = true;
    const formData = new FormData();
    formData.append('files', this.imageFile, this.imageFile.name);
    this.sub = this.ImageService.uploadImage(formData).subscribe(
      (data) => {
        console.log('AppComponent | upload | data ', data);
        this.pleaseWait = false;
        this.message = "image sauvegardée"
        this.pictureUploaded = true;
        this.showMessage({duration: 2000})
      },
      (err) => {
        console.log('AppComponent | upload | data ', err);
        this.message = "image non sauvegardée";
        this.pleaseWait = false;
        this.pictureUploaded = false;
        this.showMessage({duration: 2000});
      }
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  togglePreviewVisibility() {
    this.isPreviewVisible = !this.isPreviewVisible;
    this.togglePreviewMessage = this.isPreviewVisible ? 'Prévisualisation activée' : 'Prévisualisation désactivée'
    console.log(this.isPreviewVisible)
    console.log(this.togglePreviewMessage)
  }

  showMessage(option){
    setTimeout(()=>{this.message = ""},option.duration)
  }
}
