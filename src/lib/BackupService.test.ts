import { BackupService } from './BackupService';
import fs from 'fs';
import path from 'path';

// Mock the 'fs' module
jest.mock('fs');

describe('BackupService', () => {
  const mockDrivePath = 'G:\\My Drive\\Akshara World';
  const folder = 'TestFolder';
  const filename = 'testfile.txt';
  const content = 'Test content';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToDrive', () => {
    it('should create directory if it does not exist and write file', async () => {
      // Setup mock to say directory doesn't exist
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await BackupService.saveToDrive(folder, filename, content);

      const expectedDir = path.join(mockDrivePath, folder);
      const expectedPath = path.join(expectedDir, filename);

      // Verify fs.existsSync was called
      expect(fs.existsSync).toHaveBeenCalledWith(expectedDir);

      // Verify fs.mkdirSync was called with correct arguments
      expect(fs.mkdirSync).toHaveBeenCalledWith(expectedDir, { recursive: true });

      // Verify fs.writeFileSync was called with correct arguments
      expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, content);
    });

    it('should not create directory if it already exists and write file', async () => {
      // Setup mock to say directory exists
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await BackupService.saveToDrive(folder, filename, content);

      const expectedDir = path.join(mockDrivePath, folder);
      const expectedPath = path.join(expectedDir, filename);

      // Verify fs.existsSync was called
      expect(fs.existsSync).toHaveBeenCalledWith(expectedDir);

      // Verify fs.mkdirSync was NOT called
      expect(fs.mkdirSync).not.toHaveBeenCalled();

      // Verify fs.writeFileSync was called with correct arguments
      expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, content);
    });

    it('should handle errors during file write gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Setup mock to say directory exists
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // Mock writeFileSync to throw an error
      const error = new Error('Write failed');
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await BackupService.saveToDrive(folder, filename, content);

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(`[BackupService] Failed to save to Drive`, error);

      consoleErrorSpy.mockRestore();
    });
  });
});