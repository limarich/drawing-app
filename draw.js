const canvas = document.getElementById("draw-board");
const ctx = canvas.getContext("2d");

const clearBtn = document.getElementById("clear-btn");
const colorSelector = document.getElementById("color-selector");
const lineWidthSelector = document.getElementById("line-width-selector");
const fillBtn = document.getElementById("fill-btn");
const gridSelector = document.getElementById("grid-selector");
const coordinates = document.getElementById("coordinates");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");
const options = document.querySelectorAll(".option");
const floatInput = document.getElementById("float-input");
const imageInput = document.getElementById("image-input");
const saveBtn = document.getElementById("save-btn");

let selectedOption = "line";

let snapshot;

let isDrawing = false,
  isPressing = false;

let previousMouseX,
  previousMouseY = 0;

//history stacks for the undo and redo functionality
let undoStack = [];
let redoStack = [];

undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

const saveCanvas = () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL();
  a.download = "aaaa.png";
  a.click();
};

const eraseArea = (e) => {
  ctx.clearRect(e.offsetX, e.offsetY, 20, 20);
  saveSnapshot();
};

const saveSnapshot = () => {
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  redoStack = [];
};

const drawCoordinates = (x, y) => {
  coordinates.innerHTML = `
  <span>X: ${x}</span>
  <span>Y: ${y}</span>
  `;
};

const drawRect = (e) => {
  ctx.beginPath();
  if (fillBtn.checked) {
    ctx.fillRect(
      e.offsetX,
      e.offsetY,
      previousMouseX - e.offsetX,
      previousMouseY - e.offsetY
    );
    ctx.fill();
  } else {
    ctx.strokeRect(
      e.offsetX,
      e.offsetY,
      previousMouseX - e.offsetX,
      previousMouseY - e.offsetY
    );
  }
};
const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(previousMouseX, previousMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);

  ctx.lineTo(2 * previousMouseX - e.offsetX, e.offsetY);
  ctx.closePath();
  fillBtn.checked ? ctx.fill() : ctx.stroke();
};
const drawCircle = (e) => {
  ctx.beginPath();

  const radius = Math.sqrt(
    Math.pow(previousMouseX - e.offsetX, 2) +
      Math.pow(previousMouseY - e.offsetY, 2)
  );
  ctx.arc(e.offsetX, e.offsetY, radius, 0, 2 * Math.PI);
  fillBtn.checked ? ctx.fill() : ctx.stroke();
};
const drawLine = (e) => {
  ctx.beginPath();
  ctx.moveTo(previousMouseX, previousMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};
const drawText = (x, y) => {
  ctx.font = "30px Comic Sans MS";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.fillText(floatInput.value, x, y);
  floatInput.style.display = "none";
  floatInput.value = "";
  isDrawing = false;
  selectedOption = "brush";
};

const drawing = (e) => {
  if (!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);
  drawCoordinates(e.offsetX, e.offsetY);
  if (selectedOption === "brush") {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedOption === "line") {
    drawLine(e);
  } else if (selectedOption === "rect") {
    drawRect(e);
  } else if (selectedOption === "circle") {
    drawCircle(e);
  } else if (selectedOption === "triangle") {
    drawTriangle(e);
  } else if (selectedOption === "text") {
    floatInput.style.display = "flex";
  }
};

const initDraw = (e) => {
  previousMouseX = e.offsetX;
  previousMouseY = e.offsetY;

  ctx.beginPath();

  ctx.lineWidth = lineWidthSelector.value;
  ctx.strokeStyle = colorSelector.value;
  ctx.fillStyle = colorSelector.value;
  isDrawing = true;
  if (selectedOption === "text") {
    floatInput.style.left = e.pageX + "px";
    floatInput.style.top = e.pageY + "px";
    floatInput.style.display = "inline-block";
  }
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};
const finishDraw = (e) => {
  if (selectedOption === "text") {
    drawText(e.offsetX, e.offsetY);
  }
  saveSnapshot();
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
};

canvas.addEventListener("mousemove", (e) => {
  if (isPressing && selectedOption === "eraser") {
    eraseArea(e);
  } else {
    drawing(e);
  }
});
canvas.addEventListener("mousedown", (e) => {
  isPressing = true;
  if (selectedOption !== "eraser") {
    initDraw(e);
  }
});
canvas.addEventListener("mouseup", (e) => {
  isPressing = false;
  if (selectedOption !== "eraser") {
    finishDraw(e);
  }
  isDrawing = false;
});

clearBtn.addEventListener("click", clearCanvas);

options.forEach((option) => {
  option.addEventListener("click", () => {
    selectedOption = option.id;
  });
});

const undo = () => {
  if (undoStack.length > 0) {
    redoStack.push(undoStack.pop());
    ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
  }
};
const redo = () => {
  if (redoStack.length > 0) {
    undoStack.push(redoStack.pop());
    ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
  }
};

const handleImage = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = (e) => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};
redoBtn.addEventListener("click", redo);
undoBtn.addEventListener("click", undo);

floatInput.addEventListener("focusout", (e) => {
  finishDraw({
    offsetX: previousMouseX,
    offsetY: previousMouseY,
  });
});
imageInput.addEventListener("change", handleImage);
saveBtn.addEventListener("click", saveCanvas);
