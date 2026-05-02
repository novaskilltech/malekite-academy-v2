// Integration test for lesson generation flow
// This test verifies that the UI store config, the API endpoint, and the backend response work together.
// It is a placeholder and should be expanded with real assertions.

import { expect, test } from 'vitest';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3006/api/generate-lesson';

test('generate lesson endpoint returns 200 and JSON', async () => {
  // Minimal payload – adjust according to your API schema
  const payload = {
    topic: 'Al‑Ijtihad',
    levelId: 'master'
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  // Expect the API to return a field `lesson` with content
  expect(data).toHaveProperty('lesson');
});
