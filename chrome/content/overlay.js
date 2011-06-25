var tbscript = {
	/**
	 * Gets the strings for DuckPoin from tbscripts
	 */
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("tbscript-strings");
  },

/**
 * Launches DuckPond after being clicked on from the tool bar
 */
  onToolbarButtonCommand: function(e) {
    if (this.mgrwindow == null || this.mgrwindow.closed) {
      this.mgrwindow = window.openDialog("chrome://tbscript/content/workflowmgr.xul", 
          "workflowmanager", 
          "chrome,centerscreen,resizable"
      );
    } else {
      this.mgrwindow.focus();
    }
  }
};

window.addEventListener("load", tbscript.onLoad, false);
