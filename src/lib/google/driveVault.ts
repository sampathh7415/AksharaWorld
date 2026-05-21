/**
 * 🗄️ GOOGLE DRIVE & PHOTOS FILE ASSET ADAPTER
 * Mapped to G:\My Drive\Akshara World\
 */
import { resilientFetch } from '../resilience';

export interface DriveFolder {
  name: string;
  path: string;
  filesCount: number;
  sizeMb: number;
  lastSync: string;
}

export interface PhotoAsset {
  id: string;
  title: string;
  url: string;
  category: 'Drawings' | 'Photos' | 'Thumbnails' | 'Veo_Renders';
  createdAt: string;
}

// Initialized mocks conforming to visual directory structure
const localFolders: DriveFolder[] = [
  { name: '01_Capsule', path: '/01_Capsule', filesCount: 1, sizeMb: 0.12, lastSync: new Date().toLocaleDateString('en-IN') },
  { name: '02_Content_Forge', path: '/02_Content_Forge', filesCount: 24, sizeMb: 14.8, lastSync: new Date().toLocaleDateString('en-IN') },
  { name: '03_Media_Studio', path: '/03_Media_Studio', filesCount: 88, sizeMb: 612.4, lastSync: new Date().toLocaleDateString('en-IN') },
  { name: '04_Growth_Engine', path: '/04_Growth_Engine', filesCount: 12, sizeMb: 2.1, lastSync: new Date().toLocaleDateString('en-IN') },
  { name: '05_Revenue_Vault', path: '/05_Revenue_Vault', filesCount: 5, sizeMb: 4.3, lastSync: new Date().toLocaleDateString('en-IN') },
  { name: '06_Tech_Core', path: '/06_Tech_Core', filesCount: 42, sizeMb: 85.0, lastSync: new Date().toLocaleDateString('en-IN') },
  { name: '07_Guardian_Ops', path: '/07_Guardian_Ops', filesCount: 18, sizeMb: 2400.0, lastSync: new Date().toLocaleDateString('en-IN') },
  { name: '08_Insight_Lab', path: '/08_Insight_Lab', filesCount: 65, sizeMb: 12.8, lastSync: new Date().toLocaleDateString('en-IN') },
  { name: '09_File_Reviews', path: '/09_File_Reviews', filesCount: 14, sizeMb: 0.8, lastSync: new Date().toLocaleDateString('en-IN') },
  { name: '10_Upgrade_Proposals', path: '/10_Upgrade_Proposals', filesCount: 30, sizeMb: 1.5, lastSync: new Date().toLocaleDateString('en-IN') }
];

const localPhotos: PhotoAsset[] = [
  { id: 'IMG-001', title: 'SEO_Marketing_Blueprint_Cover.png', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', category: 'Thumbnails', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'IMG-002', title: 'Akshara_World_Octopus_Strategy.svg', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80', category: 'Drawings', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'IMG-003', title: 'Niche_Trends_Analysis_May_2026.png', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80', category: 'Photos', createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'IMG-004', title: 'Veo_Generative_Video_Shorts_Frame.png', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', category: 'Veo_Renders', createdAt: new Date(Date.now() - 28800000).toISOString() }
];

export class DriveVault {
  private static webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL || '';

  public static async getFoldersList(): Promise<DriveFolder[]> {
    if (!this.webhookUrl) {
      return localFolders;
    }

    try {
      const data = await resilientFetch<any>(
        `${this.webhookUrl}?action=getFolders`,
        { method: 'GET', timeout: 5000 },
        { success: true, items: localFolders }
      );
      return data.items || localFolders;
    } catch {
      return localFolders;
    }
  }

  public static async getPhotosList(): Promise<PhotoAsset[]> {
    if (!this.webhookUrl) {
      return localPhotos;
    }

    try {
      const data = await resilientFetch<any>(
        `${this.webhookUrl}?action=getPhotos`,
        { method: 'GET', timeout: 5000 },
        { success: true, items: localPhotos }
      );
      return data.items || localPhotos;
    } catch {
      return localPhotos;
    }
  }

  public static async syncGooglePhotos(): Promise<boolean> {
    if (!this.webhookUrl) {
      // Simulate successful sync
      return new Promise((resolve) => setTimeout(() => resolve(true), 1500));
    }

    try {
      await resilientFetch<any>(
        this.webhookUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'syncPhotos' })
        },
        { success: true }
      );
      return true;
    } catch {
      return false;
    }
  }
}
