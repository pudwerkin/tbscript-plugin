"""
Module that outputs attachment files to a directory
"""
from Module import *
import os

class OutputFiles(Module):
    name = "Output Files"
    description = "Outputs files to the set directory"
    input = "files"
    root = False
    settings = {
        "Output Directory": Setting("directory", ScriptUtils.getHomePath(), "Directory to output the file(s) to")
    }
    
    def run(self, input):
        print "Outputting", len(input), "items"
        for file in input: # assume input is set of something...
            output = open(self.settings["Output Directory"].value + os.sep + file.filename, "w")
            output.write(file.data)
            output.close()
            
        