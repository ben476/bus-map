import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";
import ButtonBase from "@mui/material/ButtonBase";
import React from "react";
import MapContext from "../MapContext";
import callAPI from "../callAPI";

export default function Home() {
  const [map] = React.useContext(MapContext);
  // const [geoJSON, setGeoJSON] = React.useState(null)
  const [buses, setBuses] = React.useState([])

  React.useEffect(() => {
    const updateBuses = async () => {
      const data = await callAPI("https://api.opendata.metlink.org.nz/v1/gtfs-rt/vehiclepositions")
      setBuses(data.entity.map(a => a.vehicle));
    }

    updateBuses()

    const interval = setInterval(updateBuses, 10000);

    return () => clearInterval(interval);
  }, [])

  React.useEffect(() => {
    try {
      const geoJSON = {
        type: "FeatureCollection",
        features: buses.map(bus => {
          const {
            latitude,
            longitude,
            bearing,
          } = bus.position;

          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            properties: {
              bearing: bearing + 90,
            },
          };
        }),
      };

      map?.addSource("buses", {
        type: "geojson",
        data: geoJSON,
      });

      map?.addLayer({
        id: "buses",
        type: "symbol",
        source: "buses",
        layout: {
          "icon-image": "rectangle-blue-3",
          "icon-allow-overlap": true,
          'icon-rotate': ['get', 'bearing']
        },
      }, "clusters");

      return () => {
        map?.removeLayer("buses");
        map?.removeSource("buses");
      };
    } catch (e) {
      console.error(e);
    }
  }, [buses, map]);

  return (
    <Fade in>
      <Box>
        <Box sx={{ padding: 3 }}>
          {/* <img src="/crisis_lab_i_small.png" style={{height: 100, marginTop: 20}}></img> */}
          <Box
            sx={{
              paddingInline: 1,
              paddingBlock: 3,
              marginTop: 7,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
              }}
            >
              Bus Network
            </Typography>
            <Typography
              variant="h6"
              sx={{
                marginTop: 2,
                fontWeight: 400,
                lineHeight: "1.4em",
              }}
            >
              Benjamin Hong 300605520 COMP261 Assignment 1 Challenge Attempt
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ position: "absolute", bottom: 25, width: "100%", padding: 4 }}
        >
          {/* <Typography variant="h6" sx={{ marginTop: 10, marginBottom: 1 }}>
            Base map:
          </Typography>

          <Box sx={{ display: "flex", gap: 2, marginInline: 1 }}>
            {[
              { text: "Streets", color: "pink", id: "streets-v11" },
              { text: "Satellite", color: "blue", id: "satellite-v9" },
              {
                text: "Satellite streets",
                color: "blue",
                id: "satellite-streets-v11",
                lines: 2,
              },
              { text: "Outdoors", color: "green", id: "outdoors-v11" },
              // { text: "Light", color: "yellow", id: "light-v10" },
              { text: "Dark", color: "black", id: "dark-v10" },
            ].map((style) => (
              <FlexSquare
                key={style.id}
                selected={selectedStyle === style.id}
                onClick={() => setStyle(style.id)}
                color={style.color}
                text={style.text}
                lines={style.lines}
              />
            ))}
          </Box> */}

          {/* <Typography variant="h6" sx={{ marginTop: 3, marginBottom: 1 }}>
            Layers:
          </Typography>

          <Box sx={{ display: "flex", gap: 10, marginInline: 1 }}>
            {[
              { text: "EEW", color: "red", id: "eew-v1" },
              { text: "GNS", color: "red", id: "gns" },
              { text: "Fault lines", color: "red", id: "gns-2" },
            ].map((style) => (
              <FlexSquare
                key={style.id}
                // selected={window.map?.getLayer(style.id)?.visibility}
                onClick={() =>
                  map?.setLayoutProperty(
                    style.id,
                    "visibility",
                    map?.getLayoutProperty(style.id, "visibility") === "visible"
                      ? "none"
                      : "visible"
                  )
                }
                color={style.color}
                text={style.text}
              />
            ))}
          </Box> */}
        </Box>
      </Box>
    </Fade>
  );
}
