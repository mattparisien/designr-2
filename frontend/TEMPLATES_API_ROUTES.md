# Templates API Routes - Next.js Implementation Guide

This document outlines all the Next.js API routes that need to be implemented to support the TemplatesAPI class.

## Required API Routes

### 1. GET Routes

#### Get All Templates
- **Path**: `/api/templates`
- **Method**: `GET`
- **Query Parameters**: 
  - `category` (optional)
  - `type` (optional)
  - `featured` (optional boolean)
  - `popular` (optional boolean)
  - `tags` (optional comma-separated string)
- **File**: `src/app/api/templates/route.ts`

#### Get Template by ID
- **Path**: `/api/templates/[id]`
- **Method**: `GET`
- **File**: `src/app/api/templates/[id]/route.ts`

#### Get Featured Templates
- **Path**: `/api/templates/featured`
- **Method**: `GET`
- **File**: `src/app/api/templates/featured/route.ts`

#### Get Popular Templates
- **Path**: `/api/templates/popular`
- **Method**: `GET`
- **File**: `src/app/api/templates/popular/route.ts`

#### Get Templates by Category
- **Path**: `/api/templates/category/[category]`
- **Method**: `GET`
- **File**: `src/app/api/templates/category/[category]/route.ts`

#### Get Template Presets
- **Path**: `/api/templates/presets`
- **Method**: `GET`
- **File**: `src/app/api/templates/presets/route.ts`

#### Get Paginated Templates
- **Path**: `/api/templates/paginated`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - Additional filter parameters
- **File**: `src/app/api/templates/paginated/route.ts`

### 2. POST Routes

#### Create New Template
- **Path**: `/api/templates`
- **Method**: `POST`
- **Body**: `Partial<Template>`
- **File**: `src/app/api/templates/route.ts`

#### Create Template from Project
- **Path**: `/api/templates/from-project/[projectId]`
- **Method**: `POST`
- **Body**: `{ slug: string, categories?: string[], tags?: string[] }`
- **File**: `src/app/api/templates/from-project/[projectId]/route.ts`

#### Use Template to Create Project
- **Path**: `/api/templates/[id]/use`
- **Method**: `POST`
- **Body**: `{ ownerId: string }`
- **File**: `src/app/api/templates/[id]/use/route.ts`

### 3. PUT Routes

#### Update Template
- **Path**: `/api/templates/[id]`
- **Method**: `PUT`
- **Body**: `Partial<Template>`
- **File**: `src/app/api/templates/[id]/route.ts`

### 4. DELETE Routes

#### Delete Single Template
- **Path**: `/api/templates/[id]`
- **Method**: `DELETE`
- **File**: `src/app/api/templates/[id]/route.ts`

#### Delete Multiple Templates (Bulk)
- **Path**: `/api/templates/bulk`
- **Method**: `DELETE`
- **Body**: `{ ids: string[] }`
- **File**: `src/app/api/templates/bulk/route.ts`

## Implementation Notes

### Error Handling
All API routes should implement consistent error handling:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // API logic here
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### Authentication
Consider implementing authentication middleware for protected routes:
```typescript
// middleware to check authentication
const isAuthenticated = (request: NextRequest) => {
  // Check authentication token
  return true; // or false
};
```

### Backend Proxy Pattern
Each API route should:
1. Validate the request
2. Extract necessary data/parameters
3. Make the actual request to the backend API
4. Handle backend responses and errors
5. Return appropriate Next.js responses

### Example Implementation Structure
```typescript
// src/app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/lib/api/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    // ... extract other params
    
    // Forward request to backend
    const response = await backendApiClient.get('/templates', {
      params: { category, ... }
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to backend
    const response = await backendApiClient.post('/templates', body);
    
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
```

## File Structure
```
src/app/api/templates/
├── route.ts                    # GET /api/templates, POST /api/templates
├── [id]/
│   ├── route.ts               # GET, PUT, DELETE /api/templates/[id]
│   └── use/
│       └── route.ts           # POST /api/templates/[id]/use
├── bulk/
│   └── route.ts               # DELETE /api/templates/bulk
├── category/
│   └── [category]/
│       └── route.ts           # GET /api/templates/category/[category]
├── featured/
│   └── route.ts               # GET /api/templates/featured
├── from-project/
│   └── [projectId]/
│       └── route.ts           # POST /api/templates/from-project/[projectId]
├── paginated/
│   └── route.ts               # GET /api/templates/paginated
├── popular/
│   └── route.ts               # GET /api/templates/popular
└── presets/
    └── route.ts               # GET /api/templates/presets
```

## Next Steps
1. Create the API route files listed above
2. Implement backend proxy logic in each route
3. Add proper authentication middleware
4. Test all endpoints with the frontend TemplatesAPI class
5. Add proper error handling and logging
