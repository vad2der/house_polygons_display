from pymongo import MongoClient, GEOSPHERE

db = MongoClient().polygons
db.polygon_collection.create_index([("geometry", GEOSPHERE)])
