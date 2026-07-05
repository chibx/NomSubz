"use client";

// SilkHero — drop-in replacement for GradientHero.
// Pure WebGL fragment shader: domain-warped flowing "liquid silk" in
// NomSubz wine tones over near-black. Zero dependencies, GPU-rendered,
// mouse-reactive, respects prefers-reduced-motion, falls back silently
// if WebGL is unavailable (the section's #07030A background remains).
import { useEffect, useRef } from "react";

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

// NomSubz palette
const vec3 INK    = vec3(0.027, 0.012, 0.039); // #07030A
const vec3 WINE   = vec3(0.459, 0.188, 0.255); // #753041
const vec3 ROSE   = vec3(0.769, 0.537, 0.604); // #c4899a
const vec3 EMBER  = vec3(0.588, 0.216, 0.314); // deep heat
const vec3 SMOKE  = vec3(0.180, 0.165, 0.200); // graphite haze

vec2 hash(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return -1.0+2.0*fract(sin(p)*43758.5453123); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(dot(hash(i),f), dot(hash(i+vec2(1,0)),f-vec2(1,0)),u.x),
             mix(dot(hash(i+vec2(0,1)),f-vec2(0,1)), dot(hash(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0.0, a=0.55;
  mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<5;i++){ v+=a*noise(p); p=r*p*2.03; a*=0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv; p.x *= u_res.x / u_res.y;
  float t = u_time * 0.045;
  vec2 m = (u_mouse - 0.5) * 0.3;

  // domain warp — flowing silk
  vec2 q = vec2(fbm(p + t + m), fbm(p + vec2(5.2,1.3) - t));
  vec2 r = vec2(fbm(p + 2.4*q + vec2(1.7,9.2) + 0.14*t),
                fbm(p + 2.4*q + vec2(8.3,2.8) - 0.11*t));
  float f = fbm(p + 2.0*r);

  // dark base, wine folds glowing through
  vec3 col = INK;
  col = mix(col, SMOKE, smoothstep(0.15, 0.85, f) * 0.6);
  col = mix(col, WINE,  smoothstep(0.35, 0.95, length(q)) * 0.85);
  col = mix(col, EMBER, smoothstep(0.45, 1.05, r.y * 1.15) * 0.7);
  col = mix(col, ROSE,  smoothstep(0.72, 1.12, f * length(r)) * 0.5);

  // heat rises from below (mirrors old blob's wine bleed)
  col = mix(col, WINE * 1.15, (1.0 - uv.y) * (1.0 - uv.y) * 0.28);

  // vignette keeps the hero copy legible
  float vig = smoothstep(1.35, 0.3, distance(uv, vec2(0.5, 0.55)));
  col *= mix(0.55, 1.0, vig);

  // grain kills banding on dark gradients
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453);
  col += (g - 0.5) * 0.03;

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a,0.0,1.0); }`;

export function SilkHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = mk(gl.VERTEX_SHADER, VERT);
    const fs = mk(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
    const onMove = (e: PointerEvent) => {
      tmx = e.clientX / window.innerWidth;
      tmy = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // silk reads perfectly at low res — big perf win on phones
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
    const resize = () => {
      const p = canvas.parentElement;
      const w = p?.offsetWidth || window.innerWidth;
      const h = p?.offsetHeight || 700;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      mx += (tmx - mx) * 0.03;
      my += (tmy - my) * 0.03;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ background: "#07030A" }}
    />
  );
}
