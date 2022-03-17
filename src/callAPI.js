export default async function callAPI(url, options = {}) {
    const res = await fetch(url, {
        headers: {
            "accept": "application/json",
            "x-api-key": "zYhBoRRd2D2MK9HY0hAwo1og0HEUJvR51aUQgnxf"
        }
    })
    const data = await res.json();
    return data;
}