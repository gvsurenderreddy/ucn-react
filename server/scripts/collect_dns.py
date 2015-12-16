from datalogger import DataLogger
from collectdb import CollectDB
from os import path
import logging
from datetime import datetime
import time
from config import TestingConfig
from tld import get_tld

logger = logging.getLogger( "collect_logger" )

def duplicate(ts,host, domain, lastline):
	if lastline is None:
		return False
	return ts == lastline['ts'] and host == lastline['host'] and domain == lastline['domain']

def lookup(host):
	device = datalogger.deviceid_for_host(host)
	return device
		
def insert_dns(datafile):
	
	device = None
	lookedup = []
	
	logger.debug("adding data from dns logs")	
	#fpos = collectdb.fetch_filepos_for('dns')
	fpos = 0
	if fpos > path.getsize(datafile):
		logger.debug("resetting fpos to 0 (%d > %d)" % ((fpos+1), path.getsize(datafile)))
		fpos = 0

	logger.debug("reading from file position %d, dns file size is %d" % (fpos,path.getsize(datafile)))
	lastline = None
	
	if fpos < path.getsize(datafile):
		with open(datafile) as f:
			f.seek(fpos)
			content = f.readlines()
			lines = []
			for line in content:
				tokens = line.split()
				
				if len(tokens) >= 3:
					ts = "%s000" % tokens[0].split(".")[0]
					hlist = tokens[1].split(".")
				
					if len(hlist) >= 5:
						hlist = hlist[:4]
				
					host = ".".join(hlist)
					#fine to only search for device once as each file if for a specific device!
					if device is None:
						if host not in lookedup:
							device = lookup(host)
							lookedup.append(host)
						
					domain = tokens[2]
					try:
						#print "gettimg http://%s" % domain
						res = get_tld("http://%s"%domain,fail_silently=False)
						#print "VALID!!!"
						if domain[len(domain)-1] == ".":
							domain = domain[:-1]
					
						if not duplicate(ts,host,domain, lastline):
							lines.append({'ts':ts,'host':host,"domain":domain})
					
						lastline = {'ts':ts,'host':host,"domain":domain}
						
					except Exception,e:
						pass
						#print "ERROR: %s" % domain
									
			logger.debug("adding %d new entries" % len(lines))
			#print device
			if device is not None:
				datalogger.bulk_insert_dns(device, lines)
				#collectdb.update_filepos(int(time.mktime(datetime.now().timetuple())), f.tell(),'dns')	
				logger.debug("written %d bytes of dns log to db" % (f.tell() - fpos))	

if __name__ == "__main__":
	cfg = TestingConfig()
	hdlr = logging.FileHandler(cfg.DNS_LOGFILE or '/var/tmp/ucn_dns.log') 
	formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
	hdlr.setFormatter(formatter)
	logger.addHandler(hdlr)
	logger.setLevel(logging.DEBUG)

	collectdb = CollectDB()
	#collectdb.createTables()
	datalogger = DataLogger()
	#insert_dns(cfg.DNSLOG)
	insert_dns(cfg.DNSLOG)