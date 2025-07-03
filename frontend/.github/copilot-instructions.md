<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI-Powered Design Tool Project Instructions

This is a full-stack AI-powered design tool built with:

## Frontend (Next.js)
- Next.js 15 with TypeScript and Tailwind CSS
- React components for brand onboarding wizard, template gallery, AI content generation
- Auto-resize functionality and export features
- Stripe integration for billing

## Backend (Express.js)
- Express.js server with TypeScript
- MongoDB for data storage
- OpenAI API integration for AI content generation
- Sharp library for image manipulation
- Stripe webhook handling

## Key Features to Implement
1. Single-page onboarding wizard (logo upload, brand colors, vibe selection)
2. Template gallery with 20 starter templates (1080x1080 social posts)
3. AI "Magic Fill" with OpenAI GPT for headline & body copy generation
4. Auto-resize functionality (1080x1080 to 1920x1080)
5. PNG export with watermark system
6. User authentication and Stripe billing
7. Telemetry tracking for user actions

## User Flow Target
Time-to-value: < 5 minutes for first exported asset

Please maintain clean, production-ready code with proper error handling and TypeScript types throughout.
