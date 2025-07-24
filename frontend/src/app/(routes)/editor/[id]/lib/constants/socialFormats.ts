/**
 * Social media format configurations for canvas resizing
 */

export interface SocialFormat {
  width: number;
  height: number;
  name: string;
  category: string;
}

export const SOCIAL_MEDIA_FORMATS: Record<string, SocialFormat> = {
  // Instagram
  "instagram-square": { width: 1080, height: 1080, name: "Instagram Square Post", category: "Instagram" },
  "instagram-portrait": { width: 1080, height: 1350, name: "Instagram Portrait Post", category: "Instagram" },
  "instagram-landscape": { width: 1080, height: 566, name: "Instagram Landscape Post", category: "Instagram" },
  "instagram-story": { width: 1080, height: 1920, name: "Instagram Story", category: "Instagram" },
  "instagram-reel": { width: 1080, height: 1920, name: "Instagram Reel", category: "Instagram" },
  "instagram-profile": { width: 110, height: 110, name: "Instagram Profile Picture", category: "Instagram" },
  "instagram-highlight-cover": { width: 161, height: 161, name: "Instagram Highlight Cover", category: "Instagram" },

  // TikTok
  "tiktok-video": { width: 1080, height: 1920, name: "TikTok Video", category: "TikTok" },
  "tiktok-profile": { width: 200, height: 200, name: "TikTok Profile Picture", category: "TikTok" },

  // YouTube
  "youtube-thumbnail": { width: 1280, height: 720, name: "YouTube Thumbnail", category: "YouTube" },
  "youtube-shorts": { width: 1080, height: 1920, name: "YouTube Shorts", category: "YouTube" },
  "youtube-channel-art": { width: 2560, height: 1440, name: "YouTube Channel Art", category: "YouTube" },
  "youtube-profile": { width: 800, height: 800, name: "YouTube Profile Picture", category: "YouTube" },
  "youtube-end-screen": { width: 1280, height: 720, name: "YouTube End Screen", category: "YouTube" },

  // Facebook
  "facebook-post": { width: 1200, height: 630, name: "Facebook Post", category: "Facebook" },
  "facebook-story": { width: 1080, height: 1920, name: "Facebook Story", category: "Facebook" },
  "facebook-cover": { width: 1200, height: 315, name: "Facebook Cover Photo", category: "Facebook" },
  "facebook-profile": { width: 170, height: 170, name: "Facebook Profile Picture", category: "Facebook" },
  "facebook-event-cover": { width: 1920, height: 1080, name: "Facebook Event Cover", category: "Facebook" },
  "facebook-ad": { width: 1200, height: 628, name: "Facebook Ad", category: "Facebook" },

  // Twitter / X
  "twitter-post": { width: 1200, height: 675, name: "Twitter/X Post", category: "Twitter" },
  "twitter-header": { width: 1500, height: 500, name: "Twitter/X Header", category: "Twitter" },
  "twitter-profile": { width: 400, height: 400, name: "Twitter/X Profile Picture", category: "Twitter" },
  "twitter-card": { width: 1200, height: 628, name: "Twitter/X Card", category: "Twitter" },

  // LinkedIn
  "linkedin-post": { width: 1200, height: 627, name: "LinkedIn Post", category: "LinkedIn" },
  "linkedin-story": { width: 1080, height: 1920, name: "LinkedIn Story", category: "LinkedIn" },
  "linkedin-cover": { width: 1584, height: 396, name: "LinkedIn Cover Photo", category: "LinkedIn" },
  "linkedin-profile": { width: 400, height: 400, name: "LinkedIn Profile Picture", category: "LinkedIn" },
  "linkedin-company-logo": { width: 300, height: 300, name: "LinkedIn Company Logo", category: "LinkedIn" },
  "linkedin-ad": { width: 1200, height: 627, name: "LinkedIn Ad", category: "LinkedIn" },

  // Pinterest
  "pinterest-pin": { width: 1000, height: 1500, name: "Pinterest Pin (2:3)", category: "Pinterest" },
  "pinterest-square": { width: 1000, height: 1000, name: "Pinterest Square Pin", category: "Pinterest" },
  "pinterest-long": { width: 1000, height: 2100, name: "Pinterest Long Pin", category: "Pinterest" },
  "pinterest-board-cover": { width: 222, height: 150, name: "Pinterest Board Cover", category: "Pinterest" },

  // Standard
  "square-1-1": { width: 1080, height: 1080, name: "Square (1:1)", category: "Standard" },
  "landscape-16-9": { width: 1920, height: 1080, name: "Landscape (16:9)", category: "Standard" },
  "portrait-9-16": { width: 1080, height: 1920, name: "Portrait (9:16)", category: "Standard" },
  "wide-21-9": { width: 2560, height: 1080, name: "Ultra Wide (21:9)", category: "Standard" },

  // Print Materials
  "a4-portrait": { width: 2480, height: 3508, name: "A4 Portrait", category: "Print" },
  "a4-landscape": { width: 3508, height: 2480, name: "A4 Landscape", category: "Print" },
  "letter-portrait": { width: 2550, height: 3300, name: "Letter Portrait", category: "Print" },
  "letter-landscape": { width: 3300, height: 2550, name: "Letter Landscape", category: "Print" },
  "business-card": { width: 1050, height: 600, name: "Business Card", category: "Print" },
  "postcard": { width: 1875, height: 1275, name: 'Postcard (6x4")', category: "Print" },
};

export const SOCIAL_FORMAT_CATEGORIES = Array.from(
  new Set(Object.values(SOCIAL_MEDIA_FORMATS).map(format => format.category))
);
