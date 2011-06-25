from Module import *

"""
Module to filter files based on a keywords
"""
class FilterFiles(Module):
    name = "File filter - keyword"
    description = "Filters files to include or exclude files based on the filename"
    root = False
    input = "files"
    output = "files"
    settings = {
        "Condition" : Setting("option", options = ["contains", "does not contain", "starts with", "does not start with", "ends with", "does not end with"]),
        "Keyword" : Setting("text", description = "(case insensitive)")
    }

    
    def run(self, files):
        condition = self.settings["Condition"].value
        keyword = self.settings["Keyword"].value.lower()
        output = []
        for file in files:
            if condition == "contains":
                if file.filename.lower().find(keyword) != -1:
                    output.append(file)
            elif condition == "does not contain":
                if file.filename.lower().find(keyword) == -1:
                    output.append(file)
            elif condition == "starts with":
                if file.filename.lower().find(keyword) == 0:
                    output.append(file)
            elif condition == "does not start with":
                if file.filename.lower().find(keyword) != 0:
                    output.append(file)
            elif condition == "ends with":
                if file.filename.lower().rfind(keyword) == len(file.filename) - len(keyword):
                    output.append(file)
            elif condition == "does not end with":
                if file.filename.lower().rfind(keyword) != len(file.filename) - len(keyword):
                    output.append(file)
        return output