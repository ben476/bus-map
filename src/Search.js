import SearchIcon from "@mui/icons-material/Search";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import * as React from "react";
import Divider from "@mui/material/Divider";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import styles from "./Search.module.css";
import Fuse from 'fuse.js';
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowBack, DepartureBoard } from "@mui/icons-material";
import MapContext from "./MapContext";
import StopsContext from "./StopsContext";
import RoutesContext from "./RoutesContext";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYmVuaG9uZyIsImEiOiJjbDB1dXU2YjkxMTFqM2pxbzk4azl6bnJjIn0.FB3GqcVZYnZqzs549LsjPg";

const options = {
  // isCaseSensitive: false,
  includeScore: true,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 1,
  // location: 0,
  threshold: 0.2,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  keys: [
    { name: "route_short_name", weight: 1.01 },
    { name: "stop_id", weight: 1 },
    { name: "route_long_name", weight: 0.5 },
    { name: "stop_name", weight: 0.5 },
  ]
};

// MapBox Search
export default function SearchBar() {
  const [value, setValue] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [fuse, setFuse] = React.useState(null);
  const [hasFocus, setHasFocus] = React.useState(false);
  const [map, setMap] = React.useContext(MapContext);
  const [stops, setStops] = React.useContext(StopsContext);
  const [routes] = React.useContext(RoutesContext);

  const [mouseOver, setMouseOver] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (routes && stops) {
      const searchValues = Object.values(stops).concat(Object.values(routes));

      setFuse(new Fuse(searchValues, options));
    }
  }, [routes, stops]);

  React.useEffect(() => {
    (async () => {
      if (value && fuse) {
        // const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        //   value
        // )}.json?country=nz&proximity=175%2C-41&types=postcode%2Cpoi%2Caddress%2Cregion%2Cplace&language=en&access_token=${MAPBOX_TOKEN}`;
        // const response = await fetch(url);
        // const json = await response.json();

        const results = fuse.search(value);

        results.length = 8

        console.log(results);

        if (results.length) {
          setResults(results);
          setHasFocus(true);
        } else {
          setHasFocus(false);
          setTimeout(() => setResults(results), 200);
        }
      }
    })();
  }, [value, fuse]);

  React.useEffect(() => {
    // Get search query from url params. Example: ?search=123
    const search = new URLSearchParams(location.search);
    const searchQuery = search.get("search");
    if (searchQuery) {
      setValue(searchQuery);
      setHasFocus(true);
    }

    // Remove search query from url params. Example: ?search=123
    navigate(location.pathname);
  }, [])

  function reset() {
    setHasFocus(false);
    setValue("");
    setMouseOver(false);
    setTimeout(() => setResults([]), 200);
    setSelectedIndex(0);
  }

  function select(result) {
    reset();
    if (result.stop_id) {
      navigate(`/stop/${result.stop_id}`);
    } else {
      navigate(`/route/${result.route_short_name}`);
    }
  }

  React.useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowDown") {
        setSelectedIndex(Math.min(selectedIndex + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
      }
      if (e.key === "Enter") {
        select(results[selectedIndex].item);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, results]);

  console.log(location);

  return (
    <Box
      onMouseEnter={() => setHasFocus(true)}
      onFocus={() => setHasFocus(true)}
      onMouseLeave={() => setTimeout(() => setHasFocus(false), 100)}
      style={{
        pointerEvents: results.length > 0 && value && hasFocus ? "all" : "none",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "90%",
          margin: "5%",
          borderRadius: "10px",
          position: "absolute",
          zIndex: 999,
          pointerEvents: "all",
        }}
        // onMouseEnter={() => setMouseOver(true)}
        // onMouseLeave={() => setMouseOver(false)}
        className={styles.box}
      >
        {/* Show back button if location is not / */}
        <Box sx={{ display: "flex", alignItems: "center", marginInline: "2%" }}>
          <IconButton
            onClick={() => {
              reset();
              if (!(results.length > 0 && value && hasFocus)) navigate("/");
            }}
            style={{
              flexGrow: 0,
              marginRight: location.pathname !== "/" || value ? -5 : -40,
              transition: "opacity 0.2s, margin-right 0.2s ease-out",
              opacity: location.pathname !== "/" || value ? 1 : 0,
            }}
          >
            <ArrowBack fontSize="medium" />
          </IconButton>

          <TextField
            style={{ flexGrow: 1, marginTop: 7, marginBottom: 7 }}
            size="small"
            label="Find a bus stop or service..."
            variant="outlined"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
              disableUnderline: true,
              sx: {
                "& .MuiOutlinedInput-notchedOutline": {
                  display: "none",
                },
              },
            }}
          />
        </Box>
      </Paper>

      <Paper
        elevation={10}
        sx={{
          width: "90%",
          margin: "5%",
          boxShadow: "0 2px 6px rgb(0 0 0 / 30%), 0 -1px 0 rgb(0 0 0 / 2%)",
          borderRadius: "10px",
          position: "absolute",
          zIndex: 997,
          transition: "opacity 0.2s",
          opacity: results.length > 0 && value && hasFocus ? 0 : 1,
        }}
        // onMouseEnter={() => setMouseOver(true)}
        // onMouseLeave={() => setMouseOver(false)}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setTimeout(() => setHasFocus(false), 100)}
        className={styles.box}
      >
        {/* Show back button if location is not / */}
        <TextField
          size="small"
          style={{ marginTop: 7, marginBottom: 7 }}
          variant="outlined"
          autoComplete="off"
        />
      </Paper>
      <Paper
        elevation={10}
        sx={{
          width: "90%",
          margin: "5%",
          boxShadow: "0 2px 6px rgb(0 0 0 / 30%), 0 -1px 0 rgb(0 0 0 / 2%)",
          borderRadius: "10px",
          position: "absolute",
          zIndex: 998,
          opacity: results.length > 0 && value && hasFocus ? 1 : 0,
          transition: "opacity 0.2s",
        }}
        // onMouseEnter={() => setMouseOver(true)}
        // onMouseLeave={() => setMouseOver(false)}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setTimeout(() => setHasFocus(false), 100)}
        className={styles.box}
      >
        {/* Show back button if location is not / */}
        <TextField
          size="small"
          variant="outlined"
          autoComplete="off"
          style={{ marginTop: 7, marginBottom: 7 }}
        />
        {results.length > 0 && (
          <>
            <Divider />
            <List disablePadding dense className={styles.list}>
              {results.map(({ item: result }, i) => (
                <ListItem disableGutters>
                  <ListItemButton
                    selected={selectedIndex === i}
                    disablePadding
                    onClick={() => {
                      select(result);
                    }}
                    style={{
                      // paddingLeft: 18,
                    }}
                  >
                    <ListItemIcon>
                      {result.route_id ? (
                        <Avatar sx={{ bgcolor: "#" + result.route_color, marginLeft: -1, fontSize: 15 }}>{result.route_short_name}</Avatar>
                      ) : (
                        <DepartureBoard style={{ marginLeft: 3 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      style={{ marginLeft: -16 }}
                      primary={result.route_long_name || result.stop_name}
                      secondary={result.stop_id}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>
    </Box>
  );
}
