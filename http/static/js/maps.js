$(function() {
  var VectorSource = ol.source.Vector;
  var VectorLayer = ol.layer.Vector;
  var GeoJSON = ol.format.GeoJSON;
  var body = $("body");
  var selectedRoom; // the feature that is currently selected

  var cavendishMaps = {
    Bragg: {
      "0": {},
      "1": {},
      "2": {}
    },
    Mott: {
      "0": {}
    }
  };

  // Parse the query string in case it contains an indicator
  // of which room to highlight
  // Parse some argument types for comparisons later
  var queryParams = {};
  location.search
    .substr(1)
    .split("&")
    .forEach(function(item) {
      var paramName = item.split("=")[0];
      var paramValue = item.split("=")[1];
      switch (paramName) {
        case "identifier":
          queryParams[paramName] = parseInt(paramValue);
          break;
        case "longitude":
        case "latitude":
          queryParams[paramName] = parseFloat(paramValue);
          break;
        default:
          queryParams[paramName] = paramValue;
      }
    });

  // Styles for features, rooms, highlighted, selected, doors
  var style = new ol.style.Style({
    fill: new ol.style.Fill({ color: "#fff" }),
    stroke: new ol.style.Stroke({ color: "#422e5d", width: 2 }),
    text: new ol.style.Text({
      font: "13px " + body.css("font-family"),
      fill: new ol.style.Fill({ color: "#000" }),
      stroke: new ol.style.Stroke({ color: "#888", width: 1 })
    })
  });
  var corridorStyle = new ol.style.Style({
    fill: new ol.style.Fill({ color: "#d9d0c9" }), // OSM building colour
    stroke: new ol.style.Stroke({ color: "#422e5d", width: 2 }),
    text: new ol.style.Text({
      font: "11px " + body.css("font-family"),
      fill: new ol.style.Fill({ color: "#444" }),
      stroke: new ol.style.Stroke({ color: "#555", width: 1 })
    })
  });
  var highlightStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: "#000", width: 2 }),
    fill: new ol.style.Fill({ color: "#00a2ff" })
  });
  var highlightStyleText = new ol.style.Style({
    text: new ol.style.Text({
      font: "14px " + body.css("font-family"),
      fill: new ol.style.Fill({ color: "#000" }),
      stroke: new ol.style.Stroke({ color: "#cde", width: 3 }),
      overflow: true
    })
  });
  var activeStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: "#000", width: 2 }),
    fill: new ol.style.Fill({ color: "#ffd700" })
  });
  var activeStyleText = new ol.style.Style({
    text: new ol.style.Text({
      font: "14px " + body.css("font-family"),
      fill: new ol.style.Fill({ color: "#000" }),
      stroke: new ol.style.Stroke({ color: "#edc", width: 3 }),
      overflow: true
    })
  });
  var doorStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: "#fff", width: 4 }),
    text: new ol.style.Text({
      font: '900 14px "Font Awesome 5 Free"',
      fill: new ol.style.Fill({ color: "#000" }),
      stroke: new ol.style.Stroke({ color: "#fff", width: 3 })
    })
  });
  var doorShadow = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: "#000", width: 8 })
  });
  // Style objects according to their type
  var mapStyler = function(feature) {
    if (feature.getGeometry().getType() === "LineString") {
      if (map.getView().getZoom() > 20) {
        doorStyle.getText().setText("\uf52b");
        return [doorShadow, doorStyle];
      } else if (map.getView().getZoom() > 19) {
        doorStyle.getText().setText();
        return [doorShadow, doorStyle];
      } else {
        doorStyle.getText().setText();
        return doorStyle;
      }
    } else if (feature.get("selected") === true) {
      return activeStyle; // text is in separate layer
    } else if (feature.get("type") === "corridor") {
      corridorStyle.getText().setText(feature.get("number"));
      return corridorStyle;
    } else if (map.getView().getZoom() > 21) {
      style.getText().setText(roomText(feature));
      return style;
    } else {
      style.getText().setText(feature.get("number"));
      return style;
    }
  };
  // load all layers
  Object.keys(cavendishMaps).forEach(function(building) {
    Object.keys(cavendishMaps[building]).forEach(function(floor) {
      cavendishMaps[building][floor]["rooms"] = new VectorLayer({
        source: new VectorSource({
          url: "/resources/maps/" + building + "_" + floor + ".geojson",
          format: new GeoJSON()
        }),
        style: mapStyler,
        visible: false // start with nothing visible
      });
      cavendishMaps[building][floor]["rooms"].setProperties({
        selectable: true,
        building: building,
        floor: floor
      });
      cavendishMaps[building][floor]["doors"] = new VectorLayer({
        source: new VectorSource({
          url: "/resources/maps/" + building + "_" + floor + ".lines.geojson",
          format: new GeoJSON()
        }),
        style: mapStyler,
        visible: false // start with nothing visible
      });
    });
  });

  var roomText = function(feature) {
    // Construct the text description of the room
    // some rooms have no name, description or occupants
    // so skip those components
    var text = [];
    var roomNumber = feature.get("number");
    var roomDescription = feature.get("description");
    var peopleCount = (feature.get("people") || []).length;
    if (roomNumber) {
      text.push(roomNumber);
    }
    if (roomDescription) {
      text.push(roomDescription);
    }
    if (peopleCount) {
      var occupants = "";
      for (var i = 1; i <= peopleCount; i++) {
        occupants += "\uD83D\uDC64";
      }
      text.push(occupants);
    }
    return text.join("\n");
  };

  var LayerSwitchControl = function(opt_options) {
    var options = opt_options || {};
    var button0 = $("<button>", { text: "0", title: "Show ground floor" });
    var button1 = $("<button>", { text: "1", title: "Show first floor" });
    var button2 = $("<button>", { text: "2", title: "Show second floor" });
    var switchLayer = function() {
      var visibleFloor = this.toString();
      selectFeature(selectedRoom); // deselect any featute
      Object.keys(cavendishMaps).forEach(function(building) {
        Object.keys(cavendishMaps[building]).forEach(function(floor) {
          if (floor === visibleFloor) {
            Object.keys(cavendishMaps[building][floor]).forEach(function(
              feature
            ) {
              cavendishMaps[building][floor][feature].setVisible(true);
            });
          } else {
            Object.keys(cavendishMaps[building][floor]).forEach(function(
              feature
            ) {
              cavendishMaps[building][floor][feature].setVisible(false);
            });
          }
        });
      });
    };
    button0.on("click", switchLayer.bind(0));
    button1.on("click", switchLayer.bind(1));
    button2.on("click", switchLayer.bind(2));
    var element = $("<div>", {
      class: "ol-unselectable ol-control"
    })
      .css({ top: "4.5rem", left: "0.5em" })
      .append(button0)
      .append(button1)
      .append(button2);
    ol.control.Control.call(this, {
      element: element[0],
      target: options.target
    });
  };
  ol.inherits(LayerSwitchControl, ol.control.Control);
  // Geolocation toggle
  var ToggleLocation = function(opt_options) {
    var options = opt_options || {};
    var toggle = $("<button>", {
      class: "fas fa-map-marker-alt",
      title: "Toggle position tracking"
    })
      .css({ color: "rgba(255, 255, 255, 0.5)" })
      .on("click", function() {
        if (geolocation.getTracking()) {
          // turn off
          $(this).css({ color: "rgba(255, 255, 255, 0.5)" });
          positionFeature.setGeometry(null);
          accuracyFeature.setGeometry(null);
          geolocation.setTracking(false);
        } else {
          // turn on tracking
          $(this).css({ color: "#fff" });
          geolocation.setTracking(true);
        }
      });
    var element = $("<div>", {
      class: "ol-unselectable ol-control"
    })
      .css({ top: "2.7rem", right: "0.5em" })
      .append(toggle);
    ol.control.Control.call(this, {
      element: element[0],
      target: options.target
    });
  };
  ol.inherits(ToggleLocation, ol.control.Control);

  //
  // THE MAP
  //
  var map = new ol.Map({
    target: "map",
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([
        queryParams.longitude || 0.0927017677464935,
        queryParams.latitude || 52.209162023137
      ]),
      zoom: 20
    }),
    controls: ol.control
      .defaults({
        attributionOptions: {
          collapsible: false
        }
      })
      .extend([
        new LayerSwitchControl(),
        new ToggleLocation(),
        new ol.control.FullScreen()
      ])
  });
  // highlighting rooms with text on top
  var featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: highlightStyle
  });
  var featureOverlayText = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: function(feature) {
      highlightStyleText.getText().setText(roomText(feature));
      return highlightStyleText;
    }
  });
  var selectedOverlayText = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: function(feature) {
      activeStyleText.getText().setText(roomText(feature));
      return activeStyleText;
    }
  });

  // Build map layers
  // OSM is already on the bottom
  // Room plans on top
  // Layer with mouse hightlight over the top of rooms (no text)
  // Doors above rooms
  // Text of mouseover on top of everything
  var selectedFloor = queryParams.floor || "0"; // Always select a floor
  Object.keys(cavendishMaps).forEach(function(building) {
    Object.keys(cavendishMaps[building]).forEach(function(floor) {
      map.addLayer(cavendishMaps[building][floor]["rooms"]);
      if (floor === selectedFloor) {
        cavendishMaps[building][floor]["rooms"].setVisible(true);
        // select requested room, must put it on an event
        // after source is populated
        if (queryParams.identifier) {
          cavendishMaps[building][floor]["rooms"]
            .getSource()
            .on("addfeature", function(evt) {
              var feature = evt.feature;
              if (feature.get("identifier") === queryParams.identifier) {
                selectFeature(feature, cavendishMaps[building][floor]["rooms"]);
              }
            });
        }
      }
    });
  });
  map.addLayer(featureOverlay); // Highlight fill of room
  Object.keys(cavendishMaps).forEach(function(building) {
    Object.keys(cavendishMaps[building]).forEach(function(floor) {
      map.addLayer(cavendishMaps[building][floor]["doors"]);
      if (floor === selectedFloor) {
        cavendishMaps[building][floor]["doors"].setVisible(true);
      }
    });
  });
  map.addLayer(featureOverlayText); // Text of mouseover room
  map.addLayer(selectedOverlayText); // selected text always on top
  var highlight;
  var displayFeatureInfo = function(pixel) {
    var feature = map.forEachFeatureAtPixel(
      pixel,
      function(feature) {
        return feature;
      },
      {
        layerFilter: function(layer) {
          return layer.get("selectable");
        }
      }
    );
    if (feature !== highlight) {
      if (highlight) {
        featureOverlay.getSource().removeFeature(highlight);
        featureOverlayText.getSource().removeFeature(highlight);
      }
      if (feature) {
        featureOverlay.getSource().addFeature(feature);
        featureOverlayText.getSource().addFeature(feature);
      }
      highlight = feature;
    }
  };
  var selectFeature = function(feature, layer) {
    if (!feature) {
      return; // nothing to do
    }
    if (feature.get("selected")) {
      // Feature is currently selected, deselect it
      feature.set("selected", false);
      selectedOverlayText.getSource().removeFeature(feature);
      $("#info").replaceWith(
        $("<div>", { id: "info", class: "card" }).append(
          $("<div>", { class: "card-header d-flex" }).append(
            $("<h3>", {
              class: "py-1 px-2",
              text: "Nothing Selected"
            })
          )
        )
      );
      selectedRoom = null;
    } else {
      if (selectedRoom) {
        // deselect previously selected room
        selectedRoom.set("selected", false);
        selectedOverlayText.getSource().removeFeature(selectedRoom);
        selectedRoom = null;
      }
      // Get values here as deselect doesn't always send a layer
      var building = layer.get("building");
      var number = feature.get("number");
      // select this room
      feature.set("selected", true);
      selectedOverlayText.getSource().addFeature(feature);
      var roomButton;
      if (feature.get("identifier")) {
        roomButton = $("<a>", {
          class: "btn btn-room",
          href: "/rooms/" + feature.get("identifier") + "/",
          text: building + " - " + number,
          title: feature.get("description")
        });
      } else {
        roomButton = $();
      }

      $("#info").replaceWith(
        $("<div>", { id: "info", class: "card" })
          .append(
            $("<div>", { class: "card-header d-flex" })
              .append($("<div>").append(roomButton))
              .append("<div>")
              .append(
                $("<h3>", {
                  class: "px-2",
                  text: feature.get("description")
                })
              )
          )
          .append(
            $("<div>", { class: "card-body" }).append(
              $("<ul>", { class: "list-group" }).append(function() {
                var peopleList = feature.get("people") || [];
                var people = [];
                peopleList.forEach(function(person) {
                  people.push(
                    $("<a>", {
                      class:
                        "list-group-item list-group-item-action d-flex w-100 justify-content-between",
                      href: "/people/" + person.crsid + "/",
                      text: person.display_name
                    }).append($("<code>", { text: people.crsid }))
                  );
                });
                return people;
              })
            )
          )
      );
      // store the selected room
      selectedRoom = feature;
    }
  };
  var toggleSelect = function(pixel) {
    var layer = map.forEachLayerAtPixel(pixel, function(layer) {
      if (layer.get("building")) {
        // ignores highlight layer
        return layer;
      }
    });
    var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
      if (feature !== positionFeature && feature !== accuracyFeature) {
        return feature;
      }
    });
    if (feature) {
      selectFeature(feature, layer);
    }
  };
  map.on("pointermove", function(evt) {
    if (evt.dragging) {
      return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
  });
  map.on("click", function(evt) {
    toggleSelect(evt.pixel);
    displayFeatureInfo(evt.pixel);
  });
  // Geolocation, see where you are on mobile
  var geolocation = new ol.Geolocation({
    trackingOptions: {
      enableHighAccuracy: true
    },
    projection: map.getView().getProjection()
  });
  // Location on the map
  var positionFeature = new ol.Feature();
  // Map pin marker
  positionFeature.setStyle(
    new ol.style.Style({
      text: new ol.style.Text({
        font: '900 18px "Font Awesome 5 Free"',
        fill: new ol.style.Fill({ color: "#ffd700" }),
        stroke: new ol.style.Stroke({ color: "#000", width: 5 }),
        text: "\uf3c5"
      })
    })
  );
  var accuracyFeature = new ol.Feature();
  // Coloured aura
  accuracyFeature.setStyle(
    new ol.style.Style({
      fill: new ol.style.Fill({ color: "#0af4" })
    })
  );

  // Update position on map as it changes
  geolocation.on("change:position", function() {
    var coordinates = geolocation.getPosition();
    positionFeature.setGeometry(
      coordinates ? new ol.geom.Point(coordinates) : null
    );
  });

  geolocation.on("change:accuracyGeometry", function() {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  map.addLayer(
    new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [positionFeature, accuracyFeature]
      })
    })
  );
});
