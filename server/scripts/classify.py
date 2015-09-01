from config import TestingConfig
import psycopg2
import requests

def reconnect(fn):
	print "in conncet decorator"
	""" decorator to reconnect to the database if needed """
	def wrapped(self, *args, **kwargs):
		if self.connected is not True:
			self.connect()
		return fn(self, *args, **kwargs)
	return wrapped

class Classifier( object ):
	''' classdocs '''

	def __init__( self, name):
		print "IN INIT!"
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
			except Exception, e:
				print e
				print "unable to connect to the database!"
				
	@reconnect
	def createTables(self):
	
		print "in create tables!!"
		#try:
			#self.cur.execute('''CREATE TABLE CLASSIFICATION (
			#						id serial PRIMARY KEY,
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
		sql = "SELECT DISTINCT(httphost) FROM http3 %s" % whereclause 
		
		try:
			self.cur.execute(sql)
			return [row[0] for row in self.cur.fetchall()]
		except Exception, e:
			print e
			return []
	

	@reconnect
	def fetch_classified_tlds(self, classifier):
		sql = "SELECT DISTINCT(tld) FROM CLASSIFICATION WHERE classifier='%s' " % classifier
		self.cur.execute(sql)
		classified = {}

		for row in self.cur.fetchall():
			classified[row[0]] = True

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
		print " in translate urls"
		totranslate = self.fetch_to_translate("alchemy")
		limitexceeded = False
		
		for tld in totranslate:
			
			print "translating %s" % tld
			
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
 					print result['statusInfo']
					if result['statusInfo'] == "daily-transaction-limit-exceeded":
						print "limit exceeded"
						limitexceeded = True
			
			else:
			   print "result is none!"
	
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
			print "url %s status %s" % (tld,result['status'])
					
		except Exception, e:
			print "error extracting text!"
			print e
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
			print "error extracting text!"
			print e
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
		print "text len is "
	        print len(text)
		print text	
		url = "http://access.alchemyapi.com/calls/text/TextGetRankedTaxonomy"
		r =  requests.post(url, params=payload)
		
		try:
			print "converting alchemy result"
			result = r.json()
			print result			
			if result['status'] == "OK":
				maxscore = 0
				label = None
				print result['taxonomy']
				for classification in result['taxonomy']:
					score = classification["score"]

					if score > maxscore:
						maxscore = score
						label = classification["label"]

				if label is not None:
					self.updateclassification(tld=tld, success=True, classifier="alchemy", classification=label, score=maxscore)
				
		except Exception, e:
			print "Exception ----->"
			print r
			print r.content
			print e
						
	def classify_urls_with_alchemy(self, tlds, apikey):

		alreadyclassified = self.fetch_classified_tlds("alchemy")
		limitexceeded = False

		for tld in tlds:

			if limitexceeded:
				return

			if tld not in alreadyclassified:

				payload = {
							'url':tld,
							'outputMode': 'json',
							'apikey':apikey,
						  }
				url = "http://access.alchemyapi.com/calls/url/URLGetRankedTaxonomy"
				r =  requests.get(url, params=payload)
				try:
					result = r.json()
					print "url %s status %s" % (tld,result['status'])

					if result['status'] == "OK":
						maxscore = 0
						label = None
   						print result['taxonomy']
						for classification in result['taxonomy']:
							score = classification["score"]

							if score > maxscore:
								maxscore = score
								label = classification["label"]

						if label is not None:
							self.classify(tld=tld, success=True, classifier="alchemy", classification=label, error=None, score=maxscore)
						else:
							self.classify(tld=tld, success=False, classifier="alchemy", classification=None, error="no classification")

					elif result['status'] == "ERROR":

						if result['statusInfo'] == "daily-transaction-limit-exceeded":
							print "limit exceeded"
							limitexceeded = True
						else:
							self.classify(tld=tld, success=False, classifier="alchemy", classification=None, error=result['statusInfo'])

					#print result
				except:
					print "oh well - error!"
	
	@reconnect
	def updateclassification(self, tld, success, classifier, classification, score):
		try:
			sql = 'UPDATE CLASSIFICATION SET success=%d,score=%f,classification="%s" WHERE tld="%s" AND classifier="%s" ' % (1, float(score),classification,tld, classifier)
			print sql
			self.cur.execute(sql)
			self.conn.commit()
		except Exception, e:
			print "error storing in database"
			print e
				
	@reconnect
	def classify(self, tld, success, classifier, classification, error=None, score=None):

		if success is True:
			try:
				sql = "INSERT INTO CLASSIFICATION (tld,success,classifier,score,classification) VALUES (%s,%s,%s,%s,%s)"
				data = (tld, 1, classifier, float(score), classification)
				self.cur.execute(sql,data)
				self.conn.commit()
			except Exception, e:
				print "error storing in database"
				print e

		else:
			try:
				sql = "INSERT INTO CLASSIFICATION(tld,success,classifier,error) VALUES (%s,%s,%s,%s)"
				data = (tld, 0, classifier, error)
				self.cur.execute(sql,data)
				self.conn.commit()
			except Exception, e:
				print "error storing in database"
				print e

if __name__ == "__main__":
	cfg = TestingConfig()
	print "using dbase %s" % cfg.DATADB
	classifier = Classifier(name=cfg.DATADB)
	classifier.createTables();
	blocked = []
	with open("ad_domains.txt") as f:
		blocked = [x.strip() for x in f.readlines()]

	toclassify = classifier.fetch_distinct_tlds(blocked)
	
	print "ok to classify is"
	print toclassify
	print "****"
	
	classifier.classify_urls_with_alchemy(toclassify,cfg.ALCHEMYAPI)
	#classifier.translate_urls(cfg.ALCHEMYAPI, cfg.ZANDEXAPI)
