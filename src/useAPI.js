import React from "react";
import callAPI from "./callAPI";

export default function useAPI(url) {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        (async () => {
            const data = await callAPI(url);
            setData(data);
        })();
    }, [url]);

    return data;
}