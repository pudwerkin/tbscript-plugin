import os
import imp
import ScriptUtils
from xpcom import components
from xml.dom import minidom

promptService = components.classes["@mozilla.org/embedcomp/prompt-service;1"]\
				.getService(components.interfaces.nsIPromptService);
				
'''The actual Workflow containing modules'''
class Workflow:
	_com_interfaces_ = [components.interfaces.IWorkflow]
	_reg_clsid_ = "{2572a9b1-889b-43d2-8807-336af3c5141f}"
	_reg_contractid_ = "@tbscript.wm.edu/Workflow;1"
	_reg_desc_ = "Workflow for TB scripting"
	
	modules = [] #Holds the modules in the workflow
	
	'''Initalizes the modules'''
	def __init__ (self):
		self.modulePath = ScriptUtils.getExtensionPath() + os.sep + "modules"
		self.mf = components.classes["@tbscript.wm.edu/ModuleFactory;1"].\
			getService(components.interfaces.IModuleFactory)
		
	
	def runWorkflow (self):
		try:
			print str(self.modules)
			output = self.modules[0].run()
			for item in self.modules[1:]:
				output = item.run(output)
				promptService.alert(None, "Workflow complete", "The workflow is done.")
			return True
		except Exception as e:
			promptService.alert(None, "Error", "Workflow had an error:\n" + str(e))
			return False
			
	
	def getSettings (self, moduleID):
		# Return name, type, value
		settingsList = []
		module = self.modules[moduleID]
		for item in module.settings.items():
			name = item[0]
			setting = item[1]
			settingsList.extend([name, setting.type, str(setting.value)])
		return settingsList
			
	def getSettingOptions (self, moduleID, settingName):
		optionsList = []
		module = self.modules[moduleID]
		for option in module.settings[settingName].options:
			optionsList.append(str(option))
		return optionsList
	
	def getSettingDescription (self, moduleID, settingName):
		module = self.modules[moduleID]
		return module.settings[settingName].description
					
	def changeSetting (self, moduleID, settingID, value):
		self.modules[moduleID].settings[settingID].value = value;
		print "Setting", settingID, "to", value
		return True;
		
	def loadWorkflow (self, filename):
		oldModules = self.modules
		self.clear()
		try:
			root = minidom.parse(filename)
			for moduleNode in root.getElementsByTagName("module"):
				moduleID = self.appendModule (moduleNode.getAttribute("filename"))
				for setting in moduleNode.getElementsByTagName("setting"):
					self.changeSetting(moduleID, setting.getAttribute("name"), setting.getAttribute("value"))
			return len(self.modules)
		except Exception as e:
			self.clear()
			self.modules = oldModules
			promptService.alert(None, "Error", "Error loading workflow:\n" + str(e))
			return len(self.modules)
		
	def saveWorkflow (self, filename):
		try:
			document = minidom.getDOMImplementation().createDocument(None, "workflow", None)
			root = document.documentElement
			for module in self.modules:
				moduleElement = minidom.Element("module")
				moduleElement.setAttribute("filename", module.__module__ + ".py")
				for setting in module.settings.items():
					if setting[1].value is not None:
						settingElement = minidom.Element("setting")
						settingElement.setAttribute("name", setting[0])
						settingElement.setAttribute("value", str(setting[1].value))
						moduleElement.appendChild(settingElement)
				root.appendChild(moduleElement)
			wflow = open(filename, "w")
			wflow.write(document.toprettyxml())
			wflow.close()
			return True
		except Exception as e:
			promptService.alert(None, "Error", "Error saving module:\n" + str(e))
		
	def appendModule (self, moduleName):
		# load module
		print "loading", moduleName
		module = getattr(imp.load_source(moduleName[:-3], self.modulePath + os.sep + moduleName), moduleName[:-3])
		if not ScriptUtils.verifyModule(module):
			raise Exception
		self.modules.append(module())
		return len(self.modules) - 1
	
	def getModuleName (self, moduleID):
		return self.modules[moduleID].getName()
	
	def getModuleDescription (self, moduleID):
		return self.modules[moduleID].getDescription()
		
	def setRootModule (self, moduleName):
		module = getattr(imp.load_source(moduleName[:-3], self.modulePath + os.sep + moduleName), moduleName[:-3])
		if len(self.modules) != 0:
			self.modules.pop(0)
		self.modules.insert (0, module())
		return True
		
	def removeModuleFromEnd (self):
		assert False, "Not implemented"
		
	def clear (self):
		self.modules = []
		
	def getOutputType(self):
		return self.modules[-1].output

PYXPCOM_CLASSES = [
	Workflow,
]