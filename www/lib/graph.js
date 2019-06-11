// This is a JavaScript file

window.graph = {};

function initSakeMap(canvasId) {
  var canvas = document.getElementById(canvasId);//キャンバス定義 
  var ctx = canvas.getContext("2d");
  //真ん中定義
  var [x_c, y_c] = canvasCenterPosition(canvas);
  var x, y;
  //--------------------------初期表示
  createSakeMap(canvas, 0, 0, true);
  //-------------------------------------------------------------onmove
  canvas.addEventListener('touchstart', function (event) {
    //真ん中定義
    var [x_c, y_c] = canvasCenterPosition(canvas);
    //座標取得
    [x, y] = getCursorPosition(event);
    // 真ん中を0にする。（注：相対座標）
    x = x - x_c;
    y = y - y_c + 150;
    //console.log("saisho"+[x, y, x_c, y_c]);
  }, { passive: false });
  canvas.addEventListener('touchmove', ontouch, { passive: false });
  function ontouch(event) {
    event.preventDefault(); //touchmoveによる画面スクロールを止めさせる
    //座標取得
    [x, y] = getCursorPosition(event);
    // 真ん中を0にする。（注：相対座標）
    x = x - x_c;
    y = y - y_c + 150;
    //console.log("tugi"+[x, y, x_c, y_c]);
    //描画
    createSakeMap(canvas, x, y, true);
  }
  //preventDefault解除
  canvas.addEventListener("touchend", function (event) {
    canvas.removeEventListener('touchmove', ontouch, { passive: false });
    canvas.addEventListener('touchmove', ontouch, { passive: false });
    sakeMapSearch(x, y);
    // var search_str=document.getElementById("sakeStrSearch").value;
    // sakelistpage(search_str);
  }, false);
}


function createSakeMap(canvas, x, y, sakelist) {
  ctx = canvas.getContext("2d");
  //save default style
  ctx.save();
  //クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //サイズ
  var siz = canvas.width / 4;
  //真ん中
  var x_c = canvas.width / 2;
  var y_c = canvas.height / 2;
  ctx.setTransform(2, 0, 0, 2, x_c, y_c);//真ん中を０に
  //座標軸
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.lineTo(0, -150);
  ctx.moveTo(150, 0);
  ctx.lineTo(-150, 0);
  ctx.closePath();
  ctx.stroke();

  var txt = ["濃厚・甘口", "淡麗・甘口", "濃厚・辛口", "淡麗・辛口"]; //描画する文字
  var [x_t, y_t] = [[75, 75, -75, -75], [75, -75, 75, -75]];
  ctx.font = "20px serif"; //フォントにArial,40px,斜体を指定
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  for (var j = 0; j < 4; j++) {
    ctx.fillStyle = (j == 0) ? "rgba(244,140,66,1)" : (j == 1) ? "rgba(244,66,128,0.3)" : (j == 2) ? "rgba(98,244,66,0.5)" : (j == 3) ? "rgba(0,250,255,0.5)" : "black";
    ctx.fillText(txt[j], x_t[j], y_t[j]);
  }
  var txt = ["甘い", "辛い", "爽やか", "旨い"]; //描画する文字＠甘い→プラス＠爽やか→プラス
  var [x_t, y_t] = [[150, -150, 0, 0], [0, 0, -150, 150]];
  ctx.font = "15px serif"; //フォントにArial,40px,斜体を指定

  ctx.fillStyle = "black"; //塗り潰し
  for (var j = 0; j < 4; j++) {
    ctx.textAlign = (j === 2) ? "right" : "left";
    ctx.textBaseline = (j === 0) ? "top" : "bottom";
    ctx.fillText(txt[j], x_t[j], y_t[j]);
  }
  //sakelist
  if (sakelist) {
    for (let i = 0; i < sakeobjs.length; i++) {
      let x = sakeobjs[i].nihonnsyudo;
      let y = sakeobjs[i].sando;
      if (x == "" || y == "") continue;
      x = String(x).replace('±', '');
      ////////////////日本酒度と酸度による
      // x = Number(x)*15;//-10,10=>-150,150
      // y = Number(y)*200-250;//0.5,2=>-150,150
      ////////////////甘辛度と濃淡度による
      let n = Number(x);
      let a = Number(y);
      x = 193593 / (1443 + n) - 1.16 * a - 132.57;//ama-kara
      y = 94545 / (1443 + n) + 1.88 * a - 68.54;//nou-tan
      x = x * 100///-1.5,1.5=>-150,150
      y = y * 75///-2,2=>-150,150
      //console.log([sakeobjs[i].meigara_2,x,y]);
      let arcsiz = 5;
      x = (-siz + arcsiz < x) ? x : -siz + arcsiz;
      x = (x < siz - arcsiz) ? x : siz - arcsiz
      y = (-siz + arcsiz < y) ? y : -siz + arcsiz
      y = (y < siz - arcsiz) ? y : siz - arcsiz;
      ctx.fillStyle = "rgba(0,0,255,0.1)";
      // ctx.shadowColor = color.replace(")", ",0.5)");  //影を付ける
      // ctx.shadowBlur = 5;       //ぼかしを５にする
      // ctx.shadowOffsetX = 2;    //横にずらす
      ctx.beginPath();
      ctx.arc(x, y, arcsiz, 0, 2 * Math.PI, true);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
  }
  //maru
  var arcsiz = 20;
  x = (-siz + arcsiz < x) ? x : -siz + arcsiz;
  x = (x < siz - arcsiz) ? x : siz - arcsiz
  y = (-siz + arcsiz < y) ? y : -siz + arcsiz
  y = (y < siz - arcsiz) ? y : siz - arcsiz;
  ctx.fillStyle = "rgba(255,178,0,0.5)";
  ctx.strokeStyle = "rgba(0,0,0,1)";
  // ctx.shadowColor = color.replace(")", ",0.5)");  //影を付ける
  // ctx.shadowBlur = 5;       //ぼかしを５にする
  // ctx.shadowOffsetX = 2;    //横にずらす
  ctx.beginPath();
  ctx.arc(x, y, arcsiz, 0, 2 * Math.PI, true);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ///////////////////なおす
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.restore();
}



///// global pool distance
var buff_distance = (function () {
  var _a = false;
  return {
    get a() { return _a; },
    set a(n) {
      if (n == true || n == false) {
        _a = n;
      }
    }
  };
})();


function distanceToXY(distance = [0.2, 0.2, 0.2, 0.2, 0.2], siz = 150) {
  var x_online = [5], y_online = [5];
  var pi = Math.PI;
  for (var position = 0; position < 5; position++) {
    var dist =
      (distance[position] > 1) ? 1 ://最大値
        (distance[position] < 0.2) ? 0.2 ://最小値
          distance[position];
    var rad = 4 / 10 * pi * position - pi / 10;
    x_online[position] = dist * siz * Math.cos(rad);
    y_online[position] = dist * siz * Math.sin(rad);
  }
  return [x_online, y_online];
}
//背景
function raderBackChartCreate(canvas_b) {
  var ctx_b = canvas_b.getContext("2d");
  //真ん中
  var x_c = canvas_b.width / 2;
  var y_c = canvas_b.height / 2 * 1.1;
  ctx.setTransform(1, 0, 0, 1, x_c, y_c);//真ん中を０に
  //サイズ定義
  var siz = canvas_b.width / 2;
  //PI
  var pi = Math.PI;
  //外枠の五角形
  var [x, y] = distanceToXY(Array(5).fill(1), siz);
  ctx_b.lineWidth = 1;
  ctx_b.strokeStyle = "rgba(0,0,0,1)"
  ctx_b.lineCap = "round";
  ctx_b.lineJoin = "round";
  ctx_b.fillStyle = ("rgba(255,255,255,0.5)");
  ctx_b.beginPath();
  ctx_b.moveTo(x[0], y[0]);
  for (var j = 1; j < 5; j++) {
    ctx_b.lineTo(x[j], y[j]);
  }
  ctx_b.closePath();
  ctx_b.stroke();
  ctx_b.fill();
  //補助線を描く
  ctx_b.strokeStyle = ("rgba(100,100,100,0.4)");
  //縦線
  var [x, y] = distanceToXY(Array(5).fill(1), siz);
  ctx_b.beginPath();
  for (var j = 0; j < 5; j++) {
    ctx_b.moveTo(0, 0);
    ctx_b.lineTo(x[j], y[j]);
  }
  ctx_b.stroke();
  //横線
  for (var i = 1; i < 5; i++) {
    var [x, y] = distanceToXY(Array(5).fill(i / 5), siz)
    ctx_b.beginPath();
    ctx_b.moveTo(x[0], y[0]);
    for (var j = 1; j < 5; j++) {
      ctx_b.lineTo(x[j], y[j]);
    }
    ctx_b.closePath();
    ctx_b.stroke();
  }
  //パラメータテキスト
  if (siz > 100) {
    var txt = ["日本酒度", "酸度", "甘辛度", "濃淡度", "アルコール"]; //描画する文字
    var [x, y] = distanceToXY(Array(5).fill(3 / 5), siz);
    ctx_b.font = "30px serif"; //フォントにArial,40px,斜体を指定
    ctx_b.textAlign = "center";
    ctx_b.fillStyle = "black"; //塗り潰し色を緑に
    for (var j = 0; j < 5; j++) {
      ctx_b.fillText(txt[j], x[j], y[j]);
    }
  }
  ctx_b.setTransform(1, 0, 0, 1, 0, 0);//なおす
}

//チャートグラフ
function raderChartCreate(canvas, distance, isdot = true, color = "rgba(0,0,255)") {
  var ctx = canvas.getContext("2d");
  //サイズ
  var siz = canvas.width / 2;
  //真ん中
  var x_c = canvas.width / 2;
  var y_c = canvas.height / 2 * 1.1;
  ctx.setTransform(1, 0, 0, 1, x_c, y_c);//真ん中を０に
  //pi
  var pi = Math.PI;
  //五角形
  ctx.strokeStyle = color;
  ctx.fillStyle = color.replace(")", ",0.5)");
  ctx.beginPath();
  [x, y] = distanceToXY(distance, siz);
  ctx.moveTo(x[0], y[0]);
  for (var i = 1; i < 5; i++) {
    ctx.lineTo(x[i], y[i]);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  //点
  if (isdot) {
    ctx.fillStyle = color;
    // ctx.shadowColor = color.replace(")", ",0.5)");  //影を付ける
    // ctx.shadowBlur = 5;       //ぼかしを５にする
    // ctx.shadowOffsetX = 2;    //横にずらす
    // ctx.shadowOffsetY = 2;    //縦にずらす
    for (i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x[i], y[i], 10, 0, 2 * pi, true);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);//座標変換を解除
}

graph.createRader = (canvas, distance, def_distance, isdot = true) =>  {
  ctx = canvas.getContext("2d");
  //クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //Back
  raderBackChartCreate(canvas);
  //def
  if (def_distance) {
    raderChartCreate(canvas, def_distance, false, "rgba(255,165,0)");
  }
  if (distance) {
    raderChartCreate(canvas, distance, isdot, "rgba(0,0,255)");
  }
}

