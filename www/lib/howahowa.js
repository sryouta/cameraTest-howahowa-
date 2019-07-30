// This is a JavaScript file

/*global SVG */

// 一つのほわほわを持っている（要SVG.js）
class HowaHowa { //eslint-disable-line
  // HowaHowa.createとnew HowaHowaにはそんなに違いはない（と思う）
  static create(name, draw, data) {
    console.log(name);
    const howahowa = new HowaHowa(name, draw, data);
    return howahowa;
  }

  // コンストラクタ。たしかdataにhowahowaJSON渡せば勝手にその通り作ってくれた、と思う
  constructor(name, draw, data = {}) {
    this.data = HowaHowa.dataInit(name, data);
    this.howa = this.makeHowa(draw);
    this.howa.draggable();//ドラッグできるようにする
    this.howa.dragTime = 0;//移動回数（クリックかドラッグかを区別する）定義
    this.holdTime = 0;
    this.interval = {};
    this.clCount = 0;
    this.addEvent(draw);//クリック、ドラッグ時のイベント作成
  }

  static dataInit(name, argdata) {
    const initdata = {
      taste: name, color: 'red', pos: { x: 0, y: 0 }, strength: 0, sharpness: 0
    };
    if (Object.prototype.hasOwnProperty.call(argdata, 'color')) {
      initdata.color = argdata.color;
    }
    if (Object.prototype.hasOwnProperty.call(argdata, 'pos')) {
      if ((Object.prototype.hasOwnProperty.call(argdata.pos, 'x')) && (Object.prototype.hasOwnProperty.call(argdata.pos, 'y'))) {
        initdata.pos = argdata.pos;
      }
    }
    if (Object.prototype.hasOwnProperty.call(argdata, 'strength')) {
      initdata.strength = argdata.strength;
    }
    if (Object.prototype.hasOwnProperty.call(argdata, 'sharpness')) {
      initdata.sharpness = argdata.sharpness;
    }
    return initdata;
  }

  makeHowa(draw) {
    function blackOrWhite(color) {
      const hexcolor = new SVG.Color(color).toHex();
      const r = parseInt(hexcolor.substr(1, 2), 16);
      const g = parseInt(hexcolor.substr(3, 2), 16);
      const b = parseInt(hexcolor.substr(5, 2), 16);
      return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? 'white' : 'black';
    }
    const nested = draw.nested();
    const path = nested.path(HowaHowa.plotData(0)).fill({ color: this.data.color, opacity: 0.8 })
.move(0, 0)
.size(100);
    const text = nested.plain(this.data.taste).attr({ fill: blackOrWhite(this.data.color), 'text-anchor': 'middle' });
    text.move(50, 20);
    nested.pathElem = path;
    nested.textElem = text;
    return nested;
  }

  addEvent(draw) {
    this.howa.on('dragstart', e => { this.dragStart(e); });
    this.howa.on('dragmove', e => { this.dragMove(e); });
    this.howa.on('dragend', e => { this.dragEnd(e, draw); });
  }

  removeEvent() {
    this.howa.off('dragstart');
    this.howa.off('dragmove');
    this.howa.off('dragend');
    this.howa.draggable(false);
    console.log('howahowa-remove')
  }

  dragStart() {
    console.log('dragstart');
    this.howa.dragTime = 0;//移動回数初期化
    this.howa.pathElem.animate(100).opacity(1);
    this.interval = setInterval(() => {
      this.holdTime += 100;
      if (this.holdTime > 500) {
        let s = this.data.strength;
        if (s < 2) {
          s += 0.08;
          this.howa.pathElem.animate(99).scale((s * (2 / 3)) + 1);
        } else if (~~s === 2) {
          s += 0.08;
          this.howa.pathElem.animate(50).stroke({ color: 'black', width: 3 });
        } else if (s <= 3) {
          s += 0.12;
        } else {
          s = 0;
          this.howa.pathElem.animate(100).stroke({ color: 'none' });
        }
        this.data.strength = s;
      }
    }, 100);
  }

  dragMove() {
    //console.log("dragmove")
    this.howa.dragTime += 1;//移動回数を追加していく
    if (this.howa.dragTime === 20) {
      clearInterval(this.interval);
    }
  }

  ///ドラッグ終了後
  dragEnd(event, draw) {
    console.log(`dragend: ${this.howa.dragTime} times moved`);
    ///
    this.howa.pathElem.animate(100).opacity(0.8);
    if (this.howa.dragTime < 8 && this.holdTime <= 1000) {//移動してない(dragMove=3)+ロングタップでないときはクリックイベント
      console.log('click');
      this.data.sharpness = (this.data.sharpness + 1) % HowaHowa.plotData();
      this.howa.pathElem.animate(100).plot(HowaHowa.plotData(this.data.sharpness))
.move(0, 0)
.size(100);
      if (!this.clCount) {
        this.clCount += 1;
        setTimeout(() => {
          this.clCount = 0;
        }, 350);
      } else {
        this.clCount = 0;
        console.log(draw);
        draw.set().clear();
      }

    } else {//移動したときはドラッグイベント

    }
    this.data.pos.x = this.howa.x();
    this.data.pos.y = this.howa.y();
    clearInterval(this.interval);
    this.holdTime = 0;
  }

  // 楕円⇄ギザギザのSVG
  // @@@@@@@@じまじまさせる
  static plotData(index = null) {
    const plot = [
`
      m 120.19957,409.78803 -14.46095,-3.16695 -13.472279,-4.51728 -12.43105,-5.78442 -12.11674,-6.51241 -9.292491,-7.18613 -8.923607,-9.7101 -5.808368,-9.78051 -4.12607,-9.92853 -1.170173,-10.74836 1.161154,-10.20646 3.711627,-9.00989 6.197248,-10.66073 8.294456,-9.46511 9.993119,-7.51769 10.417967,-6.30766 13.96612,-5.80822 13.213157,-4.05692 14.87731,-3.5193 15.50978,-1.99989 14.30691,-0.67675 15.55692,0.67675 14.25976,1.99989 13.58335,3.64794 14.50706,3.92828 11.81956,5.05061 12.56456,7.06527 8.73042,7.26515 9.55714,9.71765 5.18708,9.01923 4.72178,10.65139 0.6561,10.459 -0.66511,10.49582 -4.3786,10.30734 -5.55582,9.4017 -8.42039,9.58516 -9.79569,7.31107 -11.99047,6.89121 -12.55734,5.40562 -14.10322,4.39101 -13.82962,3.29322 -14.32854,1.72595 -15.51847,0.72113 -16.45809,-0.41665 z`,
`
      M 120.19957,409.78803 93.237979,435.03162 92.266341,402.1038 58.495818,421.44692 67.718551,389.80697 28.752829,401.18239 49.502453,372.91074 7.7074004,374.24191 39.568015,353.2017 0.26458333,342.70588 39.558996,332.24688 7.6627457,311.24143 l 41.8051253,1.33483 -20.74743,-28.2792 39.035005,11.2964 -9.280008,-31.56147 33.664095,19.44559 1.248871,-32.71763 26.841596,25.14141 10.68835,-31.55346 19.12834,28.87682 19.12835,-28.87682 10.68833,31.55346 26.8416,-25.14141 1.24881,32.71763 33.66411,-19.44559 -9.27999,31.56147 39.035,-11.2964 -20.74744,28.2792 41.80511,-1.33483 -31.89625,21.00545 39.29443,10.459 -39.30344,10.49582 31.86062,21.04021 -41.79504,-1.33117 20.74776,28.27298 -38.96384,-11.37675 9.22273,31.63995 -33.77054,-19.34312 -0.97124,32.92782 -26.9616,-25.24359 -9.27778,34.42964 -20.56923,-31.98256 -19.10974,28.87777 z`
];
    if (index === null) {return plot.length;}
    return (index < plot.length) ? plot[index] : plot[0];
  }

}

