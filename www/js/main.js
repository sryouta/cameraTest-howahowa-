/*global Muuri fmbaas camera Camera ons cordova SVG HowaHowa*/


const home = {};

const user = 'testUser';
let grid = {};

home.init = function () {
  ///Muuriの定義
  grid = new Muuri('.grid', {
    dragEnabled: true,
    dragSortInterval: 10,
  });

  //itemにリスナー入れる
  const items = grid.getItems();
  items.forEach((i) => {
    const item = i.getElement();
    item.addClickListener({ handleEvent: itemContext, item: item });
  });

  ///addボタン系のリスナー追加
  const addFromAlbumButton = document.querySelector('.addbutton.album');
  const addFromCameraButton = document.querySelector('.addbutton.camera');
  const addHowaHowaButton = document.querySelector('.addbutton.howahowa');
  const addCommentButton = document.querySelector('.addbutton.comment');
  addFromAlbumButton.addEventListener('click', { handleEvent: createItemFromAlbum, });
  addFromCameraButton.addEventListener('click', { handleEvent: createItemFromAlbum, });
  addHowaHowaButton.addEventListener('click', { handleEvent: createHowaHowaItem, });
  addCommentButton.addEventListener('click', { handleEvent: createCommentItem, });

  ///OnsenUI is ready!!!
  console.log('Onsen UI is ready!');

  ///add
  addPreItem();

};
const addPreItem = function () {
  fmbaas.userData = {};
}


///Itemのコンテキストメニュー表示
const itemContext = function () {
  if (!this.moveFlag) {
    ons.notification.confirm('アイテムを削除しますか？', {
      callback: (index) => {
        if (!(index === -1 || index === 0) && index === 1) {
          grid.remove(this.item, { removeElements: true })
        }
      }
    });
  }
  this.moveFlag = false;
};

///（Item）タップ時の動作・ドラッグしたら無効。
HTMLElement.prototype.addClickListener = function (listener) {
  listener.moveFlag = false;
  this.addEventListener('mousedown', () => { listener.moveFlag = false; });
  //    this.addEventListener('touchstart', () => { listener.moveFlag = false; });
  this.addEventListener('mousemove', () => { listener.moveFlag = true; });
  this.addEventListener('touchmove', () => { listener.moveFlag = true; });
  this.addEventListener('mouseup', listener);
  //    this.addEventListener('touchend', listener);
};


///Albamから
const createItemFromAlbum = function (e) {
  const options = {};
  if (e.target.className === 'addbutton album button button--material') {
    options.sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM//.PHOTOLIBRARY or.CAMERA or .SAVEDPHOTOALBUM
  } else if (e.target.className === 'addbutton camera button button--material') {
    options.sourceType = Camera.PictureSourceType.CAMERA//.PHOTOLIBRARY or.CAMERA or .SAVEDPHOTOALBUM
  }
  const item = ons.createElement(`
    <div class='item'>
        <img src=''>
    </div>
    `);
  item.querySelector('img').style.width = '100%';
  item.querySelector('img').style.height = '100%';
  const fileName = fmbaas.getUniqueName(user, 'image') + '.png';
  camera.getImage(options)
    .then((imageURI_old) => {
      console.log(imageURI_old);
      return fmbaas.fileMove(imageURI_old, cordova.file.dataDirectory, fileName);
    })///ここまで通ったっぽい！
    .then((fileEntry) => {///この後は、div.item要素作成→アップロードSVG起こす→grid.add→アップロード→アップロード処理SVG消す
      console.log(fileEntry.nativeURL);
      item.querySelector('img').src = fileEntry.nativeURL;
      grid.add(item, { index: 0 });
      item.addClickListener({ handleEvent: itemContext, item: item });
      return fmbaas.readFile(fileEntry, 'image/png');
    })
    .then((imageData) => {
      fmbaas.uploadImage(imageData, 'Blob', fileName, item);
      fmbaas.upload(user, 'image', fileName);
    })
    .catch(err => {
      console.log('Error:' + err);
    });
};

///howahowa
const createHowaHowaItem = function () {
  ///howahowa.htmlに移動して編集
  fn.loadPush('howahowa.html');
};
///howahowa.htmlでの動作
const howahowa = {}
howahowa.init = function () {
  const draw_elem = document.querySelector('#drawing');
  draw_elem.innerHTML = '';
  //svg作成
  const draw = SVG(draw_elem).size(300, 300);
  draw.viewbox(0, 0, 300, 300);
  draw.addClass('svg');
  //ほわほわ収める場所
  let svgElems = [];
  //ボタン類
  const fab = document.querySelector('.comment.sake .pallet .fab');
  const sweet = document.querySelector('.comment.sake .pallet .sweet');
  const sour = document.querySelector('.comment.sake .pallet .sour');
  const umami = document.querySelector('.comment.sake .pallet .umami');
  const aroma = document.querySelector('.comment.sake .pallet .aroma');
  //イベント
  fab.addEventListener('click', () => {
    console.log('fab');
  });
  const addHowaButton = (elem, name, data) => {
    elem.addEventListener('click', () => {
      console.log(name);
      svgElems.push(HowaHowa.create(name, draw, data));
    });
  };
  addHowaButton(sweet, '甘味', { color: '#efb8db' });
  addHowaButton(sour, '酸味', { color: '#edef67' });
  addHowaButton(umami, '旨味', { color: '#75c15b' });
  addHowaButton(aroma, '香り', { color: '#518787' });
  //消す
  const clear = document.querySelector('.comment.sake .clearbutton');
  clear.addEventListener('click', () => {
    draw_elem.children[0].innerHTML = '';
    svgElems = [];
  });
  //セーブボタン押したとき
  const save = document.querySelector('.comment.sake .savebutton');
  const preview = document.querySelector('.comment.sake .preview');
  save.addEventListener('click', () => {
    preview.innerHTML = draw.svg();
    const svg_pre = preview.querySelector('svg');
    svg_pre.id = 'preview';

    const dataset = [];
    // preventDefault,datasetを追加
    for (let h of svgElems) {
      h.removeEvent();
      dataset.push(h.data);
    }
    const _howahowaElem = ons.createElement(draw.svg());
    fn.setCurrentPageData({ howahowaElem: _howahowaElem, howaData: dataset });
    fn.popPage();
    console.log(_howahowaElem);
  });
};

//howahowa.htmlが閉じたら、itemにSVGを追加する
howahowa.postpop = (e) => {
  console.log('onpostpop');
  console.log(e);
  ////enterPageはhome.html
  //const enterPage = e.enterPage;
  ///leavePageはhowahowa.html  .dataにhowahowaElem,howahowaJSON
  const leavePage = e.leavePage;
  ///Cancelしたらitem追加は起きない
  if (Object.prototype.hasOwnProperty.call(leavePage.data, 'howahowaElem')) {
    const item = ons.createElement(`
        <div class='item'></div>
        `);
    const howa = leavePage.data.howahowaElem;
    console.log(howa);
    item.appendChild(howa);
    howa.style.width = '100px';
    howa.style.height = '100px';
    grid.add(item, { index: 0 });
    item.addClickListener({ handleEvent: itemContext, item: item });
    ///NCMBにアップロードする
  }
  if (Object.prototype.hasOwnProperty.call(leavePage.data, 'howaData')) {
    console.log(JSON.parse(JSON.stringify(leavePage.data.howaData)));
    fmbaas.upload(user, 'howahowa', { result: leavePage.data.howaData });
  }
};

const createCommentItem = function () {
  const initAlert = function (e) {
    const text = e.querySelector('.textarea');
    const okButton = e.querySelector('.ok');
    const cancelButton = e.querySelector('.cancel');
    text.value = '';

    const onOkButton = function () {
      fn.hideDialog('comment-dialog.html', {
        callback: () => {
          const item = ons.createElement(`
                        <div class='item'>
                            <div class='item-content'>
                                ${text.value}
                            </div>
                        </div>
                     `);
          grid.add(item, { index: 0 });
          item.addClickListener({ handleEvent: itemContext, item: item });
        }
      });
      okButton.removeEventListener('click', onOkButton, false);
      cancelButton.removeEventListener('click', onCancelButton, false);
      fmbaas.upload(user, 'comment', text.value);
    };
    const onCancelButton = function () {
      fn.hideDialog('comment-dialog.html');
      okButton.removeEventListener('click', onOkButton, false);
      cancelButton.removeEventListener('click', onCancelButton, false);
    };
    okButton.addEventListener('click', onOkButton, false);
    cancelButton.addEventListener('click', onCancelButton, false);
  };
  fn.createDialog('comment-dialog.html', { callback: initAlert });
};



///Main
ons.ready(function () {
  if (fn.initFlag && ons.isReady()) {
    fn.init();
  }
  ///NCMB
  fmbaas.ncmbGreet();
});

if (ons.platform.isIPhoneX()) {
  document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
  document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
}


//スプリッター用
const fn = {};
fn.open = function () {
  let menu = document.getElementById('menu');
  menu.open();
};
fn.close = function () {
  let menu = document.querySelector('#menu');
  menu.close();
}
fn.load = function (page, _data = {}, _animation = 'slide') {//'slide', 'simpleslide', 'lift', 'fade', 'none'
  let navi = document.getElementById('navi');
  let menu = document.getElementById('menu');
  menu.close();
  console.log(page);
  navi.pushPage(page, { animation: _animation, data: _data });
  // navi.resetToPage(page, { animation: _animation, data: _data });
};
fn.loadPush = function (page, _data = {}, _animation = 'slide') {
  const navi = document.getElementById('navi');
  console.log(page);
  navi.pushPage(page, { animation: _animation, data: _data });
};
fn.popPage = async function (_data = {}, _animation = 'slide') {
  const navi = document.getElementById('navi');
  await navi.popPage({ animation: _animation, data: _data })
}
//load引数dataの取得
fn.getCurrentPageData = function () {
  const navi = document.querySelector('#navi');
  const data = navi.topPage.data;
  console.log(data);
  return data;
};
fn.setCurrentPageData = function (_data) {
  const navi = document.querySelector('#navi');
  Object.assign(navi.topPage.data, _data);
}


//ページ読み込み用
fn.initFlag = false;//readyイベントとinitイベント両方が発火することでロード完了とする。


document.addEventListener('init', function (event) {
  let page = event.target;
  console.log('Init event :' + page.id);
  switch (page.id) {
    case 'load.html-page': {
      fn.initFlag = true;
      if (fn.initFlag && ons.isReady()) {
        fn.init();
      }
      break;
    }
    case 'home.html-page': home.init(); break;
    case 'login.html-page': window.login.init(); break;
    case 'register.html-page': window.register.init(); break;
    case 'forget.html-page': window.forget.init(); break;
    case 'token.html-page': window.token.init(); break;
    case 'email.html-page': window.email.init(); break;
    case 'setting.html-page': window.setting.init(); break;
    case 'howahowa.html-page': howahowa.init(); break;
  }
});


document.addEventListener('postpop', function (event) {
  const enterPage = event.enterPage;
  const leavePage = event.leavePage;

  if (enterPage.id === 'home.html-page' && leavePage.id === 'howahowa.html-page') {
    howahowa.postpop(event);
  }
});


fn.init = function () {
  // let cons = document.querySelector('.load.console');
  // function consPrint(str) {
  //   cons.innerHTML = str;
  //   console.log(str);
  // }
  fn.load('home.html');
};
///アラート読み込み用
fn.createDialog = function (pageid, options = {}) {
  var dialog = document.getElementById(pageid + '-page');
  if (dialog) {
    dialog.show(options);
  } else {///loading from template
    ons.createElement(pageid, { append: true })
      .then(function (dialog) {
        dialog.show(options);
      });
  }
};
fn.hideDialog = function (pageid, options = {}) {
  document
    .getElementById(pageid + '-page')
    .hide(options);
};
