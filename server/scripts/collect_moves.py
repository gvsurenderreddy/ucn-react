from datalogger import DataLogger
import requests
from config import TestingConfig
import json
import logging
from datetime import datetime
from datetime import date
import dateutil.parser
from dateutil.tz import *
from collectdb import CollectDB
#from datadb import NetDB
import time

logger = logging.getLogger( "collect_logger" )


#psql zones schema is
'''
CREATE TABLE zones(
	date varchar(16),
	locationid bigint,
	deviceid integer,
	name  varchar(128),
	lat real,
	lng real,
	enter bigint,
	exit bigint
)
'''

#Aggghhh - when using an updated since, there is no way of being able to replace stale records with updated records
#as there is no information in the new records that can be faithfully linked back to the older ones (in the database)
#locationid changes, as does the lng/lat when a location name is changed.  The best we can do is to simply overwrite
#all older data with newer data - and this can only go back 31 days.  It means that, if a location name is changed, only
#the records in the last 31 days will be updated with that change..

def fetchlocations():
	logger.debug("fetching tokens")
	tokens = collectdb.fetch_tokens('moves')
 	
 	for token in tokens:
 		print "looking at token"
 		print token
 		result = None
 		payload = {'access_token':token['token']}
 		url = cfg.API_URL + "/user/places/daily"
 					
 		payload['pastDays'] = 31
		r =  requests.get(url, params=payload)
		
		logger.debug("called url %s" % r.url)
 		
 		try:
			result = r.json()
			
			latestUpdate = None
			zones = []
		
			for row in result:	
 				if row['segments'] is not None:
 					for segment in row['segments']:
 						print segment
 						
 						lastUpdate = dateutil.parser.parse(row['lastUpdate'])
 				
 						if latestUpdate is None:
 							latestUpdate = lastUpdate
 						else:
 							if time.mktime(lastUpdate.timetuple()) > time.mktime(latestUpdate.timetuple()):
 								latestUpdate = lastUpdate
						
						print latestUpdate 
						print int(time.mktime(latestUpdate.timetuple()))						
 						place = segment['place']
 						enter = int(time.mktime(dateutil.parser.parse(segment['startTime']).timetuple()))
 						exit  = int(time.mktime(dateutil.parser.parse(segment['endTime']).timetuple()))
 						
 						if 'name' in place:
 							name = place['name']
 						else:
 							name = ""

 						zone = {'date':row['date'], 'deviceid':token['deviceid'], 'locationid':place['id'], 'name':name, 'lat':place['location']['lat'], 'lng':place['location']['lon'], 'enter':enter, 'exit':exit}
 						zones.append(zone)
 			
 						datalogger.remove_zones(token['deviceid'], row['date'])
 			logger.debug("adding zones ")
 			logger.debug(zones)					
 			datalogger.insert_zones(zones)
 			zones=[]
		
		except Exception, e:
			print "EXCEPTION!!!"
			print e
			logger.error("failed to get update for %s %s" % (r.url, token['token']))
						
		if latestUpdate is not None:
			logger.debug("set latest update for host %s to %s" %  (token['deviceid'],lastUpdate.strftime("%Y%m%dT%H%M%S%z")))
			collectdb.update_ts('moves',token['deviceid'], int(time.time()))
			
	#print result
	#return jsonify({"result":result})
	
if __name__ == "__main__":
	cfg = TestingConfig()
	hdlr = logging.FileHandler(cfg.COLLECT_LOGFILE or '/var/tmp/collect.log') 
	formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
	hdlr.setFormatter(formatter)
	logger.addHandler(hdlr)
	logger.setLevel(logging.DEBUG)

	collectdb = CollectDB()
	datalogger = DataLogger()
	fetchlocations()
