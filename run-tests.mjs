/**
 * Automated Test Runner for POST /api/flashcards/generate
 * Runs comprehensive tests against the endpoint
 */

import fs from 'fs';

// Load test credentials
const creds = JSON.parse(fs.readFileSync('test-credentials.json', 'utf-8'));
const API_BASE = 'http://localhost:3000';
const AUTH_HEADER = `Bearer ${creds.accessToken}`;

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, status, details = '') {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
  results.tests.push({ name, status, details });
  if (status === 'PASS') results.passed++;
  else results.failed++;
}

async function runTest(testName, testFn) {
  console.log(`\n🧪 ${testName}`);
  console.log('─'.repeat(60));
  try {
    await testFn();
  } catch (error) {
    logTest(testName, 'FAIL', `Unexpected error: ${error.message}`);
  }
}

// ============================================================================
// TEST 1: Successful Generation
// ============================================================================
await runTest('Test 1: Successful Generation', async () => {
  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: 'POST',
    headers: {
      'Authorization': AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deck_id: creds.deckId,
      text: 'Mitochondria are membrane-bound organelles found in the cytoplasm of all eukaryotic cells. They are responsible for producing adenosine triphosphate (ATP), the main energy currency of the cell.'
    })
  });

  const data = await response.json();
  
  if (response.status === 200) {
    if (data.proposals && Array.isArray(data.proposals) && data.proposals.length > 0) {
      logTest('Successful Generation', 'PASS', 
        `Generated ${data.proposals.length} proposals, ` +
        `usage: ${data.usage.total_generated_today}/${data.usage.daily_limit}`);
      console.log(`   Sample: "${data.proposals[0].front_content.substring(0, 50)}..."`);
    } else {
      logTest('Successful Generation', 'FAIL', 'No proposals returned');
    }
  } else {
    logTest('Successful Generation', 'FAIL', 
      `Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
  }
});

// ============================================================================
// TEST 2: Validation Error - Text Too Short
// ============================================================================
await runTest('Test 2: Validation Error - Text Too Short', async () => {
  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: 'POST',
    headers: {
      'Authorization': AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deck_id: creds.deckId,
      text: 'Short text'
    })
  });

  const data = await response.json();
  
  if (response.status === 400 && data.error?.code === 'VALIDATION_ERROR') {
    logTest('Text Too Short Validation', 'PASS', 
      `Correctly rejected: ${data.error.details?.reason}`);
  } else {
    logTest('Text Too Short Validation', 'FAIL', 
      `Expected 400 VALIDATION_ERROR, got ${response.status}`);
  }
});

// ============================================================================
// TEST 3: Validation Error - Invalid UUID
// ============================================================================
await runTest('Test 3: Validation Error - Invalid UUID', async () => {
  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: 'POST',
    headers: {
      'Authorization': AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deck_id: 'not-a-uuid',
      text: 'This is a text with more than fifty characters for testing purposes only.'
    })
  });

  const data = await response.json();
  
  if (response.status === 400 && data.error?.code === 'VALIDATION_ERROR') {
    logTest('Invalid UUID Validation', 'PASS', 
      `Correctly rejected invalid UUID`);
  } else {
    logTest('Invalid UUID Validation', 'FAIL', 
      `Expected 400 VALIDATION_ERROR, got ${response.status}`);
  }
});

// ============================================================================
// TEST 4: Unauthorized - Missing Token
// ============================================================================
await runTest('Test 4: Unauthorized - Missing Token', async () => {
  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deck_id: creds.deckId,
      text: 'This is a text with more than fifty characters for testing purposes only.'
    })
  });

  const data = await response.json();
  
  if (response.status === 401 && data.error?.code === 'UNAUTHORIZED') {
    logTest('Missing Token Auth Check', 'PASS', 
      `Correctly rejected: ${data.error.message}`);
  } else {
    logTest('Missing Token Auth Check', 'FAIL', 
      `Expected 401 UNAUTHORIZED, got ${response.status}`);
  }
});

// ============================================================================
// TEST 5: Unauthorized - Invalid Token
// ============================================================================
await runTest('Test 5: Unauthorized - Invalid Token', async () => {
  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer invalid-token-12345',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deck_id: creds.deckId,
      text: 'This is a text with more than fifty characters for testing purposes only.'
    })
  });

  const data = await response.json();
  
  if (response.status === 401 && data.error?.code === 'UNAUTHORIZED') {
    logTest('Invalid Token Auth Check', 'PASS', 
      `Correctly rejected invalid token`);
  } else {
    logTest('Invalid Token Auth Check', 'FAIL', 
      `Expected 401 UNAUTHORIZED, got ${response.status}`);
  }
});

// ============================================================================
// TEST 6: Not Found - Deck Doesn't Exist
// ============================================================================
await runTest('Test 6: Not Found - Deck Does Not Exist', async () => {
  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: 'POST',
    headers: {
      'Authorization': AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deck_id: '00000000-0000-0000-0000-000000000000',
      text: 'This is a text with more than fifty characters for testing purposes only.'
    })
  });

  const data = await response.json();
  
  if (response.status === 404 && data.error?.code === 'NOT_FOUND') {
    logTest('Deck Not Found Check', 'PASS', 
      `Correctly returned 404: ${data.error.message}`);
  } else {
    logTest('Deck Not Found Check', 'FAIL', 
      `Expected 404 NOT_FOUND, got ${response.status}`);
  }
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests:  ${results.passed + results.failed}`);
console.log(`✅ Passed:     ${results.passed}`);
console.log(`❌ Failed:     ${results.failed}`);
console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

if (results.failed > 0) {
  console.log('\n⚠️  Failed Tests:');
  results.tests.filter(t => t.status === 'FAIL').forEach(t => {
    console.log(`  - ${t.name}: ${t.details}`);
  });
}

console.log('\n');

// Save results
fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
console.log('📄 Results saved to: test-results.json\n');

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);

