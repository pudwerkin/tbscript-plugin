'''
This Module loads all of the messages in a specified folder
'''

from Module import *
import mailbox
import ScriptUtils

class getFolder(Module):
    name = "Get Folder"
    description = "This module loads all the messages from a specified folder to feed the next module"
    output = "messages"
    root = True
    settings = {
        "Mailfolder" : Setting("mailfolder", description="Which folder to process")
    }
    
    messages = []
    
    def __init__(self):
        self.folders = {}
        for item in ScriptUtils.getMessageFileList():
            self.folders[item[0]] = item[1]
    
    def run(self):
        folder = self.folders[self.settings["Mailfolder"].value]
        print "Opening", folder
        for message in mailbox.mbox(self.folders[self.settings["Mailfolder"].value]):
            self.messages.append(message)
        return self.messages