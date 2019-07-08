// This is a JavaScript file

window.fmbaas = {};

///dateとusernameを利用してユニークなファイル名を生成する
fmbaas.getUniqueName = (userName, modifier) => {
  let fileName = ""
  const dt = new Date();
  return `${dt.getFullYear()}${dt.getMonth() + 1}${dt.getDate()}${dt.getHours()}${dt.getMinutes()}${dt.getSeconds()}${userName}${modifier}`
};

///resolveLocalFileSystemのPromise化
fmbaas.resolveFileSystem = (url) => new Promise((resolve, reject) => window.resolveLocalFileSystemURL(url, resolve, reject));

///moveToのPromise化
///arg:old_uri,new_url_of_directory,new_filename(string)
///ret:Promise
fmbaas.fileMove = (old_uri, new_url, fileName) => new Promise((resolve, reject) => {
  Promise.all([fmbaas.resolveFileSystem(old_uri), fmbaas.resolveFileSystem(new_url)])
    .then(entryArr => {
      const fileEntry = entryArr[0];
      const dirEntry = entryArr[1];
      fileEntry.moveTo(dirEntry, fileName, resolve, reject);
    });
});

//userdata受信
window.fmbaas.getUserData = (userName) => {
  let UserData = ncmb.DataStore("UserData");
  UserData.equalTo("userName", userName)
    .fetchAll()
    .then(function (results) {
      userData = results;
      console.log("userdata successed.");
    })
    .catch(function (err) {
      console.log(err);
    });

};
//userdata受信
fmbaas.upload = function (user = "testuser", data_type, data) {
  const UserData = ncmb.DataStore(user);
  const userData = new UserData;

  if (data_type === "howahowa") {
    userData.set("howahowa", JSON.parse(JSON.stringify(data)))
      .save();
  } else if (data_type === "comment") {
    userData.set("comment", data)
      .save();
  }

}

///NCMBにアクセス
window.fmbaas.ncmbGreet = () => {
  // APIキーの設定とSDK初期化（ncmbはfmbaasのオブジェクトとする）
  window.ncmb = new NCMB("026ba82d390ff9d14394b68ba109a561e3d2167467ebaf7a7960995b644cb346", "410cc6f77669761654942e5748b851481961af02165fd27341954263b2665879");
  // 保存先クラスの作成
  const NcmbAccess = ncmb.DataStore("Access");
  // 保存先クラスのインスタンスを生成
  const n_access = new NcmbAccess();
  // 値を設定と保存
  n_access.set("message", "Hello, NCMB!")
    .save()
    .then(function (object) {
      // 保存に成功した場合の処理
    })
    .catch(function (err) {
      // 保存に失敗した場合の処理
    });
};


///画像・ローディング用
fmbaas.hideProgress = function (progress) {
  progress.style.display = "none";
};

fmbaas.progressOn = function (imageDivElem, options = {}) {
  ///default
  if (options === {}) {
    options = { text: "uploading..." };
  }
  //loadImage作成
  let svgStr = `<svg width="150" height="120" viewBox="-10 0 115 105" xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="#999">`
  const circlePos = [12.5, 52.5, 92.5];
  for (cx of circlePos) {
    for (cy of circlePos) {
      svgStr += `
    <circle cx="${cx}" cy="${cy}" r="12.5">
        <animate attributeName="fill-opacity"
         begin="${(cx + cy) * 3}ms" dur="1s"
         values="1;.2;1" calcMode="linear"
         repeatCount="indefinite" />
    </circle>
    `;
    }
  }
  svgStr += `<text x="50%" text-anchor="middle" y="120" font-size="20 textLength="125" lengthAdjust="spacingAndGlyphs">${options.text}</text>`;
  svgStr += "</svg>";

  loadImage = ons.createElement(svgStr);

  //CSS
  imageDivElem.style.position = "relative";

  loadImage.style.position = "absolute";
  loadImage.style.top = "50%";
  loadImage.style.left = "50%";
  loadImage.style.transform = "translate(-50%,-50%)";
  loadImage.style.width = "70px";

  imageDivElem.appendChild(loadImage);

  return loadImage;
};

fmbaas.readFile = (fileEntry, fileType) => new Promise((resolve, reject) => {
  fileEntry.file((resFile) => {
    var reader = new FileReader(); // *2
    reader.onloadend = (evt) => {
      var blob = new Blob([evt.target.result], { type: new String(fileType) });
      resolve(blob); // Return BLOB file
    };
    reader.onerror = (e) => {
      reject(e);
    };
  });
});


fmbaas.uploadImage = (imageData, imageDataType, fileName, wrapperDiv, ) => {
  //画像の上にローディング画面
  const progress = fmbaas.progressOn(wrapperDiv, { text: "uploading..." });
  //イメージデータのタイプ→Blob形式へ
  if (imageDataType === "Base64") {
    // NCMBにアップロード(バイト文字列とファイル名を渡す)
    const byteCharacters = fmbaas.toBlob(imageData);
  } else if (imageDataType === "Blob") {
    const byteCharacters = imageData;
  }else{
    const byteCharacters = "";
    console.log("  \"Base64\" or \"Blob\"   ")
  }
  ///アップロード
  ncmb.File.upload(fileName, byteCharacters)
    .then(function () {
      fmbaas.hideProgress(progress);
    })
    .catch(function (error) {
      fmbaas.hideProgress(progress);
      fmbaas.progressOn(wrapperDiv, { text: "upload failed!" });
      alert("アップロードエラー" + JSON.stringify(error));
    });
}

fmbaas.toBlob = (base64) => {
  var bin = atob(base64.replace(/^.*,/, ''));
  var buffer = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  // Blobを作成
  try {
    var blob = new Blob([buffer.buffer], {
      type: 'image/png'
    });
  } catch (e) {
    return false;
  }
  return blob;
};
