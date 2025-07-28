/**
 * Represents a digital asset in the system.
 * Assets can be images, videos, audio files, or other media used in projects.
 */
export interface Asset {
  _id: string;                 // Unique identifier for the asset
  name: string;                // Display name of the asset
  originalFilename?: string;   // Original filename when uploaded
  type: string;                // Type of asset (e.g., 'image', 'video', 'audio')
  url: string;                 // URL to access the asset
  cloudinaryUrl?: string;      // Cloudinary-specific URL if using Cloudinary for storage
  cloudinaryId?: string;       // Cloudinary resource identifier
  mimeType: string;            // MIME type of the asset (e.g., 'image/jpeg')
  fileSize: number;            // Size of the asset in bytes
  size?: number;               // Legacy size property for backward compatibility
  thumbnail?: string;          // URL to thumbnail for images/videos
  tags?: string[];             // Keywords/tags associated with the asset for organization and search
  userId: string;              // ID of the user who owns this asset
  folderId?: string;           // ID of the folder containing this asset
  createdAt: string;           // ISO timestamp of asset creation
  updatedAt: string;           // ISO timestamp of last update
  metadata?: {
    width?: number;            // Width of the asset (if applicable)
    height?: number;           // Height of the asset (if applicable)
  };                            // Additional metadata for the asset
}
