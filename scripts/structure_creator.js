function createMissingFolders() {
  const FOLDER_ID = '17lcOvG7lVxN7FZvuBGsKYX-vQgr6Dt7q';
  let rootFolder;
  try {
    rootFolder = DriveApp.getFolderById(FOLDER_ID);
  } catch (e) {
    const folders = DriveApp.getFoldersByName('Akshara World');
    if (folders.hasNext()) rootFolder = folders.next();
  }

  if (!rootFolder) {
    Logger.log('Could not find root folder');
    return;
  }

  const structure = {
    '00_AI_Instructions': [],
    '01_Capsule': ['history'],
    '02_Sam_Memory': ['vector_store'],
    '03_Dashboard': [],
    '04_Departments': [
      'Content_Forge', 'Media_Studio', 'Growth_Engine', 'Revenue_Vault',
      'Tech_Core', 'Guardian_Ops', 'Insight_Lab', 'Innovation_Scout'
    ],
    '05_Resources': [],
    '06_Backups': [],
    '07_Logs': ['audit', 'alerts', 'three_try_failures'],
    '08_Owner_Vault': [],
    '09_File_Reviews': [],
    '10_Upgrade_Proposals': []
  };

  for (const [parentName, children] of Object.entries(structure)) {
    let parentFolder;
    const parentIter = rootFolder.getFoldersByName(parentName);
    if (parentIter.hasNext()) {
      parentFolder = parentIter.next();
    } else {
      parentFolder = rootFolder.createFolder(parentName);
    }

    for (const childName of children) {
      const childIter = parentFolder.getFoldersByName(childName);
      if (!childIter.hasNext()) {
        parentFolder.createFolder(childName);
      }
    }
  }

  Logger.log('Folder structure generated successfully!');
}
