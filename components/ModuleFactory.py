import os
import imp
import ScriptUtils
from xpcom import components

"""
This class access the modules and gets the desired modules based on the current
method. It is the "go-between" for the software and the modules
"""
class ModuleFactory:
    _com_interfaces_ = [components.interfaces.IModuleFactory]
    _reg_clsid_ = "{4959cffa-aa24-4f12-b61e-e599eb1da4ea}"
    _reg_contractid_ = "@tbscript.wm.edu/ModuleFactory;1"
    _reg_desc_ = "ModuleFactory component"

    rootModules = [] #Discovered Root Modules
    nodeModules = [] #Discovered Node Modules
    '''Notes
        -looking at [key1, name1, description1, key2, name2, description2]
    '''
    """
    Initializes and sorts Modules based on whether they are root or link modules
    """
    def __init__ (self):
        '''TODO: check module type...'''
        self.modulePath = ScriptUtils.getExtensionPath() + os.sep + "modules"
        for moduleFile in os.listdir(self.modulePath):
            if moduleFile[-3:] == ".py": # if it's a python file, import it
                # load python file for module, load class from file
                try:
                    module = getattr(imp.load_source(moduleFile[:-3], self.modulePath + os.sep + moduleFile), moduleFile[:-3])
                except:
                    continue
                if not ScriptUtils.verifyModule(module):
                    print moduleFile, "not a module"
                    continue
                if module.isRoot():
                    self.rootModules.append(module)
                else:
                    self.nodeModules.append(module)      
    
    """
    Gets the list of root modules
    @return: List of Root Modules
    """
    def getRootModuleList (self):
        moduleList = []
        for module in self.rootModules:
            moduleList.append(module.__name__ + ".py")
            moduleList.append(module.getName())
            moduleList.append(module.getDescription())
        return moduleList
        
        """
        Gets a list of leaf/Node modules
        @return: List of node/lead modules
        """
    def getNodeModuleList (self):
        moduleList = []
        for module in self.nodeModules:
            moduleList.append(module.__name__ + ".py")
            moduleList.append(module.getName())
            moduleList.append(module.getDescription())
            moduleList.append(module.input)
            moduleList.append(module.output)
        return moduleList
        
PYXPCOM_CLASSES = [
    ModuleFactory,
]
        