import json
from pymongo import MongoClient
from os import environ
from urllib.parse import quote_plus

# mongodb connection
DB_USERNAME = environ.get("DB_USERNAME")
DB_PASSWORD = environ.get("DB_PASSWORD")
DB_NAME = environ.get("DB_NAME_MONGO")
DB_COLLECTION = environ.get("DB_COLLECTION_MONGO")
DB_HOST = environ.get("DB_HOST_MONGO")
DB_PORT = int(environ.get("DB_PORT_MONGO"))

client = MongoClient(host=DB_HOST, port=DB_PORT, username=DB_USERNAME, password=DB_PASSWORD, authSource="admin")
db = client[DB_NAME]
collection = db[DB_COLLECTION]

collection.drop()

with open('Full-Stack-Developer-2020-04-example-data.geojson') as f:
    data = json.load(f)
    collection.insert_many(data["features"])

client.close()
