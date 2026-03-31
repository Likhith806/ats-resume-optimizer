/**
 * claudeService.js
 * Handles all Claude AI interactions for resume optimization
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Build the optimization prompt
 */
function buildPrompt(resumeText, jobDescription) {
  return `You are an expert ATS resume writer and career coach. Optimize the resume below based on the job description provided.

---
RESUME:
${resumeText}

---
JOB DESCRIPTION:
${jobDescription}

---
INSTRUCTIONS:
1. Rewrite the resume to be ATS-friendly, keyword-optimized, and human-like in tone.
2. Use these standard sections: Summary, Skills, Experience, Projects, Education.
3. Use bullet points and strong action verbs (Developed, Implemented, Designed, Led, etc.).
4. Quantify achievements wherever possible (e.g., "Reduced load time by 40%").
5. Naturally incorporate missing keywords from the JD.
6. Remove irrelevant content; highlight what matters for this role.
7. Keep it concise, impactful, and within 1 page worth of content.
8. The tone should sound like a real person — professional but not robotic.

---
OUTPUT FORMAT (return EXACTLY this structure with these delimiters):

===OPTIMIZED_RESUME===
[Full rewritten resume here — plain text, use bullet points with "•" character]
===END_RESUME===

===KEYWORDS_ADDED===
[Comma-separated list of keywords added or emphasized from the JD]
===END_KEYWORDS===

===IMPROVEMENT_SUMMARY===
[3-5 sentences explaining what was improved and why it helps with ATS and this specific JD]
===END_SUMMARY===

===MATCH_SCORE===
[A number from 0 to 100 representing how well the optimized resume matches the JD, with a one-line justification]
===END_SCORE===`;
}

/**
 * Parse the structured AI response into discrete sections
 */
function parseAIResponse(rawText) {
  function extract(text, startTag, endTag) {
    const start = text.indexOf(startTag);
    const end = text.indexOf(endTag);
    if (start === -1 || end === -1) return '';
    return text.slice(start + startTag.length, end).trim();
  }

  const optimizedResume = extract(rawText, '===OPTIMIZED_RESUME===', '===END_RESUME===');
  const keywordsRaw = extract(rawText, '===KEYWORDS_ADDED===', '===END_KEYWORDS===');
  const improvementSummary = extract(rawText, '===IMPROVEMENT_SUMMARY===', '===END_SUMMARY===');
  const scoreRaw = extract(rawText, '===MATCH_SCORE===', '===END_SCORE===');

  // Parse keywords into array
  const keywords = keywordsRaw
    ? keywordsRaw.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  // Parse score (extract number)
  const scoreMatch = scoreRaw.match(/(\d+)/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
  const scoreJustification = scoreRaw.replace(/^\d+\s*[-–—:]?\s*/, '').trim();

  return {
    optimizedResume: optimizedResume || rawText,
    keywords,
    improvementSummary,
    score,
    scoreJustification,
  };
}

/**
 * Main function: optimize resume using Claude
 * @param {string} resumeText - extracted resume text
 * @param {string} jobDescription - job description text
 * @returns {Promise<object>} parsed optimization result
 */
async function optimizeResume(resumeText, jobDescription) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Please add it to your .env file.');
  }

  const prompt = buildPrompt(resumeText, jobDescription);

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    temperature: 0.3, // low temperature for consistent, structured output
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const rawText = message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');

  return parseAIResponse(rawText);
}

module.exports = { optimizeResume };
