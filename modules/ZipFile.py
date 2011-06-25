"""
Takes files an zips them and then puts them in a desired directory
"""
from Module import *
import ScriptUtils
import os
import zipfile

class ZipFile(Module):
    name = "Output to Zip"
    description = "Outputs files to a zip file"
    input = "files"
    root = False
    settings = {
        "Output File": Setting("file", ScriptUtils.getHomePath() + os.sep + "tbscriptoutput.zip", "Zip file to put contents into. *Overwrites if exists", ["*.zip"])
    }
    
    def run(self, input):
        print "Outputting", len(input), "items"
        output = zipfile.ZipFile (self.settings["Output File"].value, "w")
        for file in input: # assume input is set of something...
            print file.filename
            output.writestr(file.filename, file.data)
        output.close()
            
        