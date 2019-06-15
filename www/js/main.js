
const itemContext = function (e) {
    if (!this.moveFlag) {
        console.log(this.item)
        ons.notification.confirm('アイテムを削除しますか？', {
            callback: (index) => {
                console.log(index)
                if (index === -1 || index === 0) {
                    console.log("canceled.");
                } else if (index === 1) {
                    grid.remove(this.item, { removeElements: true })
                }
            }
        });
    }
    this.moveFlag = false;
};

HTMLElement.prototype.addClickListener = function (listener) {
    listener.moveFlag = false;
    this.addEventListener("mousedown", () => { listener.moveFlag = false; });
//    this.addEventListener("touchstart", () => { listener.moveFlag = false; });
    this.addEventListener("mousemove", () => { listener.moveFlag = true; });
    this.addEventListener("touchmove", () => { listener.moveFlag = true; });
    console.log(listener.moveFlag)
    this.addEventListener("mouseup", listener);
//    this.addEventListener("touchend", listener);
};

const createItem = function () {
    const item = ons.createElement(`
    <div class="item">
        <div class="item-content">
            item
        </div>
    </div>
    `);

    
    grid.add(item, { index: 0 });
    item.addClickListener({ handleEvent: itemContext, item: item });
};

ons.ready(function () {

    ///Muuriの定義
    window.grid = new Muuri('.grid', {
        dragEnabled: true,
        dragSortInterval: 10
    });

    const items = grid.getItems();
    items.forEach((i) => {
        const item = i.getElement();
        item.addClickListener({ handleEvent: itemContext, item: item });
    });

    ///addButton
    const addButton = document.querySelector(".addbutton");
    addButton.addEventListener("click", createItem);

    ///OnsenUI is ready!!!
    console.log("Onsen UI is ready!");
});

if (ons.platform.isIPhoneX()) {
    document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
    document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
}

