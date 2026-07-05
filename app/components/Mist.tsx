"use client";

import { useEffect, useRef } from "react";

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

const vec3 WHITE = vec3(1.0);
const vec3 SLATE = vec3(0.55, 0.55, 0.58);
const vec3 DARK  = vec3(0.22, 0.22, 0.25);
const vec3 INK   = vec3(0.06, 0.06, 0.08);
const vec3 VOID  = vec3(0.02, 0.02, 0.03);

vec2 hash(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return -1.0+2.0*fract(sin(p)*43758.5453123); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);
  return mix(mix(dot(hash(i),f), dot(hash(i+vec2(1,0)),f-vec2(1,0)),u.x),
             mix(dot(hash(i+vec2(0,1)),f-vec2(0,1)), dot(hash(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0.0, a=0.6;
  mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<7;i++){ v+=a*noise(p); p=r*p*2.1; a*=0.48; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv; p.x *= u_res.x / u_res.y;
  float t = u_time * 0.07;
  vec2 m = (u_mouse - 0.5) * 0.35;

  vec2 q = vec2(fbm(p*1.2 + t + m), fbm(p*1.2 + vec2(5.2,1.3) - t));
  vec2 r2 = vec2(fbm(p + 3.0*q + vec2(1.7,9.2) + 0.16*t),
                 fbm(p + 3.0*q + vec2(8.3,2.8) - 0.14*t));
  float f = fbm(p + 2.8*r2);

  // sharp contrast: pow() snaps the blending edges harder
  float f1 = pow(smoothstep(0.0, 0.5, f), 0.7);
  float f2 = pow(smoothstep(0.1, 0.6, length(q)), 0.65);
  float f3 = pow(smoothstep(0.2, 0.7, r2.y * 1.3), 0.6);
  float f4 = pow(smoothstep(0.3, 0.8, f * length(r2)), 0.55);

  vec3 col = WHITE;
  col = mix(col, SLATE, f1 * 0.95);
  col = mix(col, DARK,  f2 * 0.9);
  col = mix(col, INK,   f3 * 0.85);
  col = mix(col, VOID,  f4 * 0.75);

  // deep ink pools in corners
  float corner = max(
    smoothstep(0.5, 0.0, distance(uv, vec2(0.0, 0.0))),
    smoothstep(0.6, 0.0, distance(uv, vec2(1.0, 0.0)))
  );
  col = mix(col, VOID, corner * 0.6);

  // fade bottom to white so rest of page blends
  col = mix(col, WHITE, smoothstep(0.18, 0.0, uv.y) * 0.85);

  // grain
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453);
  col += (g - 0.5) * 0.025;

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a,0.0,1.0); }`;

export function Mist() {
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

    const isMobile = window.innerWidth < 768 || "ontouchstart" in window;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5) * (isMobile ? 0.35 : 0.6);
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
    let lastFrame = 0;
    const interval = isMobile ? 50 : 0;

    const frame = (now: number) => {
      if (now - lastFrame < interval) {
        if (!reduced) raf = requestAnimationFrame(frame);
        return;
      }
      lastFrame = now;
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
      style={{ background: "#FFFFFF" }}
    />
  );
}