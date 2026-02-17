/**
 * parseThinking — Extract <thinking> blocks from model responses
 *
 * Handles:
 * - Complete <thinking>...</thinking> tags → splits into { thinking, content }
 * - Unclosed <thinking> tag (mid-stream) → returns everything as content (safe fallback)
 * - No tags at all → returns { thinking: null, content: original }
 * - Multiple <thinking> blocks → concatenates all reasoning
 */

const THINKING_REGEX = /<thinking>([\s\S]*?)<\/thinking>/gi;

/**
 * @param {string} text — Raw model response
 * @returns {{ thinking: string | null, content: string }}
 */
export function parseThinking(text) {
  if (!text || typeof text !== 'string') {
    return { thinking: null, content: text || '' };
  }

  // If we have an opening tag but no closing tag → still streaming the thinking block
  const hasOpenTag = /<thinking>/i.test(text);
  const hasCloseTag = /<\/thinking>/i.test(text);

  if (hasOpenTag && !hasCloseTag) {
    // Mid-stream: extract what we have so far as thinking, no final content yet
    const parts = text.split(/<thinking>/i);
    const beforeTag = parts[0]?.trim() || '';
    const thinkingSoFar = parts[1] || '';
    return {
      thinking: thinkingSoFar,
      content: beforeTag,
      isThinkingComplete: false,
    };
  }

  // Extract all <thinking> blocks
  const thinkingParts = [];
  let match;
  while ((match = THINKING_REGEX.exec(text)) !== null) {
    thinkingParts.push(match[1].trim());
  }

  if (thinkingParts.length === 0) {
    return { thinking: null, content: text.trim(), isThinkingComplete: true };
  }

  // Remove thinking blocks from the content
  const content = text.replace(THINKING_REGEX, '').trim();
  const thinking = thinkingParts.join('\n\n');

  return { thinking, content, isThinkingComplete: true };
}
