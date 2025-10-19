# Testing Guide: POST /api/flashcards/generate

## Prerequisites

1. **Environment Setup:**
   ```bash
   # Create .env file (if not exists)
   cp .env.example .env
   
   # Add your OpenAI API key
   OPENAI_API_KEY=sk-your-api-key-here
   ```

2. **Start Supabase:**
   ```bash
   npx supabase start
   ```

3. **Start Dev Server:**
   ```bash
   npm run dev
   ```

4. **Get Authentication Token:**
   - Go to http://127.0.0.1:54323 (Supabase Studio)
   - Navigate to Authentication > Users
   - Create a test user or use existing user
   - Copy the JWT token from the user's session

5. **Create a Test Deck:**
   ```bash
   # Use Supabase Studio SQL Editor
   INSERT INTO decks (user_id, name, description) 
   VALUES ('USER_ID_HERE', 'Test Deck', 'For testing flashcard generation')
   RETURNING id;
   ```

## Test Cases

### Test 1: Successful Generation ✅
**Description:** Generate flashcards from valid text

```bash
curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "YOUR_DECK_ID",
    "text": "Mitochondria are membrane-bound organelles found in the cytoplasm of all eukaryotic cells. They are responsible for producing adenosine triphosphate (ATP), the main energy currency of the cell. Mitochondria have their own DNA and are thought to have originated from ancient bacteria."
  }'
```

**Expected Response:** `200 OK`
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
    "total_generated_today": 2,
    "daily_limit": 100
  }
}
```

---

### Test 2: Validation Error - Text Too Short ❌
**Description:** Text must be at least 50 characters

```bash
curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "YOUR_DECK_ID",
    "text": "Short text"
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "text",
      "reason": "Text must be at least 50 characters long"
    }
  }
}
```

---

### Test 3: Validation Error - Text Too Long ❌
**Description:** Text must not exceed 5000 characters

```bash
# Generate text over 5000 characters
TEXT=$(python -c "print('a' * 5001)")

curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"deck_id\": \"YOUR_DECK_ID\",
    \"text\": \"$TEXT\"
  }"
```

**Expected Response:** `400 Bad Request`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "text",
      "reason": "Text must not exceed 5000 characters"
    }
  }
}
```

---

### Test 4: Validation Error - Invalid UUID ❌
**Description:** deck_id must be a valid UUID

```bash
curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "not-a-uuid",
    "text": "This is a text with more than fifty characters for testing purposes only."
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "deck_id",
      "reason": "Invalid deck ID format"
    }
  }
}
```

---

### Test 5: Unauthorized - Missing Token ❌
**Description:** Request must include valid JWT token

```bash
curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "YOUR_DECK_ID",
    "text": "This is a text with more than fifty characters for testing purposes only."
  }'
```

**Expected Response:** `401 Unauthorized`
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token"
  }
}
```

---

### Test 6: Unauthorized - Invalid Token ❌
**Description:** Token must be valid and not expired

```bash
curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer invalid-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "YOUR_DECK_ID",
    "text": "This is a text with more than fifty characters for testing purposes only."
  }'
```

**Expected Response:** `401 Unauthorized`
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token"
  }
}
```

---

### Test 7: Not Found - Deck Doesn't Exist ❌
**Description:** Deck must exist and belong to user

```bash
curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "00000000-0000-0000-0000-000000000000",
    "text": "This is a text with more than fifty characters for testing purposes only."
  }'
```

**Expected Response:** `404 Not Found`
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Deck not found or access denied"
  }
}
```

---

### Test 8: Not Found - Deck Belongs to Another User ❌
**Description:** User can only generate flashcards for their own decks

```bash
# First, create a deck for another user
# Then try to access it with a different user's token

curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer DIFFERENT_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "DECK_ID_FROM_ANOTHER_USER",
    "text": "This is a text with more than fifty characters for testing purposes only."
  }'
```

**Expected Response:** `404 Not Found`
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Deck not found or access denied"
  }
}
```

---

### Test 9: Rate Limit Exceeded ❌
**Description:** User can generate max 100 flashcards per day

```bash
# Run this script to hit the limit
for i in {1..101}; do
  echo "Request $i"
  curl -X POST http://localhost:4321/api/flashcards/generate \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"deck_id\": \"YOUR_DECK_ID\",
      \"text\": \"Request $i: This is a text with more than fifty characters for testing purposes only.\"
    }"
  echo ""
done
```

**Expected Response (on 101st request):** `429 Too Many Requests`
```json
{
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "Daily AI generation limit exceeded",
    "details": {
      "daily_limit": 100,
      "used_today": 100,
      "resets_at": "2025-10-20T00:00:00.000Z"
    }
  }
}
```

---

### Test 10: AI Generation Failed ❌
**Description:** AI fails to generate flashcards (e.g., no API key)

```bash
# Remove OPENAI_API_KEY from .env and restart server

curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "YOUR_DECK_ID",
    "text": "This is a text with more than fifty characters for testing purposes only."
  }'
```

**Expected Response:** `422 Unprocessable Entity`
```json
{
  "error": {
    "code": "AI_GENERATION_FAILED",
    "message": "OpenAI API key not configured",
    "details": {
      "reason": "Missing OPENAI_API_KEY environment variable"
    }
  }
}
```

---

## Testing Checklist

- [ ] Test 1: Successful generation with valid input
- [ ] Test 2: Validation error - text too short
- [ ] Test 3: Validation error - text too long
- [ ] Test 4: Validation error - invalid UUID
- [ ] Test 5: Unauthorized - missing token
- [ ] Test 6: Unauthorized - invalid token
- [ ] Test 7: Not found - deck doesn't exist
- [ ] Test 8: Not found - deck belongs to another user
- [ ] Test 9: Rate limit exceeded
- [ ] Test 10: AI generation failed

## Performance Metrics

Track these metrics during testing:

1. **Response Time:**
   - AI API latency: 2-10 seconds (typical)
   - Total endpoint latency: 2-12 seconds
   - Timeout: 30 seconds

2. **Database Queries:**
   - Deck ownership check: ~10-50ms
   - Usage limit check: ~10-50ms (with index)

3. **Success Rates:**
   - AI generation success rate: >95%
   - Proposal acceptance rate: Track in future

## Troubleshooting

### Issue: "Supabase client not initialized"
**Solution:** Check middleware setup in `src/middleware/index.ts`

### Issue: "OpenAI API key not configured"
**Solution:** Add `OPENAI_API_KEY` to `.env` file

### Issue: "Failed to check usage limits"
**Solution:** Check database connection and ensure migrations are applied

### Issue: AI timeout
**Solution:** Normal for complex text or slow API. Timeout is set to 30 seconds.

### Issue: Invalid JSON from AI
**Solution:** Rare, but AI sometimes returns invalid format. Error is handled gracefully.

## Notes

1. **Daily Limit Reset:** Midnight UTC
2. **Cost Tracking:** Each generation uses OpenAI API (gpt-4o-mini)
3. **Proposals:** Not saved to database until user accepts via `/api/flashcards/batch`
4. **RLS Policies:** Automatically enforce user ownership of decks

