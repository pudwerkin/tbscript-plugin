from Module import *
from email import email

"""
Filters messages based on a keyword
"""
class FilterMessages(Module):
    name = "Message filter - keyword"
    description = "Filters messages by keywords"
    input = "messages"
    output = "messages"
    root = False
    settings = {
                "Consider" : Setting("option", description="What part of the message to consider", options=["From", "To", "Received", "Subject", "Delivered To"]),
                "Condition" : Setting("option", options = ["contains", "does not contain", "starts with", "does not start with", "ends with", "does not end with"]),
                "Keyword" : Setting("text")
    }

    def run(self, messages):
        output = []
        condition = self.settings["Condition"].value
        keyword = self.settings["Keyword"].value
        considering = self.settings["Consider"].value
        for message in messages:
            item = email.utils.collapse_rfc2231_value(email.utils.decode_rfc2231(message.get(considering)))
            print message.get(considering)
            print item
            if condition == "contains":
                if item.find(keyword) != -1:
                    output.append(message)
            elif condition == "does not contain":
                if item.find(keyword) == -1:
                    output.append(message)
            elif condition == "starts with":
                if item.find(keyword) == 0:
                    output.append(message)
            elif condition == "does not start with":
                if item.find(keyword) != 0:
                    output.append(message)
            elif condition == "ends with":
                if item.rfind(keyword) == len(item) - len(keyword):
                    output.append(message)
            elif condition == "does not end with":
                if item.rfind(keyword) != len(item) - len(keyword):
                    output.append(message)
        print "Filter stats (in,out) (", len(messages), ",", len(output), ")"
        return output