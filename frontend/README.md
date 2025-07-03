# AI-Powered Design Tool

A full-stack application that helps users create professional designs quickly using AI-generated content and customizable templates.

## Features

### MVP Features (Current Implementation)
- **Single-page Onboarding Wizard**: Upload logo, pick brand colors, choose vibe
- **Template Gallery**: 20 starter templates filtered by brand vibe  
- **AI Magic Fill**: GPT-powered headline & body copy generation
- **Auto-resize**: One-click resize from 1080x1080 to 1920x1080
- **PNG Export**: Download designs with optional watermark
- **User Authentication**: Email login with JWT tokens
- **Stripe Billing**: Pro subscription ($12/month) removes watermarks

### Target User Flow
1. Sign up ➜ Upload logo
2. Pick two brand colors & a vibe word
3. Land on template gallery filtered by vibe
4. Click template ➜ Magic Fill prompt appears
5. Accept AI suggestions
6. (Optional) Hit Resize to make 16:9 version
7. Export PNG (watermark reminder nudges upgrade)

**Time-to-value target**: < 5 minutes for first exported asset

## Tech Stack

### Frontend (Next.js)
- Next.js 15 with TypeScript and Tailwind CSS
- React components for onboarding, gallery, and editor
- Lucide React icons
- Client-side state management

### Backend (Express.js)
- Express.js server with TypeScript
- MongoDB with Mongoose ODM
- OpenAI API integration for content generation
- Sharp library for image processing
- Stripe for payment processing
- JWT authentication

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone and setup the project**:
```bash
git clone <repository-url>
cd new-app
npm install
```

2. **Setup Backend**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup Frontend**:
```bash
# In root directory
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

### Environment Variables

#### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/design-tool
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Running the Application

1. **Start MongoDB** (if running locally):
```bash
mongod
```

2. **Start the Backend**:
```bash
cd backend
npm run dev
```

3. **Start the Frontend**:
```bash
# In root directory
npm run dev
```

4. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Brand Management
- `POST /api/brand` - Create brand (with logo upload)
- `GET /api/brand` - Get user's brands
- `GET /api/brand/:id` - Get specific brand

### Templates
- `GET /api/templates` - Get templates (filterable by vibe)
- `GET /api/templates/:id` - Get specific template

### AI Content Generation
- `POST /api/ai/magic-fill` - Generate content with OpenAI
- `POST /api/ai/variations` - Generate content variations

### Export
- `POST /api/export/resize` - Auto-resize templates
- `POST /api/export/png` - Export PNG (with watermark)
- `POST /api/export/png-pro` - Export PNG without watermark (Pro only)

### Stripe
- `POST /api/stripe/create-checkout-session` - Create payment session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `POST /api/stripe/customer-portal` - Access billing portal

### Telemetry
- `POST /api/telemetry/track` - Track user events
- `GET /api/telemetry/analytics` - Get analytics data

## Project Structure

```
.
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & other middleware
│   │   └── server.ts       # Express server
│   ├── package.json
│   └── tsconfig.json
├── src/                    # Next.js frontend
│   ├── app/
│   │   ├── onboarding/     # Brand creation wizard
│   │   ├── dashboard/      # Template gallery
│   │   └── editor/         # Design editor
│   └── components/         # Reusable components
├── public/                 # Static assets
├── package.json
└── README.md
```

## Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations
- Track user actions with telemetry
- Test payment flows in Stripe test mode

## Next Steps (v1.0+)

- [ ] Video templates and animations
- [ ] Advanced AI chat interface
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Custom font support
- [ ] Social media scheduling
- [ ] Brand asset management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
