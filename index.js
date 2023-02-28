const pics = [
  {
    name: "clinton",
    width: 1076, //main pic width in pixels
    height: 1356, //main pic height in pixels
    scale: 0.6,
    file: "./imgs/clinton.png",
    boundaries: [
      {
        name: "hands",
        quad: {
          top_left:     {x: 236, y: 473},
          top_right:    {x: 615, y: 591},
          bottom_left:  {x: 133, y: 827},
          bottom_right: {x: 488, y: 956}
        },
      },
      {
        name: "wall",
        quad: {
          top_left:     {x: 852, y: 623},
          top_right:    {x: 1131, y: 701},
          bottom_left:  {x: 776, y: 931},
          bottom_right: {x: 1025, y: 1040}
        },
      },
      {
        name: "floor left",
        quad: {
          top_left:     {x: 265, y: 1129},
          top_right:    {x: 621, y: 1212},
          bottom_left:  {x: 45, y: 1354},
          bottom_right: {x: 471, y: 1460}
        },
      },
      {
        name: "floor right",
        quad: {
          top_left:     {x: 629, y: 1138},
          top_right:    {x: 1024, y: 1128},
          bottom_left:  {x: 642, y: 1378},
          bottom_right: {x: 1138, y: 1359}
        },
      },
    ],
  },
  //obama picture variables
  {
    name: "obama",
    width: 1440,
    height: 1738,
    scale: 0.6,
    file: "./imgs/obama.png",
    boundaries: [
      {
        name: "obama",
        quad: {
          top_left:     {x: 249, y: 1038},
          top_right:    {x: 1031, y: 1007},
          bottom_left:  {x: 277, y: 1760},
          bottom_right: {x: 1079, y: 1737}
        }
      }
    ],
  }
];

let mainPicture = null
let selectedModel = null

function preload() {
  selectedModel = pics[Math.floor(Math.random() * pics.length)]
  mainPicture = loadImage(selectedModel.file)
}

function setup() {
  createCanvas(selectedModel.width * selectedModel.scale, selectedModel.height * selectedModel.scale);
}

function draw() {
  background(0);
  image(mainPicture, 0, 0, selectedModel.width * selectedModel.scale, selectedModel.height * selectedModel.scale)
}
