# Templates API Configuration

This file outlines the environment variables and configuration needed for the Templates API routes.

## Environment Variables

Add these to your `.env.local` file:

```bash
# Backend API Configuration
BACKEND_API_URL=http://localhost:3001

# If you're using authentication, add these as well:
# BACKEND_API_KEY=your-api-key
# JWT_SECRET=your-jwt-secret
```

## Backend API Endpoints Expected

The Next.js API routes will proxy to these backend endpoints:

### Templates CRUD
- `GET /templates` - Get all templates with filters
- `GET /templates/:id` - Get template by ID
- `POST /templates` - Create new template
- `PUT /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template
- `DELETE /templates/bulk` - Delete multiple templates

### Special Template Endpoints
- `GET /templates/featured/all` - Get featured templates
- `GET /templates/popular/all` - Get popular templates
- `GET /templates/category/:category` - Get templates by category
- `GET /templates/presets/all` - Get template presets
- `GET /templates/paginated` - Get paginated templates
- `POST /templates/from-project/:projectId` - Create template from project
- `POST /templates/:id/use` - Use template to create project

## Testing the API Routes

You can test the API routes using curl or a tool like Postman:

```bash
# Get all templates
curl http://localhost:3000/api/templates

# Get template by ID
curl http://localhost:3000/api/templates/123

# Create new template
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Template","type":"custom"}'

# Get featured templates
curl http://localhost:3000/api/templates/featured

# Get paginated templates
curl "http://localhost:3000/api/templates/paginated?page=1&limit=10"
```

## Error Handling

All API routes implement consistent error handling:
- 400: Bad Request (validation errors)
- 500: Internal Server Error (backend issues)
- Success responses return appropriate status codes (200, 201)

## Security Considerations

Consider implementing:
1. Authentication middleware
2. Rate limiting
3. Input validation
4. CORS configuration
5. API key validation for backend requests

## File Structure Created

```
src/app/api/templates/
├── _utils.ts                  # Shared utilities
├── route.ts                   # GET /api/templates, POST /api/templates
├── [id]/
│   ├── route.ts              # GET, PUT, DELETE /api/templates/[id]
│   └── use/
│       └── route.ts          # POST /api/templates/[id]/use
├── bulk/
│   └── route.ts              # DELETE /api/templates/bulk
├── category/
│   └── [category]/
│       └── route.ts          # GET /api/templates/category/[category]
├── featured/
│   └── route.ts              # GET /api/templates/featured
├── from-project/
│   └── [projectId]/
│       └── route.ts          # POST /api/templates/from-project/[projectId]
├── paginated/
│   └── route.ts              # GET /api/templates/paginated
├── popular/
│   └── route.ts              # GET /api/templates/popular
└── presets/
    └── route.ts              # GET /api/templates/presets
```
