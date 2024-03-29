import fs from "fs";
import axios from "axios";

class Search {

    history = [];
    dbPath = './db/database.json';

    constructor() {
        // TODO: read DB if exists
        this.readDB();
    };

    get mapboxParams() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'en',
        };
    };

    get weatherParams() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
        };
    };

    get capitalizedHistory() {
        return this.history.map(place => {
            let words = place.split(' ');
            words = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
            return words.join(' ');
        });
    };

    async city(place = '') {
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
                params: this.mapboxParams,
            });
            const response = await instance.get();
            return response.data.features.map(place => ({
                id: place.id,
                name: place.place_name,
                lng: place.center[0],
                lat: place.center[1],
            }));
        } catch (error) {
            return [];
        };
    };

    async weather(lat, lon) {
        try {
            const instance = axios.create({
                baseURL: 'https://api.openweathermap.org/data/2.5/weather',
                params: {
                    ...this.weatherParams,
                    lat,
                    lon,
                }
            })
            const resp = await instance.get();
            const { weather, main } = resp.data;
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp,
            }
        } catch (error) {
            console.log(error);
        }
    };

    addHistory(place = '') {
        if (this.history.includes(place.toLocaleLowerCase())) return;
        this.history = this.history.splice(0, 5);
        this.history.unshift(place.toLocaleLowerCase());
        this.saveDB();
    };

    saveDB() {
        const payload = {
            history: this.history
        };
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    };

    readDB() {
        if (!fs.existsSync(this.dbPath)) return;
        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
        const data = JSON.parse(info);
        this.history = data.history;
    };
};

export { Search };