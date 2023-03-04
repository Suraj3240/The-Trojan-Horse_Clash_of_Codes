async function map() {
  let headersList = {

  }
  const api = "ea9100c0cbdd820bbc15a8f0af11b391";
  const city = "Pune";
  let response = await fetch("http://api.positionstack.com/v1/forward?access_key=" + api + "&query=" + city, {
    method: "GET",
    headers: headersList
  });

  let data = await response.json();
  console.log(data.data[0].latitude);
  $(".lat").text("Latitude: " + data.data[0].latitude);
  $(".lon").text("Longitude: " + data.data[0].longitude);

  // Map
  response.header.set('Content-Type', 'application/javascript');

  const newApi = "AAPKb95c1dfb6b0842d397111d79682ecadc-rOMMlSkEAVIQlpl0clPguoLP_YlhZt2ufHwRYcpbFZRanELAN-4r5Bk2Jx4L5jk";
  require
    ([
        "esri/config",
        "esri/Map",
        "esri/views/MapView",
        "esri/rest/locator",
        "esri/Graphic"
      ],
      function (esriConfig, Map, MapView, locator, Graphic) {

        console.log("Hello");
        esriConfig.apiKey = newApi;

        const map = new Map({
          basemap: "arcgis-navigation"
        });

        const view = new MapView({
          container: "viewDiv",
          map: map,
          center: [data.data[0].longitude, data.data[0].latitude], //Longitude, latitude
          zoom: 13
        });

        const places = ["Choose a place type...", "Parks and Outdoors", "Coffee shop", "Gas station", "Food", "Hotel"];

        const select = document.createElement("select", "");
        select.setAttribute("class", "esri-widget esri-select");
        select.setAttribute("style", "width: 175px; font-family: 'Avenir Next W00'; font-size: 1em");

        places.forEach(function (p) {
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

            .then(function (results) {
              view.popup.close();
              view.graphics.removeAll();

              results.forEach(function (result) {
                view.graphics.add(
                  new Graphic({
                    attributes: result.attributes, // Data attributes returned
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
        view.watch("stationary", function (val) {
          if (val) {
            findPlaces(select.value, view.center);
          }
        });

        // Listen for category changes and find places
        select.addEventListener('change', function (event) {
          findPlaces(event.target.value, view.center);
        });

      });

}

map();