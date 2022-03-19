import { Avatar, Fade } from '@mui/material';
import Box from '@mui/material/Box';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from '@mui/material/Typography';
import parse from 'parse-duration';
import React from 'react';
import { useParams } from 'react-router-dom';
import BusContext from '../../BusContext';
import MapContext from '../../MapContext';
import StopsContext from '../../StopsContext';

export default function Service(props) {
    const [stops] = React.useContext(StopsContext);
    const [map, , mapLoaded] = React.useContext(MapContext);
    const [time, setTime] = React.useState(new Date())
    const [geoJSON, setGeoJSON] = React.useState(null)
    const [buses, , setBusFilter] = React.useContext(BusContext)
    const busMarkersRef = React.useRef([])

    // const [busGeoJSON, setBusGeoJSON] = React.useState(null)
    const { id: stopId, departures: allDepartures, routes } = props;
    const { routeId } = useParams();

    const stop = stops[stopId]
    const route = routes.find(r => r.route_short_name === routeId)
    const departures = allDepartures.filter(d => d.service_id === routeId)

    // console.log("Service Details", stop);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    React.useEffect(() => {
        setBusFilter(() => (a) => (a?.trip?.route_id == route.route_id))

        return () => setBusFilter(() => a => true)
    }, [routeId])

    React.useEffect(() => {
        map.setLayoutProperty("clusters", 'visibility', 'none');

        return () => map.setLayoutProperty("clusters", 'visibility', 'visible');
    })

    React.useEffect(() => {
        (async () => {
            const req = await fetch("https://backend.metlink.org.nz/api/v1/routemap", {
                "body": JSON.stringify({ service: "" + route.route_short_name }),
                "method": "POST",
                "mode": "cors",
                "credentials": "omit"
            })

            const data = await req.json()

            setGeoJSON(data.geojson)
        })()
    }, [])

    React.useEffect(() => {
        if (geoJSON && mapLoaded && map && route) {
            map.addSource('route#' + route.route_short_name, {
                'type': 'geojson',
                'data': geoJSON
            })

            const layerOptions = {
                'id': 'route#' + route.route_short_name,
                'type': 'line',
                'source': 'route#' + route.route_short_name,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#' + route.route_color,
                    'line-width': 6
                }
            }


            try {
                map.addLayer(layerOptions, "buses");
            } catch (e) {
                map.addLayer(layerOptions);
            }


            return () => {
                map.removeLayer('route#' + route.route_short_name)
                map.removeSource('route#' + route.route_short_name)
            }
        }
    }, [geoJSON, map, mapLoaded, route])

    if (!stop || !route) {
        return null
    }

    function msToString(ms) {
        const seconds = ms / 1000;
        var numyears = Math.floor(seconds / 31536000);
        var numdays = Math.floor((seconds % 31536000) / 86400);
        var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
        var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
        var numseconds = Math.ceil((((seconds % 31536000) % 86400) % 3600) % 60);

        if (numyears >= 1) {
            return numyears + " year" + (numyears === 1 ? "" : "s");
        } else if (numdays >= 1) {
            return numdays + " day" + (numdays === 1 ? "" : "s");
        } else if (numhours >= 1) {
            return numhours + " hour" + (numhours === 1 ? "" : "s");
        } else if (numminutes >= 1) {
            return numminutes + " minute" + (numminutes === 1 ? "" : "s");
        } else {
            return numseconds + " second" + (numseconds === 1 ? "" : "s");
        }
    }

    return (
        <Fade in>
            <Box sx={{
                paddingInline: 0,
                paddingTop: 6,
                marginTop: 6,
            }}>
                <Box sx={{ display: "flex", paddingInline: 4 }}>
                    <Avatar sx={{ bgcolor: "#" + route.route_color, flexGrow: 0, width: '100px', height: '100px', fontSize: '50px' }}>{route.route_short_name}</Avatar>
                    <Box sx={{ flexGrow: 1, marginLeft: 2 }}>
                        <Typography variant="h5" sx={{
                            fontWeight: "bold"
                        }}>
                            {departures[0]?.direction === "outbound" ? route.route_desc : route.route_long_name}
                        </Typography>
                        <Typography variant="body1" sx={{ marginTop: 1 }}>
                            {
                                "ID: " + route.route_short_name + " "
                            }
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="h6" sx={{ marginTop: 2, paddingInline: 4 }}>
                    Services:
                </Typography>
                <List>
                    {(departures || []).map((service) => {
                        if (new Date(service.arrival.expected || service.arrival.aimed) < time) return null;

                        const state = service.delay.charAt(0) === "-" ? "late" : "early"

                        const durationString = service.delay.substring(3).replace("PT", "").toLowerCase()

                        // console.log(durationString, parse(durationString), parse)

                        return (new Date(service.arrival.expected || service.arrival.aimed) > time) && (
                            <ListItem
                                button={!!buses.find(a => a.trip.trip_id === service.trip_id)}
                                onClick={() => {
                                    if (buses.find(a => a.trip.trip_id === service.trip_id)) {
                                        map.flyTo({
                                            center: [buses.find(a => a.trip.trip_id === service.trip_id).position.longitude, buses.find(a => a.trip.trip_id === service.trip_id).position.latitude],
                                            zoom: 16
                                        })
                                    }
                                }}
                                sx={{ paddingInline: 4 }}
                            >
                                <ListItemText
                                    primary={msToString(new Date(service.arrival.expected || service.arrival.aimed) - time) + " away"}
                                    secondary={!!buses.find(a => a.trip.trip_id === service.trip_id) && (msToString(parse(durationString)) + " " + state)}
                                />
                            </ListItem>
                        )
                    }
                    )}
                </List>

            </Box>
        </Fade >
    );
}