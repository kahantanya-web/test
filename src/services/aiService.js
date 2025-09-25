export async function analyzeFeedbackService(prompt) {
  const response = await fetch('/api/ai-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return await response.json();
}