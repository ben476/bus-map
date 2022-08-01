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
      window.map = map

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
