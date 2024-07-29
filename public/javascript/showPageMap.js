
mapboxgl.accessToken = mapToken;
     const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: JSON.parse(show), // starting position [lng, lat]
        zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl())

// console.log(show);
new mapboxgl.Marker()
    .setLngLat(JSON.parse(show))
    .setPopup(
        new mapboxgl.Popup({offest: 25})
        .setHTML(
            `<h3> ${title} </h3>`
        )
    )
    .addTo(map)
