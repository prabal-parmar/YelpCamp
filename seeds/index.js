
const mongoose = require('mongoose')
const cities = require('./cities');
const Campground = require('../models/campground');
const { places , descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(()=>{
    console.log("Mongo Connection Open!!");
})
.catch(err => {
    console.log("Error caught in Mongo !!!");
    console.log(err);
})

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async ()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const rprice = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '65de2e2828cd2d47662ed93b',
            title: `${sample(places)} ${sample(descriptors)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Est praesentium, debitis, ipsum, fugiat quibusdam hic tenetur perspiciatis dolorum explicabo dolorem repellat id ea saepe. Minus in maiores minima quidem porro.',
            price : rprice,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                //   url: 'https://res.cloudinary.com/dlurq7obv/image/upload/v1709490763/YelpCamp/rnu24anamvhumxyadbqf.png',
                url: 'https://imgs.search.brave.com/9JMwLUAXURUfqsLgqDaWrkDd-UhVcrCvMxs4fLwAhjI/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXM3LmFscGhhY29k/ZXJzLmNvbS80MTEv/NDExODIwLmpwZw',
                filename: 'YelpCamp/rnu24anamvhumxyadbqf',
                }
              ]
        })
        await camp.save();
    }
}
seedDB().then( () => {
    mongoose.connection.close();
})