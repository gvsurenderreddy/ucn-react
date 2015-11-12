from os import path
from datetime import datetime
import time
from config import TestingConfig
from tld import get_tld

def bulk_insert_urls(content):
	
	for line in content:

			items = line.split()
			deviceid=1
			
			if len(items) < 9:
				print "error parsing line"
				print line
			else:
				if ("http" in items[8]  and "//" in items[8]):
					parts  = items[8].split("//")[1].split("/")

					domain = parts[0]	
					res = get_tld(items[8], as_object=True, fail_silently=True)

					if res is not None:
						tld = "%s.%s" % (res.domain, res.suffix)
					else:
						tld = parts[0]
						
					
					path = ""
					if len(parts) > 0:
						path = "".join(parts[1:])
					
					if items[11].split("/")[1].strip() == "-":
						dest = "0.0.0.0"
					else:
						dest = items[11].split("/")[1]
						
					#url = {'ts':items[2].split(".")[0], 'host':items[4], 'tld':tld, 'domain':domain, 'path': path}
					url = {'ts':items[2].replace(".",""), 
							'host':items[4], 
							'tld':tld, 
							'domain':domain, 
							'path': path, 
							'verb':items[7],
							'clength':items[6],
							'statuscode':items[5].split("/")[1],
							'dest':  dest,
							'contenttype':items[12],
						}
					
					try:
						data = (deviceid,url['verb'],url['path'], url['statuscode'],url['tld'], url['contenttype'], url['clength'], url['host'], url['dest'], url['ts'])			
						print url['dest']
					except Exception, e:
						print e


def insert_urls(datafile):
	
	
	print "adding data from squid logs"
	fpos = 0

	try:
		if fpos < path.getsize(datafile):
			with open(datafile) as f:
				f.seek(fpos)
				content = f.readlines()
				print "adding %d new entries" % len(content)
				#logger.debug("%s" % content)
				bulk_insert_urls(content)
				#collectdb.update_filepos(int(time.mktime(datetime.now().timetuple())), f.tell(),'squid')
				#logger.debug("written %d bytes of squid log to db" % (f.tell() - fpos))
		else: #reset fpos to 0
			if fpos > 0:
				print("reset fpos to 0")
				#collectdb.update_filepos(int(time.mktime(datetime.now().timetuple())), 0,'squid')	
			
	except Exception, e:
		print "error adding data from squid file"
		print e

if __name__ == "__main__":
    insert_urls('access.test.log')