/**
 * Advanced Tests for POST /api/flashcards/generate
 * Tests edge cases and additional scenarios
 */

import fs from "fs";

const creds = JSON.parse(fs.readFileSync("test-credentials.json", "utf-8"));
const API_BASE = "http://localhost:3000";
const AUTH_HEADER = `Bearer ${creds.accessToken}`;

const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, status, details = "") {
  const icon = status === "PASS" ? "✅" : "❌";
  console.log(`${icon} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
  results.tests.push({ name, status, details });
  if (status === "PASS") results.passed++;
  else results.failed++;
}

async function runTest(testName, testFn) {
  console.log(`\n🧪 ${testName}`);
  console.log("─".repeat(60));
  try {
    await testFn();
  } catch (error) {
    logTest(testName, "FAIL", `Unexpected error: ${error.message}`);
  }
}

console.log("\n============================================================");
console.log("🧪 ADVANCED API TESTS: Edge Cases & Performance");
console.log("============================================================\n");

// ============================================================================
// TEST 7: Maximum Text Length (5000 chars)
// ============================================================================
await runTest("Test 7: Maximum Text Length (5000 chars)", async () => {
  const longText =
    "A".repeat(50) +
    " Photosynthesis is the process by which plants convert light energy into chemical energy. " +
    "B".repeat(4800);

  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deck_id: creds.deckId,
      text: longText.substring(0, 5000),
    }),
  });

  const data = await response.json();

  if (response.status === 200) {
    logTest("Max Text Length", "PASS", `Generated ${data.proposals.length} proposals from 5000 chars`);
  } else {
    logTest("Max Text Length", "FAIL", `Expected 200, got ${response.status}`);
  }
});

// ============================================================================
// TEST 8: Text Length Over Limit (5001 chars)
// ============================================================================
await runTest("Test 8: Text Over Limit (5001 chars)", async () => {
  const tooLongText = "A".repeat(5001);

  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deck_id: creds.deckId,
      text: tooLongText,
    }),
  });

  const data = await response.json();

  if (response.status === 400 && data.error?.code === "VALIDATION_ERROR") {
    logTest("Text Over Limit", "PASS", `Correctly rejected text over 5000 chars`);
  } else {
    logTest("Text Over Limit", "FAIL", `Expected 400 VALIDATION_ERROR, got ${response.status}`);
  }
});

// ============================================================================
// TEST 9: Text Exactly 50 Characters (Boundary)
// ============================================================================
await runTest("Test 9: Text Exactly 50 Characters (Boundary)", async () => {
  const text = "A".repeat(50); // Exactly 50 characters

  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deck_id: creds.deckId,
      text: text,
    }),
  });

  const data = await response.json();

  if (response.status === 200 || response.status === 422) {
    // Either success or AI can't generate from meaningless text - both acceptable
    logTest("Boundary 50 Chars", "PASS", `Accepted 50-char text (status: ${response.status})`);
  } else {
    logTest("Boundary 50 Chars", "FAIL", `Expected 200 or 422, got ${response.status}`);
  }
});

// ============================================================================
// TEST 10: Whitespace Trimming
// ============================================================================
await runTest("Test 10: Whitespace Trimming", async () => {
  const textWithWhitespace = "   " + "Valid text content ".repeat(5) + "   ";

  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deck_id: creds.deckId,
      text: textWithWhitespace,
    }),
  });

  const data = await response.json();

  if (response.status === 200) {
    logTest("Whitespace Trimming", "PASS", `Correctly handled text with leading/trailing spaces`);
  } else {
    logTest("Whitespace Trimming", "FAIL", `Expected 200, got ${response.status}`);
  }
});

// ============================================================================
// TEST 11: Empty JSON Body
// ============================================================================
await runTest("Test 11: Empty JSON Body", async () => {
  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();

  if (response.status === 400 && data.error?.code === "VALIDATION_ERROR") {
    logTest("Empty Body Validation", "PASS", `Correctly rejected empty request body`);
  } else {
    logTest("Empty Body Validation", "FAIL", `Expected 400 VALIDATION_ERROR, got ${response.status}`);
  }
});

// ============================================================================
// TEST 12: Malformed JSON
// ============================================================================
await runTest("Test 12: Malformed JSON", async () => {
  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: "{invalid json here",
  });

  const data = await response.json();

  if (response.status === 400 && data.error?.code === "VALIDATION_ERROR") {
    logTest("Malformed JSON", "PASS", `Correctly rejected malformed JSON`);
  } else {
    logTest("Malformed JSON", "FAIL", `Expected 400 VALIDATION_ERROR, got ${response.status}`);
  }
});

// ============================================================================
// TEST 13: Response Time Check (Performance)
// ============================================================================
await runTest("Test 13: Response Time Check", async () => {
  const startTime = Date.now();

  const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deck_id: creds.deckId,
      text: "The Earth rotates on its axis once every 24 hours, causing day and night. It also orbits the Sun once every 365.25 days, creating the seasons.",
    }),
  });

  const endTime = Date.now();
  const duration = endTime - startTime;
  const data = await response.json();

  if (response.status === 200) {
    const durationSeconds = (duration / 1000).toFixed(2);
    if (duration < 30000) {
      logTest("Response Time", "PASS", `Completed in ${durationSeconds}s (under 30s timeout)`);
    } else {
      logTest("Response Time", "FAIL", `Took ${durationSeconds}s (over 30s timeout)`);
    }
  } else {
    logTest("Response Time", "FAIL", `Request failed with ${response.status}`);
  }
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n" + "=".repeat(60));
console.log("📊 ADVANCED TEST SUMMARY");
console.log("=".repeat(60));
console.log(`Total Tests:  ${results.passed + results.failed}`);
console.log(`✅ Passed:     ${results.passed}`);
console.log(`❌ Failed:     ${results.failed}`);
console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
console.log("=".repeat(60));

if (results.failed > 0) {
  console.log("\n⚠️  Failed Tests:");
  results.tests
    .filter((t) => t.status === "FAIL")
    .forEach((t) => {
      console.log(`  - ${t.name}: ${t.details}`);
    });
}

console.log("\n");

// Save results
fs.writeFileSync("test-advanced-results.json", JSON.stringify(results, null, 2));
console.log("📄 Results saved to: test-advanced-results.json\n");

process.exit(results.failed > 0 ? 1 : 0);
