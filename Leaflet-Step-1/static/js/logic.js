function createMap(earthquakeData) {

  // Establish the title layers that will be the background options of the map
  
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
  
    // Create the map
    var myMap = L.map("map").setView([19.642588, -28.950359], 2.5);
  
    //Creat ethe array to hold each circle
    var circleArray = [];
  
    for (var i = 0; i < earthquakeData.length; i++) {
      coordinates = [earthquakeData[i].geometry.coordinates[1], earthquakeData[i].geometry.coordinates[0]]
      properties = earthquakeData[i].properties;
  
    // Conditional colors
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
        radius: (properties.mag * 20000)
      }).bindPopup("<h1>" + properties.place + "</h1> <hr> <h3>Magnitude: " + properties.mag.toFixed(2) + "</h3>");
      circleArray.push(myCircle);
  
      //Create Circles Layer
      var earthquakes = L.layerGroup(circleArray);
    };
  
    // Define baseMaps object to hold base layer
    var baseMaps = {
      "GrayScale": grayScale
    };
  
    // Create object to hold our overlay earthquake layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    //Create the control layer
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
  
      function getColors(magnitude) {
        return magnitude > 5  ? '#0000ff' :
               magnitude > 4  ? '#ff0000' :
               magnitude > 3  ? '#800080' :
               magnitude > 2  ? '#ffa500' :
               magnitude > 1  ? '#d4ee00' :
                                 '#00ff00';
      }
      // Legend
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
      myMap.removeControl(legend);
    });
  
  };
  
  // Perform an API call to the USGS API to get earthquake information. Call createMap when complete
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (data) {
    console.log(data)
    createMap(data.features);
  });