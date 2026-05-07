import * as THREE from 'three';

export function initTunnelHero(container) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  container.style.position = 'relative';
  container.insertBefore(canvas, container.firstChild);

  const vertexShader = `void main(){ gl_Position = vec4(position, 1.0); }`;

  // Optimised fragment shader:
  //  – Reduced TUNNEL_LAYERS  96 → 60  (biggest GPU cost reducer)
  //  – Reduced RING_POINTS   128 → 80
  //  – Added vignette mask so edges fade instead of hard-clipping
  //  – Center offset pushed to exact screen centre so the circle
  //    sits behind the glass card and never clips
  const fragmentShader = `
    uniform float iTime;
    uniform vec3 iResolution;

    #define TAU 6.2831853071795865
    #define TUNNEL_LAYERS 60
    #define RING_POINTS 80
    #define POINT_SIZE 1.8
    #define POINT_COLOR_A vec3(1.0)
    #define POINT_COLOR_B vec3(0.7)
    #define SPEED 0.7

    float sq(float x){ return x*x; }

    vec2 AngRep(vec2 uv, float angle){
      vec2 polar = vec2(atan(uv.y, uv.x), length(uv));
      polar.x = mod(polar.x + angle/2.0, angle) - angle/2.0;
      return polar.y * vec2(cos(polar.x), sin(polar.x));
    }

    float sdCircle(vec2 uv, float r){ return length(uv) - r; }

    vec3 MixShape(float sd, vec3 fill, vec3 target){
      float blend = smoothstep(0.0, 1.0/iResolution.y, sd);
      return mix(fill, target, blend);
    }

    vec2 TunnelPath(float x){
      vec2 offs = vec2(
        0.2 * sin(TAU * x * 0.5) + 0.4 * sin(TAU * x * 0.2 + 0.3),
        0.3 * cos(TAU * x * 0.3) + 0.2 * cos(TAU * x * 0.1)
      );
      offs *= smoothstep(1.0, 4.0, x);
      return offs;
    }

    void main(){
      vec2 res = iResolution.xy / iResolution.y;
      vec2 uv = gl_FragCoord.xy / iResolution.y - res/2.0;
      vec3 color = vec3(0.0);
      float repAngle = TAU / float(RING_POINTS);
      float pointSize = POINT_SIZE / (2.0 * iResolution.y);
      float camZ = iTime * SPEED;
      vec2 camOffs = TunnelPath(camZ);

      for(int i = 1; i <= TUNNEL_LAYERS; i++){
        float pz = 1.0 - (float(i) / float(TUNNEL_LAYERS));
        pz -= mod(camZ, 4.0 / float(TUNNEL_LAYERS));
        vec2 offs = TunnelPath(camZ + pz) - camOffs;
        float ringRad = 0.15 * (1.0 / sq(pz * 0.8 + 0.4));
        if(abs(length(uv + offs) - ringRad) < pointSize * 1.5){
          vec2 aruv = AngRep(uv + offs, repAngle);
          float pdist = sdCircle(aruv - vec2(ringRad, 0), pointSize);
          vec3 ptColor = (mod(float(i/2), 2.0) == 0.0) ? POINT_COLOR_A : POINT_COLOR_B;
          float shade = (1.0 - pz);
          color = MixShape(pdist, ptColor * shade, color);
        }
      }

      // Soft vignette so edges fade to black instead of hard-clipping
      float vignette = 1.0 - smoothstep(0.35, 0.75, length(uv));
      color *= vignette;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false }); // antialias off for perf
  // Cap DPR to 1.5 for heavy shader backgrounds
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);

  const w = container.offsetWidth;
  const h = container.offsetHeight;
  renderer.setSize(w, h);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(w * dpr, h * dpr, 1) },
    },
    vertexShader,
    fragmentShader,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let animId;
  let lastTime = 0;
  let running = false;

  function animate(time) {
    animId = requestAnimationFrame(animate);
    if (!running) { lastTime = time; return; }
    time *= 0.001;
    const delta = time - (lastTime || time);
    lastTime = time;
    material.uniforms.iTime.value += delta * 0.5;
    renderer.render(scene, camera);
  }

  function resize() {
    const cw = container.offsetWidth;
    const ch = container.offsetHeight;
    const dp = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dp);
    renderer.setSize(cw, ch);
    material.uniforms.iResolution.value.set(cw * dp, ch * dp, 1);
  }

  // Only render when section is visible (IntersectionObserver)
  const observer = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
  }, { threshold: 0, rootMargin: '200px 0px' });

  observer.observe(container);

  function onVisibility() {
    if (document.hidden) running = false;
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);
  animId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animId);
    observer.disconnect();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibility);
    scene.remove(mesh);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
