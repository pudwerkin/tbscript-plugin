var workflow = Components.classes["@tbscript.wm.edu/Workflow;1"].getService(Components.interfaces.IWorkflow);
var mf = Components.classes["@tbscript.wm.edu/ModuleFactory;1"].getService(Components.interfaces.IModuleFactory);
var nsIFilePicker = Components.interfaces.nsIFilePicker;
var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);

/**
 * Sets up the file picker for saving and loading workflows
 */
fp.appendFilter("Workflow", "*.wflow");
fp.displayDirectory = Components.classes["@mozilla.org/file/directory_service;1"].
	getService(Components.interfaces.nsIProperties).
	get("Home", Components.interfaces.nsIFile);
var workflowExtension = "wflow"
fp.defaultExtension = workflowExtension;
fp.defaultString = "workflow" + "." + workflowExtension;

var workflowmgr = {
  availableNodes: null,
  rootModules: null,
  /**
   * Clears any previous workflow and sets up GUI for the workflow
   */
  init: function() {
	workflow.clear(); // clear the workflow, in case user closed window
	var rootModuleList = document.getElementById("rootModuleList");
	var count = 0;
	this.rootModules = mf.getRootModuleList(new Array());
	for (var i = 0; i < this.rootModules.length; i+=3) {
	  var listitem = document.createElement("menuitem")
	  listitem.setAttribute("id", this.rootModules[i+1]);
	  listitem.setAttribute("value", this.rootModules[i]);
	  listitem.setAttribute("label", this.rootModules[i+1]);
	  listitem.setAttribute("tooltiptext", this.rootModules[i+2]);
	  rootModuleList.appendChild(listitem);
	}
	if (this.rootModules.length > 0) {
      var rootMenu = document.getElementById("rootMenu");
      rootMenu.setAttribute("disabled", "false");
      rootMenu.selectedIndex = 0;
      this.setRootModule();
    }
  },
  /**
   * Sets up GUI for choosing the root module and communicates with Workflow once
   * module has been selected. Additionally, updates the GUI once root module has been
   * selected
   */
  setRootModule: function() {
    var moduleName = document.getElementById("rootMenu").selectedItem.value;
    workflow.setRootModule (moduleName);
    var settings = workflow.getSettings (0, new Array());
    if (settings.length > 0) {
    	button = document.getElementById ("rootSettings");
    	button.setAttribute ("oncommand", "workflowmgr.changeSettings(0)");
    	button.setAttribute("disabled", "false");
    	var settingsString = "";
    	for (i = 0; i < settings.length; i+=3) {
    		var name = settings[i];
    		var value = settings[i+2];
    		settingsString += name + ": ";
    		settingsString += value;
    		if (i + 3 < settings.length) {
    			settingsString += ", ";
    		}
    	}
    	document.getElementById ("0settings").textContent = settingsString;
    }
    else {
    	button = document.getElementById ("rootSettings");
    	button.setAttribute("disabled", "true");
    	document.getElementById ("0settings").textContent = "";
    }
  },
  /**
   * Updates GUI with the settings information for a provided moduleID
   * @param provided moduleID
   */
  updateSettings : function(moduleID) {
	  var settings = workflow.getSettings (moduleID, new Array());
	  var settingsString = "";
	  for (i = 0; i < settings.length; i+=3) {
		  var name = settings[i];
		  var value = settings[i+2];
		  settingsString += name + ": ";
		  settingsString += value;
		  if (i + 3 < settings.length) {
			  settingsString += ", ";
			  }
		  }
	  document.getElementById (moduleID + "settings").textContent = settingsString;
  },
  /**
   * Updates the GUI and governs adding a new link module
   */
  appendModule: function() {
    var module = {fileName: null};
    window.openDialog("chrome://tbscript/content/modulelist.xul", "modulelist", "modal,dialog,left=0,top=100,resizable", module, workflow.getOutputType());
	if (module.fileName != null && module.fileName != "error") {
      var moduleID = workflow.appendModule(module.fileName);
      var settings = workflow.getSettings (moduleID, new Array());
      if (settings.length > 0)
    	  var button = document.createElement("button");
      var item = document.createElement("richlistitem");
      var bigbox = document.createElement ("vbox");
      var hbox = document.createElement ("hbox");
      var label = document.createElement("label");
      var description = document.createElement("description");
      //description.setAttribute("crop", "end");
      var spacer = document.createElement("spacer");
      var name = workflow.getModuleName(moduleID);
      var descriptiontxt = workflow.getModuleDescription(moduleID);
      if (settings.length > 0) {
    	  button.setAttribute("label", "Change Settings");
    	  button.setAttribute("oncommand", "workflowmgr.changeSettings(" + moduleID + ")");
      }
      label.setAttribute("value", name);
      label.setAttribute("class", "modulename");
      description.textContent = descriptiontxt;
      description.setAttribute("style", "text-align:right");
      spacer.setAttribute("flex", "1");
      
      var vbox = document.createElement("vbox");
      vbox.setAttribute("flex", "1");
      vbox.appendChild(description);
      
      
      hbox.appendChild(label);
      hbox.appendChild(spacer);
      hbox.appendChild(vbox);
      hbox.setAttribute("flex", "1");
      bigbox.setAttribute("flex", "1");
      bigbox.appendChild(hbox);
      item.appendChild(bigbox);
      if (settings.length > 0) {
    	  hbox.appendChild(button);
    	  var hbox2 = document.createElement("hbox");
    	  var spacer2 = document.createElement("spacer");
    	  spacer2.setAttribute("width", "50px");
    	  hbox2.setAttribute("flex", "1");
    	  var settingsList = document.createElement("description");
    	  var label2 = document.createElement("label");
    	  label2.setAttribute("value", "Settings:");
    	  settingsList.setAttribute("id", moduleID + "settings");
    	  settingsList.textContent = "";
    	  hbox2.appendChild(spacer2);
    	  hbox2.appendChild(label2);
    	  hbox2.appendChild(settingsList);
    	  bigbox.appendChild(hbox2);
      }
      var modulelist = document.getElementById("workflowModuleList");
      modulelist.appendChild(item);
      var empty = document.getElementById("empty");
      if (empty) {
    	modulelist.removeChild(empty);
      }
      this.updateSettings(moduleID);
	}
  },
  /**
   * Refreshes the GUI view such as after loading a work flow
   * @param numModules the number of modules being loaded in a workflow
   */
  updateView: function(numModules) {
	  // Set root
	  var rootList = document.getElementById("rootMenu");
	  if (rootList == null)
		  alert ("uh-oh - no root list found.")
	  var rootName = workflow.getModuleName(0);
	  var selectIt = document.getElementById(rootName);
	  if (selectIt == null)
		  alert("Uh-oh couldn't select root module");
	  rootList.selectedItem = selectIt;
	  this.updateSettings(0);
	  
	  var moduleList = document.getElementById("workflowModuleList")
	  // Clear modules
	  while (moduleList.hasChildNodes()) {
		  moduleList.removeChild(moduleList.firstChild);
	  }
	  for (var i = 1; i < numModules; i++) {
		  var moduleID = i;
	      var settings = workflow.getSettings (moduleID, new Array());
	      if (settings.length > 0)
	    	  var button = document.createElement("button");
	      var item = document.createElement("richlistitem");
	      var bigbox = document.createElement ("vbox");
	      var hbox = document.createElement ("hbox");
	      var label = document.createElement("label");
	      var description = document.createElement("description");
	      //description.setAttribute("crop", "end");
	      var spacer = document.createElement("spacer");
	      var name = workflow.getModuleName(moduleID);
	      var descriptiontxt = workflow.getModuleDescription(moduleID);
	      if (settings.length > 0) {
	    	  button.setAttribute("label", "Change Settings");
	    	  button.setAttribute("oncommand", "workflowmgr.changeSettings(" + moduleID + ")");
	      }
	      label.setAttribute("value", name);
	      label.setAttribute("class", "modulename");
	      description.textContent = descriptiontxt;
	      description.setAttribute("style", "text-align:right");
	      spacer.setAttribute("flex", "1");
	      
	      var vbox = document.createElement("vbox");
	      vbox.setAttribute("flex", "1");
	      vbox.appendChild(description);
	      
	      
	      hbox.appendChild(label);
	      hbox.appendChild(spacer);
	      hbox.appendChild(vbox);
	      hbox.setAttribute("flex", "1");
	      bigbox.setAttribute("flex", "1");
	      bigbox.appendChild(hbox);
	      item.appendChild(bigbox);
	      if (settings.length > 0) {
	    	  hbox.appendChild(button);
	    	  var hbox2 = document.createElement("hbox");
	    	  var spacer2 = document.createElement("spacer");
	    	  spacer2.setAttribute("width", "50px");
	    	  hbox2.setAttribute("flex", "1");
	    	  var settingsList = document.createElement("description");
	    	  var label2 = document.createElement("label");
	    	  label2.setAttribute("value", "Settings:");
	    	  settingsList.setAttribute("id", moduleID + "settings");
	    	  settingsList.textContent = "";
	    	  hbox2.appendChild(spacer2);
	    	  hbox2.appendChild(label2);
	    	  hbox2.appendChild(settingsList);
	    	  bigbox.appendChild(hbox2);
	      }
	      moduleList.appendChild(item);
	      this.updateSettings(moduleID);
	  }
  },
  /**
   * Changes a settings for a module
   * @param moduleID to change
   */
  changeSettings: function(moduleID) {
	  window.openDialog("chrome://tbscript/content/modulesettings.xul", "modulesettings", "modal,dialog,resizable", moduleID);
	  this.updateSettings(moduleID);
  },
  /**
   * Starts the GUI for loading a workflow
   */
  load: function() {
	fp.init(window, "Load Workflow", nsIFilePicker.modeOpen);
	var result = fp.show();
	if (result == nsIFilePicker.returnOK) {
	  var file = fp.file.path;
	  var numModules = workflow.loadWorkflow(file);
	  this.updateView(numModules);
	}
  },
  /**
   * Removes a module from the end of a workflow (unimplemented)
   */
  removeModuleFromEnd: function() {
    alert ("unimplemented");
  },
  /**
   * Starts the GUI to save a worfklow
   */
  save: function() {
	fp.init(window, "Save Workflow", nsIFilePicker.modeSave);
    var result = fp.show();
	if (result == nsIFilePicker.returnOK || result == nsIFilePicker.returnReplace) {
	  var file = fp.file.path;
	  workflow.saveWorkflow(file);
	}
  }
};