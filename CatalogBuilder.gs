const DRIVE = "drive#drive";

class CatalogBuilder {
  constructor() {
    const spreadsheet = SpreadsheetApp.getActive();

    this._ss = spreadsheet;
    this._sheet = this._ss.getActiveSheet();
    this._fileCrawler = new FileCrawler();
  }

  _isSheetEmpty(sheet) {
    return sheet.getDataRange().getValues().join("") === "";
  }

  _getNextSheetName(name) {
    const date = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd hh:mm:ss")
    const sheetName = `${name} ${date}`;

    return sheetName;
  }

  _getEmptySheet(name) {
    const sheetName = this._getNextSheetName(name);    
    let sheet = this._sheet;

    if (!this._isSheetEmpty(sheet)) {
      const ss = this._ss;
      sheet = ss.insertSheet(0);
    }

    this._sheet = sheet.setName(sheetName);
    return this._sheet;
  }

  _createLink(fileOrFolder) {
    const link = SpreadsheetApp.newRichTextValue()
      .setText(fileOrFolder.getName())
      .setLinkUrl(fileOrFolder.getUrl())
      .build();

    return link;
  }

  _getRichTextFormattedDate(date) {
    const formattedDate = Utilities.formatDate(date, "GMT+7", "MMMM dd, yyyy");
    const richTextFormattedDate = SpreadsheetApp.newRichTextValue()
      .setText(formattedDate)
      .build();

    return richTextFormattedDate;
  }

  _createCatalog(files) {
    const catalog = files.map(file => [
      this._createLink(file.googleDriveFile),
      this._createLink(file.googleDriveFolder),
      this._getRichTextFormattedDate(file.googleDriveFile.getDateCreated()),
      this._getRichTextFormattedDate(file.googleDriveFile.getLastUpdated())
    ]);

    return catalog;    
  }

  _addHeader(sheet) {
    sheet.appendRow(["filename", "folder", "created", "last updated"]);

    const fullRange = sheet.getRange(1, 1, 1, 4);
    const bold = SpreadsheetApp.newTextStyle().setBold(true).build();

    fullRange.setTextStyle(bold);
    fullRange.setBackground("whitesmoke");

    const dateRange = sheet.getRange(1, 3, 1, 2);
    
    dateRange.setHorizontalAlignment("right");
  }
  
  _addCatalog(sheet, catalog) {
    const lastRow = SpreadsheetApp.getActiveSheet().getLastRow();
    const row = lastRow + 1;
    const column = 1;
    const numRows = catalog.length;
    const numColumns = 4;
    const range = sheet.getRange(row, column, numRows, numColumns);

    range.setRichTextValues(catalog);
  }

  _catalogFiles(sheet, files) {
    const catalog = this._createCatalog(files);
    
    this._addHeader(sheet);
    this._addCatalog(sheet, catalog);

    sheet.autoResizeColumns(1, 4);
  }

  _catalogDrive(sheet, rootFolder) {
    const fileCrawler = this._fileCrawler;
    const files = fileCrawler.catalogFilesFrom(rootFolder);

    this._catalogFiles(sheet, files);    
  }

  _getRootFolderInfo() {
    const rootFolder = DriveApp.getRootFolder();
    const userName = rootFolder.getOwner().getName();

    return { rootFolder, userName };
  }

  catalogMyDrive() {
    const { rootFolder, userName } = this._getRootFolderInfo();
    const sheet = this._getEmptySheet(userName);    

    this._catalogDrive(sheet, rootFolder);
  }

  _catalogSharedDrive(drive, userName) { 
      const sheetName = `${drive.name} - ${userName}`;
      const sheet = this._getEmptySheet(sheetName);
      const rootFolder = DriveApp.getFolderById(drive.id);   

      this._catalogDrive(sheet, rootFolder);
  }

  catalogSharedDrives() {
    const { userName } = this._getRootFolderInfo();
    const response = Drive.Drives.list();
    const drives = response.items;

    drives.forEach(drive => {
      const kind = drive.kind;

      if (kind === DRIVE) {
        this._catalogSharedDrive(drive, userName);
      }
    });          
  }    
}
