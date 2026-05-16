# wrap-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/wrap-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/wrap-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: word-wrap text at a column width. Existing newlines are
preserved (treated as paragraph breaks). No deps.

## Tool

### `wrap`

```json
{ "text": "one two three four five", "width": 10 }
```

→

```
one two
three four
five
```

`break_long_words` (default `true`) controls whether words longer than `width` get split mid-token or left whole.

## Configure

```json
{ "mcpServers": { "wrap": { "command": "npx", "args": ["-y", "@mukundakatta/wrap-mcp"] } } }
```

## License

MIT.
