var mf = Components.classes["@tbscript.wm.edu/ModuleFactory;1"].getService(Components.interfaces.IModuleFactory);
var workflow = Components.classes["@tbscript.wm.edu/Workflow;1"].getService(Components.interfaces.IWorkflow);
var moduleID = window.arguments[0];
var nsIFilePicker = Components.interfaces.nsIFilePicker;
var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);

/**
 * Zero pad's numbers to ensure that they are the right length used for time and date
 * @param value the value to pad
 * @param length the length that the value should be padded to
 * @returns {String} the padded value
 */
function zeroPad(value, length) {
	var string = ""
	string += value;
	while (string.length < length)
		string = "0"+string;
	return string
};

var modulesettings = {
		/**
		 * Initializes the module settings menu and creates a dynamic GUI of 
		 * these settings as read from a module
		 */
		init: function() {
			var settingsList = document.getElementById("settingsContainer");
			var settings = workflow.getSettings (moduleID, new Array());
			for (i = 0; i < settings.length; i+=3) {
				var groupbox = document.createElement ("groupbox");
				//groupbox.setAttribute ("style", "max-width: 100px; overflow:none");
				var name = settings[i];
				var type = settings[i+1];
				var value = settings[i+2];
				
				var label = document.createElement ("caption")
				label.textContent = name + ":";
				groupbox.appendChild (label);
				
				var settingDescription = workflow.getSettingDescription (moduleID, name);
				if (settingDescription != "") {
					description = document.createElement ("description");
					description.setAttribute ("style", "font-style: italic");
					description.textContent = settingDescription;
					groupbox.appendChild (description);
				}
				
				var settingElement = this.createSettingGUIElement (name,type,value);
				groupbox.appendChild (settingElement);
				
				settingsList.appendChild(groupbox);
			}
		},
		/**
		 * Pulls the date and time from GUI elements (if a date is needed) and passes it
		 * to workflow
		 */
		updateDateTime: function(name) {
			var now = new Date();
			var date = document.getElementById("date_" + name);
			var time = document.getElementById("time_" + name);
			var datestring = zeroPad(date.month+1,2) + "-" + zeroPad(date.date,2) + "-" + date.year;
			if (date.month == null)
				datestring = zeroPad(now.getMonth()+1,2) + "-" + zeroPad(now.getDate(),2) + "-" + now.getFullYear();
			var timestring = zeroPad(time.hour,2) + ":" + zeroPad(time.minute,2) + ":" + zeroPad(time.second,2);
			if (time.hour == null)
				timestring = zeroPad(now.getHours(), 2) + ":" + zeroPad(now.getMinutes(),2) + ":" + zeroPad(now.getSeconds(),2);
			var datetimestring = datestring + " " + timestring
			workflow.changeSetting(moduleID, name, datetimestring);
		},
		/**
		 * Parses the provided string into a date
		 */
		parseDate: function(string) {
			var month = parseInt(string.slice(0,2),10);
			var day = parseInt(string.slice(3,5),10);
			var year = parseInt(string.slice(6,10),10);
			var hour = parseInt(string.slice(11,13),10);
			var minute = parseInt(string.slice(14,16),10);
			var second = parseInt(string.slice(17,19),10);
			var d = new Date(year, month, day, hour, minute, second);
			if (d == null)
				alert("uh-oh. date object not created correctly...");
			return d;
		},
		/**
		 * Creates a GUI element based on a provided setting type. Adds a name in
		 * front and sets value to the predefined setting
		 */
		createSettingGUIElement: function(name,type,value) {
			switch (type) {
			case "textoptions":
				var menulist = document.createElement("menulist");
				var menupopup = document.createElement("menupopup");
				menulist.setAttribute("editable", "true");
				menulist.setAttribute("onkeyup", "workflow.changeSetting(" + moduleID + ", '" + name + "', this.value)");
				menulist.setAttribute("oncommand", "workflow.changeSetting(" + moduleID + ", '" + name + "', this.value)");
				//menulist.inputField.setAttribute("oncommand", "workflow.changeSetting(" + moduleID + ", '" + name + "', this.value)");
				menulist.appendChild(menupopup);
				
				var options = workflow.getSettingOptions(moduleID, name, new Array());
				for (var i = 0; i < options.length; i++) {
					var option = document.createElement("menuitem");
					option.setAttribute("id", options[i]);
					option.setAttribute("value", options[i]);
					option.setAttribute("label", options[i]);
					if (value == options[i])
						option.setAttribute("selected", "true");
					menupopup.appendChild(option);
				}
				
				return menulist;
			case "datetime":
				var vbox = document.createElement("vbox");
				var radiogroup = document.createElement("radiogroup");
				var radio1 = document.createElement("radio");
				radio1.setAttribute("label", "Unspecified");
				radio1.setAttribute("value", "n/a");
				radio1.setAttribute("oncommand", "document.getElementById('datetime_" + name + "').hidden = 'true'; workflow.changeSetting(" + moduleID + ", '" + name + "', 'unspecified');");
				radiogroup.appendChild(radio1);
				var radio2 = document.createElement("radio");
				radio2.setAttribute("label", "Specific Date/Time");
				radio2.setAttribute("value", "specified");
				radio2.setAttribute("oncommand", "document.getElementById('datetime_" + name + "').hidden = ''; modulesettings.updateDateTime('" + name + "')");
				radiogroup.appendChild(radio2);
				
				if (value == "unspecified")
					radio1.setAttribute("selected", "true");
				else
					radio2.setAttribute("selected", "true");
						
				
				vbox.appendChild(radiogroup);
				var hbox = document.createElement("hbox");
				hbox.setAttribute("id", "datetime_" + name);
				hbox.hidden = "true";
				var datepicker = document.createElement("datepicker");
				datepicker.setAttribute("id", "date_" + name);
				datepicker.setAttribute("type", "popup");
				datepicker.setAttribute("oncommand", "modulesettings.updateDateTime('" + name + "')");
				datepicker.setAttribute("onkeyup", "modulesettings.updateDateTime('" + name + "')");
				var timepicker = document.createElement("timepicker");
				timepicker.setAttribute("id", "time_" + name);
				timepicker.setAttribute("oncommand", "modulesettings.updateDateTime('" + name + "')");
				timepicker.setAttribute("onkeyup", "modulesettings.updateDateTime('" + name + "')");
				hbox.appendChild(datepicker);
				hbox.appendChild(timepicker);
				vbox.appendChild(hbox);
				// init date and time
				if (value != "unspecified") {
					hbox.hidden = "";
					var date = this.parseDate(value);
					datepicker.setAttribute("value", date.getFullYear() + "-" + zeroPad(date.getMonth(),2) + "-" + zeroPad(date.getDate(),2));
					timepicker.setAttribute("value", zeroPad(date.getHours(),2) + ":" + zeroPad(date.getMinutes(),2) + ":" + zeroPad(date.getSeconds(),2))
				}
				return vbox;
			case "option":
				var radiogroup = document.createElement("radiogroup");
				radiogroup.setAttribute("oncommand", "workflow.changeSetting(" + moduleID + ", '" + name + "', this.value)");
				var options = workflow.getSettingOptions(moduleID, name, new Array());
				for (var i = 0; i < options.length; i++) {
					var radio = document.createElement("radio");
					radio.setAttribute("label", options[i]);
					radio.setAttribute("value", options[i]);
					if (value == options[i])
						radio.setAttribute("selected", "true");
					radiogroup.appendChild(radio);
				}
				return radiogroup
			case "float":
				var textbox = document.createElement ("textbox");
				textbox.setAttribute ("type", "number");
				textbox.setAttribute ("decimalplaces", "2");
				textbox.setAttribute ("onkeyup", "workflow.changeSetting(" + moduleID + ",'" + name + "', this.value)");
				textbox.setAttribute ("oncommand", "workflow.changeSetting(" + moduleID + ",'" + name + "', this.value)");
				textbox.setAttribute ("value", value);
				return textbox;
			case "integer":
				var textbox = document.createElement ("textbox");
				textbox.setAttribute ("type", "number");
				textbox.setAttribute ("onkeyup", "workflow.changeSetting(" + moduleID + ",'" + name + "', this.value)");
				textbox.setAttribute ("oncommand", "workflow.changeSetting(" + moduleID + ",'" + name + "', this.value)");
				textbox.setAttribute ("value", value);
				return textbox;
			case "text":
				var textbox = document.createElement ("textbox");
				textbox.setAttribute("onkeyup", "workflow.changeSetting(" + moduleID + ",'" + name + "', this.value)");
				textbox.setAttribute("value", value);
				return textbox;
			case "boolean":
				var box = document.createElement("box");
				var command = document.createElement("command");
				command.setAttribute("id", "cmd"+name);
				command.setAttribute("oncommand", "workflow.changeSetting(" + moduleID + ",'" + name + "', document.getElementById('" + name + "checkbox').getAttribute('checked') == 'true' ? 'true' : 'false')");
				var checkbox = document.createElement("checkbox");
				if (value == "true")
					checkbox.setAttribute("checked", "true");
				checkbox.setAttribute("command", "cmd"+name);
				checkbox.setAttribute("id", name+"checkbox");
				checkbox.setAttribute("label", name);
				box.appendChild(command);
				box.appendChild(checkbox);
				return box;
			case "extension":
				var menulist = document.createElement("menulist");
				var menupopup = document.createElement("menupopup");
				menulist.setAttribute("editable", "true");
				menulist.setAttribute("onkeyup", "workflow.changeSetting(" + moduleID + ", '" + name + "', this.value)");
				menulist.setAttribute("oncommand", "workflow.changeSetting(" + moduleID + ", '" + name + "', this.value)");
				//menulist.inputField.setAttribute("oncommand", "workflow.changeSetting(" + moduleID + ", '" + name + "', this.value)");
				menulist.appendChild(menupopup);
				
				var options = workflow.getSettingOptions(moduleID, name, new Array());
				for (var i = 0; i < options.length; i++) {
					var option = document.createElement("menuitem");
					option.setAttribute("id", options[i]);
					option.setAttribute("value", options[i]);
					option.setAttribute("label", options[i]);
					if (value == options[i])
						option.setAttribute("selected", "true");
					menupopup.appendChild(option);
				}
				
				return menulist;
			case "file":
				var hbox = document.createElement ("hbox");
				var spacer = document.createElement ("spacer");
				spacer.setAttribute ("flex", "2");
				hbox.appendChild(spacer);
				hbox.setAttribute("flex", "1");
				var vbox = document.createElement ("vbox");
				var description = document.createElement ("description");
				var spacer1 = document.createElement ("spacer");
				var spacer2 = document.createElement ("spacer");
				spacer2.setAttribute ("flex", "1");
				vbox.appendChild (description);
				description.setAttribute ("id", name);
				vbox.setAttribute("flex", "1");
				description.textContent = value;
				description.setAttribute("width", "250px");
				description.setAttribute("clip", "start");
				var button = document.createElement ("button");
				button.setAttribute ("oncommand", "modulesettings.getFile(\"" + name + "\")")
				button.setAttribute("label", "Browse...");
				hbox.appendChild(vbox);
				hbox.appendChild(button);
				return hbox;
			case "mailfolder":
				var options = workflow.getSettingOptions(moduleID, name, new Array());
				var menulist = document.createElement("menulist");
				var menupopup = document.createElement("menupopup");
				menulist.setAttribute ("oncommand", "workflow.changeSetting(" + moduleID + ", \"" + name + "\", this.selectedItem.value)");
				menulist.appendChild(menupopup);
				var selectedIndex = -1;
				for (i = 0; i < options.length; i++) {
					var option = document.createElement("menuitem");
					option.setAttribute("label", options[i]);
					option.setAttribute("value", options[i]);
					menupopup.appendChild(option);
					if (value == options[i])
						option.setAttribute("selected", "true");
				}
				return menulist;
			case "account":
				var options = workflow.getSettingOptions(moduleID, name, new Array());
				var radiogroup = document.createElement ("radiogroup");
				radiogroup.setAttribute ("id", name);
				radiogroup.setAttribute ("oncommand", "workflow.changeSetting(" + moduleID + ", \"" + name + "\", this.selectedItem.value)");
				var selectedIndex = -1;
				for (i = 0; i < options.length; i++) {
					var option = document.createElement ("radio");
					option.setAttribute ("label", options[i]);
					option.setAttribute ("value", options[i]);
					if (value == options[i])
						option.setAttribute ("selected", "true")
					radiogroup.appendChild(option);
				}
				return radiogroup;
			case "directory":
				var hbox = document.createElement ("hbox");
				var spacer = document.createElement ("spacer");
				spacer.setAttribute ("flex", "1");
				hbox.appendChild(spacer);
				var vbox = document.createElement ("vbox");
				var description = document.createElement ("label");
				var spacer1 = document.createElement ("spacer");
				spacer1.setAttribute ("flex", "1");
				var spacer2 = document.createElement ("spacer");
				spacer2.setAttribute ("flex", "1");
				vbox.appendChild (spacer1);
				vbox.appendChild (description);
				vbox.appendChild (spacer2);
				description.setAttribute ("id", name);
				description.textContent = value;
				var button = document.createElement ("button");
				button.setAttribute ("oncommand", "modulesettings.getDirectory(\"" + name + "\")")
				button.setAttribute ("label", "Browse...");
				hbox.appendChild(vbox);
				hbox.appendChild(button);
				return hbox;
			default:
				var placeholder = document.createElement ("description");
				placeholder.textContent = "Error: unrecognized setting type: " + type + " (value = " + value + ")";
				return placeholder;
			}
		},
		/**
		 * Shows a directory dialog for selecting a file
		 */
		getDirectory: function(settingName) {
			fp.init(window, "Choose a directory", nsIFilePicker.modeGetFolder);
			var result = fp.show();
			if (result == nsIFilePicker.returnOK) {
				workflow.changeSetting (moduleID, settingName, fp.file.path);
				document.getElementById (settingName).textContent = fp.file.path;
			}
		},
		/**
		 * For setting type file, that shows the file picker dialog
		 */
		getFile: function(settingName) {
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			var options = workflow.getSettingOptions(moduleID, settingName, new Array());
			for (var i = 0; i < options.length; i++)
				fp.appendFilter(options[i], options[i]);
			fp.init(window, "Choose a file", nsIFilePicker.modeSave);
			var result = fp.show();
			if (result == nsIFilePicker.returnOK || result == nsIFilePicker.returnReplace) {
				workflow.changeSetting (moduleID, settingName, fp.file.path);
				document.getElementById (settingName).textContent = fp.file.path;
			}
		}
};