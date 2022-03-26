import { Fade } from "@mui/material";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { getDistance } from "geolib";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ServiceTip from "../components/ServiceTip";
import MapContext from "../MapContext";
import StopsContext from "../StopsContext";

export default function Search() {
  const [stops] = React.useContext(StopsContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const name = searchParams.get("name");
  const center = JSON.parse(searchParams.get("center"));
  const bbox = searchParams.get("bbox") && JSON.parse(searchParams.get("bbox"));
  const [map] = React.useContext(MapContext);

  let results;

  if (bbox) {
    // Look for stops inside the bounding box
    results = Object.values(stops).filter((stop) => {
      const { stop_lat: latitude, stop_lon: longitude } = stop;
      return (
        bbox[1] <= latitude &&
        bbox[3] >= latitude &&
        bbox[0] <= longitude &&
        bbox[2] >= longitude
      );
    });
  } else {
    // Find the top 5 closest stops to the location
    const [longitude, latitude] = center;
    // Use geolib to calculate the distance between the center and each stop
    results = Object.values(stops)
      .map((stop) => {
        const { stop_lat: stopLatitude, stop_lon: stopLongitude } = stop;
        return {
          ...stop,
          distance: getDistance(
            { latitude, longitude },
            { latitude: stopLatitude, longitude: stopLongitude }
          ),
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }

  console.log("Stops:", stops);

  return (
    <Fade in>
      <Box
        sx={{
          paddingInline: 0,
          paddingBlock: 6,
          marginTop: 6,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            marginInline: 4,
          }}
        >
          {bbox ? "Stops in" : "Stops near"} {name}:
        </Typography>

        {results.length > 0 && (
          <List>
            {results.map((stop) => (
              <ListItem
                button
                sx={{ paddingInline: 4 }}
                onClick={() => {
                  map?.flyTo({
                    center: [stop.stop_lat, stop.stop_lon],
                    zoom: 16,
                    speed: 1.2,
                    curve: 1,
                  });
                  navigate("/stop/" + stop.stop_id);
                }}
              >
                <ListItemIcon>
                  <ServiceTip />
                </ListItemIcon>
                <ListItemText
                  primary={stop.type}
                  secondary={
                    (bbox
                      ? ""
                      : (stop.distance > 1000
                        ? Math.round(stop.distance / 100) / 10 +
                        " kilometers away"
                        : stop.distance + " meters away") + " • ") +
                    "ID: " +
                    stop.stop_id +
                    " • " +
                    (stop.online ? "Online" : "Offline")
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Fade>
  );
}
