/**
 * Test Setup Script
 * Creates test user and deck for API testing
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_PASSWORD = 'testpassword123';
const TEST_USER_ID = 'a0000000-0000-0000-0000-000000000001';
const TEST_DECK_ID = 'd0000000-0000-0000-0000-000000000001';

async function setup() {
  console.log('🔧 Setting up test environment...\n');

  // Create Supabase admin client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Step 1: Create test user
  console.log('1️⃣ Creating test user...');
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    email_confirm: true,
    user_metadata: { test_user: true }
  });

  if (userError) {
    if (userError.message.includes('already registered')) {
      console.log('   ✅ Test user already exists');
    } else {
      console.error('   ❌ Error creating user:', userError.message);
      process.exit(1);
    }
  } else {
    console.log('   ✅ Test user created:', userData.user.email);
  }

  // Step 2: Sign in to get JWT token
  console.log('\n2️⃣ Signing in to get JWT token...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (signInError) {
    console.error('   ❌ Error signing in:', signInError.message);
    process.exit(1);
  }

  const accessToken = signInData.session.access_token;
  const userId = signInData.user.id;
  console.log('   ✅ Signed in successfully');
  console.log('   📝 User ID:', userId);

  // Step 3: Create test deck
  console.log('\n3️⃣ Creating test deck...');
  const { data: deckData, error: deckError } = await supabase
    .from('decks')
    .insert({
      user_id: userId,
      name: 'Test Deck for API Testing',
      description: 'This deck is used for testing the flashcard generation endpoint',
    })
    .select()
    .single();

  if (deckError) {
    if (deckError.code === '23505') { // Unique violation
      // Try to get existing deck
      const { data: existingDeck } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single();
      
      if (existingDeck) {
        console.log('   ✅ Using existing test deck:', existingDeck.id);
        console.log('\n' + '='.repeat(60));
        console.log('✅ TEST ENVIRONMENT READY!\n');
        console.log('Test Credentials:');
        console.log('  Email:        ', TEST_USER_EMAIL);
        console.log('  Password:     ', TEST_USER_PASSWORD);
        console.log('  User ID:      ', userId);
        console.log('  Deck ID:      ', existingDeck.id);
        console.log('  Access Token: ', accessToken.substring(0, 30) + '...');
        console.log('='.repeat(60));
        
        // Write to file for easy access
        const fs = await import('fs');
        fs.writeFileSync('test-credentials.json', JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
          userId: userId,
          deckId: existingDeck.id,
          accessToken: accessToken,
          supabaseUrl: SUPABASE_URL
        }, null, 2));
        console.log('\n📄 Credentials saved to: test-credentials.json\n');
        return;
      }
    }
    console.error('   ❌ Error creating deck:', deckError.message);
    process.exit(1);
  }

  console.log('   ✅ Test deck created:', deckData.id);

  // Display summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST ENVIRONMENT READY!\n');
  console.log('Test Credentials:');
  console.log('  Email:        ', TEST_USER_EMAIL);
  console.log('  Password:     ', TEST_USER_PASSWORD);
  console.log('  User ID:      ', userId);
  console.log('  Deck ID:      ', deckData.id);
  console.log('  Access Token: ', accessToken.substring(0, 30) + '...');
  console.log('='.repeat(60));

  // Write to file for easy access
  const fs = await import('fs');
  fs.writeFileSync('test-credentials.json', JSON.stringify({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    userId: userId,
    deckId: deckData.id,
    accessToken: accessToken,
    supabaseUrl: SUPABASE_URL
  }, null, 2));
  console.log('\n📄 Credentials saved to: test-credentials.json\n');
}

setup().catch(console.error);

