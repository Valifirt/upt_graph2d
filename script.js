'use strict';

//обработка автозаполнениея значений Y
function clickCheckY(){
  var checkY=document.getElementById('checkY');
  if(checkY.checked) {
    minX = document.getElementById('minX').value;
    maxX = document.getElementById('maxX').value;

    minY = document.getElementById('minY');
    minY.value = minX;
    minY.setAttribute("disabled","disabled");

    maxY = document.getElementById('maxY');
    maxY.value = maxX;
    maxY.setAttribute("disabled","disabled");
  } else {
    document.getElementById('minY').removeAttribute("disabled");
    document.getElementById('maxY').removeAttribute("disabled");
  }
};

//обработка очистки полей ввода
function clickClear(){
  document.getElementById('func').value = "";
  document.getElementById('minX').value = "";
  document.getElementById('maxX').value = "";
  document.getElementById('minY').value = "";
  document.getElementById('maxY').value = "";
  var checkY=document.getElementById('checkY');
  if(checkY.checked) {
    document.getElementById('checkY').checked = false;
    document.getElementById('minY').removeAttribute("disabled");
    document.getElementById('maxY').removeAttribute("disabled");
  }
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.clientHeight, canvas.clientWidth);
};

/////////////////////////////////////////////////////
//CONST
const π = Math.pi;
let abs = Math.abs;
let cos = Math.cos;
let arccos = Math.acos;
let sin = Math.sin;
let arcsin = Math.asin;
let tg = Math.tan;
let arctg = Math.atan;
let pow = Math.pow;
let sqrt = Math.sqrt;
let exp = Math.exp;
let ln = Math.log;

function ctg(x){
  return 1 / tg(x);
};

function arcctg(x) {
  return π * .5 - arctg(x);
};
/////////////////////////////////////////////////////
let canvas;
let ctx;

let clientHeight; // высота холста
let clientWidth; // ширина холста

let func; //входная функция

//область определения входной функции
let minX;
let maxX;
let minY;
let maxY;

//коэффициенты перехода от системы координат входной функции к системе координат экрана
let scaleX = 1;
let scaleY = 1;

let deltaX = 0;

const indent = 50; // отступ от границ canvas для подписей осей
const BLACK = '#000000';
const WHITE = '#AAAAAA';
const TEXT_FONT = "18pt Times New Roman";
const MAX_DRAW_LEVEL = 100;

function clickDraw(e) {
  errors.innerText = "";
  try {
    init();
    drawCoordinatesSystem();
    drawGraph()
  } catch (err) {
    errors.innerText = err.message;
  }
}

//инициализация входных данных и подготовка области для отрисовки
function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  clientHeight = canvas.clientHeight;
  clientWidth = canvas.clientWidth;
  ctx.clearRect(0, 0, clientWidth, clientHeight);


  minX = Number(document.getElementById('minX').value);
  maxX = Number(document.getElementById('maxX').value);
  if (isNaN(minX) || isNaN(maxX) || minX >= maxX) {
    throw new Error('Неверно введены значения Х');
  };

  var checkY = document.getElementById('checkY');
  if(checkY.checked) {
    minY = minX;
    maxY = maxX;
  } else {
    minY = Number(document.getElementById('minY').value);
    maxY = Number(document.getElementById('maxY').value);
    if (isNaN(minY) || isNaN(maxY) || minY >= maxY) {
      throw new Error('Неверно введены значения Y');
    };
  }

  func = new Function('x', 'return ' + document.getElementById('func').value);

  const doubleIndent = 2 * indent;
  let innerWidth = clientWidth - doubleIndent;
  let innerHeight = clientHeight - doubleIndent;
  let canvasWidth = maxX - minX;
  deltaX = canvasWidth / innerWidth;

  //отрисовка квадрата на холсте
  ctx.fillStyle = BLACK;
  ctx.strokeRect(0, 0, clientWidth, clientHeight);
  ctx.strokeStyle = WHITE;
  ctx.strokeRect(indent, indent, innerWidth, innerHeight);

  //масштабирование
  scaleX = innerWidth / canvasWidth;
  scaleY = innerHeight / (maxY - minY);
};

function drawCoordinatesSystem() {
  ctx.strokeStyle = BLACK;
  ctx.font = TEXT_FONT;

  //расчеты координат подписей осей
  const halfIndent = indent / 2;
  ctx.fillText(maxY, halfIndent, indent);
  let h1 = clientHeight - indent;
  ctx.fillText(minY, halfIndent, h1);
  let h2 = clientHeight - halfIndent;
  ctx.fillText(minX, indent, h2);
  ctx.fillText(maxX, clientWidth - indent, h2);

  const zeroX = transformX(0);
  const zeroY = transformY(0);
  const unitX = transformX(1);
  const unitY = transformY(1);

  //задание размеров стрелки
  const step = 10;
  const arrowWidth = indent / step;
  const arrowHeight = arrowWidth * (step - 1);

  if (zeroX >= indent && zeroX <= h1) {
    ctx.beginPath();
    ctx.moveTo(zeroX, h1);
    ctx.lineTo(zeroX, halfIndent);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineTo(zeroX - arrowWidth, arrowHeight);
    ctx.lineTo(zeroX + arrowWidth, arrowHeight);
    ctx.lineTo(zeroX, halfIndent);
    ctx.fill();
    ctx.fillText("Y", zeroX, halfIndent);
    if (minX != 0 && maxX != 0) {
      ctx.fillText("0", zeroX, h2);
    }

    if (unitY > indent && unitY < h1) {
      ctx.beginPath();
      ctx.moveTo(zeroX - step, unitY);
      ctx.lineTo(zeroX + step, unitY);
      ctx.stroke();
      ctx.fillText("1", zeroX + step + 1, unitY + step/2);
    }

  }
  if (zeroY >= indent && zeroY <= h1) {
    ctx.beginPath();
    ctx.moveTo(indent, zeroY);
    ctx.lineTo(clientWidth - halfIndent, zeroY);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineTo(clientWidth - arrowHeight, zeroY - arrowWidth);
    ctx.lineTo(clientWidth - arrowHeight, zeroY + arrowWidth);
    ctx.lineTo(clientWidth - halfIndent, zeroY);
    ctx.fill();
    ctx.fillText("X", clientWidth - halfIndent, zeroY);
    if (minY != 0 && maxY != 0) {
      ctx.fillText("0", halfIndent, zeroY);
    }
    if (unitX > indent && unitX < h1) {
      ctx.beginPath();
      ctx.moveTo(unitX, zeroY + step);
      ctx.lineTo(unitX, zeroY - step);
      ctx.stroke();
      ctx.fillText("1", unitX, zeroY - step - 1);
    }
  }
};

function drawGraph() {
  ctx.fillStyle = BLACK;
  ctx.beginPath();

  let prevX = minX;
  let curX = prevX;
  let numPoints = 2 * clientHeight;
  while (curX <= maxX) {
    drawPoints(prevX, curX, numPoints);
    prevX = curX;
    curX = prevX + deltaX;
  }
  ctx.stroke();
};

function almostEqual(x, y) {
  return Math.abs(x - y) < Number.EPSILON * Math.max(Math.abs(x), Math.abs(y));
}

function correctYCoord(y) {
  return !(isNaN(y) || y == Infinity || y == -Infinity || y > maxY || y < minY);
}

function drawPoints(prevX, curX, numPoints) {
  let countPoints = 0;
  let drawLevel = 0;

  function drawPointRec(prevX, curX) {
    if (countPoints >= numPoints || drawLevel > MAX_DRAW_LEVEL) {
      return;
    }
    ++drawLevel;
    const prevY = func(prevX);
    const curY = func(curX);
    if (correctYCoord(prevY) || correctYCoord(curY)) {
      const screenCurY = transformY(curY);
      if (Math.abs(screenCurY - transformY(prevY)) <= 1) {
        ctx.fillRect(transformX(curX), screenCurY, 1, 1);
        ++countPoints;
      } else {
        if (almostEqual(curX, prevX)) {
          ctx.fillRect(transformX(curX), screenCurY, 1, 1);
          ++countPoints;
        } else {
          const midX = (prevX + curX) / 2;
          drawPointRec(prevX, midX);
          drawPointRec(midX, curX);
        }
      }
    }
    --drawLevel;
  }
  drawPointRec(prevX, curX);
};

//преобразование координат
function transformX(x) {
  return Math.round((x - minX) * scaleX + indent);
};

function transformY(y) {
  return Math.round((maxY - y) * scaleY + indent);
};
