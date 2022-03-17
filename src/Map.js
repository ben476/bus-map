import "mapbox-gl/dist/mapbox-gl.css";

import React, { useRef } from "react";
import mapboxgl, {
  AttributionControl,
  GeolocateControl,
  Map as MapboxMap,
  Marker,
  NavigationControl,
  ScaleControl,
} from "mapbox-gl";
import SunCalc from "suncalc";
import MapContext from "./MapContext";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYmVuaG9uZyIsImEiOiJjbDB1dXU2YjkxMTFqM2pxbzk4azl6bnJjIn0.FB3GqcVZYnZqzs549LsjPg";

export default function MapApp(props) {
  const mapContainerRef = useRef(null);
  const [map, setMap] = React.useContext(MapContext);

  React.useEffect(() => {
    if (mapContainerRef.current) {
      const map = new MapboxMap({
        container: mapContainerRef.current,
        style: "mapbox://styles/benhong/cl0ua4mv5001e14ornuw0m8mf",
        center: [174.778997, -41.2923318],
        zoom: 12,
      });
      setMap(map);

      const attributionControl = new AttributionControl();
      map.addControl(attributionControl, "top-left");
      const navigationControl = new NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      });
      map.addControl(navigationControl, "top-left");
      const geoLocateControl = new GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        showUserLocation: false,
      });
      map.addControl(geoLocateControl, "top-left").addControl(
        new ScaleControl({
          maxWidth: 150,
          unit: "metric",
        }),
        "bottom-left"
      );

      function onError(e) {
        console.log("Failed to load map. Error: ", e);
      }

      function onLoad() {
        // Insert the layer beneath any symbol layer.
        // map.addSource('composite', { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v7' });

        // The 'building' layer in the Mapbox Streets
        // vector tileset contains building height data
        // from OpenStreetMap.
        // map.addLayer(
        // 	{
        // 		'id': 'buildings',
        // 		'source': 'composite',
        // 		'source-layer': 'building',
        // 		'filter': ['==', 'extrude', 'true'],
        // 		'type': 'fill-extrusion',
        // 		'minzoom': 15,
        // 		'paint': {
        // 			'fill-extrusion-color': '#aaa',

        // 			// Use an 'interpolate' expression to
        // 			// add a smooth transition effect to
        // 			// the buildings as the user zooms in.
        // 			'fill-extrusion-height': [
        // 				'interpolate',
        // 				['linear'],
        // 				['zoom'],
        // 				15,
        // 				0,
        // 				15.05,
        // 				['get', 'height']
        // 			],
        // 			'fill-extrusion-base': [
        // 				'interpolate',
        // 				['linear'],
        // 				['zoom'],
        // 				15,
        // 				0,
        // 				15.05,
        // 				['get', 'min_height']
        // 			],
        // 			'fill-extrusion-opacity': 0.6
        // 		}
        // 	},
        // );

        // map.addSource('mapbox-dem', {
        // 	'type': 'raster-dem',
        // 	'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        // 	'tileSize': 512,
        // 	'maxzoom': 14
        // });
        // // add the DEM source as a terrain layer with exaggerated height
        // map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

        function getSunPosition() {
          const center = map.getCenter();
          const sunPos = SunCalc.getPosition(
            new Date(),
            center.lat,
            center.lng
          );
          const sunAzimuth = 180 + (sunPos.azimuth * 180) / Math.PI;
          const sunAltitude = 90 - (sunPos.altitude * 180) / Math.PI;
          return [sunAzimuth, sunAltitude];
        }
        map.addLayer({
          id: "sky",
          type: "sky",
          paint: {
            "sky-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              0,
              5,
              0.3,
              8,
              1,
            ],
            // set up the sky layer for atmospheric scattering
            "sky-type": "atmosphere",
            // explicitly set the position of the sun rather than allowing the sun to be attached to the main light source
            "sky-atmosphere-sun": getSunPosition(),
            // set the intensity of the sun as a light source (0-100 with higher values corresponding to brighter skies)
            "sky-atmosphere-sun-intensity": 5,
          },
        });
      }

      // function onLoad() {
      // 	map.addSource("geonet-source", {
      // 		type: "vector",
      // 		url: "mapbox://zadeviggers.ckyti0ozu2wkk20rvo89kd6ur-6jsd8",
      // 	});
      // 	map.addLayer({
      // 		id: "geonet-layer",
      // 		type: "symbol",
      // 		source: "geonet-source",
      // 		"source-layer": "stations",
      // 		layout: {
      // 			visibility: "none",
      // 			"text-field": ["get", "Name"],
      // 			"text-size": 12,
      // 			"icon-image": ["image", "border-dot-13"],
      // 		},
      // 		paint: {
      // 			"text-color": theme.palette.text.primary,
      // 			"text-halo-width": 1,
      // 			"text-halo-color": "#ffffff",
      // 			"icon-color": theme.palette.secondary.main,
      // 		},
      // 	});
      // 	// Fault lines
      // 	map.addSource("fault-lines-source", {
      // 		type: "vector",
      // 		url: "mapbox://zadeviggers.8hjwpez9",
      // 	});
      // 	map.addLayer({
      // 		id: "fault-lines-layer",
      // 		type: "line",
      // 		source: "fault-lines-source",
      // 		"source-layer": "New_Zealand_Active_Faults_Database_1250k",
      // 		layout: {
      // 			// Make the layer visible by default.
      // 			visibility: "visible",
      // 			"line-join": "round",
      // 			"line-cap": "round",
      // 		},
      // 		paint: {
      // 			"line-color": theme.palette.error.main,
      // 		},
      // 	});
      // 	map.addLayer({
      // 		id: "fault-lines-labels-layer",
      // 		type: "symbol",
      // 		source: "fault-lines-source",
      // 		"source-layer": "New_Zealand_Active_Faults_Database_1250k",
      // 		layout: {
      // 			visibility: "visible",
      // 			"text-field": ["get", "Name"],
      // 			"text-size": 12,
      // 			"symbol-placement": "line-center",
      // 		},
      // 		paint: {
      // 			"text-color": theme.palette.text.primary,
      // 			"text-halo-width": 1,
      // 			"text-halo-color": "#ffffff",
      // 			// Other theme - try out later
      // 			// "text-color": theme.palette.error.main,
      // 			// "text-halo-width": 1,
      // 			// "text-halo-color": "#000000",
      // 		},
      // 	});
      // 	setMap(map);
      // }
      map.on("error", onError);
      map.on("load", onLoad);

      return () => {
        map.off("error", onError);
        map.off("load", onLoad);
        map.removeControl(navigationControl);
        map.removeControl(geoLocateControl);
        map.removeControl(attributionControl);
        map.remove();
      };
    }
  }, [mapContainerRef]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        // height: "100%",
        // width: "100%",
        ...props.style,
      }}
      className="map-container"
      ref={mapContainerRef}
    />
  );
}
