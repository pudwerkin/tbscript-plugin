from Module import *
import re
from email import email

"""
Filters messages based on a regular expression
"""
class FilterRegExp(Module):
    name = "Message filter - RE"
    description = "Regular expression message filter. Think grep."
    input = "messages"
    output = "messages"
    root = False
    settings = {
                "Header" : Setting("textoptions", description="Which header to check with a regular expression. Consult RFC 5322.", options=["From", "To", "Received", "Subject", "Delivered To"]),
                "Regular expression" : Setting ("text", description="Regular expression using Python's regular expression module"),
                "Match/Search" : Setting ("option", description="Match means the string and pattern must match. Search means the string contains the pattern.", options=["match", "search"]),
                "Ignore Case" : Setting ("boolean", "false")
    }
    
    def run(self, messages):
        output = []
        flags = re.MULTILINE | re.DOTALL
        header = self.settings["Header"].value
        regexp = self.settings["Regular expression"].value
        matchOrSearch = self.settings["Match/Search"].value
        if self.settings["Ignore Case"].value == 'true':
            flags |= re.IGNORECASE
        for message in messages:
            mheader = message.get(header)
            if mheader is None:
                print "Ignoring message: didn't have", header, "header"
                continue
            mheader = email.utils.collapse_rfc2231_value(email.utils.decode_rfc2231(mheader))
            if matchOrSearch == "match":
                if re.match(regexp, mheader, flags):
                    output.append(message)
            else:
                if re.search(regexp, mheader, flags):
                    output.append(message)
        return output
            
            
        