PROJECT = Modello_Multimediaplayer

VERSION := 0.0.2
PACKAGE = $(PROJECT)-$(VERSION)

INSTALL_FILES = $(PROJECT).wgt
INSTALL_DIR = ${DESTDIR}/opt/usr/apps/.preinstallWidgets

wgtPkg:
	zip -r $(PROJECT).wgt components config.xml css icon.png images index.html js

install:
	@echo "Installing Multimediaplayer, stand by..."
	mkdir -p $(INSTALL_DIR)/
	cp $(PROJECT).wgt $(INSTALL_DIR)/

dist:
	tar czf ../$(PACKAGE).tar.bz2 .
