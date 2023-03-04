// Map

require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/rest/locator",
    "esri/Graphic"
    ], function(esriConfig, Map, MapView, locator, Graphic) {


    esriConfig.apiKey = "YOUR_API_KEY";

    const map = new Map({
      basemap: "arcgis-navigation"
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [18.9553, 69.6492], //Longitude, latitude
      zoom: 13
    });

    const places = ["Choose a place type...", "Parks and Outdoors", "Coffee shop", "Gas station", "Food", "Hotel"];

    const select = document.createElement("select","");
      select.setAttribute("class", "esri-widget esri-select");
      select.setAttribute("style", "width: 175px; font-family: 'Avenir Next W00'; font-size: 1em");

    places.forEach(function(p){
      const option = document.createElement("option");
      option.value = p;
      option.innerHTML = p;
      select.appendChild(option);
    });

    view.ui.add(select, "top-right");

    const locatorUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

   // Find places and add them to the map
   function findPlaces(category, pt) {
    locator.addressToLocations(locatorUrl, {
      location: pt,
      categories: [category],
      maxLocations: 25,
      outFields: ["Place_addr", "PlaceName"]
    })

    .then(function(results) {
      view.popup.close();
      view.graphics.removeAll();

      results.forEach(function(result){
        view.graphics.add(
          new Graphic({
            attributes: result.attributes,  // Data attributes returned
            geometry: result.location, // Point returned
            symbol: {
             type: "simple-marker",
             color: "#000000",
             size: "12px",
             outline: {
               color: "#ffffff",
               width: "2px"
             }
            },

            popupTemplate: {
              title: "{PlaceName}", // Data attribute names
              content: "{Place_addr}"
            }
         }));
      });

    });

  }

  // Search for places in center of map
  view.watch("stationary", function(val) {
    if (val) {
       findPlaces(select.value, view.center);
    }
    });

  // Listen for category changes and find places
  select.addEventListener('change', function (event) {
    findPlaces(event.target.value, view.center);
  });

});