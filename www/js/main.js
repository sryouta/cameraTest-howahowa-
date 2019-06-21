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
    fn.loadPush("howahowa.html");
};
window.howahowa = {}
window.howahowa.init = function () {
    const draw_elem = document.querySelector("#drawing");
    draw_elem.innerHTML = "";

    //svg作成
    const draw = SVG(draw_elem).size(300, 300);
    draw.viewbox(0, 0, 300, 300);
    draw.addClass("svg");

    //ほわほわ収める場所
    let svgElems = [];

    //ボタン類
    const fab = document.querySelector(".comment.sake .pallet .fab");
    const sweet = document.querySelector(".comment.sake .pallet .sweet");
    const sour = document.querySelector(".comment.sake .pallet .sour");
    const umami = document.querySelector(".comment.sake .pallet .umami");
    const aroma = document.querySelector(".comment.sake .pallet .aroma");

    //イベント
    fab.addEventListener("click", () => {
        console.log("fab");
    });
    const addHowaButton = (elem, name, data) => {
        elem.addEventListener("click", () => {
            console.log(name);
            svgElems.push(HowaHowa.create(name, draw, data));
        });
    };
    addHowaButton(sweet, "甘味", { color: "#efb8db" });
    addHowaButton(sour, "酸味", { color: "#edef67" });
    addHowaButton(umami, "旨味", { color: "#75c15b" });
    addHowaButton(aroma, "香り", { color: "#518787" });

    //消す
    const clear = document.querySelector(".comment.sake .clearbutton");
    clear.addEventListener("click", () => {
        draw_elem.children[0].innerHTML = "";
        svgElems = [];
    });

    //セーブ
    const save = document.querySelector(".comment.sake .savebutton");
    const preview = document.querySelector(".comment.sake .preview");
    save.addEventListener("click", () => {
        preview.innerHTML = draw.svg();
        const svg_pre = preview.querySelector("svg");
        svg_pre.id = "preview";
        // preventDefault
        for (h of svgElems) {
            // h.removeEvent();
        }
        const _howahowaElem = ons.createElement(draw.svg());
        fn.setCurrentPageData({ howahowaElem: _howahowaElem });
        fn.popPage();
        console.log(_howahowaElem);
    });
}

howahowa.postpop = (e) => {
    console.log("onpostpop");
    console.log(e);
    const enterPage = e.enterPage;
    const leavePage = e.leavePage;

    if (leavePage.data.hasOwnProperty("howahowaElem")) {
        const item = ons.createElement(`
        <div class="item">
            <div class="item-content">
            </div>
        </div>
        `);
        item.querySelector(".item-content").appendChild(leavePage.data.howahowaElem);
        grid.add(item, { index: 0 });
        item.addClickListener({ handleEvent: itemContext, item: item });
        console.log(grid);
    }
};

const createCommentItem = function (e) {
    const item = ons.createElement(`
    <div class="item">
        <div class="item-content">
            item
        </div>
    </div>
    `);
    fn.createAlertDialog("comment-dialog.html");
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
fn.popPage = async function (_data = {}, _animation = 'slide') {
    const navi = document.getElementById('navi');
    await navi.popPage({ animation: _animation, data: _data })
}
//load引数dataの取得
fn.getCurrentPageData = function () {
    const navi = document.querySelector("#navi");
    const data = navi.topPage.data;
    console.log(data);
    return data;
};
fn.setCurrentPageData = function (_data) {
    const navi = document.querySelector("#navi");
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
        case 'howahowa.html-page': howahowa.init(); break;
    }
});
document.addEventListener("postpop", function(event){
    const enterPage = event.enterPage;
    const leavePage = event.leavePage;

    if(enterPage.id === "home.html-page" && leavePage.id === "howahowa.html-page" ){
        howahowa.postpop(event);
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
fn.createAlertDialog = function (pageid) {
    var dialog = document.getElementById(pageid + "-page");
    if (dialog) {
        dialog.show();
    } else {
        ons.createElement(pageid, { append: true })
            .then(function (dialog) {
                dialog.show();
            });
    }
};
fn.hideAlertDialog = function (pageid) {
    document
        .getElementById(pageid + "-page")
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

