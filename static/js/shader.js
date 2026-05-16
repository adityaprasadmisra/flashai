/**
 * shader.js
 * WebGL plasma-line background (ported from the React component spec).
 */
(function () {
  const canvas = document.getElementById('shader-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl');
  if (!gl) { console.warn('WebGL not supported'); return; }

  /* ── Shaders ── */
  const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `;

  const fsSource = `
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;

    const float overallSpeed      = 0.2;
    const float gridSmoothWidth   = 0.015;
    const float axisWidth         = 0.05;
    const float majorLineWidth    = 0.025;
    const float minorLineWidth    = 0.0125;
    const float majorLineFreq     = 5.0;
    const float minorLineFreq     = 1.0;
    const float scale             = 5.0;
    const float minLineWidth      = 0.01;
    const float maxLineWidth      = 0.2;
    const float lineSpeed         = 1.0 * overallSpeed;
    const float lineAmplitude     = 1.0;
    const float lineFrequency     = 0.2;
    const float warpSpeed         = 0.2 * overallSpeed;
    const float warpFrequency     = 0.5;
    const float warpAmplitude     = 1.0;
    const float offsetFrequency   = 0.5;
    const float offsetSpeed       = 1.33 * overallSpeed;
    const float minOffsetSpread   = 0.6;
    const float maxOffsetSpread   = 2.0;
    const int   linesPerGroup     = 16;

    /* Line colour remapped to near-white so it reads on dark bg */
    const vec4 lineColor = vec4(1.0, 1.0, 1.0, 1.0);

    #define drawCircle(pos, radius, coord)   smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
    #define drawSmoothLine(pos, hw, t)       smoothstep(hw, 0.0, abs(pos - (t)))
    #define drawCrispLine(pos, hw, t)        smoothstep(hw + gridSmoothWidth, hw, abs(pos - (t)))
    #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

    float random(float t) {
      return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
    }

    float getPlasmaY(float x, float hFade, float offset) {
      return random(x * lineFrequency + iTime * lineSpeed) * hFade * lineAmplitude + offset;
    }

    void main() {
      vec2 uv    = gl_FragCoord.xy / iResolution.xy;
      vec2 space = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.x * 2.0 * scale;

      float hFade = 1.0 - (cos(uv.x * 6.28318) * 0.5 + 0.5);
      float vFade = 1.0 - (cos(uv.y * 6.28318) * 0.5 + 0.5);

      space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + hFade);
      space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * hFade;

      /* Pure black background */
      vec4 fragColor = vec4(0.0, 0.0, 0.0, 1.0);
      fragColor *= vFade;
      fragColor.a = 1.0;

      vec4 lines = vec4(0.0);
      for (int l = 0; l < linesPerGroup; l++) {
        float nli          = float(l) / float(linesPerGroup);
        float offsetTime   = iTime * offsetSpeed;
        float offsetPos    = float(l) + space.x * offsetFrequency;
        float rand         = random(offsetPos + offsetTime) * 0.5 + 0.5;
        float halfWidth    = mix(minLineWidth, maxLineWidth, rand * hFade) * 0.5;
        float offset       = random(offsetPos + offsetTime * (1.0 + nli)) * mix(minOffsetSpread, maxOffsetSpread, hFade);
        float linePos      = getPlasmaY(space.x, hFade, offset);
        float line         = drawSmoothLine(linePos, halfWidth, space.y) * 0.5
                           + drawCrispLine(linePos,  halfWidth * 0.15, space.y);

        float cx           = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
        vec2  cp           = vec2(cx, getPlasmaY(cx, hFade, offset));
        float circle       = drawCircle(cp, 0.01, space) * 4.0;

        lines += (line + circle) * lineColor * rand;
      }

      /* Dim lines to ~25 % so text stays readable */
      fragColor += lines * 0.25;
      gl_FragColor = fragColor;
    }
  `;

  /* ── Compile helpers ── */
  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function buildProgram(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  const program = buildProgram(
    compileShader(gl.VERTEX_SHADER,   vsSource),
    compileShader(gl.FRAGMENT_SHADER, fsSource)
  );
  if (!program) return;

  /* ── Geometry (full-screen quad) ── */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const aPos  = gl.getAttribLocation(program,  'aVertexPosition');
  const uRes  = gl.getUniformLocation(program, 'iResolution');
  const uTime = gl.getUniformLocation(program, 'iTime');

  /* ── Resize ── */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── Render loop ── */
  const t0 = performance.now();
  function render() {
    const t = (performance.now() - t0) / 1000;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
