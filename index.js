const pics = [
  {
    name: "clinton",
    width: 1076, //main pic width in pixels
    height: 1356, //main pic height in pixels
    scale: 0.6,
    file: "https://raw.githack.com/jmeaster30/spotify-demo/main/imgs/clinton.png",
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
    scale: 0.5,
    file: "https://raw.githack.com/jmeaster30/spotify-demo/main/imgs/obama.png",
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
let selectedBoundary = null
let boundaryImage = {}
let saveImage = false
let imageFilename = 'coolimageXD'

function handleSelectBoundary(event) {
  selectedBoundary = event.target.value
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}

async function doSearch() {
  let searchBox = document.getElementById('searchText');
  let searchResults = document.getElementById('results');
  removeAllChildNodes(searchResults);
  let searchText = searchBox.value;
  console.log("searching", searchText);
  let access_token = null;
  await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Authorization': `Basic ${btoa('f01b9f12b0964f3bbbca7c17c417deb1:55421359dc4d4c65ae2ac12f79f30524')}`,
      "Content-type": "application/x-www-form-urlencoded",
    }
  }).then(async (result) => {
    const data = await result.json();
    access_token = data.access_token;
  }).catch(err => console.error(err));

  if (!access_token) {
    return;
  }

  await fetch(`https://api.spotify.com/v1/search?q=${searchText}&type=album&limit=15`, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  }).then(async (res) => {
    const data = await res.json();
    foundAlbums = data.albums?.items.map((value) => ({
      printURL: value.images[0].url,
      displayURL: value.images[value.images.length - 1].url,
      albumName: value.name,
      artists: value.artists.map((x) => x.name)
    }));
    
    console.log(foundAlbums)

    // load search results into view

    for (let i = 0; i < foundAlbums.length; i++) {
      let result = document.createElement('div');
      result.className = "resultEntry"

      result.addEventListener('click', function(){
        console.log("CLICK");
        boundaryImage[selectedBoundary] = loadImage(foundAlbums[i].printURL);
      })

      let resultImageSpan = document.createElement('div');
      result.appendChild(resultImageSpan);

      let resultOtherSpan = document.createElement('div');
      result.appendChild(resultOtherSpan);

      let resultImage = document.createElement('img');
      resultImage.src = foundAlbums[i].displayURL;
      resultImageSpan.appendChild(resultImage);
      
      let resultTitle = document.createElement('div');
      resultTitle.className = "resultTitle"
      resultTitle.innerHTML = foundAlbums[i].albumName
      resultOtherSpan.appendChild(resultTitle);

      let resultArtists = document.createElement('div');
      resultArtists.className = "resultArtists";
      for (let j = 0; j < foundAlbums[i].artists.length; j++) {
        let resultArtist = document.createElement('span');
        resultArtist.className = "resultArtist";
        resultArtist.innerHTML = foundAlbums[i].artists[j];
        resultArtists.appendChild(resultArtist)
      }
      resultOtherSpan.appendChild(resultArtists);

      searchResults.appendChild(result)
    }
  })
  .catch(err => console.error(err));
}

function doSaveImage() {
  saveImage = true;
}

function doSetImageFilename() {
  let filename = document.getElementById('imageFilename');
  imageFilename = filename.value;
}

const debounce = (func, delay) => {
  let debounceTimer;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  }
}

function preload() {
  selectedModel = pics[Math.floor(Math.random() * pics.length)]
  mainPicture = loadImage(selectedModel.file)
  
  selectedBoundary = selectedModel.boundaries[0].name
  let select = document.getElementById('locations');
  select.addEventListener('change', handleSelectBoundary);
  for(let i = 0; i < selectedModel.boundaries.length; i++) {
    let opt = selectedModel.boundaries[i].name;
    let el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
  }

  let searchBox = document.getElementById('searchText');
  searchBox.addEventListener('input', debounce(doSearch, 500));

  document.getElementById('saveImageButton').addEventListener('click', doSaveImage);
  document.getElementById('imageFilename').addEventListener('input', doSetImageFilename);
}

function setup() {
  let container = document.getElementById('p5container')
  let desiredWidth = container.offsetWidth;
  selectedModel.scale = desiredWidth / selectedModel.width;
  let cnv = createCanvas(selectedModel.width * selectedModel.scale, selectedModel.height * selectedModel.scale, WEBGL);
  cnv.parent('p5container')

  colorMode(HSB, 255);
  document.getElementById('results').style.maxHeight = selectedModel.height * selectedModel.scale;
}

function draw() {
  background((noise(frameCount * 0.005) * 512) % 255, 255, 255);
  translate(-width / 2, -height / 2);
  for (let i = 0; i < selectedModel.boundaries.length; i++) {
    let boundaryName = selectedModel.boundaries[i].name
    if (boundaryImage[boundaryName]) {
      noStroke();
      texture(boundaryImage[boundaryName]);
      quad(selectedModel.boundaries[i].quad.top_left.x * selectedModel.scale, selectedModel.boundaries[i].quad.top_left.y * selectedModel.scale,
        selectedModel.boundaries[i].quad.top_right.x * selectedModel.scale, selectedModel.boundaries[i].quad.top_right.y * selectedModel.scale, 
        selectedModel.boundaries[i].quad.bottom_right.x * selectedModel.scale, selectedModel.boundaries[i].quad.bottom_right.y * selectedModel.scale, 
        selectedModel.boundaries[i].quad.bottom_left.x * selectedModel.scale, selectedModel.boundaries[i].quad.bottom_left.y * selectedModel.scale)
    }
  }
  image(mainPicture, 0, 0, selectedModel.width * selectedModel.scale, selectedModel.height * selectedModel.scale)
  if (saveImage) {
    saveCanvas(`${imageFilename}.png`);
    saveImage = false;
  }
}
