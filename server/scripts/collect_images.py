from datalogger import DataLogger
#from collectdb import CollectDB
from os import listdir
from os.path import isfile, join
from datetime import datetime
import time
import sys

# images psql schema
'''CREATE TABLE images (
    id integer NOT NULL,
    ts bigint,
    domain text,
    path text
   );    
'''
def insert_urls(directory):
	
	files = [f for f in listdir(directory)  if isfile(join(directory, f))]
	
	for file in files:
		datafile = join(directory, file)
		print "adding data from squid log: %s" % datafile
		#fpos = 0
	
		try:
		
			with open(datafile) as f:
				#f.seek(fpos)
				content = f.readlines()
				datalogger.bulk_insert_images(content)
			
		except Exception, e:
			print "error reading data from squid file"
			print e

if __name__ == "__main__":
	
	if len(sys.argv) > 1:
		datalogger = DataLogger()
		insert_urls(sys.argv[1])