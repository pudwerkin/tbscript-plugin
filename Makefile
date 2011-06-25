# This Makefile currently builds under linux. YMMV with other platforms.
GECKO_SDK_PATH ?= $(HOME)/xulrunner-sdk# adjust this to suit your setup
XPIDLDIR ?= $(GECKO_SDK_PATH)/idl # only needed for building xpt file
VPATH = idl
COMPONENTS = components/IWorkflow.xpt components/IModuleFactory.xpt

default: $(COMPONENTS) ../tbscript.xpi

components/%.xpt: %.idl
	@echo "Generating XPT file for $<"
	@xpidl -I $(XPIDLDIR) -m typelib -e $@ $<

../tbscript.xpi: * */* */*/*
	@echo "Creating tbscript.xpi"
	rm -f tbscript.xpi
	zip -r tbscript.xpi * -x Makefile \*/.svn/\* tbscript.xpi
	
clean:
	rm -f tbscript.xpi
	rm -f components/*.xpt
