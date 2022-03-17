import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material";
import { Marker } from "mapbox-gl";
import { useNavigate } from "react-router-dom";
import Search from "./Search";
import Routes from "./Routes";
import StopsContext from "./StopsContext";
import MapContext from "./MapContext";
import BusContext from "./BusContext";
import callAPI from "./callAPI";

const Map = React.lazy(() => import("./Map"));

const theme = responsiveFontSizes(
  createTheme({
    typography: {
      fontFamily: "Roboto Slab, serif",
    },
  }),
  { breakpoints: ["sm", "md", "lg", "xl"], factor: 4 }
);

const drawerWidth = 500;

export default function App() {
  const [stops, setStops] = React.useState({});
  const [map, setMap] = React.useState(null);
  // const [buses, setBuses] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      const data = await callAPI("https://api.opendata.metlink.org.nz/v1/gtfs/stops")
      const newStops = {};
      data.forEach((stop) => {
        if (stop.stop_lat && stop.stop_lat) {
          newStops[stop.stop_id] = stop;
        }
      });
      setStops(newStops);
    })();
  }, []);

  // React.useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const data = await callAPI("https://api.opendata.metlink.org.nz/v1/gtfs-rt/vehiclepositions")
  //     setBuses(data);
  //   }, 5000);

  //   return () => clearInterval(interval);
  // })

  function setupMap(geoJSON) {
    map.addSource('earthquakes', {
      type: 'geojson',
      // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
      // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
      data: geoJSON,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'earthquakes',
      filter: ['has', 'point_count'],
      paint: {
        // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ]
      }
    });

    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'earthquakes',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'earthquakes',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Roboto Slab Regular'],
        'text-size': 12
      }
    }, 'unclustered-point');

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      map.getSource('earthquakes').getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }
      );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();

      // Ensure that if the map is zoomed out such that
      // multiple copies of the feature are visible, the
      // popup appears over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      map?.flyTo({
        center: [e.lngLat.lng, e.lngLat.lat],
        zoom: 18,
        speed: 1.4,
        curve: 1,
      });
      navigate(`/stop/${e.features[0].properties.id}`);

      // new mapboxgl.Popup()
      //   .setLngLat(coordinates)
      //   .setHTML(
      //     `magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`
      //   )
      //   .addTo(map);
    });

    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });
  }

  React.useEffect(() => {
    if (map && stops && Object.keys(stops).length) {
      // Construct geoJSON
      const geoJSON = {
        type: "FeatureCollection",
        features: Object.values(stops).map((stop) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [stop.stop_lon, stop.stop_lat],
          },
          properties: {
            title: stop.stop_name,
            description: stop.stop_desc,
            id: stop.stop_id,
          },
        }))
      };

      console.log("GeoJSON:", geoJSON);

      try {
        setupMap(geoJSON);
      } catch (e) {
        map.on("load", () => {
          setupMap(geoJSON);
        });
      }
      // map.addSource("stops", {
      //   type: "geojson",
      //   data: geoJSON,
      //   cluster: true,
      //   clusterMaxZoom: 14, // Max zoom to cluster points on
      //   clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      // });
      // map.addLayer({
      //   id: "stops",
      //   type: "symbol",
      //   source: "stops",
      //   layout: {
      //     "icon-image": "bus-15",
      //     "icon-allow-overlap": true,
      //   },
      // });
    }
  }, [map, stops]);
  // for (const stop of Object.values(stops)) {
  //   const markerElement = document.createElement("img");
  //   markerElement.style.width = "13px"
  //   markerElement.src = "https://www.google.com/maps/vt/icon/name=assets/icons/transit/quantum_v2/transit-container-outline-0-tiny.png,assets/icons/transit/quantum_v2/transit-container-0-tiny.png,assets/icons/transit/quantum_v2/bus-0-tiny.png&highlight=1967d2,1a73e8,ffffff?scale=2"
  //   markerElement.onclick = () => {
  //     map?.flyTo({
  //       center: [stop.stop_lon, stop.stop_lat],
  //       zoom: 16,
  //       speed: 1.4,
  //       curve: 1,
  //     });
  //     navigate(`/stop/${stop.id}`);
  //   };

  //   let marker = new Marker({
  //     element: markerElement,
  //     anchor: "bottom",
  //   });
  //   marker.setLngLat([stop.stop_lon, stop.stop_lat]);
  //   marker.addTo(map);
  // }
  // }, [stops, map]);

  return (
    <ThemeProvider theme={theme}>
      <StopsContext.Provider value={[stops, setStops]}>
        <MapContext.Provider value={[map, setMap]}>
          {/* <BusContext.Provider value={[buses, setBuses]}> */}
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <CssBaseline />
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                  boxSizing: "border-box",
                },
              }}
              variant="permanent"
              anchor="left"
            >
              <Search />

              <Routes />
            </Drawer>

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                bgcolor: "background.default",
                p: 3,
                position: "relative",
                height: "100%",
              }}
            >
              <React.Suspense
                fallback={
                  // div with text in middle
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "#78bced",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h5" style={{ color: "white" }}>
                      Loading map...
                    </Typography>
                  </div>
                }
              >
                <Map />
              </React.Suspense>
            </Box>
          </Box>
          {/* </BusContext.Provider> */}
        </MapContext.Provider>
      </StopsContext.Provider>
    </ThemeProvider>
  );
}
