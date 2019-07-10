// // This is a JavaScript file

camera = {};
camera.photoIndex = 0;

///camera.getImage
///arg: options = {} cordova camera options
///ret: promise
camera.getImage = (options) => new Promise((resolve, reject) => {
  //cordovaのcamera非対応の場合はalert
  if (!navigator.hasOwnProperty("camera")) {
    alert("お使いの端末ではカメラが利用できません。")
  } else {
    ///デフォルトの設定
    const option = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,//.DATA_URL or .FILE_URI
      sourceType: Camera.PictureSourceType.CAMERA,//.PHOTOLIBRARY or.CAMERA or .SAVEDPHOTOALBUM
      allowEdit: true,//andoroidでは無視される(大嘘)
      encodingType: Camera.EncodingType.JPEG,
      // targetWidth: 100,targetHeight: 100,
      mediatype: Camera.MediaType.PICTURE,//PHOTOLIBRARYまたはSAVEDPHOTOALBUMのみ有効。PICTURE,VIDEO,ALLMEDIA
      correctOrientation: true,//写真が撮影されたときと同じ向きになるよう写真を回転させます。
      saveToPhotoAlbum: false, //撮影後端末に保存
      popoverOptions: CameraPopoverOptions, //iOSのみの設定。iPadでポップオーバー位置を明示するかどうか。
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY///CAMERA,PHOTOLIBRARY
    };
    ///追加の設定
    ///許可する項目（this.elemやthis.filenameの排除）
    let optArr = ["quality", "destinationType", "sourceType", "allowEdit", "encodingType", "targetWidth", "targetHeight", "mediaType", "correctOrientation", "saveToPhotoAlbum", "popoverOptions", "cameraDirection"];
    for (k of Object.keys(options)) {
      if (optArr.includes(k)) {
        console.log("camera options key:" + k + " value:" + options[k]);
        option[k] = options[k];
      }
    }
    ///カメラ起動
    navigator.camera.getPicture(resolve, reject, option);
  }
});


function createNewFileEntry(imageURI) {
  window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

    // JPEG file
    dirEntry.getFile(`0519_image${camera.photoIndex}.jpeg`, { create: true, exclusive: false }, function (fileEntry) {

      // Do something with it, like write to it, upload it, etc.
      writeFile(fileEntry, imageURI);
      console.log("got file: " + fileEntry.fullPath);
      // displayFileData(fileEntry.fullPath, "File copied to");
      return fileEntry.fullPath;
    }, (err) => {
      console.log(err);
    });

  }, (err) => {
    console.log(err);
  });
}

function writeFile(fileEntry, dataObj, isAppend) {
  // Create a FileWriter object for our FileEntry (log.txt).
  fileEntry.createWriter(function (fileWriter) {

    fileWriter.onwriteend = function () {
      console.log("Successful file read...");
      //readFile(fileEntry);
    };

    fileWriter.onerror = function (e) {
      console.log("Failed file read: " + e.toString());
    };

    // If we are appending data to file, go to the end of the file.
    if (isAppend) {
      try {
        fileWriter.seek(fileWriter.length);
      }
      catch (e) {
        console.log("file doesn't exist!");
      }
    }
    fileWriter.write(dataObj);
  });
}

