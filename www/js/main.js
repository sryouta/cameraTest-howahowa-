window.home = {};

home.init = function () {
    ///Muuriの定義
    window.grid = new Muuri('.grid', {
        dragEnabled: true,
        dragSortInterval: 10
    });

    //itemにリスナー入れる
    const items = grid.getItems();
    items.forEach((i) => {
        const item = i.getElement();
        item.addClickListener({ handleEvent: itemContext, item: item });
    });

    ///addボタン系のリスナー追加
    const addFromAlbumButton = document.querySelector(".addbutton.album");
    const addFromCameraButton = document.querySelector(".addbutton.camera");
    const addHowaHowaButton = document.querySelector(".addbutton.howahowa");
    const addCommentButton = document.querySelector(".addbutton.comment");
    console.log(addFromAlbumButton);
    addFromAlbumButton.addEventListener("click", { handleEvent: createItemFromAlbum, });
    addFromCameraButton.addEventListener("click", { handleEvent: createItemFromCamera, });
    addHowaHowaButton.addEventListener("click", { handleEvent: createHowaHowaItem, });
    addCommentButton.addEventListener("click", { handleEvent: createCommentItem, });

    ///OnsenUI is ready!!!
    console.log("Onsen UI is ready!");
};

///Itemのコンテキストメニュー表示
const itemContext = function (e) {
    if (!this.moveFlag) {
        ons.notification.confirm('アイテムを削除しますか？', {
            callback: (index) => {
                if (index === -1 || index === 0) {
                } else if (index === 1) {
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
    this.addEventListener("mousedown", () => { listener.moveFlag = false; });
    //    this.addEventListener("touchstart", () => { listener.moveFlag = false; });
    this.addEventListener("mousemove", () => { listener.moveFlag = true; });
    this.addEventListener("touchmove", () => { listener.moveFlag = true; });
    this.addEventListener("mouseup", listener);
    //    this.addEventListener("touchend", listener);
};

///Item追加
const createItemFromAlbum = function (e) {
    const item = ons.createElement(`
    <div class="item">
        <div class="item-content">
            item
        </div>
    </div>
    `);
    camera.insertImage(item.querySelector(".item-content"), "test.png", {
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    })
    grid.add(item, { index: 0 });
    item.addClickListener({ handleEvent: itemContext, item: item });
};
const createItemFromCamera = function (e) {
    const item = ons.createElement(`
    <div class="item">
        <div class="item-content">
            item
        </div>
    </div>
    `);
    camera.insertImage(item.querySelector(".item-content"), "test.png", {
        sourceType: Camera.PictureSourceType.CAMERA
    });
    grid.add(item, { index: 0 });
    item.addClickListener({ handleEvent: itemContext, item: item });
};
const createHowaHowaItem = function (e) {
    const item = ons.createElement(`
    <div class="item">
        <div class="item-content">
            item
        </div>
    </div>
    `);
    camera.insertImage(item.querySelector(".item-content"), "test.png", {
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    });
    grid.add(item, { index: 0 });
    item.addClickListener({ handleEvent: itemContext, item: item });
};
const createCommentItem = function (e) {
    const item = ons.createElement(`
    <div class="item">
        <div class="item-content">
            item
        </div>
    </div>
    `);
    camera.insertImage(item.querySelector(".item-content"), "test.png", {
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    });
    grid.add(item, { index: 0 });
    item.addClickListener({ handleEvent: itemContext, item: item });
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
window.fn = {};
window.fn.open = function () {
    let menu = document.getElementById('menu');
    menu.open();
};
window.fn.close = function () {
    let menu = document.querySelector('#menu');
    menu.close();
}
window.fn.load = function (page, _data = {}, _animation = "slide") {//"slide", "simpleslide", "lift", "fade", "none"
    let navi = document.getElementById('navi');
    let menu = document.getElementById('menu');
    menu.close();
    console.log(page);
    navi.pushPage(page, { animation: _animation, data: _data });
    // navi.resetToPage(page, { animation: _animation, data: _data });
};
window.fn.loadPush = function (page, _data = {}, _animation = 'slide') {
    const navi = document.getElementById('navi');
    console.log(page);
    navi.pushPage(page, { animation: _animation, data: _data });
};
//load引数dataの取得
fn.getPageData = function () {
    const navi = document.querySelector("#navi");
    const data = navi.topPage.data;
    console.log(data);
    return data;
};


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
        case 'login.html-page': login.init(); break;
        case 'register.html-page': register.init(); break;
        case 'forget.html-page': forget.init(); break;
        case 'token.html-page': token.init(); break;
        case 'email.html-page': email.init(); break;
        case 'setting.html-page': setting.init(); break;
        case 'search_shop.html-page': mysearch.shop.init(); break;
        case 'search_sake.html-page': mysearch.sake.init(); break;
        case 'search_cook.html-page': mysearch.cook.init(); break;
        case 'comment_shop.html-page': mycomment.shop.init(); break;
        case 'comment_sake.html-page': mycomment.sake.init(); break;
        case 'comment_cook.html-page': mycomment.cook.init(); break;
        case 'mylist_shop.html-page': mylist.shop.init(); break;
        case 'mylist_sake.html-page': mylist.sake.init(); break;
        case 'mylist_cook.html-page': mylist.cook.init(); break;
        case 'mydetail_shop.html-page': mydetail.shop.init(); break;
        case 'mydetail_sake.html-page': mydetail.sake.init(); break;
        case 'mydetail_cook.html-page': mydetail.cook.init(); break;
        case 'entry_shop.html-page': window.entry.shop.init(); break;
        case 'entry_sake.html-page': entry.sake.init(); break;
        case 'entry_cook.html-page': entry.cook.init(); break;
    }
});
fn.init = function () {
    // console.log("fn.init");
    let cons = document.querySelector('.load.console');
    function consPrint(str) {
        cons.innerHTML = str;
        console.log(str);
    }
    fn.load("home.html");
};
///アラート読み込み用
fn.createAlertDialog = function (url) {
    var dialog = document.getElementById('my-alert-dialog');
    if (dialog) {
        dialog.show();
    } else {
        ons.createElement(url, { append: true })
            .then(function (dialog) {
                dialog.show();
            });
    }
};
fn.hideAlertDialog = function (pageid) {
    document
        .getElementById(pageid)
        .hide();
};
document.addEventListener('postshow', function (event) {
    let page = event.target;
    console.log((page.id) ? page.id : page);
    if (page.id === 'canvas-dialog') {
        canvasDialog();
    } else if (page.id === 'sakeinfo-dialog.html') {
        sakeInfoDialog();
    }
});

