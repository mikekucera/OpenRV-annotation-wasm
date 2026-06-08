#!/usr/bin/env node
// Generates test/shaders/shader-test.html from the actual shader files in
// deps/OpenRV-annotation/assets/shaders/.  Run from the repo root:
//
//   node test/shaders/generate.js
//
// The script applies the compat_webgl2.glsl macro substitutions so the
// shaders compile under WebGL2 / GLSL ES 3.00 without modification.

const fs = require('fs');
const path = require('path');

const SHADER_DIR = path.resolve(__dirname, '../../deps/OpenRV-annotation/assets/shaders');

// ---------------------------------------------------------------------------
// Load and prepare shader source
// ---------------------------------------------------------------------------

function readShader(name) {
    return fs.readFileSync(path.join(SHADER_DIR, name), 'utf8');
}

// Apply compat_webgl2.glsl macro substitutions (word-boundary replacements).
function applyWebGL2Compat(src) {
    return src
        .replace(/\bIN_FRAG\b/g, 'in')
        .replace(/\bIN_VERT\b/g, 'in')
        .replace(/\bOUT_VERT\b/g, 'out')
        .replace(/\bSAMPLE2D\b/g, 'texture')
        .replace(/\bFRAG_COLOR\b/g, 'fragColor');
}

// Build a complete WebGL2 fragment shader source from a raw .frag file.
// Mirrors what the real pipeline does: prepend compat_webgl2.glsl, then
// append shape_common.glsl.
const COMMON_SRC = readShader('shape_common.glsl');

// Extract just the smoothColors function body (skip the licence header).
const smoothColorsFn = COMMON_SRC.split('\n')
    .filter((l) => !l.startsWith('//') && l.trim() !== '')
    .join('\n')
    .trim();

// Mirrors compat_webgl2.glsl: add version/precision and declare fragColor.
// Do NOT redeclare vPosition here — the .frag files do that via IN_FRAG.
const FRAG_HEADER = `#version 300 es
precision highp float;
out vec4 fragColor;
`;

function buildFragSrc(filename) {
    const raw = readShader(filename);
    const body = applyWebGL2Compat(raw);
    return FRAG_HEADER + '\n' + smoothColorsFn + '\n\n' + body;
}

// ---------------------------------------------------------------------------
// Vertex shader (simplified pass-through for tests — no uTransform needed)
// ---------------------------------------------------------------------------

const VERT_SRC = `#version 300 es
precision highp float;
in  vec2 aPosition;
out vec2 vPosition;
void main() {
  vPosition   = aPosition;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

// ---------------------------------------------------------------------------
// Test cases
// Each entry: { label, shader, uniforms }
// uniforms: array of { fn, name, values }  where fn is 'uniform1f' etc.
// ---------------------------------------------------------------------------

const TESTS = [
    {
        label: 'arrow — horizontal, filled',
        shader: 'arrow.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uStart', values: [-0.55, 0.0] },
            { fn: 'uniform2f', name: 'uEnd', values: [0.55, 0.0] },
            { fn: 'uniform1f', name: 'uThickness', values: [0.08] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [0.2, 0.6, 1.0, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [1.0, 1.0, 1.0, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.02] },
        ],
    },
    {
        label: 'arrow — diagonal, no border',
        shader: 'arrow.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uStart', values: [-0.5, -0.5] },
            { fn: 'uniform2f', name: 'uEnd', values: [0.5, 0.5] },
            { fn: 'uniform1f', name: 'uThickness', values: [0.07] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [1.0, 0.5, 0.1, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [0.0, 0.0, 0.0, 0.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.0] },
        ],
    },
    {
        label: 'arrow — very short (stress test)',
        shader: 'arrow.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uStart', values: [-0.1, 0.0] },
            { fn: 'uniform2f', name: 'uEnd', values: [0.1, 0.0] },
            { fn: 'uniform1f', name: 'uThickness', values: [0.06] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [0.8, 0.2, 0.8, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [1.0, 1.0, 1.0, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.015] },
        ],
    },
    {
        label: 'line — horizontal',
        shader: 'line.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uStart', values: [-0.6, 0.0] },
            { fn: 'uniform2f', name: 'uEnd', values: [0.6, 0.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [0.3, 1.0, 0.4, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.05] },
        ],
    },
    {
        label: 'line — diagonal',
        shader: 'line.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uStart', values: [-0.6, -0.6] },
            { fn: 'uniform2f', name: 'uEnd', values: [0.6, 0.6] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [1.0, 0.9, 0.2, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.04] },
        ],
    },
    {
        label: 'rectangle — filled + border',
        shader: 'rectangle.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uCenter', values: [0.0, 0.0] },
            { fn: 'uniform1f', name: 'uWidth', values: [1.0] },
            { fn: 'uniform1f', name: 'uHeight', values: [0.7] },
            { fn: 'uniform4f', name: 'uCornerRadii', values: [0.0, 0.0, 0.0, 0.0] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [0.2, 0.4, 0.9, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [1.0, 1.0, 1.0, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.04] },
        ],
    },
    {
        label: 'rectangle — rounded corners',
        shader: 'rectangle.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uCenter', values: [0.0, 0.0] },
            { fn: 'uniform1f', name: 'uWidth', values: [1.0] },
            { fn: 'uniform1f', name: 'uHeight', values: [0.7] },
            { fn: 'uniform4f', name: 'uCornerRadii', values: [0.12, 0.12, 0.12, 0.12] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [0.9, 0.3, 0.3, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [1.0, 1.0, 1.0, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.04] },
        ],
    },
    {
        label: 'ellipse — wide',
        shader: 'ellipse.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uCenter', values: [0.0, 0.0] },
            { fn: 'uniform1f', name: 'uWidth', values: [1.2] },
            { fn: 'uniform1f', name: 'uHeight', values: [0.6] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [0.2, 0.8, 0.6, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [1.0, 1.0, 1.0, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.04] },
        ],
    },
    {
        label: 'ellipse — circle (fast-path)',
        shader: 'ellipse.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uCenter', values: [0.0, 0.0] },
            { fn: 'uniform1f', name: 'uWidth', values: [0.8] },
            { fn: 'uniform1f', name: 'uHeight', values: [0.8] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [0.9, 0.7, 0.1, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [1.0, 1.0, 1.0, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.04] },
        ],
    },
    // ── Arrow edge cases ───────────────────────────────────────────────────────
    {
        label: 'arrow — thick shaft, prominent border',
        shader: 'arrow.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uStart', values: [-0.6, 0.0] },
            { fn: 'uniform2f', name: 'uEnd', values: [0.6, 0.0] },
            { fn: 'uniform1f', name: 'uThickness', values: [0.18] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [0.1, 0.8, 0.3, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [0.8, 0.1, 0.1, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.04] },
        ],
    },
    {
        label: 'arrow — thin, pointing up-right',
        shader: 'arrow.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uStart', values: [-0.6, -0.6] },
            { fn: 'uniform2f', name: 'uEnd', values: [0.4, 0.5] },
            { fn: 'uniform1f', name: 'uThickness', values: [0.02] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [1.0, 1.0, 1.0, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [0.5, 0.5, 1.0, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.01] },
        ],
    },
    // ── Rectangle edge cases ───────────────────────────────────────────────────
    {
        label: 'rectangle — mixed corner radii',
        shader: 'rectangle.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uCenter', values: [0.0, 0.0] },
            { fn: 'uniform1f', name: 'uWidth', values: [1.2] },
            { fn: 'uniform1f', name: 'uHeight', values: [0.8] },
            { fn: 'uniform4f', name: 'uCornerRadii', values: [0.25, 0.0, 0.0, 0.25] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [0.6, 0.2, 0.8, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [1.0, 1.0, 1.0, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.04] },
        ],
    },
    {
        label: 'rectangle — hollow (alpha=0 fill)',
        shader: 'rectangle.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uCenter', values: [0.0, 0.0] },
            { fn: 'uniform1f', name: 'uWidth', values: [1.2] },
            { fn: 'uniform1f', name: 'uHeight', values: [0.8] },
            { fn: 'uniform4f', name: 'uCornerRadii', values: [0.1, 0.1, 0.1, 0.1] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [0.0, 0.0, 0.0, 0.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [0.2, 0.9, 1.0, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.06] },
        ],
    },
    // ── Ellipse edge cases ─────────────────────────────────────────────────────
    {
        label: 'ellipse — very tall (near-degenerate)',
        shader: 'ellipse.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uCenter', values: [0.0, 0.0] },
            { fn: 'uniform1f', name: 'uWidth', values: [0.2] },
            { fn: 'uniform1f', name: 'uHeight', values: [1.4] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [1.0, 0.4, 0.1, 1.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [1.0, 1.0, 1.0, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.03] },
        ],
    },
    {
        label: 'ellipse — hollow',
        shader: 'ellipse.frag',
        uniforms: [
            { fn: 'uniform2f', name: 'uCenter', values: [0.0, 0.0] },
            { fn: 'uniform1f', name: 'uWidth', values: [1.2] },
            { fn: 'uniform1f', name: 'uHeight', values: [0.8] },
            { fn: 'uniform4f', name: 'uInnerColor', values: [0.0, 0.0, 0.0, 0.0] },
            { fn: 'uniform4f', name: 'uBorderColor', values: [1.0, 0.6, 0.1, 1.0] },
            { fn: 'uniform1f', name: 'uBorderWidth', values: [0.06] },
        ],
    },
];

// ---------------------------------------------------------------------------
// Code-generate the setUniforms body for each test
// ---------------------------------------------------------------------------

function uniformCall(u) {
    const args = u.values
        .map((v) => {
            // Format floats with at least one decimal place
            return Number.isInteger(v) ? v.toFixed(1) : String(v);
        })
        .join(', ');
    return `      gl.${u.fn}(gl.getUniformLocation(prog, ${JSON.stringify(u.name)}), ${args});`;
}

function testEntry(t) {
    const unifLines = t.uniforms.map(uniformCall).join('\n');
    return `  {
    label: ${JSON.stringify(t.label)},
    frag:  SHADERS[${JSON.stringify(t.shader)}],
    set: (gl, prog) => {
${unifLines}
    },
  }`;
}

// ---------------------------------------------------------------------------
// Build shader map (deduplicated)
// ---------------------------------------------------------------------------

const shaderNames = [...new Set(TESTS.map((t) => t.shader))];
const shaderEntries = shaderNames
    .map((name) => {
        const src = buildFragSrc(name);
        // Escape backticks and backslashes for JS template literal
        const escaped = src.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
        return `  ${JSON.stringify(name)}: \`${escaped}\``;
    })
    .join(',\n');

// ---------------------------------------------------------------------------
// Emit HTML
// ---------------------------------------------------------------------------

const html = `<!DOCTYPE html>
<!--
  Annotation-platform shape shader visual test.
  AUTO-GENERATED — do not edit by hand.
  Regenerate with: node test/generate-shader-test.js
-->
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Shape Shader Test</title>
  <style>
    body { margin: 0; background: #1a1a1a; font-family: monospace; color: #ccc; }
    h1   { margin: 16px; font-size: 14px; color: #888; }
    .grid { display: flex; flex-wrap: wrap; gap: 16px; padding: 16px; }
    .cell { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    canvas { border: 1px solid #444; background: #111; }
    label  { font-size: 12px; color: #aaa; }
    .error { color: #f66; font-size: 11px; max-width: 300px; word-break: break-word; }
  </style>
</head>
<body>
<h1>OpenRV-annotation-wasm — shape shader visual test</h1>
<div class="grid" id="grid"></div>

<script>
// ---------------------------------------------------------------------------
// Vertex shader (simplified pass-through — no uTransform needed for tests)
// ---------------------------------------------------------------------------

const VERT = \`${VERT_SRC.replace(/`/g, '\\`')}\`;

// ---------------------------------------------------------------------------
// Fragment shader sources — built from the actual .frag files + WebGL2 compat
// ---------------------------------------------------------------------------

const SHADERS = {
${shaderEntries}
};

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------

const TESTS = [
${TESTS.map(testEntry).join(',\n')}
];

// ---------------------------------------------------------------------------
// WebGL helpers
// ---------------------------------------------------------------------------

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s));
  return s;
}

function link(gl, vsrc, fsrc) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER,   vsrc));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fsrc));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(prog));
  return prog;
}

function makeQuad(gl) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  return buf;
}

// ---------------------------------------------------------------------------
// Render each test case
// ---------------------------------------------------------------------------

const grid = document.getElementById("grid");

for (const test of TESTS) {
  const cell   = document.createElement("div");
  cell.className = "cell";
  const lbl    = document.createElement("label");
  lbl.textContent = test.label;
  const canvas = document.createElement("canvas");
  canvas.width  = 300;
  canvas.height = 300;
  cell.appendChild(canvas);
  cell.appendChild(lbl);
  grid.appendChild(cell);

  try {
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 not available");

    const prog = link(gl, VERT, test.frag);
    const buf  = makeQuad(gl);

    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const loc = gl.getAttribLocation(prog, "aPosition");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    test.set(gl, prog);

    gl.viewport(0, 0, 300, 300);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  } catch (e) {
    const err = document.createElement("div");
    err.className = "error";
    err.textContent = "ERROR: " + e.message;
    cell.appendChild(err);
  }
}
</script>
</body>
</html>
`;

const outPath = path.resolve(__dirname, 'shader-test.html');
fs.writeFileSync(outPath, html);
console.log(`Written: ${outPath}`);
