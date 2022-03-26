import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import callAPI from '../../callAPI';
import StopsContext from '../../StopsContext';
import Service from './Service';
import StopDetails from './StopDetails';

export default function Stop() {
    const [stops] = React.useContext(StopsContext);
    const { id } = useParams();
    const [routes, setRoutes] = React.useState([]);
    const [departures, setDepartures] = React.useState([]);

    React.useEffect(() => {
        setRoutes([]);
        setDepartures([]);


        callAPI("https://api.opendata.metlink.org.nz/v1/gtfs/routes?stop_id=" + id).then(res => setRoutes(res));

        const updateDepartures = async () => setDepartures((await callAPI("https://api.opendata.metlink.org.nz/v1/stop-predictions?stop_id=" + id)).departures);

        updateDepartures()

        const interval = setInterval(updateDepartures, 10000)

        return () => clearInterval(interval);
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