#!/bin/bash

#added by tlodge
/usr/bin/tshark -2 -r /home/txl/pcaptest -R "udp.srcport==53" -T fields -e frame.time_epoch -e ip.dst -e dns.qry.name  -E quote=n -E occurrence=f > /tmp/dns.log

# run db processing script
cd /home/txl/ucn-react/server/scripts && venv/bin/python collect_dns.py
