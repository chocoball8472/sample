const ca = document.getElementById("canvas");   //キャンバスを取得
const g  = ca.getContext("2d");                 //2dコンテキストを取得
const sc = document.getElementById("score");    //score表示のdivタグ取得
const gs = document.getElementById("gamestatus")//ゲーム状況表示のdivタグ取得
const pImg  = new Image();                      //player画像
const eImg  = new Image();                      //enemy画像
const pWidth  = 30;   //playerの横幅
const pHeight = 32;   //playerの縦幅
const pSpeed  = 10;   //playerの移動スピード
const eWidth  = 23;   //enemyの横幅
const eHeight = 15;   //enemyの縦幅

let startFlag = true;   //ゲームスタート判定
let run       = true;   //gameを続けるか判定
let playerX   = 135;    //playerのx座標
let playerY   = 360;    //playerのy座標
let keyStatus = [0, 0]; //player移動のフラグ保持
let bulletList = [];    //弾を複数格納するための配列
let enemyList  = [];    //enemyを格納するための配列
let enemyTimer = 15;    //enemyが出現する頻度（フレーム）
let score      = 0;     //score


//画像の読み込み
function loadImage() {
  pImg.src = './img/ico_rocket1_1.gif';
  eImg.src = './img/ico_UFOa1_1.gif';

  pImg.onload = function() {
    console.log("player画像、読み込み完了");
  }

  eImg.onload = function() {
      console.log("enemy画像、読み込み完了");
  }
}

//描画処理
function draw() {
  g.clearRect(0, 0, ca.width, ca.height);   //画面をクリア
  //g.fillstyle = "rgb(0, 0, 0)";
  //g.fillRect(0, 0, ca.width, ca.height);    //背景を描画

  g.drawImage(pImg, playerX, playerY, pWidth, pHeight);   //playerを描画

  //弾の描画
  bulletList.forEach(bullet => {
    g.beginPath();
    g.fillStyle = "rgb(0, 0, 255)";
    g.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI*2, true);
    g.fill();
  });

  //enemyの描画
  enemyList.forEach(enemy => {
    g.drawImage(eImg, enemy.x, enemy.y, eWidth, eHeight);
  });

  //scoreの表示
  sc.textContent = "SCORE : " + score;
}

//playerの移動処理
function playerMove() {
  if(keyStatus[0] == -1 && playerX - pSpeed > 0) {
    playerX -= pSpeed;
  }
  if(keyStatus[1] == -1 && playerY - pSpeed > 0) {
    playerY -= pSpeed;
  }
  if(keyStatus[0] == 1 && playerX + pWidth + pSpeed < ca.width) {
    playerX += pSpeed;
  }
  if(keyStatus[1] == 1 && playerY + pHeight + pSpeed < ca.height) {
    playerY += pSpeed;
  }
}

//keyイベント処理
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

//keydownイベント
function keyDownHandler(e) {
  if(e.keyCode == 37) {       //←　左に移動
    keyStatus[0] = -1;
  }
  if(e.keyCode == 38) {       //↑　上に移動
    keyStatus[1] = -1;
  }
  if(e.keyCode == 39) {       //→　右に移動
    keyStatus[0] = 1;
  }
  if(e.keyCode == 40) {       //↓　下に移動
    keyStatus[1] = 1;
  }

  if(e.keyCode == 32) {       //space 弾の発射
    bulletList.push(new Bullet(playerX + pWidth/2, playerY));
  }

  //Enterでゲームスタート
  if(e.keyCode == 13 && startFlag) {
    gameStart();
    startFlag = false;
  }
}

//keydownイベント
function keyUpHandler(e) {
  if(e.keyCode == 37) {
    keyStatus[0] = 0;
  }
  if(e.keyCode == 38) {
    keyStatus[1] = 0;
  }
  if(e.keyCode == 39) {
    keyStatus[0] = 0;
  }
  if(e.keyCode == 40) {
    keyStatus[1] = 0;
  }
}

//弾クラス
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.radius = 5;
  }

  pmove() {
    this.y -= this.speed;
  }

  /*emove() {
    this.y += this.speed;
  }*/
}

//弾の移動
function bulletMove() {
  for (let x = 0; x < bulletList.length; x++) {
    bulletList[x].pmove();
    if(bulletList[x].y < 0) {
      bulletList.splice(x, 1);
    }
  }
}

//enemyクラス
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 5;
  }

  move() {
    this.y += this.speed;
  }
}

//enemyの移動
function enemyMove() {
  for (let x = 0; x < enemyList.length; x++) {
    enemyList[x].move();
    if(enemyList[x].y > ca.height) {
      enemyList.splice(x, 1);
      if(score > 0) {
        score--;
      }
    }
  }
}

//minからmaxまでのランダムな整数値を生成
let randRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//衝突処理
function collision() {
  //playerの衝突判定範囲の設定
  const pColXs = playerX + 5;
  const pColXe = playerX + pWidth - 5;
  const pColYs = playerY + 5;
  const pColYe = playerY + pHeight - 5;

  enemyList.forEach(enemy => {
    //enemyの衝突範囲の設定
    const eColXs = enemy.x + 5;
    const eColXe = enemy.x + eWidth - 5;
    const eColYs = enemy.y + 5;
    const eColYe = enemy.y + eHeight - 5;

    bulletList.forEach(bullet => {
        //弾とenemyの衝突判定
        if(  bullet.x - bullet.radius < enemy.x + eWidth
          && bullet.x + bullet.radius > enemy.x
          && bullet.y - bullet.radius < enemy.y + eHeight
          && bullet.y + bullet.radius > enemy.y ) {
          let eIdx= enemyList.indexOf(enemy);
          let bIdx= bulletList.indexOf(bullet);
          enemyList.splice(eIdx, 1);
          bulletList.splice(bIdx, 1);
          score += 5;
        }
    });
    //playerとenemyの衝突判定
    if(  pColXs < eColXe
      && pColXe > eColXs
      && pColYs < eColYe
      && pColYe > eColYs) {
        run = false;
        return;
    }
  });
}

function gameOver(interval) {
  gs.textContent = "Game Over";
  clearInterval(interval);
}

function gameStart() {
  //gamestatusの表示
  gs.textContent = "Now Playing";

  //メインループ
  const loop = setInterval(function() {
    if(!run) {
      //console.log(run);
      gameOver(loop);
    }
    if(enemyTimer == 0) {
      enemyList.push(new Enemy(randRange(0, ca.width - eWidth), -eHeight));
      enemyTimer = 10;
    }
    playerMove();
    enemyMove();
    bulletMove();
    draw();
    collision();
    enemyTimer --;
  }, 33);
}

function reset() {
  location.reload();
}

//ブラウザ起動処理
window.onload = function() {
  loadImage();
}
