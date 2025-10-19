# REST API Plan for 10XCards

## 1. Resources

The API is organized around the following main resources:

| Resource | Database Table | Description |
|----------|---------------|-------------|
| **Users** | `auth.users` | User accounts managed by Supabase Auth |
| **Decks** | `public.decks` | Collections of flashcards owned by users |
| **Flashcards** | `public.flashcards` | Individual flashcards belonging to decks |
| **AI Generation** | N/A | AI-powered flashcard generation service |
| **Learning Sessions** | N/A | Virtual resource for spaced repetition learning |

## 2. Endpoints

### 2.1 Authentication Endpoints

Authentication is handled by Supabase Auth. The following endpoints are provided by Supabase:

#### Register New User
- **Method:** `POST`
- **Path:** `/auth/v1/signup`
- **Description:** Creates a new user account with email and password
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
- **Success Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-10-19T12:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```
- **Error Responses:**
  - `400 Bad Request` - Invalid email format or weak password
  - `422 Unprocessable Entity` - Email already exists

#### Login
- **Method:** `POST`
- **Path:** `/auth/v1/token?grant_type=password`
- **Description:** Authenticates user and returns session tokens
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
- **Success Response (200 OK):**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```
- **Error Responses:**
  - `400 Bad Request` - Invalid credentials

#### Logout
- **Method:** `POST`
- **Path:** `/auth/v1/logout`
- **Description:** Invalidates the current session
- **Headers:** `Authorization: Bearer {access_token}`
- **Success Response (204 No Content)**
- **Error Responses:**
  - `401 Unauthorized` - Invalid or expired token

### 2.2 Deck Endpoints

#### List All Decks
- **Method:** `GET`
- **Path:** `/api/decks`
- **Description:** Retrieves all decks belonging to the authenticated user
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Parameters:**
  - `page` (optional, default: 1) - Page number for pagination
  - `limit` (optional, default: 20, max: 100) - Items per page
  - `sort` (optional, default: "created_at") - Sort field (created_at, updated_at, name)
  - `order` (optional, default: "desc") - Sort order (asc, desc)
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Biology Chapter 1",
      "description": "Cell structure and functions",
      "created_at": "2025-10-19T12:00:00Z",
      "updated_at": "2025-10-19T12:00:00Z",
      "flashcard_count": 15
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```
- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token

#### Get Single Deck
- **Method:** `GET`
- **Path:** `/api/decks/:id`
- **Description:** Retrieves a specific deck by ID
- **Headers:** `Authorization: Bearer {access_token}`
- **Success Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Biology Chapter 1",
  "description": "Cell structure and functions",
  "created_at": "2025-10-19T12:00:00Z",
  "updated_at": "2025-10-19T12:00:00Z",
  "flashcard_count": 15
}
```
- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `404 Not Found` - Deck does not exist or user doesn't have access

#### Create Deck
- **Method:** `POST`
- **Path:** `/api/decks`
- **Description:** Creates a new deck for the authenticated user
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
```json
{
  "name": "Biology Chapter 1",
  "description": "Cell structure and functions"
}
```
- **Success Response (201 Created):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Biology Chapter 1",
  "description": "Cell structure and functions",
  "created_at": "2025-10-19T12:00:00Z",
  "updated_at": "2025-10-19T12:00:00Z"
}
```
- **Error Responses:**
  - `400 Bad Request` - Invalid request body or validation errors
  - `401 Unauthorized` - Missing or invalid authentication token

#### Update Deck
- **Method:** `PATCH`
- **Path:** `/api/decks/:id`
- **Description:** Updates an existing deck
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
```json
{
  "name": "Biology Chapter 1 - Updated",
  "description": "Updated description"
}
```
- **Success Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Biology Chapter 1 - Updated",
  "description": "Updated description",
  "created_at": "2025-10-19T12:00:00Z",
  "updated_at": "2025-10-19T13:00:00Z"
}
```
- **Error Responses:**
  - `400 Bad Request` - Invalid request body or validation errors
  - `401 Unauthorized` - Missing or invalid authentication token
  - `404 Not Found` - Deck does not exist or user doesn't have access

#### Delete Deck
- **Method:** `DELETE`
- **Path:** `/api/decks/:id`
- **Description:** Deletes a deck and all its flashcards
- **Headers:** `Authorization: Bearer {access_token}`
- **Success Response (204 No Content)**
- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `404 Not Found` - Deck does not exist or user doesn't have access

### 2.3 Flashcard Endpoints

#### List All Flashcards
- **Method:** `GET`
- **Path:** `/api/flashcards`
- **Description:** Retrieves flashcards for the authenticated user
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Parameters:**
  - `deck_id` (optional) - Filter by deck ID
  - `status` (optional) - Filter by status (new, learning, mastered)
  - `ai_generated` (optional, boolean) - Filter by creation method
  - `page` (optional, default: 1) - Page number for pagination
  - `limit` (optional, default: 20, max: 100) - Items per page
  - `sort` (optional, default: "created_at") - Sort field
  - `order` (optional, default: "desc") - Sort order (asc, desc)
- **Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "deck_id": "uuid",
      "user_id": "uuid",
      "front_content": "What is mitochondria?",
      "back_content": "The powerhouse of the cell",
      "status": "new",
      "ai_generated": true,
      "ai_accepted": true,
      "created_at": "2025-10-19T12:00:00Z",
      "updated_at": "2025-10-19T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```
- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token

#### Get Single Flashcard
- **Method:** `GET`
- **Path:** `/api/flashcards/:id`
- **Description:** Retrieves a specific flashcard by ID
- **Headers:** `Authorization: Bearer {access_token}`
- **Success Response (200 OK):**
```json
{
  "id": "uuid",
  "deck_id": "uuid",
  "user_id": "uuid",
  "front_content": "What is mitochondria?",
  "back_content": "The powerhouse of the cell",
  "status": "new",
  "ai_generated": true,
  "ai_accepted": true,
  "created_at": "2025-10-19T12:00:00Z",
  "updated_at": "2025-10-19T12:00:00Z"
}
```
- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `404 Not Found` - Flashcard does not exist or user doesn't have access

#### Create Flashcard (Manual)
- **Method:** `POST`
- **Path:** `/api/flashcards`
- **Description:** Creates a single flashcard manually
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
```json
{
  "deck_id": "uuid",
  "front_content": "What is mitochondria?",
  "back_content": "The powerhouse of the cell"
}
```
- **Success Response (201 Created):**
```json
{
  "id": "uuid",
  "deck_id": "uuid",
  "user_id": "uuid",
  "front_content": "What is mitochondria?",
  "back_content": "The powerhouse of the cell",
  "status": "new",
  "ai_generated": false,
  "ai_accepted": null,
  "created_at": "2025-10-19T12:00:00Z",
  "updated_at": "2025-10-19T12:00:00Z"
}
```
- **Error Responses:**
  - `400 Bad Request` - Invalid request body or validation errors
  - `401 Unauthorized` - Missing or invalid authentication token
  - `404 Not Found` - Referenced deck does not exist

#### Update Flashcard
- **Method:** `PATCH`
- **Path:** `/api/flashcards/:id`
- **Description:** Updates an existing flashcard
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
```json
{
  "front_content": "What is mitochondria? (Updated)",
  "back_content": "The powerhouse of the cell - Updated description",
  "status": "learning"
}
```
- **Success Response (200 OK):**
```json
{
  "id": "uuid",
  "deck_id": "uuid",
  "user_id": "uuid",
  "front_content": "What is mitochondria? (Updated)",
  "back_content": "The powerhouse of the cell - Updated description",
  "status": "learning",
  "ai_generated": false,
  "ai_accepted": null,
  "created_at": "2025-10-19T12:00:00Z",
  "updated_at": "2025-10-19T13:00:00Z"
}
```
- **Error Responses:**
  - `400 Bad Request` - Invalid request body or validation errors
  - `401 Unauthorized` - Missing or invalid authentication token
  - `404 Not Found` - Flashcard does not exist or user doesn't have access

#### Delete Flashcard
- **Method:** `DELETE`
- **Path:** `/api/flashcards/:id`
- **Description:** Permanently deletes a flashcard
- **Headers:** `Authorization: Bearer {access_token}`
- **Success Response (204 No Content)**
- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `404 Not Found` - Flashcard does not exist or user doesn't have access

### 2.4 AI Generation Endpoints

#### Generate Flashcard Proposals
- **Method:** `POST`
- **Path:** `/api/flashcards/generate`
- **Description:** Generates flashcard proposals from provided text using AI
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
```json
{
  "deck_id": "uuid",
  "text": "Mitochondria are membrane-bound organelles found in the cytoplasm of all eukaryotic cells. They are responsible for producing adenosine triphosphate (ATP), the main energy currency of the cell."
}
```
- **Success Response (200 OK):**
```json
{
  "proposals": [
    {
      "front_content": "What are mitochondria?",
      "back_content": "Membrane-bound organelles found in eukaryotic cells that produce ATP"
    },
    {
      "front_content": "What is ATP?",
      "back_content": "Adenosine triphosphate - the main energy currency of the cell"
    }
  ],
  "usage": {
    "generated_count": 2,
    "total_generated_today": 45,
    "daily_limit": 100
  }
}
```
- **Error Responses:**
  - `400 Bad Request` - Invalid request body or text too short/long
  - `401 Unauthorized` - Missing or invalid authentication token
  - `404 Not Found` - Referenced deck does not exist
  - `422 Unprocessable Entity` - AI could not generate flashcards from the provided text
  - `429 Too Many Requests` - User has reached their AI generation limit

#### Save AI-Generated Flashcards (Batch)
- **Method:** `POST`
- **Path:** `/api/flashcards/batch`
- **Description:** Saves multiple AI-generated flashcards at once (after user verification/editing)
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
```json
{
  "deck_id": "uuid",
  "flashcards": [
    {
      "front_content": "What are mitochondria?",
      "back_content": "Membrane-bound organelles that produce ATP",
      "ai_accepted": true
    },
    {
      "front_content": "What is ATP?",
      "back_content": "The main energy currency of the cell",
      "ai_accepted": true
    }
  ]
}
```
- **Success Response (201 Created):**
```json
{
  "created": [
    {
      "id": "uuid",
      "deck_id": "uuid",
      "user_id": "uuid",
      "front_content": "What are mitochondria?",
      "back_content": "Membrane-bound organelles that produce ATP",
      "status": "new",
      "ai_generated": true,
      "ai_accepted": true,
      "created_at": "2025-10-19T12:00:00Z",
      "updated_at": "2025-10-19T12:00:00Z"
    }
  ],
  "count": 2
}
```
- **Error Responses:**
  - `400 Bad Request` - Invalid request body or validation errors
  - `401 Unauthorized` - Missing or invalid authentication token
  - `404 Not Found` - Referenced deck does not exist

### 2.5 Learning Session Endpoints

#### Get Due Flashcards
- **Method:** `GET`
- **Path:** `/api/flashcards/due`
- **Description:** Retrieves flashcards that are due for review based on spaced repetition algorithm
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Parameters:**
  - `deck_id` (optional) - Filter by specific deck
  - `limit` (optional, default: 20, max: 100) - Maximum number of cards to return
- **Success Response (200 OK):**
```json
{
  "flashcards": [
    {
      "id": "uuid",
      "deck_id": "uuid",
      "front_content": "What is mitochondria?",
      "back_content": "The powerhouse of the cell",
      "status": "learning"
    }
  ],
  "total_due": 15
}
```
- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token

#### Record Flashcard Review
- **Method:** `POST`
- **Path:** `/api/flashcards/:id/review`
- **Description:** Records a review of a flashcard and updates its status based on user rating
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
```json
{
  "rating": "good"
}
```
- **Allowed Ratings:**
  - `again` - Didn't remember, show again soon
  - `hard` - Remembered with difficulty
  - `good` - Remembered correctly
  - `easy` - Remembered very easily
- **Success Response (200 OK):**
```json
{
  "id": "uuid",
  "deck_id": "uuid",
  "user_id": "uuid",
  "front_content": "What is mitochondria?",
  "back_content": "The powerhouse of the cell",
  "status": "learning",
  "next_review_date": "2025-10-21T12:00:00Z",
  "updated_at": "2025-10-19T13:00:00Z"
}
```
- **Error Responses:**
  - `400 Bad Request` - Invalid rating value
  - `401 Unauthorized` - Missing or invalid authentication token
  - `404 Not Found` - Flashcard does not exist or user doesn't have access

### 2.6 User Limits Endpoints

#### Get Current User Limits
- **Method:** `GET`
- **Path:** `/api/users/me/limits`
- **Description:** Retrieves current usage statistics and limits for the authenticated user
- **Headers:** `Authorization: Bearer {access_token}`
- **Success Response (200 OK):**
```json
{
  "ai_generation": {
    "daily_limit": 100,
    "used_today": 45,
    "remaining_today": 55,
    "resets_at": "2025-10-20T00:00:00Z"
  },
  "statistics": {
    "total_flashcards": 150,
    "ai_generated_flashcards": 120,
    "manually_created_flashcards": 30,
    "ai_acceptance_rate": 0.85
  }
}
```
- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token

## 3. Authentication and Authorization

### Authentication Mechanism
The API uses **JWT (JSON Web Tokens)** provided by Supabase Auth for authentication. All protected endpoints require a valid JWT token in the Authorization header.

### Implementation Details

1. **Token Format:**
   ```
   Authorization: Bearer {jwt_token}
   ```

2. **Token Acquisition:**
   - Tokens are obtained through the Supabase Auth endpoints (`/auth/v1/signup`, `/auth/v1/token`)
   - Access tokens are short-lived (default: 1 hour)
   - Refresh tokens are used to obtain new access tokens

3. **Token Validation:**
   - All API endpoints (except auth endpoints) validate the JWT token
   - Token validation checks signature, expiration, and user existence
   - Invalid or expired tokens result in `401 Unauthorized` response

4. **Authorization:**
   - Row Level Security (RLS) is enabled on all database tables
   - RLS policies ensure users can only access their own data
   - The authenticated user's ID (`auth.uid()`) is extracted from the JWT token
   - All database queries automatically filter by user ID through RLS

5. **Security Considerations:**
   - Tokens should be stored securely (e.g., httpOnly cookies or secure storage)
   - HTTPS must be used in production to prevent token interception
   - Implement token refresh logic to maintain user sessions
   - Rate limiting should be applied to prevent abuse

## 4. Validation and Business Logic

### 4.1 Validation Rules

#### Deck Validation
- **name:**
  - Required (cannot be null or empty string)
  - Minimum length: 1 character
  - Maximum length: 255 characters (recommended)
- **description:**
  - Optional (can be null)
  - Maximum length: 1000 characters (recommended)

#### Flashcard Validation
- **deck_id:**
  - Required
  - Must be a valid UUID
  - Must reference an existing deck owned by the user
- **front_content:**
  - Required (cannot be null or empty string)
  - Minimum length: 1 character
  - Maximum length: 200 characters (per PRD FR-02)
- **back_content:**
  - Required (cannot be null or empty string)
  - Minimum length: 1 character
  - Maximum length: 500 characters (per PRD FR-02)
- **status:**
  - Optional (defaults to 'new')
  - Must be one of: 'new', 'learning', 'mastered'

#### AI Generation Validation
- **text:**
  - Required
  - Minimum length: 50 characters (to ensure meaningful content)
  - Maximum length: 5,000 characters (to prevent abuse and control costs)
- **deck_id:**
  - Required
  - Must be a valid UUID
  - Must reference an existing deck owned by the user

#### Review Rating Validation
- **rating:**
  - Required
  - Must be one of: 'again', 'hard', 'good', 'easy'

### 4.2 Business Logic Implementation

#### AI Generation (US-004, US-006, US-007)
1. **Before Generation:**
   - Verify user authentication
   - Check if user has reached daily AI generation limit (FR-08)
   - Validate input text length and content
   - Verify deck_id belongs to authenticated user

2. **During Generation:**
   - Send text to AI service (OpenRouter.ai)
   - Parse AI response into flashcard proposals
   - Validate generated flashcards (length constraints)
   - Handle AI service errors gracefully

3. **After Generation:**
   - Return proposals to client (not saved to database yet)
   - Update usage statistics
   - Log generation for metrics tracking

4. **Error Handling:**
   - Return `422 Unprocessable Entity` if AI cannot extract information
   - Return `429 Too Many Requests` if limit exceeded
   - Provide clear error messages to user

#### Batch Flashcard Creation (US-005)
1. **Validation:**
   - Verify all flashcards have valid content
   - Check that deck_id is the same for all flashcards
   - Verify deck belongs to authenticated user
   - Validate maximum batch size (e.g., 50 flashcards per request)

2. **Transaction:**
   - Use database transaction to ensure atomicity
   - Set `ai_generated = true` for all flashcards
   - Set `ai_accepted` based on input
   - Set `status = 'new'` for all flashcards
   - Commit all or rollback on error

3. **Metrics Tracking:**
   - Track total proposals vs. accepted proposals
   - Calculate AI acceptance rate

#### Manual Flashcard Creation (US-008)
1. **Validation:**
   - Verify content length constraints
   - Verify deck ownership

2. **Creation:**
   - Set `ai_generated = false`
   - Set `ai_accepted = null`
   - Set `status = 'new'`
   - Set `user_id` from authenticated user

#### Flashcard Update (US-010)
1. **Authorization:**
   - Verify flashcard belongs to authenticated user (via RLS)

2. **Update:**
   - Allow updating `front_content`, `back_content`, and `status`
   - Do not allow updating `ai_generated`, `ai_accepted`, or `user_id`
   - Automatically update `updated_at` timestamp (via database trigger)

3. **Validation:**
   - Validate content length constraints
   - Validate status enum values

#### Flashcard Deletion (US-011)
1. **Authorization:**
   - Verify flashcard belongs to authenticated user (via RLS)

2. **Deletion:**
   - Permanent deletion (no soft delete in MVP)
   - RLS policies ensure user can only delete their own flashcards

#### Learning Session (US-012, US-013)
1. **Retrieving Due Flashcards:**
   - Query flashcards where `next_review_date <= current_date`
   - Filter by user_id (via RLS)
   - Optionally filter by deck_id
   - Order by `next_review_date` ascending (oldest first)
   - Apply limit

2. **Recording Review:**
   - Validate rating value
   - Apply spaced repetition algorithm based on rating:
     - `again`: Reset interval (e.g., 1 minute)
     - `hard`: Small interval increase (e.g., current * 1.2)
     - `good`: Medium interval increase (e.g., current * 2.5)
     - `easy`: Large interval increase (e.g., current * 3.0)
   - Update `status` based on performance:
     - Multiple 'again' → `status = 'learning'`
     - Consistent 'good'/'easy' → `status = 'mastered'`
   - Set `next_review_date` based on calculated interval
   - Update `updated_at` timestamp

3. **Spaced Repetition Algorithm:**
   - Use a simple open-source algorithm (e.g., SM-2 or simplified variant)
   - Store review history if needed for future enhancements
   - Default intervals:
     - First review: 1 day
     - Second review: 3 days
     - Subsequent reviews: multiply by factor based on rating

#### Usage Limits (FR-08)
1. **Configuration:**
   - Store limits in environment variables or database
   - Default daily limit: 100 AI-generated flashcards

2. **Tracking:**
   - Count AI-generated flashcards created today by user
   - Reset count at midnight (UTC or user's timezone)

3. **Enforcement:**
   - Check limit before calling AI service
   - Return error if limit exceeded
   - Include usage information in API responses

### 4.3 Metrics Collection

#### AI Acceptance Rate (PRD Section 6.1)
- **Calculation:** (Number of AI flashcards saved) / (Total AI proposals presented) * 100
- **Tracking:**
  - Count proposals in `/api/flashcards/generate` response
  - Count saved flashcards with `ai_accepted = true` in `/api/flashcards/batch`
  - Store metrics in separate tracking table or analytics service

#### AI Adoption Rate (PRD Section 6.2)
- **Calculation:** (Number of AI flashcards) / (Total flashcards) * 100
- **Tracking:**
  - Query: `SELECT COUNT(*) WHERE ai_generated = true` / `COUNT(*)`
  - Available in `/api/users/me/limits` endpoint

### 4.4 Error Handling Standards

All error responses follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context about the error"
    }
  }
}
```

Common error codes:
- `UNAUTHORIZED` - Authentication required or invalid token
- `FORBIDDEN` - User doesn't have access to the resource
- `NOT_FOUND` - Resource doesn't exist
- `VALIDATION_ERROR` - Request validation failed
- `LIMIT_EXCEEDED` - User has exceeded usage limits
- `AI_GENERATION_FAILED` - AI service failed to generate flashcards
- `INTERNAL_ERROR` - Unexpected server error

### 4.5 Rate Limiting

To prevent abuse and ensure fair usage:

1. **Global Rate Limits:**
   - 100 requests per minute per IP address
   - 1000 requests per hour per authenticated user

2. **Endpoint-Specific Limits:**
   - `/api/flashcards/generate`: 10 requests per minute per user
   - `/api/flashcards/batch`: 20 requests per minute per user

3. **Headers:**
   - `X-RateLimit-Limit`: Maximum requests allowed
   - `X-RateLimit-Remaining`: Requests remaining
   - `X-RateLimit-Reset`: Timestamp when limit resets

4. **Response:**
   - `429 Too Many Requests` when limit exceeded
   - Include `Retry-After` header with seconds to wait

### 4.6 Pagination Standards

All list endpoints support pagination:

1. **Query Parameters:**
   - `page`: Page number (1-indexed)
   - `limit`: Items per page (default: 20, max: 100)

2. **Response Format:**
   ```json
   {
     "data": [...],
     "pagination": {
       "page": 1,
       "limit": 20,
       "total": 150,
       "total_pages": 8
     }
   }
   ```

3. **Cursor-Based Alternative (Future Enhancement):**
   - For real-time data, consider cursor-based pagination
   - Use `cursor` parameter instead of `page`
   - More efficient for large datasets


