import fs from 'fs';
import path from 'path';

export class BackupService {
  private static DRIVE_PATH = ['G:', 'My Drive', 'Akshara World'].join(path.sep);

  public static async saveToDrive(folder: string, filename: string, content: string): Promise<void> {
    try {
      const targetDir = path.join(this.DRIVE_PATH, folder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetPath = path.join(targetDir, filename);
      fs.writeFileSync(targetPath, content);
      console.log(`[BackupService] Successfully saved to Drive: ${targetPath}`);
    } catch (e) {
      console.error(`[BackupService] Failed to save to Drive`, e);
    }
  }

  public static async backupSessionLog(log: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    await this.saveToDrive('07_Logs', `session_${timestamp}.md`, log);
  }

  public static async updateCapsule(capsule: string): Promise<void> {
    await this.saveToDrive('01_Capsule', 'capsule_latest.md', capsule);
  }
}
