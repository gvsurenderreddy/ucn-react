from config import TestingConfig
import psycopg2
import requests
import logging

logger = logging.getLogger( "collect_logger" )

def reconnect(fn):
	""" decorator to reconnect to the database if needed """
	def wrapped(self, *args, **kwargs):
		if self.connected is not True:
			self.connect()
		return fn(self, *args, **kwargs)
	return wrapped

class Classifier( object ):
	''' classdocs '''

	def __init__( self, name):
		self.name = name
		self.connected = False
		self.dbname = 'hostview'
		self.dbuser = 'hostview'
		self.dbhost = 'localhost'
		self.dbpass = 'hostview'
	#///////////////////////////////////////


	def connect( self ):
		
		if self.connected is False:
			try:
				constr = "dbname=%s user=%s host=%s password=%s" % (self.dbname,self.dbuser,self.dbhost,self.dbpass)
				self.conn = psycopg2.connect("dbname=hostview user=hostview host=localhost password=hostview")
				self.cur = self.conn.cursor()
				self.connected = True
			except Exception, e:
				logger.debug(e)
				logger.debug("unable to connect to the database!")
				
	@reconnect
	def createTables(self):
		pass
		#try:
			#self.cur.execute('''CREATE TABLE CLASSIFICATION (
			#						deviceid integer,
			#						tld varchar(255) NOT NULL,
			#						classifier varchar(128),
			#						version varchar(128),
			#						success integer,
			#						error varchar(255),
			#						score decimal,
			#						classification varchar(255)
			#					);''')
			#self.conn.commit()
		#except Exception,e:
		#	print e
				
			
	@reconnect
	def fetch_distinct_tlds(self, filters):
		whereclause = "WHERE httphost NOT IN (%s) AND httphost NOT LIKE '%%openvpn%%'" % ",".join("'{0}'".format(w) for w in filters)
		sql = "SELECT id, httphost FROM http3 %s GROUP BY id, httphost" % whereclause 
		
		try:
			self.cur.execute(sql)
			return [{'id':row[0], 'tld':row[1]} for row in self.cur.fetchall()]
		except Exception, e:
			logger.debug(e)
			return []
	

	@reconnect
	def fetch_classified_tlds(self):
		sql = "SELECT deviceid,tld FROM CLASSIFICATION"
		self.cur.execute(sql)
		classified = {}

		for row in self.cur.fetchall():
			classified["%s:%s" % (row[0],row[1])] = True

		return classified

	@reconnect
	def fetch_to_translate(self, classifier):
		sql = "SELECT DISTINCT(tld) FROM CLASSIFICATION WHERE classifier='%s' AND error='%s' AND success=%d" % (classifier, "unsupported-text-language", 0)
		self.cur.execute(sql)
		return [row[0] for row in self.cur.fetchall()]

		
	#this first will extract the text from the foreign language site (using the alchemy api)
	#then it will translate the text to english (using the yandex api)
	#then it will post this text to the alchemy keyword api
	def translate_urls(self, alchemykey, zandexkey):
		
		totranslate = self.fetch_to_translate("alchemy")
		limitexceeded = False
		
		for tld in totranslate:
			
			if limitexceeded:
				return
				
			result = self.extract_text(tld, alchemykey)
			
			if result is not None:
				if result['status'] == "OK":
					text = result["text"]
					#now translate the text!
					translated = self.translate_text(zandexkey, text)
					#now categorise the text
					self.classify_text_with_alchemy(tld, translated, alchemykey)
					
				elif result['status'] == "ERROR":
					if result['statusInfo'] == "daily-transaction-limit-exceeded":
						limitexceeded = True
	
	def extract_text(self, tld, apikey):
			
		payload = {
			'url':tld,
			'outputMode': 'json',
			'apikey':apikey,
		}
		url =  "http://access.alchemyapi.com/calls/url/URLGetText" 
		
		r =  requests.get(url, params=payload)
		
		try:
			result = r.json()
			return result
			logger.debug("url %s status %s" % (tld,result['status']))
					
		except Exception, e:
			logger.debug("error extracting text!")
			logger.debug(e)
			return None
	
	def translate_text(self, apikey, text):
		
		payload = {
			'lang':'en',
			'key':apikey,
			'text':text[:9950] if len(text) > 9950 else text
		}
		
		url = "https://translate.yandex.net/api/v1.5/tr.json/translate"
		r =  requests.get(url, params=payload)
			
		try:
			result = r.json()
			return ' '.join(result['text'])
				
		except Exception, e:
			logger.debug("error extracting text!")
			logger.debug(e)
			return None	

	def classify_text_with_alchemy(self, tld, text, apikey):
		if text is None:
		   return
		text = text[:5000] if len(text) > 5000 else text
	
		payload = {
			'text':text,
			'outputMode': 'json',
			'apikey':apikey,
		}
		
		url = "http://access.alchemyapi.com/calls/text/TextGetRankedTaxonomy"
		r =  requests.post(url, params=payload)
		
		try:
			result = r.json()
			logger.debug(result)			
			if result['status'] == "OK":
				maxscore = 0
				label = None
				logger.debug(result['taxonomy'])
				for classification in result['taxonomy']:
					score = classification["score"]

					if score > maxscore:
						maxscore = score
						label = classification["label"]

				if label is not None:
					self.updateclassification(tld=tld, success=True, classifier="alchemy", classification=label, score=maxscore)
				
		except Exception, e:
			logger.debug("error extracting text!")
			logger.debug(r)
			logger.debug(r.content)
			
						
	def classify_urls_with_alchemy(self, tlds, apikey):

		alreadyclassified = self.fetch_classified_tlds()
		limitexceeded = False

		for tld in tlds:

			if limitexceeded:
				return

			if "%s:%s"%(tld['id'],tld['tld']) not in alreadyclassified:

				payload = {
							'url':tld['tld'],
							'outputMode': 'json',
							'apikey':apikey,
						  }
				url = "http://access.alchemyapi.com/calls/url/URLGetRankedTaxonomy"
				r =  requests.get(url, params=payload)
				try:
					result = r.json()
					logger.debug("url %s status %s" % (tld['tld'],result['status']))

					if result['status'] == "OK":
						maxscore = 0
						label = None
   						logger.debug(result['taxonomy'])
						for classification in result['taxonomy']:
							score = classification["score"]

							if score > maxscore:
								maxscore = score
								label = classification["label"]

						if label is not None:
							self.classify(deviceid=tld['id'], tld=tld['tld'], success=True, classifier="alchemy", classification=label, error=None, score=maxscore)
						else:
							self.classify(deviceid=tld['id'], tld=tld['tld'], success=False, classifier="alchemy", classification=None, error="no classification")

					elif result['status'] == "ERROR":

						if result['statusInfo'] == "daily-transaction-limit-exceeded":
							logger.debug("limit exceeded")
							limitexceeded = True
						else:
							self.classify(deviceid=tld['id'], tld=tld['tld'], success=False, classifier="alchemy", classification=None, error=result['statusInfo'])

					#print result
				except Exception, e:
					logger.debug("classify error")
					logger.debug(e)
	
	@reconnect
	def updateclassification(self, deviceid, tld, success, classifier, classification, score):
		try:
			sql = 'UPDATE CLASSIFICATION SET success=%d,score=%f,classification="%s" WHERE tld="%s" AND classifier="%s" AND deviceid="%s" ' % (1, float(score),classification,tld, classifier,deviceid)
			self.cur.execute(sql)
			self.conn.commit()
		except Exception, e:
			logger.debug("error storing in database")
			logger.debug(e)
				
	@reconnect
	def classify(self, deviceid, tld, success, classifier, classification, error=None, score=None):
		tld = tld[:254]
		if success is True:
			try:
				sql = "INSERT INTO CLASSIFICATION (deviceid, tld,success,classifier,score,classification) VALUES (%s,%s,%s,%s,%s,%s)"
				data = (deviceid, tld, 1, classifier, float(score), classification)
				self.cur.execute(sql,data)
				self.conn.commit()
			except Exception, e:
				logger.debug("error storing in database")
				logger.debug(e)

		else:
			try:
				sql = "INSERT INTO CLASSIFICATION(deviceid, tld,success,classifier,error) VALUES (%s,%s,%s,%s,%s)"
				data = (deviceid, tld, 0, classifier, error)
				self.cur.execute(sql,data)
				self.conn.commit()
			except Exception, e:
				logger.debug("error storing in database")
				logger.debug(e)

if __name__ == "__main__":
	cfg = TestingConfig()
	hdlr = logging.FileHandler(cfg.CLASSIFY_LOGFILE or '/var/tmp/ucn_classify.log') 
	formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
	hdlr.setFormatter(formatter)
	logger.addHandler(hdlr)
	logger.setLevel(logging.DEBUG)
	
	classifier = Classifier(name=cfg.DATADB)
	classifier.createTables();
	blocked = []
	with open("ad_domains.txt") as f:
		blocked = [x.strip() for x in f.readlines()]

	toclassify = classifier.fetch_distinct_tlds(blocked)
	classifier.classify_urls_with_alchemy(toclassify,cfg.ALCHEMYAPI)
	#classifier.translate_urls(cfg.ALCHEMYAPI, cfg.ZANDEXAPI)
