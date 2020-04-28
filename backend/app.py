import os
from flask import Flask, request, Request, render_template, jsonify
from flask_restful import Api, Resource, fields, marshal_with
import json
from pymongo import MongoClient
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)
db = MongoClient().polygons
polygon_collection = db.polygon_collection

API_KEY = 'qwerty12345'

# REST Resources
class PolygonApi(Resource):
  def __init__(self):
    pass

  def post(self, param='polygon'):
    print(request)
    try:
        print('requests')
        data = request.get_json(force=True)
        if data['xcode'] != API_KEY: # simpliest api key-like auth, TODO: make it dynamic
            return json.dumps({'error': 'Unathorized'}), 401
        ulx = float(data['ulx'])
        uly = float(data['uly'])
        lrx = float(data['lrx'])
        lry = float(data['lry'])
    except:
        print('form')
        data = request.form
        if data.get('xcode') != API_KEY: # simpliest api key-like auth, TODO: make it dynamic
            return json.dumps({'error': 'Unathorized'}), 401
        ulx = float(data.get('ulx'))
        uly = float(data.get('uly'))
        lrx = float(data.get('lrx'))
        lry = float(data.get('lry'))

    coord = {'ulx': ulx, 'uly': uly, 'lrx': lrx, 'lry': lry}
    outline_polygon = [ [ [ ulx, uly ], [ ulx, lry ], [ lrx, lry ], [ lrx, uly ], [ ulx, uly ] ] ]
    print(outline_polygon)
    polygons = polygon_collection.find(
        {
            "geometry": {
                "$geoWithin": {
                    "$geometry": {
                      "type": "Polygon",
                      "coordinates": outline_polygon
                    }
              }
            }
        }
    )

    # from pymongo import MongoClient
    # db = MongoClient().polygons
    # polygon_collection = db.polygon_collection
    # list(polygon_collection.find({'geometry': {'$geoWithin': {'$geometry': {'coordinates': ol, 'type': 'Polygon' }} }}))

    refined_polygons = [{'properties': p['properties'], 'geometry': p['geometry'], 'type': p['type']} for p in list(polygons)]
    print(refined_polygons)
    return json.dumps({"coord": coord, "polygons": refined_polygons}), 201


api.add_resource(PolygonApi, '/api/v1/<param>')

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)