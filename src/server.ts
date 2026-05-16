#!/usr/bin/env node
/**
 * wrap MCP server. One tool: `wrap`.
 *
 * Word-wrap text at a given column width. Greedy algorithm with word
 * boundaries. Existing newlines are preserved as paragraph breaks.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const VERSION = '0.1.0';

export interface WrapOpts {
  width?: number;
  break_long_words?: boolean;
}

export function wrap(text: string, opts: WrapOpts = {}): string {
  const width = opts.width ?? 80;
  if (width < 1) throw new Error('width must be >= 1');
  const breakLong = opts.break_long_words ?? true;

  return text
    .split('\n')
    .map((paragraph) => wrapLine(paragraph, width, breakLong))
    .join('\n');
}

function wrapLine(line: string, width: number, breakLong: boolean): string {
  if (line.length <= width) return line;
  const words = line.split(/(\s+)/); // keep spaces so we can preserve runs
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!w) continue;
    if (/^\s+$/.test(w)) {
      // Whitespace tokens collapse to a single space at wrap boundaries.
      if (cur.length === 0) continue;
      if ((cur + ' ').length <= width) cur += ' ';
      continue;
    }
    if ((cur + w).length <= width) {
      cur += w;
      continue;
    }
    // word doesn't fit on current line — flush
    if (cur) {
      out.push(cur.replace(/\s+$/, ''));
      cur = '';
    }
    // word longer than width
    if (w.length > width && breakLong) {
      let remaining = w;
      while (remaining.length > width) {
        out.push(remaining.slice(0, width));
        remaining = remaining.slice(width);
      }
      cur = remaining;
    } else {
      cur = w;
    }
  }
  if (cur) out.push(cur.replace(/\s+$/, ''));
  return out.join('\n');
}

const server = new Server({ name: 'wrap', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'wrap',
    description:
      'Word-wrap text at a column width. Existing newlines mark paragraph breaks. Long words are broken by default.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        width: { type: 'integer', default: 80, minimum: 1, maximum: 1000 },
        break_long_words: { type: 'boolean', default: true },
      },
      required: ['text'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'wrap') return errorResult('unknown tool: ' + name);
    const a = args as unknown as { text: string } & WrapOpts;
    return textResult(wrap(a.text, a));
  } catch (err) {
    return errorResult('wrap failed: ' + (err as Error).message);
  }
});

function textResult(text: string) {
  return { content: [{ type: 'text', text }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`wrap MCP server v${VERSION} ready on stdio\n`);
}
