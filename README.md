# xeal-takehome
## Quick Setup tl;dr
#### Requirements:
- Node 16 & NPM
- Docker Desktop
- Clone this repository or download as a zip
```
git clone https://github.com/standyro/xeal-takehome
npm install
```

- Create an environment file within the root of the repository directory with the following three environment variables
- `NREL_API_KEY` from the NREL API
- `DB_CONN_STR` mongo db connection string
- `BASIC_AUTH_PW` basic auth password
```
cat > .env << EOL

NREL_API_KEY=yourNrelApiKey
DB_CONN_STR=mongodb+srv://admin:PASSWORD@cluster0.rnuzfqm.mongodb.net/?retryWrites=true&w=majority
BASIC_AUTH_PW=abcdefg

EOL
```

- Run the local development server either using Node directly or docker
```
# to run using nodemon
npm run dev

# to lint using eslint
npm run lint

# to build and run with docker
npm run docker-build
npm run docker-run

# to kill any running docker containers locally
npm run docker-kill
```
## Notes

- Node, Express, Mongo
- Routes
    - `GET /chargers`
    - `GET /chargers/:charger_id`
    - `GET /chargers/:charger_id/feedback`
    - `POST /chargers/:charger_id/feedback`
    - `GET /favorite_chargers`
    - `POST /favorite_chargers`
    - `GET /users`
    - `GET /users/:username`
    - `DELETE /users/:id`
## Things that could be improved

- Add JSON API validation
- Migrate to use Mongoose ORM for models/collections
- Remove simplified routes and use Express Open API spec
- Improve simplified authentication from HTTP basic auth to tokens
- Cleaner method for integrating data from NREL API
## Things to do

- [x] Setup Node.js Express Project with Dependencies
- [x] Setup Node.js Dockerfile
- [X] Create Mongo Controller/Routes
- [X] Setup all Routes from Requirements
- [X] Setup Postman Collection
- [X] Setup with Dockerfile
- [ ] Setup Integration tests for Routes
- [ ] Build simplistic frontend
## Feature Requirements
### Backend

- Provide APIs for adding & removing favorite charging locations for a USER
A favorite location must be a valid location.  You can use this as your charging station data source:
https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/
Security / Privacy are not going to be evaluated so keep it simple - e.g. username

- Provide an API to list a USER’s favorite charging locations.  This list should be sortable - e.g. station name, distance from a location

- Provide APIs for adding / getting feedback related to a charging station - rating, text comments, user and date.  The list should be sorted by reverse chronological order.

- Provide an API for removing a USER.  This should remove the USER, remove USER favorites, and update any USER feedback to be ANONYMOUS. 

- Provide a Postman collection or similar that can be used to evaluate and test your endpoints.

### Frontend
While this section is entirely optional, it is highly encouraged since this is a fullstack position.

- When the app loads, it shall display a map showing icons for all Electric Vehicle chargers within a 50 mile radius from the current location.  
- You can use this api for the charger data source: https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/
- When a charger is selected, the app shall show EV related information - e.g. level1 ports, connector types, etc… - as well as generic availability information.
- The app shall provide an option to leave feedback for a given charger.
- The app shall show all feedback associated with that charger.
- The app shall provide a method for the USER to enter their username (e.g. through login prompt or input box).
- Upon providing their username, the app shall show the chargers that were favorited by that USER.
- Update charger map icon to differentiate a favorite from a non-favorite.

### Deployment
- Create a method to run/deploy your services.  This could be accomplished with docker containers or something similar.
- Include a readme which provides all necessary instructions for deploying/using the service
- Bonus points for providing a running URL to your running services
