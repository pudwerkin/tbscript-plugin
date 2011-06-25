from Module import *
import mailbox
import ScriptUtils

"""
Gets all of the messages in Thunderbird for processing
"""
class getAllMessages(Module):
    name = "Get All Messages"
    description = "Gets all of your messages for processing"
    root = True
    output = "messages"
    
    def run(self):
        files = ScriptUtils.getMessageFileList()
        messages = []
        for file in files:
            for message in mailbox.mbox(file[1]):
                messages.append(message)
        return messages