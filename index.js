import * as dotenv from 'dotenv'
import { inquirerMenu, listPlaces, pause, readInput } from "./helpers/inquirer.js";
import { Search } from "./models/search.js";

dotenv.config();

const main = async () => {

    const search = new Search();
    let opt;

    do {
        opt = await inquirerMenu();
        switch (opt) {
            case 1:
                // Show message
                const searchTerm = await readInput('City: ');
                // Search place
                const places = await search.city(searchTerm);
                // Select place
                const selectedPlaceId = await listPlaces(places);
                if (selectedPlaceId === '0') continue;
                const selectedPlace = places.find(place => place.id === selectedPlaceId);
                // Save place history
                search.addHistory(selectedPlace.name);
                // Weather data
                const weather = await search.weather(selectedPlace.lat, selectedPlace.lng);
                // Show results
                console.clear();
                console.log('\nCity info\n'.green);
                console.log('City:', selectedPlace.name.green);
                console.log('Lat:', selectedPlace.lat);
                console.log('Lng:', selectedPlace.lng);
                console.log('Temperature:', weather.temp);
                console.log('Min:', weather.min);
                console.log('Max:', weather.max);
                console.log('Description:', weather.desc.green);
                break;
            case 2:
                search.capitalizedHistory.forEach((place, index) => {
                    const idx = `${index + 1}.`.green;
                    console.log(`${idx} ${place}`);
                });
                break;
        }
        opt !== 0 && await pause();
    } while (opt !== 0);

};

main();