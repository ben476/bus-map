import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import StopsContext from '../StopsContext';
import React from 'react';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useParams } from 'react-router-dom';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import { getDistance } from 'geolib';
import ServiceTip from "../components/ServiceTip";
import { Avatar, Button, Fade } from '@mui/material';
import useAPI from '../useAPI';

export default function Stop() {
    const [stops] = React.useContext(StopsContext);
    const { id } = useParams();
    const routes = useAPI("https://api.opendata.metlink.org.nz/v1/gtfs/routes?stop_id=" + id);

    const stop = stops[id]

    if (!stop) {
        return null
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
                    <Box sx={{ flexGrow: 1, marginLeft: 1 }}>
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
                    Services going to this stop:
                </Typography>
                <List>
                    {(routes || []).map((route) => (
                        <ListItem
                            button
                            sx={{ paddingInline: 4 }}
                        >
                            <ListItemIcon>
                                <Avatar sx={{ bgcolor: "#" + route.route_color }}>{route.route_short_name}</Avatar>
                            </ListItemIcon>
                            <ListItemText
                                primary={route.route_long_name}
                                secondary={"ID: " + route.route_id}
                            />
                        </ListItem>
                    ))}
                </List>

            </Box>
        </Fade >
    );
}