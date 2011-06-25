var mf = Components.classes["@tbscript.wm.edu/ModuleFactory;1"].getService(Components.interfaces.IModuleFactory);
var module = window.arguments[0];
var validType = window.arguments[1];
var workflow

var modulelist = {
		/**
		 * Sets up the GUI for displaying a list of valid link modules
		 */
		init: function() {
			var availableNodes = mf.getNodeModuleList(new Array());
			var moduleList = document.getElementById("moduleList");
			if (availableNodes.length > 0)
				moduleList.removeChild(document.getElementById("error"));
			//Goes through each module, validates it ,creates a GUI, and displays it
			//if it is a valid module
			for (var i = 0; i < availableNodes.length; i+=5) {
				var listitem = document.createElement("richlistitem");
				listitem.setAttribute("id", availableNodes[i]);
				listitem.setAttribute("style", "overflow:hidden");
				
				var label = document.createElement ("label");
				label.setAttribute("value", availableNodes[i+1]);
				label.setAttribute("class", "modulename");
				listitem.appendChild(label);
				
				var description = document.createElement("description");
				var vbox = document.createElement("vbox");
				var spacer = document.createElement("spacer");
				spacer.setAttribute("flex", "1");
				vbox.setAttribute("flex", "1");
				description.textContent = availableNodes[i+2];
				description.setAttribute("style","text-align:right");
				//description.setAttribute("crop", "end");
				vbox.appendChild(description);
				listitem.appendChild(spacer);
				listitem.appendChild(vbox);
				listitem.setAttribute("tooltiptext", availableNodes[i+2]);
				listitem.setAttribute("input", availableNodes[i+3]);
				listitem.setAttribute("output", availableNodes[i+4]);
				if (!(validType == "none" || (availableNodes[i+3] != validType && availableNodes[i+3] != "any")))
					moduleList.appendChild(listitem);
			}
			if (availableNodes.length > 0)
				moduleList.setAttribute("disabled", "false");
		},
		/**
		 * Called when the user hits accept if the user select a module
		 * @return whether or a not a user selected a module
		 * @return module.filName returns the fileName of the module
		 */
		selectModule: function() {
			var list = document.getElementById("moduleList");
			module.fileName = list.getSelectedItem(0).id;
			if (module.fileName != null && module.fileName != "error")
				return true;
			else
				return false;
		}
};