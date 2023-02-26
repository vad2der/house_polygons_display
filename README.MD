# Polygon display demo

# Updated with docker-compose for local environment
## Running the first time
1. Build containers & images
`docker-compose build`
2. Configure the DB
`docker-compose run backend python3 config_db.py`
3. Seed the DB
`docker-compose run backend python3 seed.py`

## Running the app
1. `docker-compose up` and in the browser navigate to [http://localhost:4200](http://localhost:4200/)


# One can still run it without docker containers manually running every piece (obsolete part) 
## Front End
Build with Angular cli
### Installation
Refer to [https://cli.angular.io/](https://cli.angular.io/)
### Running dev server
`ng s`
and goto [http://localhost:4200](http://localhost:4200/)

## Back End
Build with Flask and Python 3.6.2
### Dependencies
MongoDB has to be installed
### Installation
venv is recommended, refer to [https://docs.python.org/3/tutorial/venv.html](https://docs.python.org/3/tutorial/venv.html)

`pip install -r requirements.txt`

Seed the test data: `python seed.py`

Index the collection by location: `python config_db.py`

### Running dev server
`python app.py`
it will run on __http://localhost:8000__

## Appendix
https://docs.google.com/presentation/d/1kIb9-HA4VMh26WW9Z7B43P2udyTMdk2acEy_HIo2lGM/edit?usp=sharing

## Disclaimer
The test supposed to be done within 4 hours, though taking into consideration the general scope of the project and time for refreshing, I spent ~8 hours on it. Code is to be refactored. The purpose of the code is to give an idea in the approaches suggested in the appendix.

The boundary of buffer zones is not updated after first load intentionally - to show the approach, othervise we would not see them as they are reset every time after polygons are requested from the back end.