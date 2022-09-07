/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');

const app = express();
const axios = require('axios').default;
const basicAuth = require('express-basic-auth');
const _ = require('lodash');
const haversine = require('haversine-distance');
const moment = require('moment');

const PORT = 8080 || process.env.PORT;
const { NREL_API_KEY } = process.env;
const { BASIC_AUTH_PW } = process.env;

const db = require('./db');

const corsOptions = {
  origin: 'http://localhost:8081',
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(basicAuth({
  users: { xeal: BASIC_AUTH_PW },
  challenge: true,
}));

app.get('/', (req, res) => {
  res.json({ hello: 'world' });
});

app.get('/healthz', async (req, res) => {
  const connected = await db.isConnected;
  res.json({
    mongo: connected,
  });
});

const getAllChargers = async (limit, filters, lat, lng, distanceLimit) => {
  const baseUrl = 'https://developer.nrel.gov/api/alt-fuel-stations/v1.json';
  const response = await axios.get(baseUrl, {
    params: {
      fuel_type: 'E85,ELEC',
      state: 'CA',
      limit: '100',
      status: 'E', // only show available status
      api_key: NREL_API_KEY,
    },
  });

  const point1 = { lat, lng };

  const stations = response.data.fuel_stations;

  const trimmed = _.map(stations, (station) => {
    const point2 = { lat: station.latitude, lng: station.longitude };
    const haversineMeters = haversine(point1, point2);
    const haversineKm = haversineMeters / 1000;
    // eslint-disable-next-line no-param-reassign
    station.distance = haversineKm;
    return station;
  });

  const distanceLimited = _.filter(trimmed, ({ distance }) => distance < distanceLimit);
  const ordered = _.orderBy(distanceLimited, ['distance'], ['asc']);
  let sliced = ordered.slice(0, limit);

  if (filters) {
    sliced = _.filter(sliced, filters);
  }
  return sliced;
};

const getChargerById = async (id) => {
  const baseUrl = `https://developer.nrel.gov/api/alt-fuel-stations/v1/${id}.json`;
  const response = await axios.get(baseUrl, {
    params: {
      fuel_type: 'E85,ELEC',
      state: 'CA',
      limit: '10',
      api_key: NREL_API_KEY,
    },
  });
  return response.data.alt_fuel_station;
};

// return all available chargers
// https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/
app.get('/chargers', async (req, res) => {
  const limit = req.params.limit || 10;
  const filters = req.params.filters || null;

  // currently hardcoded lat lon to los angeles
  const lat = 34.0522;
  const lng = -118.2437;
  const distanceLimit = req.params.distance || 10;

  res.json({
    chargers: await getAllChargers(limit, filters, lat, lng, distanceLimit),
  });
});

app.get('/chargers/:charger_id', async (req, res) => {
  const chargerInfo = await getChargerById(req.params.charger_id);
  const chargerFeedback = await db.getFeedbackById(req.params.charger_id);
  res.json({ charger: _.merge(chargerInfo, { feedback: chargerFeedback }) });
});

app.get('/chargers/:charger_id/feedback', async (req, res) => {
  const feedback = await db.getFeedbackById(req.params.charger_id);
  res.json({ feedback });
});

app.post('/chargers/:charger_id/feedback', async (req, res) => {
  const feedbackWithUser = _.merge(req.body, { user: req.auth.user });
  const feedbackWithDate = _.merge(feedbackWithUser, { date: moment().toISOString() });
  const chargersWithFeedback = _.merge(feedbackWithDate, { charger_id: req.params.charger_id });
  const feedback = await db.insertFeedback(chargersWithFeedback);
  res.json({ feedback });
});

app.get('/favorite_chargers', async (req, res) => {
  const { user } = req.auth;

  const favoriteChargers = await db.getFavoriteChargers(user);
  res.json({ favoriteChargers });
});

app.post('/favorite_chargers', async (req, res) => {
  const { user } = req.auth;
  const favoriteChargerBody = req.body;
  favoriteChargerBody.user = user;
  const favoriteCharger = await db.insertFavoriteChargers(favoriteChargerBody);
  res.json({ favoriteCharger });
});

app.get('/users', async (req, res) => {
  const users = await db.getUsers();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const user = await db.insertUsers(req.body);
  res.json(user);
});

app.get('/users/:username', async (req, res) => {
  res.json(req.user);
});

app.delete('/users/:id', async (req, res) => {
  const user = await db.deleteUser(req.params.id);
  const favoriteChargers = await db.anonymizeFavoriteChargerFeedback(req.auth.user);
  res.json({
      user: user,
      favoriteChargers: favoriteChargers
  );
});

app.listen(PORT, () => {
  console.log(`Port: ${PORT}.`);
});
