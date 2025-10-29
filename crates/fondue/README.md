# Fondue

Rust NAPI font processing module for Typie.

## Features

- Extract font metadata (family name, weight, style, etc.)
- Convert TTF fonts to WOFF2 format

## Development

### Mock Implementation

When the native Rust module is not built, the module automatically falls back to a mock implementation that:
- Returns dummy metadata for `getFontMetadata()`
- Returns the input data as-is for `toWoff2()` (no actual conversion)

This allows the API to start in development mode without requiring the Rust toolchain or building the native module.

You'll see these warnings when the mock is used:
```
[fondue] Using mock implementation
[fondue] Native font processing module not available. Font features will return dummy data.
[fondue] To build the native module, run: cd crates/fondue && bun run build:napi
```

### Building the Native Module

To build the actual native module:

```bash
cd crates/fondue
bun run build:napi
```

This requires:
- Rust toolchain
- Cross-compilation tools for target platforms

### Supported Platforms

- macOS (darwin-arm64, darwin-x64)
- Linux (linux-arm64-gnu, linux-x64-gnu)

## API

### `getFontMetadata(data: Uint8Array): FontMetadata`

Extracts metadata from a font file.

**Returns:**
```typescript
{
  weight: number;
  style: 'normal' | 'italic' | 'oblique';
  familyName?: string;
  fullName?: string;
  postScriptName?: string;
}
```

### `toWoff2(data: Uint8Array): Uint8Array`

Converts a TTF font to WOFF2 format.

**Parameters:**
- `data`: TTF font file as a Uint8Array

**Returns:** WOFF2 font file as a Uint8Array
