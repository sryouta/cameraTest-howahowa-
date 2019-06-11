// This is a JavaScript file
// This is a JavaScript file
fmbaas = {};

fmbaas.hideProgress = function (progress) {
  progress.style.display = "none";
};

fmbaas.progressOn = function (imageDivElem, options = {}) {
  ///default
  if (options === {}) {
    options = { text: "uploading..."};
  }
  //loadImage作成  
  let svgStr = `<svg width="150" height="120" viewBox="-10 0 115 105" xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="#999">`
  const circlePos = [12.5, 52.5, 92.5];
  for (cx of circlePos) {
    for (cy of circlePos) {
      svgStr += `
    <circle cx="${cx}" cy="${cy}" r="12.5">
        <animate attributeName="fill-opacity"
         begin="${(cx + cy) * 3}ms" dur="1s"
         values="1;.2;1" calcMode="linear"
         repeatCount="indefinite" />
    </circle>    
    `;
    }
  }
  svgStr += `<text x="50%" text-anchor="middle" y="120" font-size="20 textLength="125" lengthAdjust="spacingAndGlyphs">${options.text}</text>`;
  svgStr += "</svg>";

  loadImage = ons.createElement(svgStr);

  //CSS
  imageDivElem.style.position = "relative";

  loadImage.style.position = "absolute";
  loadImage.style.top = "50%";
  loadImage.style.left = "50%";
  loadImage.style.transform = "translate(-50%,-50%)";
  loadImage.style.width = "70px";

  imageDivElem.appendChild(loadImage);

  return loadImage;
};

