"""
Module that prints a log of any given object. 
"""
from Module import *
import ScriptUtils
import os
from datetime import datetime

class Log(Module):
    name = "Log"
    description = "Logs a string representation of the given input to a file"
    input = "any"
    root = False
    settings = {
        "Log Directory": Setting("directory", ScriptUtils.getHomePath(), "Directory to output log file(s) to")
    }
    
    def run(self, input):
        print "logging", len(input), "items"
        logfile = open(self.settings["Log Directory"].value + os.sep + "tbscript-" + str(datetime.now()) + ".log", "w")
        for item in input: # assume input is set of something...
            logfile.write(str(item))
        logfile.close()
            
        