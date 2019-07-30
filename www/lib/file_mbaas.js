// This is a JavaScript file

/*global fmbaas ncmb*/

window.fmbaas = {};

///dateとusernameを利用してユニークなファイル名を生成する
fmbaas.getUniqueName = (userName, modifier) => {
  const dt = new Date();
  return `${dt.getFullYear()}${dt.getMonth() + 1}${dt.getDate()}${dt.getHours()}${dt.getMinutes()}${dt.getSeconds()}${userName}${modifier}`
};

///resolveLocalFileSystemのPromise化
fmbaas.resolveFileSystem = (url) => new Promise((resolve, reject) => window.resolveLocalFileSystemURL(url, resolve, reject));

///moveToのPromise化
///arg:old_uri,new_url_of_directory,new_filename(string)
///ret:Promise
fmbaas.fileMove = (old_uri, new_url, fileName) => new Promise((resolve, reject) => {
  Promise.all([
    fmbaas.resolveFileSystem(old_uri),
    fmbaas.resolveFileSystem(new_url)
  ])
    .then(entryArr => {
      const fileEntry = entryArr[0];
      const dirEntry = entryArr[1];
      fileEntry.moveTo(dirEntry, fileName, resolve, reject);
    });
});

//userdata受信
window.fmbaas.getUserData = (userName) => {
  let UserData = ncmb.DataStore('UserData');
  UserData.equalTo('userName', userName)
    .fetchAll()
    .then(function () {
      console.log('userdata successed.');
    })
    .catch(function (err) {
      console.log(err);
    });

};
//userdata送信
fmbaas.upload = function (user = 'testuser', data_type = 'none', _data) {
  const UserData = ncmb.DataStore(user);
  const userData = new UserData();
  let data = _data
  if (typeof data !== 'string') {
    data = JSON.parse(JSON.stringify(data));
  }
  userData.set(data_type, data)
    .save();
};

//userdata受信
fmbaas.download = async (user) => {
  const UserData = await ncmb.DataStore(user);
  return UserData.fetchAll();
};


///localファイルはセキュリティの問題上(?)fetchAPIが使えない。
fmbaas.getJSON = (url) => new Promise(function (resolve, reject) {
  // Do the usual XHR stuff
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.responseType = 'json';
  req.addEventListener('loadend', () => {
    // This is called even on 404 etc
    // so check the status
    const status_bool = (() => {
      const errorCode = [3, 4, 5];
      const status = ~~(req.status / 100);
      const index = errorCode.indexOf(status);
      if (index === -1) {
        return true;
      }
      return false;
    })();
    if (status_bool) {
      // Resolve the promise with the response text
      resolve(req.response);
    } else {
      // Otherwise reject with the status text
      // which will hopefully be a meaningful error
      console.log('req.status:' + req.status);
      reject(Error(req.statusText));
    }
  });
  // Handle network errors
  req.onerror = function () {
    reject(Error('Network Error'));
  };
  // Make the request
  req.send();
});


fmbaas.ncmbGreet = async () => {
  const resp = await fmbaas.getJSON('predata/apikeys.json')
    .catch((err) => { console.log(JSON.stringify(err)) });
  await fmbaas.initNCMB(resp.NCMB_APP_KEY, resp.NCMB_CRI_KEY);
  fmbaas.userData = await fmbaas.download(user);
}
///NCMBにアクセス
window.fmbaas.initNCMB = async (appKey, criKey) => {
  try {
    // APIキーの設定とSDK初期化（ncmbはfmbaasのオブジェクトとする）
    window.ncmb = new NCMB(appKey, criKey);
    // 保存先クラスの作成
    const NcmbAccess = ncmb.DataStore('Access');
    // 保存先クラスのインスタンスを生成
    const n_access = new NcmbAccess();
    // 値を設定と保存
    await n_access
      .set('message', 'Hello, NCMB!')
      .save();
    return 'suc';
  } catch (err) {
    throw (err);
  }
};


///画像・ローディング用
fmbaas.hideProgress = function (progress) {
  progress.style.display = 'none';
};

fmbaas.progressOn = function (imageDivElem, options = {}) {
  ///default
  if (options === {}) {
    options = { text: 'uploading...' };
  }
  //loadImage作成
  let svgStr = `<svg width='150' height='120' viewBox='-10 0 115 105' xmlns='http://www.w3.org/2000/svg' fill='#fff' stroke='#999'>`
  const circlePos = [12.5, 52.5, 92.5];
  for (cx of circlePos) {
    for (cy of circlePos) {
      svgStr += `
    <circle cx='${cx}' cy='${cy}' r='12.5'>
        <animate attributeName='fill-opacity'
         begin='${(cx + cy) * 3}ms' dur='1s'
         values='1;.2;1' calcMode='linear'
         repeatCount='indefinite' />
    </circle>
    `;
    }
  }
  svgStr += `<text x='50%' text-anchor='middle' y='120' font-size='20 textLength='125' lengthAdjust='spacingAndGlyphs'>${options.text}</text>`;
  svgStr += '</svg>';

  loadImage = ons.createElement(svgStr);

  //CSS
  imageDivElem.style.position = 'relative';

  loadImage.style.position = 'absolute';
  loadImage.style.top = '50%';
  loadImage.style.left = '50%';
  loadImage.style.transform = 'translate(-50%,-50%)';
  loadImage.style.width = '70px';

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
  const progress = fmbaas.progressOn(wrapperDiv, { text: 'uploading...' });
  //イメージデータのタイプ→Blob形式へ
  if (imageDataType === 'Base64') {
    // NCMBにアップロード(バイト文字列とファイル名を渡す)
    const byteCharacters = fmbaas.toBlob(imageData);
  } else if (imageDataType === 'Blob') {
    const byteCharacters = imageData;
  } else {
    const byteCharacters = '';
    console.log('  \'Base64\' or \'Blob\'   ')
  }
  ///アップロード
  ncmb.File.upload(fileName, byteCharacters)
    .then(function () {
      fmbaas.hideProgress(progress);
    })
    .catch(function (error) {
      fmbaas.hideProgress(progress);
      fmbaas.progressOn(wrapperDiv, { text: 'upload failed!' });
      alert('アップロードエラー' + JSON.stringify(error));
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
