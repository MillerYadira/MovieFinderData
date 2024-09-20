const express = require('express');
const morgan = require('morgan');
const axios = require('axios');

require('dotenv').config();
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 86400 });

app.use(morgan('dev'));

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_API_URL = 'http://www.omdbapi.com';

const fetchOmdb = async (params) => {
    try {
        const response = await axios.get(`${OMDB_API_URL}?${params}&apikey=${OMDB_API_KEY}`);
        return response.data;
    } catch (error) {
        throw error
    }
};

app.get('/', async (req, res) => {
    const {i, t} = req.query;

    const cacheKey = i ? `i=${i}` : `t=${t}`;

    if(cache.has(cacheKey)){
        return res.json(cache.get(cacheKey));
    }

    try {
        const movie = await fetchOmdb(cacheKey);
        cache.set(cacheKey, movie);
        return res.json(movie).status(200);
    } catch (error) {
        throw error;
    }
});

module.exports = app;