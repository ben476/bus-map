import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import StopsContext from '../../StopsContext';
import React from 'react';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useParams } from 'react-router-dom';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { getDistance } from 'geolib';
import { Avatar, Button, Fade } from '@mui/material';
import parse from 'parse-duration'
import { Marker } from "mapbox-gl";
import useAPI from '../../useAPI';
import MapContext from '../../MapContext';
import callAPI from '../../callAPI';

export default function Service(props) {
    const [stops] = React.useContext(StopsContext);
    const [map] = React.useContext(MapContext);
    const [time, setTime] = React.useState(new Date())
    const [geoJSON, setGeoJSON] = React.useState(null)
    const [buses, setBuses] = React.useState([])
    const busMarkersRef = React.useRef([])

    // const [busGeoJSON, setBusGeoJSON] = React.useState(null)
    const { id: stopId, departures: allDepartures, routes } = props;
    const { routeId } = useParams();

    const stop = stops[stopId]
    const route = routes.find(r => r.route_short_name === routeId)
    const departures = allDepartures.filter(d => d.service_id === routeId)

    console.log("Service Details", stop);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    React.useEffect(() => {
        const updateBuses = async () => {
            const data = await callAPI("https://api.opendata.metlink.org.nz/v1/gtfs-rt/vehiclepositions")
            setBuses(data.entity.filter(a => a.vehicle.trip.route_id == route.route_id).map(a => a.vehicle));
        }

        updateBuses()

        const interval = setInterval(updateBuses, 10000);

        return () => clearInterval(interval);
    }, [routeId])

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
            });

            return () => {
                map?.removeLayer("buses");
                map?.removeSource("buses");
            };
        } catch (e) {
            console.error(e);
        }
    }, [buses, map]);


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
        if (geoJSON && map) {
            map.addSource('route#' + route.route_short_name, {
                'type': 'geojson',
                'data': geoJSON
            })

            map.addLayer({
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
            }, 'unclustered-point');

            return () => {
                map.removeLayer('route#' + route.route_short_name)
                map.removeSource('route#' + route.route_short_name)
            }
        }
    }, [geoJSON, map])

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
                                "ID: " + stop.stop_id + " • Zone: " + stop.zone_id
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
                                    secondary={parse(durationString) && (msToString(parse(durationString)) + " " + state)}
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