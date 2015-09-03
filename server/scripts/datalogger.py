from tld import get_tld
import logging
from os import listdir
from os.path import isfile, isdir, join
import psycopg2
logger = logging.getLogger( "collect_logger" )

def reconnect(fn):
	print "in conncet decorator"
	""" decorator to reconnect to the database if needed """
	def wrapped(self, *args, **kwargs):
		if self.connected is not True:
			self.connect()
		return fn(self, *args, **kwargs)
	return wrapped


class DataLogger( object ):
	
	''' classdocs '''

	def __init__(self, name):
		self.name = name
		self.connected = False
		self.dbname = 'hostview'
		self.dbuser = 'hostview'
		self.dbhost = 'localhost'
		self.dbpass = 'hostview'
	
	#///////////////////////////////////////
	def connect( self ):
		print "connecting to postgres database %s " % self.dbname
		
		if self.connected is False:
		
			try:
				constr = "dbname=%s user=%s host=%s password=%s" % (self.dbname,self.dbuser,self.dbhost,self.dbpass)
				print constr
				self.conn = psycopg2.connect("dbname=hostview user=hostview host=localhost password=hostview")
				self.cur = self.conn.cursor()
				self.connected = True
				print "successfully connected!"
				
			except Exception, e:
				print e
				print "unable to connect to the database!"
				
 	@reconnect
 	def bulk_insert_urls(self, content):
		logger.debug("in bulk insert urls")

		for line in content:

			items = line.split()
			
			
			if len(items) < 9:
				logger.error("error parsing line")
				logger.error(line)
			else:
				if ("http" in items[8]  and "//" in items[8]):
					parts  = items[8].split("//")[1].split("/")

					domain = parts[0]
					print domain
					
					res = get_tld(items[8], as_object=True, fail_silently=True)

					if res is not None:
						tld = "%s.%s" % (res.domain, res.suffix)
					else:
						tld = parts[0]
						
					print "%s,%s" % (domain,tld)
					path = ""
					if len(parts) > 0:
						path = "".join(parts[1:])
					
					print items[2].split(".")[0]
					print items[4]
					url = {'ts':items[2].split(".")[0], 'host':items[4], 'tld':tld, 'domain':domain, 'path': path}
					try:
						print "inserting %s %s %s %s %s %s" % (url['ts'], url['host'],url['tld'], url['domain'], url['path'], 'squid')
						# lookup IP in ip -> device.id table
						# insert device.id / data into the http3 table!
						#self.conn.execute("INSERT INTO URLS(ts, host, tld, domain, path, datasource) VALUES(?,?,?,?,?,?)", (url['ts'], url['host'],url['tld'], url['domain'], url['path'], 'squid'))
					except Exception, e:
						logger.error("error inserting url %s" % str(url))

		#commit now..
#		try:
#			self.conn.commit()
#				
#		except Exception, e:
#			logger.error("error bulk committing urls")				
