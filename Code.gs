function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SIE Utilities')
      .addItem('Log contents of My Drive', 'catalogMyDrive')
      .addSeparator()
      .addItem('Log contents of Shared Drives', 'catalogSharedDrives')
      .addToUi();
}

function catalogMyDrive() {
  const catalogBuilder = new CatalogBuilder();
  
  catalogBuilder.catalogMyDrive();
}

function catalogSharedDrives() {
  const catalogBuilder = new CatalogBuilder();

  catalogBuilder.catalogSharedDrives();
}
