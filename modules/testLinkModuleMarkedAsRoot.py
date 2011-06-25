'''
Tests a to ensure that a link module marked as root does not appear in the menu
'''
from Module import *
from File import *
import base64

class testLinkModuleMarkedAsRoot(Module):
    name = "Extract attachments(Should not be visible!)"
    description = "Extracts attachments from messages"
    root = True
    input = "messages"
    output = "files"
    settings = {
        "Extension" : Setting("extension", "any"),
        "Exclude inline": Setting("boolean", "false", "If checked, filter out inline attachments")
    }
    
    def run(self, messages):
        ignoredTypes = ["text/plain", "multipart/mixed", "text/html", "message/rfc822"] # found by experimentation
        attachments = []
        print "Get attachments: processing", len(messages), "messages"
        for message in messages:
            if message.get_content_type() == "multipart/mixed":
                for part in message.get_payload():
                    if part.get_content_type() not in ignoredTypes:
                        print part.get_content_type()
                        disposition = part.get("Content-Disposition")
                        if disposition is None:
                            print "Ignoring", message.get("Subject"), " - no disposition"
                            continue
                        disposition = disposition.split(";")
                        filename = None
                        for item in disposition:
                            item = item.strip()
                            if item.split("=")[0] == "filename":
                                filename = item.split("=")[1]
                        if filename != None:
                            filename = filename.strip("\"")
                            filename = filename.replace("\r", "")
                            filename = filename.replace("\n", "")
                            print "Adding attachment", filename
                            content = part.get_payload()
                            encoding = part.get("Content-Transfer-Encoding")
                            if encoding == "base64":
                                content = base64.b64decode(content)
                            else:
                                print "uh-oh"
                                continue
                            if (self.settings["Exclude inline"].value == "true"):
                                if "inline" in disposition:
                                    print "Filtering (inline)", filename
                                    continue
                            if (self.settings["Extension"].value != "any"):
                                extension = self.settings["Extension"].value
                                if filename.lower().rfind(extension) != len(filename) - len(extension):
                                    print "ignoring (extension)", filename
                                    continue
                            attachments.append(File(filename, content))
                            
        return attachments