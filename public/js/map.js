mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style:'mapbox://styles/mapbox/streets-v12',  //style Url
    center: [73.8567, 18.5204], // starting position [longitude, latitude]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
 });
