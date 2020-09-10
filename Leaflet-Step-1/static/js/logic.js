//Grab URL
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the earthquake URL
d3.json(earthquakeUrl, function (data) {
  console.log(data)
  // Once we get a response, send the data.features object to the createMap function
  createMap(data.features);
});

function createMap(earthquakeData) {

// Define base map layers
//satellite
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/satellite-streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
  });

  //Grayscle (light)
  var grayScale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/light-v10",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
  });

  //Outdoors
  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/outdoors-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
  });

  // Create map
  var myMap = L.map("map").setView([37.09, -95.71], 5);

  //Array to holds all circles
  var circleArray = [];

  //Loop through the location array and create one marker for each earthquake object
  for (var i = 0; i < earthquakeData.length; i++) {
    coordinates = [earthquakeData[i].geometry.coordinates[1], earthquakeData[i].geometry.coordinates[0]]
    properties = earthquakeData[i].properties;

  // Conditionals for magnitude colors
    var color = "";

    if (properties.mag < 1) {
      //green
      color = "#00ff00";
    }
    else if (properties.mag < 2) {
      //yellow
      color = "#d4ee00";
    }
    else if (properties.mag < 3) {
      //orange
      color = "#ffa500";
    }
    else if (properties.mag < 4) {
      //purple
      color = "#800080";
    }
    else if (properties.mag < 5) {
      //red
      color = "#ff0000";
    }
    else {
      //blue
      color = "#0000ff";
    }

    // Add circles to map
    var myCircle = L.circle(coordinates, {
      fillOpacity: 0.7,
      color: color,
      fillColor: color,
      // Adjust radius
      radius: (properties.mag * 20000)
    }).bindPopup("<h1>" + properties.place + "</h1> <hr> <h3>Magnitude: " + properties.mag.toFixed(2) + "</h3>");
    //Add the cricle to the array
    circleArray.push(myCircle);

    //Create the layer for the circles
    var earthquakes = L.layerGroup(circleArray);
  };

  // Define baseMaps object to hold base layers
  var baseMaps = {
    "Satellite": satellite,
    "GrayScale": grayScale,
    "Outdoors": outdoors
  };

  // Create overlay object to hold our overlay layer
  //Earthquake data from geojson
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  //Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

      // color function to be used when creating the legend
    function getColors(magnitude) {
      return magnitude > 5  ? '#0000ff' :
             magnitude > 4  ? '#ff0000' :
             magnitude > 3  ? '#800080' :
             magnitude > 2  ? '#ffa500' :
             magnitude > 1  ? '#d4ee00' :
                               '#00ff00';
    }

    // Custom legend control
    //legend position
    var legend = L.control({position: "bottomright"});
  
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        magnitude = [0, 1, 2, 3, 4, 5],
        labels = [];
 
    
       //Create a loop o go through the density intervals and generate labels
       for (var i = 0; i < magnitude.length; i++)
       {
         div.innerHTML +=
           '<i style="background:' + getColors(magnitude[i] + 1) + '"></i> ' +
           magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
       }
       console.log('div' + div);
     return div;
   };

  //Overlay listener for adding
  //Add the legend by default
  myMap.on('overlayadd', function (a) {
    //Add the legend
    legend.addTo(myMap);
  });

  //Overlay listener for remove
  myMap.on('overlayremove', function (a) {
    //Remove the legend
    myMap.removeControl(legend);
  });

};