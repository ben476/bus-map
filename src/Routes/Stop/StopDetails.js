import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import { Avatar, Fade } from '@mui/material';
import Box from '@mui/material/Box';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from '@mui/material/Typography';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MapContext from '../../MapContext';
import StopsContext from '../../StopsContext';

export default function Stop(props) {
    const [stops] = React.useContext(StopsContext);
    const [map] = React.useContext(MapContext);
    const [time, setTime] = React.useState(new Date())
    const navigate = useNavigate();
    const { id, departures, routes } = props;

    const stop = stops[id]

    console.log("Stop Details", stop);

    React.useEffect(() => {
        map?.flyTo({
            center: [stop.stop_lon, stop.stop_lat],
            zoom: 18,
            speed: 1.4,
            curve: 1,
        });
        const interval = setInterval(() => {
            setTime(new Date())
        }, 1000)

        return () => clearInterval(interval)
    }, [map, stop.stop_lat, stop.stop_lon])

    if (!stop) {
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
                    <DepartureBoardIcon fontSize="large" sx={{ fontSize: 100, flexGrow: 0 }} />
                    <Box sx={{ flexGrow: 1, marginLeft: 2 }}>
                        <Typography variant="h5" sx={{
                            fontWeight: "bold"
                        }}>
                            {stop.stop_name}
                        </Typography>
                        <Typography variant="body1" sx={{ marginTop: 1 }}>
                            {
                                "ID: " + stop.stop_id + " • Zone: " + stop.zone_id
                            }
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="h6" sx={{ marginTop: 2, paddingInline: 4 }}>
                    Departures:
                </Typography>
                <Fade in={departures.length > 0}>
                    <List>
                        {(departures || []).map((service) => (new Date(service.arrival.expected || service.arrival.aimed) > time) && (
                            <ListItem
                                button
                                sx={{ paddingInline: 4 }}
                                onClick={() => navigate("route/" + service.service_id)}
                            >
                                <ListItemIcon>
                                    <Avatar sx={{ bgcolor: "#" + routes?.find(a => a.route_short_name === service.service_id)?.route_color }}>{service.service_id}</Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary={service.destination.name}
                                    secondary={(new Date(service.arrival.expected || service.arrival.aimed) - time > 60000) ? msToString(new Date(service.arrival.expected || service.arrival.aimed) - time) + " away" : "Due"}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Fade>
            </Box>
        </Fade >
    );
}