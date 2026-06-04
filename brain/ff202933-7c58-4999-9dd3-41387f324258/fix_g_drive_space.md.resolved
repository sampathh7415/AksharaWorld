# Fix: Google Drive (G:) Phantom Space Usage

The 141GB "phantom" space usage on your G: drive, despite it being empty, is almost certainly due to files still existing in your **Google Drive Trash** or space being consumed by **Google Photos/Gmail**.

## 🛠️ Step 1: Empty Google Drive Trash (Cloud)
When you delete files from the G: drive in Windows, they are moved to the Google Drive Trash in the cloud. They are **not** permanently deleted and still count towards your storage quota.

1. Go to [drive.google.com/drive/trash](https://drive.google.com/drive/trash).
2. Click **Empty trash** at the top right.
3. Wait a few minutes for the G: drive in Windows to refresh.

## 📊 Step 2: Check Shared Storage Usage
Google Drive storage is shared with **Gmail** and **Google Photos**. If you have many photos or large email attachments, they will show up as "Used Space" on the G: drive.

1. Go to [one.google.com/storage](https://one.google.com/storage).
2. Check the breakdown. If Google Photos or Gmail is taking up the 141GB, you will need to clean those up.

## 🔄 Step 3: Refresh Google Drive Desktop (Force Sync)
If the cloud is already empty but the G: drive still shows usage, the local metadata might be stuck.

1. Click the **Google Drive icon** in your system tray (bottom right).
2. Click the **Settings (gear icon)** -> **Quit**.
3. Press `Win + R`, type `%LOCALAPPDATA%\Google\DriveFS`, and press Enter.
4. Delete the folder named with a long string of numbers (this is your local metadata cache).
   > [!NOTE]
   > This will NOT delete your files; it just forces the app to rebuild the index from the cloud.
5. Restart Google Drive from your Start Menu.

## 🧹 Step 4: Search for "Orphaned" Files
Sometimes files lose their parent folder (e.g., if a shared folder was deleted) but remain in your account.
1. In the Google Drive search bar (web version), type: `is:unorganized owner:me`
2. If any files appear, delete them and empty the trash again.
