'use client';

import { useEffect, useRef, useState } from 'react';

type FluidSmokeProps = {
  color?: string;
  className?: string;
  curl?: number;
  velocityDissipation?: number;
  densityDissipation?: number;
  splatForce?: number;
  dyeRadius?: number;
  simResolution?: number;
  dyeResolution?: number;
};

const DEFAULTS = {
  SIM_RES: 256,
  DYE_RES: 2048,
  DENSITY_DISS: 0.97,
  VEL_DISS: 0.5,
  PRESSURE: 0.85,
  PRESSURE_ITER: 20,
  CURL: 8,
  SPLAT_FORCE: 1500,
  DYE_RADIUS: 0.005,
};

const COLOR_INTENSITY = 0.8;
function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m)
    return {
      r: (153 / 255) * COLOR_INTENSITY,
      g: 0,
      b: (255 / 255) * COLOR_INTENSITY,
    };
  return {
    r: (parseInt(m[1], 16) / 255) * COLOR_INTENSITY,
    g: (parseInt(m[2], 16) / 255) * COLOR_INTENSITY,
    b: (parseInt(m[3], 16) / 255) * COLOR_INTENSITY,
  };
}

export function FluidSmoke({
  color = '#9C41F7',
  className,
  curl = DEFAULTS.CURL,
  velocityDissipation = DEFAULTS.VEL_DISS,
  densityDissipation = DEFAULTS.DENSITY_DISS,
  splatForce = DEFAULTS.SPLAT_FORCE,
  dyeRadius = DEFAULTS.DYE_RADIUS,
  simResolution = DEFAULTS.SIM_RES,
  dyeResolution = DEFAULTS.DYE_RES,
}: FluidSmokeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Desktop / cursor-based devices only.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setEnabled(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Keep latest config in a ref so runtime changes don't tear down the GL context.
  const cfgRef = useRef({
    CURL: curl,
    VEL_DISS: velocityDissipation,
    DENSITY_DISS: densityDissipation,
    SPLAT_FORCE: splatForce,
    DYE_RADIUS: dyeRadius,
    COLOR: hexToRgb(color),
  });
  useEffect(() => {
    cfgRef.current = {
      CURL: curl,
      VEL_DISS: velocityDissipation,
      DENSITY_DISS: densityDissipation,
      SPLAT_FORCE: splatForce,
      DYE_RADIUS: dyeRadius,
      COLOR: hexToRgb(color),
    };
  }, [curl, velocityDissipation, densityDissipation, splatForce, dyeRadius, color]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const params: WebGLContextAttributes = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
    };
    const gl2 = canvas.getContext('webgl2', params) as WebGL2RenderingContext | null;
    const isGL2 = !!gl2;
    const gl = (gl2 ?? canvas.getContext('webgl', params)) as
      | WebGL2RenderingContext
      | WebGLRenderingContext
      | null;
    if (!gl) return;

    let halfFloat: OES_texture_half_float | null = null;
    let linFilt:
      | OES_texture_float_linear
      | OES_texture_half_float_linear
      | null = null;
    if (isGL2) {
      gl.getExtension('EXT_color_buffer_float');
      linFilt = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      linFilt = gl.getExtension('OES_texture_half_float_linear');
    }
    const HFT = isGL2
      ? (gl as WebGL2RenderingContext).HALF_FLOAT
      : halfFloat?.HALF_FLOAT_OES;
    if (HFT === undefined) return;
    const MANUAL = !linFilt;

    type Fmt = { internalFormat: number; format: number };

    function supportFmt(iF: number, f: number): boolean {
      if (!isGL2) return true;
      const fb = gl!.createFramebuffer();
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fb);
      const tx = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, tx);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, iF, 4, 4, 0, f, HFT as number, null);
      gl!.framebufferTexture2D(
        gl!.FRAMEBUFFER,
        gl!.COLOR_ATTACHMENT0,
        gl!.TEXTURE_2D,
        tx,
        0,
      );
      const ok =
        gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) === gl!.FRAMEBUFFER_COMPLETE;
      gl!.deleteFramebuffer(fb);
      gl!.deleteTexture(tx);
      return ok;
    }
    function best(a: number, fa: number, b: number, fb: number): Fmt {
      if (supportFmt(a, fa)) return { internalFormat: a, format: fa };
      if (supportFmt(b, fb)) return { internalFormat: b, format: fb };
      return { internalFormat: gl!.RGBA, format: gl!.RGBA };
    }

    const gl2c = gl as WebGL2RenderingContext;
    const rgba: Fmt = isGL2
      ? best(gl2c.RGBA16F, gl.RGBA, gl2c.RGBA16F, gl.RGBA)
      : { internalFormat: gl.RGBA, format: gl.RGBA };
    const rg: Fmt = isGL2
      ? best(gl2c.RG16F, gl2c.RG, gl2c.RG16F, gl2c.RG)
      : rgba;
    const rSingle: Fmt = isGL2
      ? best(gl2c.R16F, gl2c.RED, gl2c.RG16F, gl2c.RG)
      : rgba;

    const BV = `precision highp float;
attribute vec2 aP;
varying vec2 vUv,vL,vR,vT,vB;
uniform vec2 ts;
void main(){
  vUv=aP*.5+.5;
  vL=vUv-vec2(ts.x,0.);
  vR=vUv+vec2(ts.x,0.);
  vT=vUv+vec2(0.,ts.y);
  vB=vUv-vec2(0.,ts.y);
  gl_Position=vec4(aP,0.,1.);
}`;
    const COPY = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D u;void main(){gl_FragColor=texture2D(u,vUv);}`;
    const CLEAR = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D u;uniform float v;void main(){gl_FragColor=v*texture2D(u,vUv);}`;
    const DISP = `#define SHADING
precision highp float;precision highp sampler2D;
varying vec2 vUv,vL,vR,vT,vB;
uniform sampler2D u;uniform vec2 ts;
void main(){
  vec3 c=texture2D(u,vUv).rgb;
#ifdef SHADING
  float dx=length(texture2D(u,vR).rgb)-length(texture2D(u,vL).rgb);
  float dy=length(texture2D(u,vT).rgb)-length(texture2D(u,vB).rgb);
  vec3 n=normalize(vec3(dx,dy,length(ts)));
  float d=clamp(dot(n,vec3(0.,0.,1.))+.4,0.,1.);
  c*=d;
#endif
  c = 1.0 - exp(-c);
  float a = max(max(c.r,c.g),c.b);
  gl_FragColor=vec4(c,a);
}`;
    const SPLAT = `precision highp float;precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uT;uniform float ar;uniform vec3 color;uniform vec2 pt;uniform float rad;
void main(){
  vec2 p=vUv-pt;p.x*=ar;
  vec3 s=exp(-dot(p,p)/rad)*color;
  gl_FragColor=vec4(texture2D(uT,vUv).xyz+s,1.);
}`;
    const ADV = (MANUAL ? '#define MANUAL_FILTERING\n' : '') + `precision highp float;precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVel,uSrc;
uniform vec2 ts,dts;
uniform float dt,diss;
vec4 bl(sampler2D s,vec2 uv,vec2 t){
  vec2 st=uv/t-.5;vec2 i=floor(st);vec2 f=fract(st);
  vec4 a=texture2D(s,(i+vec2(.5,.5))*t),
       b=texture2D(s,(i+vec2(1.5,.5))*t),
       c=texture2D(s,(i+vec2(.5,1.5))*t),
       d=texture2D(s,(i+vec2(1.5,1.5))*t);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
void main(){
#ifdef MANUAL_FILTERING
  vec2 co=vUv-dt*bl(uVel,vUv,ts).xy*ts;
  vec4 res=bl(uSrc,co,dts);
#else
  vec2 co=vUv-dt*texture2D(uVel,vUv).xy*ts;
  vec4 res=texture2D(uSrc,co);
#endif
  gl_FragColor=res/(1.+diss*dt);
}`;
    const DIV = `precision mediump float;precision mediump sampler2D;
varying highp vec2 vUv,vL,vR,vT,vB;
uniform sampler2D u;
void main(){
  float L=texture2D(u,vL).x,R=texture2D(u,vR).x,T=texture2D(u,vT).y,B=texture2D(u,vB).y;
  vec2 C=texture2D(u,vUv).xy;
  if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;
  gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);
}`;
    const CURL_SH = `precision mediump float;precision mediump sampler2D;
varying highp vec2 vUv,vL,vR,vT,vB;
uniform sampler2D u;
void main(){
  float v=texture2D(u,vR).y-texture2D(u,vL).y-texture2D(u,vT).x+texture2D(u,vB).x;
  gl_FragColor=vec4(.5*v,0.,0.,1.);
}`;
    const VORT = `precision highp float;precision highp sampler2D;
varying vec2 vUv,vL,vR,vT,vB;
uniform sampler2D uVel,uCurl;
uniform float curl,dt;
void main(){
  float L=texture2D(uCurl,vL).x,R=texture2D(uCurl,vR).x,T=texture2D(uCurl,vT).x,B=texture2D(uCurl,vB).x,C=texture2D(uCurl,vUv).x;
  vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));
  f=f/(length(f)+.0001)*curl*C;
  f.y*=-1.;
  vec2 vel=texture2D(uVel,vUv).xy+f*dt;
  gl_FragColor=vec4(clamp(vel,-1e4,1e4),0.,1.);
}`;
    const PRES = `precision mediump float;precision mediump sampler2D;
varying highp vec2 vUv,vL,vR,vT,vB;
uniform sampler2D uP,uD;
void main(){
  float L=texture2D(uP,vL).x,R=texture2D(uP,vR).x,T=texture2D(uP,vT).x,B=texture2D(uP,vB).x,d=texture2D(uD,vUv).x;
  gl_FragColor=vec4((L+R+B+T-d)*.25,0.,0.,1.);
}`;
    const GSUB = `precision mediump float;precision mediump sampler2D;
varying highp vec2 vUv,vL,vR,vT,vB;
uniform sampler2D uP,uVel;
void main(){
  float L=texture2D(uP,vL).x,R=texture2D(uP,vR).x,T=texture2D(uP,vT).x,B=texture2D(uP,vB).x;
  vec2 vel=texture2D(uVel,vUv).xy-vec2(R-L,T-B);
  gl_FragColor=vec4(vel,0.,1.);
}`;

    type Program = {
      prog: WebGLProgram;
      locs: Record<string, WebGLUniformLocation | null>;
      use: () => void;
      s1i: (k: string, v: number) => void;
      s1f: (k: string, v: number) => void;
      s2f: (k: string, x: number, y: number) => void;
      s3f: (k: string, x: number, y: number, z: number) => void;
    };

    const shaders: WebGLShader[] = [];
    const programs: WebGLProgram[] = [];
    function mkS(src: string, type: number): WebGLShader {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      shaders.push(s);
      return s;
    }
    function mkP(vs: string, fs: string): Program {
      const p = gl!.createProgram()!;
      gl!.attachShader(p, mkS(vs, gl!.VERTEX_SHADER));
      gl!.attachShader(p, mkS(fs, gl!.FRAGMENT_SHADER));
      gl!.linkProgram(p);
      programs.push(p);
      const locs: Record<string, WebGLUniformLocation | null> = {};
      const n = gl!.getProgramParameter(p, gl!.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = gl!.getActiveUniform(p, i)!;
        locs[info.name] = gl!.getUniformLocation(p, info.name);
      }
      return {
        prog: p,
        locs,
        use: () => gl!.useProgram(p),
        s1i: (k, v) => gl!.uniform1i(locs[k]!, v),
        s1f: (k, v) => gl!.uniform1f(locs[k]!, v),
        s2f: (k, x, y) => gl!.uniform2f(locs[k]!, x, y),
        s3f: (k, x, y, z) => gl!.uniform3f(locs[k]!, x, y, z),
      };
    }

    const pCopy = mkP(BV, COPY);
    const pClear = mkP(BV, CLEAR);
    const pDisp = mkP(BV, DISP);
    const pSplat = mkP(BV, SPLAT);
    const pAdv = mkP(BV, ADV);
    const pDiv = mkP(BV, DIV);
    const pCurlP = mkP(BV, CURL_SH);
    const pVort = mkP(BV, VORT);
    const pPres = mkP(BV, PRES);
    const pGsub = mkP(BV, GSUB);
    void pCopy;

    const vb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );
    const ib = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW,
    );
    function bq(p: Program) {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, vb);
      const a = gl!.getAttribLocation(p.prog, 'aP');
      gl!.enableVertexAttribArray(a);
      gl!.vertexAttribPointer(a, 2, gl!.FLOAT, false, 0, 0);
      gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, ib);
    }

    type Target = {
      tex: WebGLTexture;
      fb: WebGLFramebuffer;
      w: number;
      h: number;
      attach: (id: number) => number;
    };
    const targets: Target[] = [];
    function mkT(w: number, h: number, fmt: Fmt, filt: number): Target {
      const tex = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filt);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filt);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        fmt.internalFormat,
        w,
        h,
        0,
        fmt.format,
        HFT as number,
        null,
      );
      const fb = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fb);
      gl!.framebufferTexture2D(
        gl!.FRAMEBUFFER,
        gl!.COLOR_ATTACHMENT0,
        gl!.TEXTURE_2D,
        tex,
        0,
      );
      gl!.viewport(0, 0, w, h);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      const t: Target = {
        tex,
        fb,
        w,
        h,
        attach(id: number) {
          gl!.activeTexture(gl!.TEXTURE0 + id);
          gl!.bindTexture(gl!.TEXTURE_2D, tex);
          return id;
        },
      };
      targets.push(t);
      return t;
    }
    function mkD(w: number, h: number, fmt: Fmt, filt: number) {
      let a = mkT(w, h, fmt, filt);
      let b = mkT(w, h, fmt, filt);
      return {
        get r() {
          return a;
        },
        get w() {
          return b;
        },
        swap() {
          [a, b] = [b, a];
        },
      };
    }

    const LIN = linFilt ? gl.LINEAR : gl.NEAREST;
    let vel: ReturnType<typeof mkD>;
    let dye: ReturnType<typeof mkD>;
    let pres: ReturnType<typeof mkD>;
    let curlT: Target;
    let divT: Target;
    let sw = 0;
    let sh = 0;
    let dw = 0;
    let dh = 0;

    function initFields() {
      const ar = canvas!.width / canvas!.height || 1;
      sw = simResolution;
      sh = Math.max(1, Math.round(simResolution / ar));
      dw = dyeResolution;
      dh = Math.max(1, Math.round(dyeResolution / ar));
      vel = mkD(sw, sh, rg, LIN);
      dye = mkD(dw, dh, rgba, LIN);
      pres = mkD(sw, sh, rSingle, gl!.NEAREST);
      curlT = mkT(sw, sh, rSingle, gl!.NEAREST);
      divT = mkT(sw, sh, rSingle, gl!.NEAREST);
    }

    function disposeFields() {
      for (const t of targets) {
        gl!.deleteTexture(t.tex);
        gl!.deleteFramebuffer(t.fb);
      }
      targets.length = 0;
    }

    function draw(t: Target | null) {
      if (t) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, t.fb);
        gl!.viewport(0, 0, t.w, t.h);
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
        gl!.viewport(0, 0, canvas!.width, canvas!.height);
      }
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    }

    function splat(
      x: number,
      y: number,
      dx: number,
      dy: number,
      col: { r: number; g: number; b: number },
      radVel: number,
      radDye: number,
    ) {
      const AR = canvas!.width / canvas!.height || 1;
      pSplat.use();
      bq(pSplat);
      pSplat.s1i('uT', vel.r.attach(0));
      pSplat.s1f('ar', AR);
      pSplat.s2f('pt', x, y);
      pSplat.s3f(
        'color',
        dx * cfgRef.current.SPLAT_FORCE,
        dy * cfgRef.current.SPLAT_FORCE,
        0,
      );
      pSplat.s1f('rad', radVel);
      draw(vel.w);
      vel.swap();
      pSplat.s1i('uT', dye.r.attach(0));
      pSplat.s3f('color', col.r, col.g, col.b);
      pSplat.s1f('rad', radDye);
      draw(dye.w);
      dye.swap();
    }

    // Splat radii are normalized to a reference canvas width.
    // On larger canvases, sqScale shrinks the Gaussian footprint so each splat
    // covers fewer dye texels relative to the screen — crisper, smaller smoke.
    // Clamped so small viewports don't overshoot into a bloated look.
    const REF_WIDTH = 1440;
    let sqScale = 1;
    function recomputeScale() {
      const w = canvas!.clientWidth || REF_WIDTH;
      const linear = Math.min(1.25, REF_WIDTH / w);
      sqScale = linear * linear;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(canvas!.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas!.clientHeight * dpr));
      if (canvas!.width === w && canvas!.height === h && targets.length > 0)
        return;
      canvas!.width = w;
      canvas!.height = h;
      recomputeScale();
      disposeFields();
      initFields();
    }
    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    // Mouse interaction.
    let mx = -1;
    let my = -1;
    let lmx = -1;
    let lmy = -1;
    function toUV(cx: number, cy: number) {
      const r = canvas!.getBoundingClientRect();
      return [(cx - r.left) / r.width, 1 - (cy - r.top) / r.height] as const;
    }
    function interact(x: number, y: number, dx: number, dy: number) {
      splat(x, y, dx, dy, { r: 0, g: 0, b: 0 }, 0.002 * sqScale, 0.002 * sqScale);
      const c = cfgRef.current.COLOR;
      splat(
        x,
        y,
        dx * 0.5,
        dy * 0.5,
        c,
        0.0002 * sqScale,
        cfgRef.current.DYE_RADIUS * sqScale,
      );
    }
    function onMove(e: MouseEvent) {
      [lmx, lmy] = [mx, my];
      [mx, my] = toUV(e.clientX, e.clientY);
      if (lmx < 0) {
        lmx = mx;
        lmy = my;
        return;
      }
      const dx = mx - lmx;
      const dy = my - lmy;
      if (Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) return;
      interact(mx, my, dx * 4, dy * 4);
    }
    window.addEventListener('mousemove', onMove, { passive: true });

    // Pause when tab hidden.
    let paused = document.hidden;
    function onVis() {
      paused = document.hidden;
      if (!paused) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }
    document.addEventListener('visibilitychange', onVis);

    let last = performance.now();
    let raf = 0;
    function tick(now: number) {
      if (paused) return;
      const dt = Math.min((now - last) / 1000, 0.016);
      last = now;
      const cfg = cfgRef.current;

      gl!.disable(gl!.BLEND);

      pCurlP.use();
      bq(pCurlP);
      pCurlP.s2f('ts', 1 / sw, 1 / sh);
      pCurlP.s1i('u', vel.r.attach(0));
      draw(curlT);

      pVort.use();
      bq(pVort);
      pVort.s2f('ts', 1 / sw, 1 / sh);
      pVort.s1i('uVel', vel.r.attach(0));
      pVort.s1i('uCurl', curlT.attach(1));
      pVort.s1f('curl', cfg.CURL);
      pVort.s1f('dt', dt);
      draw(vel.w);
      vel.swap();

      pDiv.use();
      bq(pDiv);
      pDiv.s2f('ts', 1 / sw, 1 / sh);
      pDiv.s1i('u', vel.r.attach(0));
      draw(divT);

      pClear.use();
      bq(pClear);
      pClear.s1i('u', pres.r.attach(0));
      pClear.s1f('v', DEFAULTS.PRESSURE);
      draw(pres.w);
      pres.swap();

      pPres.use();
      bq(pPres);
      pPres.s2f('ts', 1 / sw, 1 / sh);
      for (let i = 0; i < DEFAULTS.PRESSURE_ITER; i++) {
        pPres.s1i('uP', pres.r.attach(0));
        pPres.s1i('uD', divT.attach(1));
        draw(pres.w);
        pres.swap();
      }

      pGsub.use();
      bq(pGsub);
      pGsub.s2f('ts', 1 / sw, 1 / sh);
      pGsub.s1i('uP', pres.r.attach(0));
      pGsub.s1i('uVel', vel.r.attach(1));
      draw(vel.w);
      vel.swap();

      pAdv.use();
      bq(pAdv);
      pAdv.s2f('ts', 1 / sw, 1 / sh);
      pAdv.s2f('dts', 1 / sw, 1 / sh);
      pAdv.s1i('uVel', vel.r.attach(0));
      pAdv.s1i('uSrc', vel.r.attach(0));
      pAdv.s1f('dt', dt);
      pAdv.s1f('diss', cfg.VEL_DISS);
      draw(vel.w);
      vel.swap();

      pAdv.s2f('dts', 1 / dw, 1 / dh);
      pAdv.s1i('uVel', vel.r.attach(0));
      pAdv.s1i('uSrc', dye.r.attach(1));
      pAdv.s1f('diss', cfg.DENSITY_DISS);
      draw(dye.w);
      dye.swap();

      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
      pDisp.use();
      bq(pDisp);
      pDisp.s2f('ts', 1 / dw, 1 / dh);
      pDisp.s1i('u', dye.r.attach(0));
      draw(null);

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      ro.disconnect();
      disposeFields();
      for (const p of programs) gl!.deleteProgram(p);
      for (const s of shaders) gl!.deleteShader(s);
      gl!.deleteBuffer(vb);
      gl!.deleteBuffer(ib);
      const lose = gl!.getExtension('WEBGL_lose_context');
      lose?.loseContext();
    };
  }, [enabled, simResolution, dyeResolution]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
