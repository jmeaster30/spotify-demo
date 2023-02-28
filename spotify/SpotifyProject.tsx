import * as React from 'react';
import { observer } from 'mobx-react';
import Sketch from "react-p5";
import p5Types from "p5";
import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap';
import axios from 'axios';
import styles from 'app/styles/spotifyStyles.scss';
import Obama from 'assets/imgs/obama.png';
import Clinton from 'assets/imgs/clinton.png';
type Point = {
  x: number,
  y: number
}

type Quad = {
  top_left: Point,
  top_right: Point,
  bottom_left: Point,
  bottom_right: Point
}

type VinylBoundary = {
  name: string,
  quad: Quad,
}

type SwagModel = {
  name: string,
  width: number,
  height: number,
  scale: number,
  file: string,
  boundaries: VinylBoundary[]
}

type AlbumSearchResult = {
  printURL: string,
  displayURL: string,
  albumName: string,
  artists: string[]
}

// TODO these being at the top level here makes it so we can't live update these values
const pics: SwagModel[] = [
  {
    name: "clinton",
    width: 1076, //main pic width in pixels
    height: 1356, //main pic height in pixels
    scale: 0.6,
    file: Clinton,
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
    file: Obama,
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

type ResultsViewProps = {
  error: any,
  searchResults: AlbumSearchResult[] | undefined
  onClick: (value: string) => void
}

export const ResultsView = observer(({ error, searchResults, onClick }: ResultsViewProps) => {
  const handleResultClick = React.useCallback((imageUrl: string) => (
    (event: any) => {
      onClick(imageUrl);
    }
  ), [onClick]);
  
  if (error) {
    return <>{JSON.stringify(error)}</>
  }

  if (!searchResults) {
    return <>{"No results :("}</>
  }

  return (<div className={styles.resultsView}>{
    ...searchResults.map((value, index) => (
      <Row key={index} className={styles.albumSearchResult} onClick={handleResultClick(value.printURL)}>
        <Col md={3}>
          <img src={value.displayURL}/>
        </Col>
        <Col md={9}>
          <label>{value.albumName}</label>
          <div>{value.artists.reduce((prev, curr) => `${prev}, ${curr}`)}</div>
        </Col>
      </Row>
  ))}</div>);
});

// Calculate the Width in pixels of a Dom element
const elementWidth = (element: Element) => {
  return (
    element.clientWidth -
    parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-left")) -
    parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-right"))
  )
}

// Calculate the Height in pixels of a Dom element
const elementHeight = (element: Element) => {
  return (
    element.clientHeight -
    parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-top")) -
    parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-bottom"))
  )
}

export const SpotifyProject = observer(() => {
  const [swagModel, setSwagModel] = React.useState<number>(0);
  const [swagImage, setSwagImage] = React.useState<p5Types.Image>(new p5Types.Image());
  const [selectedImages, setSelectedImages] = React.useState<(p5Types.Image|undefined)[]>([]);
  const [selectedImageURLs, setSelectedImageURLs] = React.useState<string[]>([]);
  const [selectedBoundary, setSelectedBoundary] = React.useState<string>("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<AlbumSearchResult[]>();
  const [error, _setError] = React.useState<any>();
  const [doSaveImage, setSaveImage] = React.useState<boolean>(false);
  const [filename, setFilename] = React.useState<string>("");

  const handleSelectBoundary = React.useCallback((event: any) => {
    setSelectedBoundary(event.target.value);
  }, [swagModel]);

  const handleSearchChange = React.useCallback((event: any) => {
    setSearchTerm(event.target.value);
  }, [setSearchTerm]);

  const handleChangeFilename = React.useCallback((event: any) => {
    setFilename(event.target.value);
  }, [setSearchTerm]);

  const handleSaveImage = React.useCallback((event: any) => {
    setSaveImage(true);
  }, [setSaveImage]);

  const handleImageURLSet = React.useCallback((imageURL: string) => {
    let boundaryIndex = pics[swagModel].boundaries.findIndex((x: any) => x.name == selectedBoundary);
    if (boundaryIndex < 0) return;
    // set image url to be loaded on next draw call
    let newSelectedImageURLs = [...selectedImageURLs];
    newSelectedImageURLs[boundaryIndex] = imageURL;
    setSelectedImageURLs(newSelectedImageURLs);
    // clear old picture
    let newSelectedImages = [...selectedImages];
    newSelectedImages[boundaryIndex] = undefined;
    setSelectedImages(newSelectedImages);
  }, [swagModel, selectedBoundary, selectedImageURLs, selectedImages]);

  const doSearch = React.useCallback(async () => {
    let access_token = "";
    await axios.post('https://accounts.spotify.com/api/token', {
      grant_type: 'client_credentials'
    }, {
      headers: {
        'Authorization': `Basic ${btoa('f01b9f12b0964f3bbbca7c17c417deb1:55421359dc4d4c65ae2ac12f79f30524')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(result => {
      access_token = result.data.access_token;
    }).catch(err => console.error(err));

    await axios.get(`https://api.spotify.com/v1/search?q=${searchTerm}&type=album&limit=15`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    }).then(results => {
      setSearchResults(results.data.albums?.items.map((value: any) => ({
        printURL: value.images[0].url,
        displayURL: value.images[value.images.length - 1].url,
        albumName: value.name,
        artists: value.artists.map((x: any) => x.name)
      })));
    })
    .catch(err => console.error(err));
  }, [searchTerm]);

  const preload = React.useCallback((p5: p5Types) => {
    const idx = Math.floor(Math.random() * pics.length);
    setSwagModel(idx);
    console.log("preload");
    p5.loadImage(pics[idx].file, (loadedImage) => {
      setSwagImage(loadedImage);
      setSelectedBoundary(pics[idx].boundaries[0].name);
    }, (ev: Event) => {
      console.log("failed loading image")
      console.log(pics[idx].file);
    });
  }, [pics, selectedBoundary, swagImage, swagModel]);
  
  const setup = React.useCallback((p5: p5Types, ref: Element) => {
    console.log("setup");
    if (!swagModel) return;
    p5.createCanvas(elementWidth(ref), elementHeight(ref), p5.WEBGL).parent(ref);
    p5.frameRate(1);
    p5.colorMode(p5.HSB, 100);
  }, [swagModel]);

  const draw = React.useCallback((p5: p5Types) => {
    p5.background(p5.color(0, 0));
    p5.translate(-p5.width / 2, -p5.height / 2);
    pics[swagModel].boundaries.forEach((value, index) => {
      if (selectedImages[index]) {
        p5.noStroke();
        p5.texture(selectedImages[index] as p5Types.Image);
        p5.quad(value.quad.top_left.x * pics[swagModel].scale, value.quad.top_left.y * pics[swagModel].scale,
          value.quad.top_right.x * pics[swagModel].scale, value.quad.top_right.y * pics[swagModel].scale, 
          value.quad.bottom_right.x * pics[swagModel].scale, value.quad.bottom_right.y * pics[swagModel].scale, 
          value.quad.bottom_left.x * pics[swagModel].scale, value.quad.bottom_left.y * pics[swagModel].scale)
      } else if (selectedImageURLs[index]) {
        console.log("load image");
        p5.loadImage(selectedImageURLs[index], image => {
          let newSelectedImages = [...selectedImages]
          newSelectedImages[index] = image;
          setSelectedImages(newSelectedImages);
        }, ev => {
          console.log("failed to load image.");
          console.log(selectedImageURLs[index]);
        });
      } else {
        console.log("neither")
      }
    });
    p5.image(swagImage, 0, 0, pics[swagModel].width * pics[swagModel].scale, pics[swagModel].height * pics[swagModel].scale);
    if (doSaveImage) {
      p5.saveCanvas(`${filename}.png`);
      setSaveImage(false);
    }
  }, [swagModel, swagImage, selectedImageURLs, selectedImages, filename, doSaveImage]);
  
  return (
    <Row className={styles.spotifyBody}>
      <Col md={6} clasName={styles.spotifyCanvasContainer}>
        <Sketch preload={preload} setup={setup} draw={draw}/>
      </Col>
      <Col md={6}>
        <ButtonToolbar>
          <select onChange={handleSelectBoundary} value={selectedBoundary}>
            {
              pics[swagModel]?.boundaries.map((value, index) => (
                <option key={index} value={value.name}>{value.name}</option>
              ))
            }
          </select>
          <input type="text" onChange={handleSearchChange} value={searchTerm} placeholder="Album Title"/>
          <Button onClick={doSearch}>Search For Album</Button>
          <input type="text" onChange={handleChangeFilename} value={filename} placeholder="Filename"/>
          <Button onClick={handleSaveImage}>Save Image</Button>
        </ButtonToolbar>
        <ResultsView error={error} searchResults={searchResults} onClick={handleImageURLSet}/>
      </Col>
    </Row>
  )
});

export default SpotifyProject;