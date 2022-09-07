/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-console */
/* eslint-disable no-return-await */
const { MongoClient, ObjectId } = require('mongodb');

const connectionUrl = process.env.DB_CONN_STR;
const dbName = 'xeal';

let db;
const isConnected = new Promise((resolve, reject) => {
  MongoClient.connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then((client) => {
    db = client.db(dbName);
    resolve(true);
    console.log('Connected to Database');
  }).catch((err) => {
    reject(false);
    console.log(
      `Error in DB connection : ${JSON.stringify(err, undefined, 2)}`,
    );
  });
});

async function isConnectedPromise() {
  return await isConnected;
}

const insertUsers = async (user) => {
  const collection = db.collection('users');
  return collection.insertOne(user);
};

const getUsers = async () => {
  const collection = db.collection('users');
  return await collection.find().toArray();
};

const deleteUser = async (id) => {
  const collection = db.collection('users');
  return await collection.remove({ _id: ObjectId(id) });
};

const getFavoriteChargers = async (user) => {
  const collection = db.collection('favorite_chargers');
  return await collection.find({ user }).toArray();
};

const insertFavoriteChargers = async (favoriteCharger) => {
  const collection = db.collection('favorite_chargers');
  return await collection.insertOne(favoriteCharger);
};

const anonymizeFavoriteChargers = async (user) => {
  const collection = db.collection('favorite_chargers');
  return await collection.updateMany({user: user}, {$set: {user: null}})
};

const getFeedback = async (user) => {
  const collection = db.collection('feedback');
  return await collection.find({ user }).toArray();
};

const getFeedbackById = async (id) => {
  const collection = db.collection('feedback');
  return await collection.find({ charger_id: id }).toArray();
};

const insertFeedback = async (feedback) => {
  const collection = db.collection('feedback');
  return await collection.insertOne(feedback);
};

exports.insertUsers = insertUsers;
exports.getUsers = getUsers;
exports.deleteUser = deleteUser;
exports.getFavoriteChargers = getFavoriteChargers;
exports.insertFavoriteChargers = insertFavoriteChargers;
exports.anonymizeFavoriteChargers = anonymizeFavoriteChargers;
exports.getFeedback = getFeedback;
exports.getFeedbackById = getFeedbackById;
exports.insertFeedback = insertFeedback;
exports.isConnected = isConnectedPromise();
