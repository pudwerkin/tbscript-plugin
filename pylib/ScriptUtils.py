from xpcom import components
from Module import Module,Setting
import inspect
"""
This has miscellaneous scripts that modules may neet to access
"""
import inspect

def getExtensionPath ():
    extensionPath = components.classes["@mozilla.org/extensions/manager;1"].\
        getService(components.interfaces.nsIExtensionManager).\
        getInstallLocation("tbscript@wm.edu").\
        getItemLocation("tbscript@wm.edu").path
    return extensionPath

"""
The path to a home directory
@return: Home directory path
"""
def getHomePath ():
    path = components.classes["@mozilla.org/file/directory_service;1"].\
        getService(components.interfaces.nsIProperties).\
        get("Home", components.interfaces.nsIFile).path;
    return path

"""
It gets the various files that may contain a message
@return: list of files that contain messages
"""
def getMessageFileList ():
    acctMgr = components.classes["@mozilla.org/messenger/account-manager;1"]\
        .getService(components.interfaces.nsIMsgAccountManager)
    filelist = []
    for i in range (acctMgr.accounts.Count()):
        account = acctMgr.accounts.QueryElementAt(i, components.interfaces.nsIMsgAccount)
        rootFolder = account.incomingServer.rootFolder
        if not rootFolder.hasSubFolders:
            filelist.append((rootFolder.prettiestName, rootFolder.filePath.path))
        else:
            subFolders = rootFolder.subFolders
            while subFolders.hasMoreElements():
                folder = subFolders.getNext().QueryInterface(components.interfaces.nsIMsgFolder)
                if not folder.hasSubFolders:
                    filelist.append(("/".join((rootFolder.prettiestName, folder.prettiestName)), folder.filePath.path))
                else:
                    subSubFolders = folder.subFolders
                    while subSubFolders.hasMoreElements():
                        subFolder = subSubFolders.getNext().QueryInterface(components.interfaces.nsIMsgFolder)
                        if not subFolder.hasSubFolders:
                            filelist.append(("/".join((rootFolder.prettiestName, folder.prettiestName, subFolder.prettiestName)), subFolder.filePath.path))
    return filelist

"""
Gets a list of email accounts
"""
def getAccountList():
    acctMgr = components.classes["@mozilla.org/messenger/account-manager;1"]\
        .getService(components.interfaces.nsIMsgAccountManager)
    accountlist = []
    for i in range (acctMgr.accounts.Count()):
        account = acctMgr.accounts.QueryElementAt(i, components.interfaces.nsIMsgAccount)
        rootFolder = account.incomingServer.rootFolder
        accountlist.append(rootFolder.prettiestName)
        
    return accountlist

"""
Verifies if a Module is correct and function

"""
def verifyModule(module):
    if not issubclass (module, Module):
        print "not a module"
        return False
    if not isinstance(module.name, basestring):
        print "name not str"
        return False
    if not isinstance(module.description, basestring):
        print "desc not str"
        return False
    if not isinstance(module.root, bool):
        print "root not bool"
        return False
    if not isinstance(module.input, basestring):
        print "input not str"
        return False
    if not isinstance(module.output, basestring):
        print "output not str"
        return False
    if not isinstance(module.settings, dict):
        print "settings not dict"
        return False
    # Make sure root module does not take arguments.
    if module.root and len(inspect.getargspec(getattr(module, "run"))[0]) != 1:
        return False
    # Make sure non-root module can take 1 argument in run.
    if (not module.root) and len(inspect.getargspec(getattr(module,"run"))[0]) != 2:
        return False
    for settingname in module.settings.keys():
        if not isinstance (settingname, str):
            print "setting name not str"
            return False
    for setting in module.settings.values():
        if not isinstance (setting, Setting):
            print "setting value not setting"
            return False
        if not isinstance(setting.type, basestring):
            print "setting type not str"
            return False
        if not isinstance(setting.description, basestring):
            print "setting desc not str"
            return False
        if not isinstance(setting.options, list):
            print "setting option not list"
            return False
        for option in setting.options:
            if not isinstance (option, basestring):
                print "option not str"
                return False
            
    return True