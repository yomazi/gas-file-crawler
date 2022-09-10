class FileCrawler {
  _getFilesInFolder(parentFolder) {
    const fileIterator = parentFolder.getFiles();
    const filesInFolder = [];
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();

      filesInFolder.push({ name: file.getName().toLowerCase(), googleDriveFolder: parentFolder, googleDriveFile: file });
    }

    return filesInFolder;
  }

  _getAllFiles(parentFolder, previousFiles) {
    const folderName = parentFolder.getName();
    SpreadsheetApp.getActive().toast(`processing files in folder`, folderName);

    let allFiles = previousFiles || [];

    const filesInFolder = this._getFilesInFolder(parentFolder);

    allFiles = allFiles.concat(filesInFolder);

    const folderIterator = parentFolder.getFolders();
    while (folderIterator.hasNext()) {
      const folder = folderIterator.next();
      
      allFiles = this._getAllFiles(folder, allFiles);
    }

    return allFiles;
  }

  catalogFilesFrom(rootFolder) {
    const allFiles = this._getAllFiles(rootFolder);
    SpreadsheetApp.getActiveSpreadsheet().toast("", "done!", 0.01);
    const sortedFiles = allFiles.sort((a, b) => (a.name > b.name) ? 1 : -1);

    return sortedFiles;
  }
}
