class FileCrawler {
  _getFilesFromFileIterator(fileIterator, parentFolder) {
    const files = [];
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      files.push({ name: file.getName().toLowerCase(), googleDriveFolder: parentFolder, googleDriveFile: file });
    }

    return files;
  }

  _getFilesInFolder(parentFolder) {
    const fileIterator = parentFolder.getFiles();
    const filesInFolder = this._getFilesFromFileIterator(fileIterator, parentFolder);

    return filesInFolder;
  }

  _getFilesFromFolderIterator(folderIterator, allFiles) {
    let files = allFiles.concat();

    while (folderIterator.hasNext()) {
      const folder = folderIterator.next();
      files = this._getAllFiles(folder, files);
    }

    return files;
  }

  _getAllFiles(parentFolder, previousFiles) {
    const folderName = parentFolder.getName();
    SpreadsheetApp.getActive().toast(`processing files in folder`, folderName);

    let allFiles = previousFiles || [];

    const filesInFolder = this._getFilesInFolder(parentFolder);
    const folderIterator = parentFolder.getFolders();

    allFiles = allFiles.concat(filesInFolder);
    allFiles = this._getFilesFromFolderIterator(folderIterator, allFiles);

    return allFiles;
  }

  catalogFilesFrom(rootFolder) {
    const allFiles = this._getAllFiles(rootFolder);
    SpreadsheetApp.getActiveSpreadsheet().toast("", "done!", 1);

    return allFiles;
  }
}
