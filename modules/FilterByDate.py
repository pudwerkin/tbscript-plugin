from Module import *
import time
from email import email

"""
Module that filters messages by Date
"""
class FilterByDate(Module):
    name = "Message Filter - Date Range"
    description = "Filter messages by date/time information"
    root = False
    input = "messages"
    output = "messages"
    settings = {
        "Start date": Setting("datetime"),
        "End date": Setting ("datetime")
    }
    
    def run(self, messages):
        output = []
        startDate = self.settings["Start date"].value
        endDate = self.settings["End date"].value
        if startDate != "unspecified":
            startDate = time.mktime(time.strptime(startDate, "%m-%d-%Y %H:%M:%S"))
            print "start", startDate
        if endDate != "unspecified":
            endDate = time.mktime(time.strptime(endDate, "%m-%d-%Y %H:%M:%S"))
            print "end", endDate
        for message in messages:
            if message.get("Date") is None:
                print "Message did not have Date header!"
                #print message
                continue
            date = message.get("Date").strip() # From RFC 5322
            date = time.mktime(email.utils.parsedate(date))
            if date is None:
                continue
            if (startDate == "unspecified" or date > startDate) and (endDate == "unspecified" or date < endDate):
                output.append(message)
        print "filter stats (in,out) = (" + str(len(messages)) + ",", str(len(output)) + ")"
        return output
            
            
            