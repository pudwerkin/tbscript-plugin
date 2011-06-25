'''
Module Gets all of the  messages for an account
'''

from Module import *
import mailbox
import ScriptUtils

class testModulewithNoIdentification(Module):
    name = "Get Account Messages (Should Not Be Visible!)"
    description = "This module loads all the messages in a specified account"
    root = None
    output = "messages"
    settings = {
        "Account" : Setting("account", description="Which account to process")
    }
    
    messages = []
    
    def __init__(self):
        self.folders = {}
        for account in self.settings["Account"].options:
            self.folders[account] = []
        folders = ScriptUtils.getMessageFileList()
        for folder in ScriptUtils.getMessageFileList():
            for account in self.settings["Account"].options:
                if folder[0].find(account) == 0:
                    self.folders[account].append(folder[1])
                    
    
    def run(self):
        for folder in self.folders[self.settings["Account"].value]:
            for message in mailbox.mbox(folder):
                self.messages.append(message)
        return self.messages