import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from '@mui/material/Typography';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BusContext from '../BusContext';
import callAPI from '../callAPI';
import MapContext from '../MapContext';
import RoutesContext from '../RoutesContext';
import StopsContext from '../StopsContext';

export default function Service(props) {
    const [stops] = React.useContext(StopsContext);
    const [map, , mapLoaded] = React.useContext(MapContext);
    const [routes] = React.useContext(RoutesContext);
    const [time, setTime] = React.useState(new Date())
    const [geoJSON, setGeoJSON] = React.useState(null)
    const [schedule, setSchedule] = React.useState([])
    const [buses, , setBusFilter, setActiveBus] = React.useContext(BusContext)
    const busMarkersRef = React.useRef([])
    const navigate = useNavigate();

    // const [busGeoJSON, setBusGeoJSON] = React.useState(null)

    const { busId } = useParams();

    const bus = buses.find(b => b.vehicle.id === busId);
    const route = routes[bus?.trip?.route_id]

    console.log("Bus details", busId, bus, route)

    // console.log("Service Details", stop);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    React.useEffect(() => {
        setActiveBus(busId)
        return () => setActiveBus(null)
    }, [busId])

    // React.useEffect(() => {
    //     setBusFilter(() => (a) => (a?.vehicle?.id == busId))

    //     return () => setBusFilter(null)
    // }, [busId])

    React.useEffect(() => {
        if (route) {
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
        }
    }, [route])

    React.useEffect(() => {
        if (bus && schedule.length === 0) {
            (async () => {
                setSchedule(await callAPI("https://api.opendata.metlink.org.nz/v1/gtfs/stop_times?trip_id=" + bus.trip.trip_id))
            })()
        }
    }, [bus])

    React.useEffect(() => {
        if (geoJSON && map && route && mapLoaded) {
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
            }, 'buses');

            return () => {
                map.removeLayer('route#' + route.route_short_name)
                map.removeSource('route#' + route.route_short_name)
            }
        }
    }, [geoJSON, map, , mapLoaded])

    if (!bus || !route) {
        if (buses.length === 0) {
            return null
        } else {
            return (
                <Fade in>
                    <Box sx={{
                        paddingInline: 0,
                        paddingTop: 6,
                        marginTop: 6,
                    }}>
                        <Box sx={{ display: "flex", paddingInline: 4 }}>
                            <DirectionsBusIcon sx={{ fontSize: '100px' }} />
                            <Box sx={{ flexGrow: 1, marginLeft: 2 }}>
                                <Typography variant="h5" sx={{
                                    fontWeight: "bold"
                                }}>
                                    Bus not in service
                                </Typography>
                                <Typography variant="body1" sx={{ marginTop: 1 }}>
                                    {"Bus ID: " + busId}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Fade>
            )
        }
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
                    <DirectionsBusIcon sx={{ fontSize: '100px' }} />
                    <Box sx={{ flexGrow: 1, marginLeft: 2 }}>
                        <Typography variant="h5" sx={{
                            fontWeight: "bold"
                        }}>
                            Bus on route {route.route_short_name}
                        </Typography>
                        <Typography variant="body1" sx={{ marginTop: 1 }}>
                            {
                                bus?.trip.direction_id ? route.route_long_name : route.route_desc
                            }
                            <br />
                            {"Bus ID: " + busId}
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="h6" sx={{ marginTop: 2, paddingInline: 4 }}>
                    Scheduled stops:
                </Typography>
                <List>
                    {schedule.map((service) => {
                        // if (new Date(service.departure_time) < time) return null;

                        // const state = service.delay.charAt(0) === "-" ? "late" : "early"

                        // const durationString = service.delay.substring(3).replace("PT", "").toLowerCase()

                        // console.log(durationString, parse(durationString), parse)

                        // return (new Date(service.arrival.expected || service.arrival.aimed) > time) && (
                        const stop = stops[service.stop_id]

                        const date = new Date()

                        const timeString = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()

                        // console.log(service.departure_time, timeString, service.departure_time > timeString)

                        if (service.departure_time < timeString || !stop) {
                            return null
                        }

                        return (
                            <ListItem
                                button
                                onClick={() => {
                                    navigate(`/stop/${service.stop_id}`)
                                }}
                                sx={{ paddingInline: 4 }}
                            >
                                <ListItemText
                                    primary={stop.stop_name}
                                    secondary={"Scheduled at " + service.departure_time}
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