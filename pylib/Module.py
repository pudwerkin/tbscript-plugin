import ScriptUtils

'''
This is a inheritance class for creating Modules.
This Module sets up the necessary methods for a unified interface between
modules and the module factory. 
'''

class Module:
    name = "Error: Unnamed"
    description = "Error: No description"
    root = None
    input = "none"
    output = "none"
    settings = {}
    '''
    Changes the settings of a module
    @param name: name of setting
    @param value: the value to set the setting 
    '''
    @classmethod
    def changeSetting(cls, name, value):
        cls.settings[name].value = value
    """
    @return: Returns whether or not a module is Root
    """
    @classmethod
    def isRoot(cls):
        return cls.root
    """
    Returns the type of data a module needs for input
    @return: The type of data the module requires for input
    """
    @classmethod
    def getInputType(cls):
        return cls.input
    
    """
    Returns the type of data a module outputs
    @return: type of data  module outputs
    """
    @classmethod
    def getOutputType(cls):
        return cls.output
    
    """
    Returns a setting and its value
    @return: Setting and its value as a dictionary
    """
    @classmethod
    def getSetting(cls, name):
        return cls.settings[name]
    
    """
    Returns the name of the module
    @return: the name of module
    """
    @classmethod
    def getName(cls):
        return cls.name
    """
    Returns the description of a module
    @return: the name of the module
    """
    @classmethod
    def getDescription(cls):
        return cls.description

"""
A class that contains a setting information for a module
"""
class Setting:
    def __init__ (self, type, value=None, description="", options=[]):
        self.type = type #The GUI type of a setting
        self.value = value #The value of a setting
        self.description = description # The setting of a setting
        self.options = options #The options that may be in a setting
        if type == "mailfolder":
            self.options = []
            self.value = ScriptUtils.getMessageFileList()[0][0]
            for item in ScriptUtils.getMessageFileList():
                self.options.append(item[0])
        elif type == "account":
            self.options = ScriptUtils.getAccountList()
            self.value = self.options[0]
        elif type == "extension":
            self.options = ["any", ".pdf", ".gif", ".jpg", ".jpeg", ".doc", ".docx", ".zip", ".rar"]
        elif type == "option":
            self.value = self.options[0]
        elif type == "datetime":
            self.value = "unspecified"
        elif type == "text":
            self.value = ""
        elif type == "textoptions":
            self.value = ""
        elif type == "boolean":
            if self.value is None:
                self.value = "true" # default to true
        
        """
        Changes a setting name and value pair
        @param value: The value of a setting  
        """
    def change (self, value):
        self.value = value
        
        