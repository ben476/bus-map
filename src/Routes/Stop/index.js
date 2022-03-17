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
import { Route, Router, Routes, useLocation, useParams } from 'react-router-dom';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import { getDistance } from 'geolib';
import { Avatar, Button, Fade } from '@mui/material';
import callAPI from '../../callAPI';
import StopDetails from './StopDetails';
import Service from './Service';

export default function Stop() {
    const [stops] = React.useContext(StopsContext);
    const { id } = useParams();
    const [routes, setRoutes] = React.useState([]);
    const [departures, setDepartures] = React.useState([]);

    React.useEffect(() => {
        setRoutes([]);
        setDepartures([]);


        (async () => {
            setRoutes(await callAPI("https://api.opendata.metlink.org.nz/v1/gtfs/routes?stop_id=" + id));
            setDepartures((await callAPI("https://api.opendata.metlink.org.nz/v1/stop-predictions?stop_id=" + id)).departures);
        })();
    }, [id])

    const stop = stops[id]

    if (!stop) {
        return null
    }

    return (
        <Routes>
            <Route index element={<StopDetails {...{ id, routes, departures }} />} />
            <Route path="route/:routeId" element={<Service {...{ id, routes, departures }} />} />
        </Routes>
    );
}