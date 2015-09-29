from tld import get_tld
import logging
from os import listdir
from os.path import isfile, isdir, join
import psycopg2
logger = logging.getLogger( "collect_logger" )

# tokens psql schema

'''CREATE TABLE TOKENS (
    deviceid integer NOT NULL,
    api varchar(255),
    token varchar(255),
    attr varchar(255),
    lastupdate bigint
   );    
'''

#logaccess psql schema

'''CREATE TABLE logaccess (
     type varchar(255),
     filepos bigint,
     ts bigint
   );    
'''

def reconnect(fn):
	""" decorator to reconnect to the database if needed """
	def wrapped(self, *args, **kwargs):
		if self.connected is not True:
			self.connect()
		return fn(self, *args, **kwargs)
	return wrapped
	

			
 	
class CollectDB( object ):
	
	''' classdocs '''
	def __init__(self):
		self.connected = False
		self.dbname = 'hostview'
		self.dbuser = 'hostview'
		self.dbhost = 'localhost'
		self.dbpass = 'hostview'
	
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
	def insert_token_for_device(self, api, deviceid, token):
		try:
			sql = "INSERT INTO tokens(api, deviceid, token) VALUES(%s,%s,%s)"
			data = (api, deviceid, token)
			self.cur.execute(sql,data)
			self.conn.commit()
		except Exception, e:
			log.error("error saving token!!")
			log.error(e)
	
	@reconnect
	def fetch_tokens(self, api):
		sql = "SELECT token, deviceid, lastupdate, attr FROM tokens WHERE api=%s"
		data = (api,)
		self.cur.execute(sql,data)
		result = self.cur.fetchall() 
		return [{"token":row[0], "deviceid":row[1], "lastupdate":row[2], "attr":row[3]} for row in result]
	
	@reconnect
	def fetch_token_for_device(self, api, deviceid):
		sql = "SELECT token FROM tokens WHERE deviceid =%s AND api =%s"
		data = (deviceid,api)
		self.cur.execute(sql,data)
		token = self.cur.fetchone()
		if token:
			return token[0]
		else:
			return None
			
	@reconnect
	def update_ts(self, api, deviceid, ts):
		sql = "UPDATE tokens SET lastupdate=%s WHERE deviceid=%s AND api=%s"
		data = (ts, deviceid,api)
		self.cur.execute(sql,data)
		self.conn.commit()
	
	@reconnect
	def update_filepos(self, ts, fpos, type):
		sql = "SELECT * FROM logaccess WHERE type=%s"
		data = (type,)
		self.cur.execute(sql,data)
		result = self.cur.fetchone()
		
		if result is not None:
			sql = "UPDATE logaccess SET ts=%s, filepos=%s WHERE type=%s"
			data = (ts, fpos, type)
		else:
			sql = "INSERT INTO logaccess(type, ts, filepos) VALUES (%s,%s,%s)"
			data = (type, ts, fpos)
			
		self.cur.execute(sql,data)
		self.conn.commit()
	
	@reconnect
	def fetch_filepos_for(self, type):
		sql = "SELECT filepos FROM logaccess WHERE type=%s"
		data = (type,)
		self.cur.execute(sql,data)
		fpos = self.cur.fetchone()
		if fpos is not None:
			return fpos[0]
		return 0
	 	