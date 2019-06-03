const ca = document.getElementById("canvas");  //canvasの要素を取得
const g  = ca.getContext("2d");                //2dcontextを取得
const block = 50;              //ブロックの幅
const radius = block / 2 - 2;  //ブロックの半径
const row = 9;                 //縦列の数(0から)
const column = 5;              //横列の数(0から)
//ブロックの色
const bColor = ["white", "red", "blue", "green", "yellow", "purple",
                "hotpink"];
const phaseType = ["operate", "search", "erase", "drop"];  //フェーズのタイプ

let phase;  //現在のフェーズ
let board /*= [
  [0,0,0,0,0,0],
  [0,0,0,0,0,0],
  [0,0,0,0,0,0],
  [0,0,0,0,0,0],
  [0,0,0,0,0,0],
  [1,1,1,4,2,6],
  [2,2,2,4,3,1],
  [1,1,1,6,2,1],
  [5,4,1,4,3,2],
  [6,3,1,4,5,3],
]*/;  //ゲームボード
let comboList;  //コンボを格納する配列

//boardを調べて任意のコールバック関数を行う
function searchBoard(callback) {
  for(let y = 0; y <= row; y++) {
    for(let x = 0; x <= column; x++) {
      callback(x, y);
    }
  }
}

function test(x, y) {
  console.log("x =" + x, "y =" + y, board[y][x]);
}

//ボード作成
function createBoard() {
  board = [];
  for(let y = 0; y <= row; y++) {
    board[y] = [];
    for(let x = 0; x <= column; x++) {
      if(y - 5 < 0) { board[y][x] = 0; }
      else { board[y][x] = Math.floor(Math.random() * 6) + 1; }
    }
  }
}

function searchCombo() {
  comboList = [];

  for(let y = 5; y <= row; y++) {
    for(let x = 0; x <= column; x++) {
      if(board[y][x] !== 0) {
        let nowType = board[y][x];
        let nx     = x;
        let combo  = [];
        let length = 0;
        while(board[y][nx] === nowType) {
          combo.push({x: nx, y: y});
          length++;
          nx++;
          if(nx > column) {
            break;
          }
        }
        if(length >= 3) {
          comboList.push(combo);
          if(length > 3) {
            break;
          }
        }
      }
    }
  }

  for(let x = 0; x <= column; x++) {
    for(let y = 5; y <= row; y++) {
      if(board[y][x] !== 0) {
        let nowType = board[y][x];
        let ny     = y;
        let combo  = [];
        let length = 0;
        while(board[ny][x] === nowType) {
          combo.push({x: x, y: ny});
          length++;
          ny++;
          if(ny > row) {
            break;
          }
        }
        if(length >= 3) {
          comboList.push(combo);
          if(length > 3) {
            break;
          }
        }
      }
    }
  }

  let concatFlag;
  do {
    concatFlag = false;
    let resultList = [];
    comboList.forEach(function(combo, index, array) {
      let filterList = [];
      let filter;
      //let result;
      combo.forEach(function(value, comboIndex, comboArray) {
        let filterIndex;
        //let cIndex;
        filter = comboList.filter(function(fv, fi, fa) {
          let c = fv.filter(function(cv, ci, ca) {
            //if(value.x === cv.x && value.y === cv.y && index !== fi) {
              //cIndex = ci;
            //}
            return (value.x == cv.x) && (value.y == cv.y) && (index != fi);
          });
          if(c.length > 0) {
            filterIndex = fi;
          }
          return c.length > 0;
        });
        if(filter.length > 0) {
          //filter[0].splice(cIndex, 1);
          array.splice(filterIndex, 1);
          filterList.push(filter[0]);
        }
      });
      if(filterList.length > 0) {
        concatFlag = true;
        let result = combo;
        for(let d = 0; d < filterList.length; d++) {
          result = result.concat(filterList[d]);
        }
        result = result.filter(function(v1, i1, a1) {
          return (a1.findIndex(function(v2, i2, a2) {
            return (v1.x === v2.x && v1.y === v2.y)
          }) === i1);
        });
        resultList.push(result);
        //console.log(result);
      }else {
        resultList.push(combo);
      }
      /*console.log(array);
      console.log(combo);
      console.log(filter);
      console.log(filterList);*/
    });
    //console.log(resultList);
    comboList = resultList;
  } while(concatFlag);
  //console.log(comboList);
  if(comboList.length <= 0) {
    phase = phaseType[0];
  }else {
    phase = phaseType[2];
  }
}

//blockを消す
function eraseBlock() {
  if(comboList.length <= 0) {
    phase = phaseType[3];
    return;
  }
  const combo = comboList[0];
  combo.forEach(function(value) {
   board[value.y - 5][value.x] = Math.floor(Math.random() * 6) + 1;
   board[value.y][value.x] = 0;
  });
  comboList.splice(0, 1);
}

//blockを落とす
function dropBlock() {
  let endFlag = true;
  for(let x = 0; x <= column; x++) {
    for(let y = row; y >= 5; y--) {
      if(board[y][x] == 0) {
        for(let a = y; a >= 0; a--) {
          if(a - 1 < 0) {
            board[a][x] = 0;
          }else {
            board[a][x] = board[a - 1][x];
          }
        }
        endFlag = false;
        break;
      }
    }
  }
  if(endFlag) {
    phase = phaseType[1];
  }
  //console.log(board);
}

//画面初期化のためのドロップ
function initDrop() {
  for(let x = 0; x <= column; x++) {
    for(let y = row; y >= 5; y--) {
      while(board[y][x] == 0) {
        for(let a = y; a >= 0; a--) {
          if(a - 1 < 0) {
            board[a][x] = 0;
          }else {
            board[a][x] = board[a - 1][x];
          }
        }
      }
    }
  }
  phase = phaseType[1];
}

//ボードの描画
function drawBoard() {
  g.strokeStyle = "black";
  for(let y = 5; y <= row; y++) {
    for(let x = 0; x <= column; x++) {
      g.strokeRect(x * block, (y - 5) * block, block, block);
    }
  }
}

//ブロックの描画
function drawBlock() {
  for(let y = 5; y <= row; y++) {
    for(let x = 0; x <= column; x++) {
      let posX = x       * block + radius + 2;
      let posY = (y - 5) * block + radius + 2;
      g.beginPath();
      g.fillStyle = bColor[board[y][x]];
      g.arc(posX, posY, radius, 0, Math.PI * 2, true);
      g.fill();
    }
  }
}

//プレーヤーの操作中のブロックを描画
function drawPlayer() {
  g.beginPath();
  g.fillStyle = bColor[player];
  g.arc(mx, my, radius, 0, Math.PI * 2, true);
  g.fill();
}

//描画処理
function render() {
  g.clearRect(0, 0, ca.width, ca.height);
  drawBoard();
  drawBlock();
  if(moveFlag) {
      drawPlayer();
  }
}

let mx, my;             //マウス座標
let playerX, playerY;   //プレイヤー座標
let preX, preY;         //プレイヤーの変化前の座標
let player;             //プレイヤーが操作中のブロック
let moveFlag = false;   //moveイベントを実行するか判定
//マウスとプレイヤーの座標を定める
function fixPoint(event) {
  let rect = ca.getBoundingClientRect();
  mx = event.pageX - rect.left;
  my = event.pageY - rect.top;

  if(mx < block) {
    playerX = 0;
  }else if(mx < block * 2) {
    playerX = 1;
  }else if(mx < block * 3) {
    playerX = 2;
  }else if(mx < block * 4) {
    playerX = 3;
  }else if(mx < block * 5) {
    playerX = 4;
  }else if(mx < block * 6) {
    playerX = 5;
  }

  if(my < block) {
    playerY = 5;
  }else if(my < block * 2) {
    playerY = 6;
  }else if(my < block * 3) {
    playerY = 7;
  }else if(my < block * 4) {
    playerY = 8;
  }else if(my < block * 5) {
    playerY = 9;
  }
}

//プレイヤー座標の変化を調べる
function pointChangeDetective() {
  if(playerX != preX || playerY != preY) {
    return true;
  }
}

//マウスイベント処理
//downイベント
ca.addEventListener("mousedown", function(event) {
  if(phase !== phaseType[0]) {
    return;
  }
  fixPoint(event);
  preX = playerX, preY = playerY;
  player = board[playerY][playerX];
  board[playerY][playerX] = 0;
  moveFlag = true;
}, false);

//upイベント
ca.addEventListener("mouseup", function(event) {
  if(phase !== phaseType[0]) {
    return;
  }
  moveFlag = false;
  fixPoint(event);
  board[playerY][playerX] = player;
  phase = phaseType[1];
}, false);

//moveイベント
ca.addEventListener("mousemove", function(event) {
  if(!moveFlag || phase !== phaseType[0]) {
    return;
  }
  fixPoint(event);
  if(pointChangeDetective()) {
    board[preY][preX] = board[playerY][playerX];
    board[playerY][playerX] = 0;
  }
  preX = playerX, preY = playerY;
}, false);

//ウィンドウ読み込み時処理
window.onload = function() {
  createBoard();
  phase = phaseType[1];
  while(phase !== phaseType[0]) {
    if(phase == phaseType[1]) {
      searchCombo();
    }else if(phase == phaseType[2]) {
      eraseBlock();
    }else if(phase == phaseType[3]) {
      initDrop();
    }
    render();
  }
  
  let frameCounter = 0;
  let loop = setInterval(function() {
    if(phase == phaseType[1]) {
      searchCombo();
    }else if(phase == phaseType[2]) {
      if(frameCounter % 10 == 0) {
        eraseBlock();
      }
    }else if(phase == phaseType[3]) {
      if(frameCounter % 10 == 0) {
        dropBlock();
      }
    }
    render();
    frameCounter++;
  }, 30);
}
