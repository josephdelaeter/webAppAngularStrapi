import { Component } from '@angular/core';

import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Observer } from 'rxjs';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pictureProject';
  public videoOptions:MediaTrackConstraints = {
    width: 1024,
    height: 576
  };

  public errors:WebcamInitError[] = [];

  //latest snapshot

  public webcamImage : WebcamImage = null;

  generatedImage :string;

  //webcam snapshot trigger

  private trigger:Subject<void> = new Subject<void>()

  public triggerSnapshot():void{
    this.trigger.next()
  }

  public handleInitError(error:WebcamInitError):void{
    this.errors.push(error);
    console.error("errors" ,this.errors)
  }

  public handleImage(webcamImage:WebcamImage){
    console.log("received webcamImage",webcamImage)
    this.webcamImage = webcamImage
    this.dataURIToBlob(webcamImage.imageAsBase64).subscribe((blob)=> {
      const imageBlob:Blob = blob;
      const imageName:string = new Date().toISOString();
      const imageFile:File = new File([imageBlob],imageName,{type:'image/jpeg'})

      this.generatedImage = window.URL.createObjectURL(imageFile)
      window.open(this.generatedImage)
    },
    (err)=>console.error(err),
    ()=>console.log("completed")
    )
  }
  public get triggerObservable(): Observable<void>{
    return this.trigger.asObservable()
  }

  dataURIToBlob(dataURI:string):Observable<Blob>{

    return Observable.create((observer:Observer<Blob>)=>{
      const byteString:string = window.atob(dataURI);
      const arrayBuffer:ArrayBuffer = new ArrayBuffer(byteString.length);
      const Int8Array:Uint8Array = new Uint8Array(arrayBuffer);
      for(let i = 0;i<byteString.length;i++){
        Int8Array[i]=byteString.charCodeAt(i)
      }
      const blob = new Blob([Int8Array],{type:'image/jpeg'});
      observer.next(blob);
      observer.complete();
    })
  }


}
