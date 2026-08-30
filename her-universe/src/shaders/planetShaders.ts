// ============================================================
// Her Universe — Planet Shader Library
// ============================================================
// Procedural GLSL shaders for each planet, atmosphere, rings,
// and the Sun. Uses 3D simplex noise for organic surfaces.
// ============================================================

// ── Shared noise functions (injected into every planet shader) ───
export const NOISE_GLSL = /* glsl */ `
//
// 3D Simplex Noise  (Stefan Gustavson, optimized Ian McEwan)
//
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractional Brownian Motion
float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}
`;

// ── Shared vertex shader ────────────────────────────────────────
export const PLANET_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// ── Mercury — Rocky, cratered, grey-brown ───────────────────────
export const MERCURY_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 pos = vPosition * 2.5;

  // Base rocky grey-brown
  float n1 = fbm(pos, 5);
  float n2 = snoise(pos * 4.0) * 0.3;

  // Crater-like depressions
  float craters = 0.0;
  for (int i = 0; i < 12; i++) {
    vec3 craterPos = vec3(
      sin(float(i) * 2.4) * 1.5,
      cos(float(i) * 1.7) * 1.5,
      sin(float(i) * 3.1) * 1.5
    );
    float dist = length(vPosition - craterPos);
    float crater = smoothstep(0.3, 0.05, dist);
    craters += crater * 0.15;
  }

  vec3 baseColor = mix(
    vec3(0.55, 0.50, 0.45),  // light grey-brown
    vec3(0.35, 0.30, 0.28),  // dark grey
    n1 * 0.5 + 0.5
  );

  baseColor -= craters;
  baseColor += n2 * vec3(0.05, 0.04, 0.03);

  // Directional lighting from Sun
  float diffuse = max(dot(vNormal, uSunDirection), 0.0);
  float ambient = 0.08;
  vec3 lit = baseColor * (diffuse * 0.9 + ambient);

  // Subtle terminator softening
  float terminator = smoothstep(-0.05, 0.15, dot(vNormal, uSunDirection));
  lit *= mix(0.3, 1.0, terminator);

  gl_FragColor = vec4(lit, 1.0);
}
`;

// ── Venus — Dense swirling clouds, warm yellows ─────────────────
export const VENUS_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 pos = vPosition * 2.0;

  // Swirling cloud motion
  float t = uTime * 0.06;
  float cloud1 = fbm(pos + vec3(t, 0.0, t * 0.5), 5);
  float cloud2 = fbm(pos * 1.5 + vec3(-t * 0.7, t * 0.3, 0.0), 4);
  float cloud3 = snoise(pos * 3.0 + vec3(t * 0.4, -t * 0.2, t * 0.6)) * 0.2;

  float cloudPattern = cloud1 * 0.6 + cloud2 * 0.3 + cloud3;

  // Warm Venus palette
  vec3 color1 = vec3(1.0, 0.85, 0.5);   // bright cream-yellow
  vec3 color2 = vec3(0.92, 0.68, 0.3);  // warm orange
  vec3 color3 = vec3(0.78, 0.52, 0.2);  // deep amber

  vec3 baseColor = mix(color1, color2, smoothstep(-0.3, 0.3, cloudPattern));
  baseColor = mix(baseColor, color3, smoothstep(0.2, 0.7, cloudPattern));

  // Directional lighting
  float diffuse = max(dot(vNormal, uSunDirection), 0.0);
  float ambient = 0.15;

  // Venus has thick atmosphere — softer terminator
  float terminator = smoothstep(-0.2, 0.3, dot(vNormal, uSunDirection));

  vec3 lit = baseColor * (diffuse * 0.7 + ambient);
  lit *= mix(0.45, 1.0, terminator);

  // Soft atmospheric scatter
  lit += vec3(0.08, 0.05, 0.02) * (1.0 - terminator);

  gl_FragColor = vec4(lit, 1.0);
}
`;

// ── Earth — Continents, oceans, ice, clouds ─────────────────────
export const EARTH_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 pos = vPosition * 2.0;

  // Continental shapes via layered noise
  float continent = fbm(pos * 1.2, 5);
  float detail = snoise(pos * 6.0) * 0.15;
  float landMask = smoothstep(-0.05, 0.12, continent + detail);

  // Ocean depth variation
  float oceanDepth = snoise(pos * 3.0) * 0.2;

  // Land colors
  vec3 deepGreen = vec3(0.15, 0.42, 0.12);
  vec3 lightGreen = vec3(0.28, 0.55, 0.2);
  vec3 desert = vec3(0.72, 0.62, 0.38);
  vec3 mountain = vec3(0.45, 0.38, 0.32);

  float landDetail = snoise(pos * 4.5);
  vec3 landColor = mix(deepGreen, lightGreen, smoothstep(-0.3, 0.3, landDetail));
  landColor = mix(landColor, desert, smoothstep(0.2, 0.6, landDetail));
  landColor = mix(landColor, mountain, smoothstep(0.5, 0.8, landDetail));

  // Ocean colors
  vec3 deepOcean = vec3(0.02, 0.08, 0.28);
  vec3 shallowOcean = vec3(0.06, 0.22, 0.58);
  vec3 oceanColor = mix(deepOcean, shallowOcean, smoothstep(-0.2, 0.2, oceanDepth));

  // Polar ice caps
  float latitude = abs(vPosition.y) / length(vPosition);
  float iceMask = smoothstep(0.72, 0.85, latitude + snoise(pos * 3.0) * 0.08);
  vec3 iceColor = vec3(0.92, 0.95, 0.98);

  // Combine land / ocean
  vec3 surfaceColor = mix(oceanColor, landColor, landMask);
  surfaceColor = mix(surfaceColor, iceColor, iceMask);

  // Cloud layer (animated)
  float t = uTime * 0.04;
  float clouds = fbm(pos * 2.5 + vec3(t, 0.0, t * 0.3), 4);
  float cloudMask = smoothstep(0.05, 0.35, clouds);
  vec3 cloudColor = vec3(0.95, 0.97, 1.0);
  surfaceColor = mix(surfaceColor, cloudColor, cloudMask * 0.65);

  // Directional lighting
  float diffuse = max(dot(vNormal, uSunDirection), 0.0);
  float ambient = 0.1;
  float terminator = smoothstep(-0.08, 0.2, dot(vNormal, uSunDirection));

  vec3 lit = surfaceColor * (diffuse * 0.85 + ambient);
  lit *= mix(0.25, 1.0, terminator);

  // Night side city lights (very subtle warm dots)
  float nightSide = 1.0 - terminator;
  float cityNoise = snoise(pos * 20.0);
  float cities = smoothstep(0.65, 0.75, cityNoise) * landMask * nightSide;
  lit += vec3(1.0, 0.85, 0.4) * cities * 0.15;

  // Ocean specular highlight
  float specAngle = max(dot(reflect(-uSunDirection, vNormal), normalize(-vPosition)), 0.0);
  float specular = pow(specAngle, 40.0) * (1.0 - landMask) * diffuse;
  lit += vec3(0.6, 0.7, 0.9) * specular * 0.3;

  gl_FragColor = vec4(lit, 1.0);
}
`;

// ── Mars — Red-orange, rocky, dry ───────────────────────────────
export const MARS_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 pos = vPosition * 2.5;

  // Terrain layers
  float terrain = fbm(pos, 5);
  float detail = snoise(pos * 5.0) * 0.2;
  float canyons = snoise(pos * 8.0) * 0.1;

  // Mars palette
  vec3 rust = vec3(0.76, 0.28, 0.1);
  vec3 darkRock = vec3(0.42, 0.18, 0.08);
  vec3 dusty = vec3(0.88, 0.52, 0.28);
  vec3 sand = vec3(0.92, 0.72, 0.48);

  vec3 baseColor = mix(rust, darkRock, smoothstep(-0.2, 0.3, terrain));
  baseColor = mix(baseColor, dusty, smoothstep(0.1, 0.5, terrain + detail));
  baseColor = mix(baseColor, sand, smoothstep(0.4, 0.7, detail));
  baseColor -= canyons * vec3(0.1, 0.05, 0.02);

  // Polar ice caps
  float latitude = abs(vPosition.y) / length(vPosition);
  float iceMask = smoothstep(0.82, 0.92, latitude + snoise(pos * 2.0) * 0.05);
  vec3 iceColor = vec3(0.9, 0.92, 0.95);
  baseColor = mix(baseColor, iceColor, iceMask);

  // Lighting
  float diffuse = max(dot(vNormal, uSunDirection), 0.0);
  float ambient = 0.08;
  float terminator = smoothstep(-0.05, 0.15, dot(vNormal, uSunDirection));

  vec3 lit = baseColor * (diffuse * 0.9 + ambient);
  lit *= mix(0.2, 1.0, terminator);

  gl_FragColor = vec4(lit, 1.0);
}
`;

// ── Jupiter — Cloud bands, Great Red Spot ───────────────────────
export const JUPITER_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 pos = vPosition;
  float t = uTime * 0.03;

  // Latitude-based banding
  float lat = atan(pos.y, length(pos.xz));
  float bands = sin(lat * 18.0) * 0.5 + 0.5;

  // Turbulent distortion along bands
  float turbulence = snoise(vec3(pos.x * 3.0, lat * 8.0 + t, pos.z * 3.0)) * 0.15;
  bands += turbulence;

  // Jupiter palette
  vec3 cream = vec3(0.95, 0.88, 0.72);
  vec3 orange = vec3(0.88, 0.58, 0.28);
  vec3 brown = vec3(0.62, 0.38, 0.18);
  vec3 white = vec3(0.96, 0.94, 0.9);

  vec3 baseColor = mix(cream, orange, smoothstep(0.3, 0.6, bands));
  baseColor = mix(baseColor, brown, smoothstep(0.6, 0.85, bands));
  baseColor = mix(baseColor, white, smoothstep(0.0, 0.2, bands) * 0.4);

  // Great Red Spot
  vec2 spotCenter = vec2(0.6, -0.25);
  vec2 spotPos = vec2(atan(pos.z, pos.x) / 3.14159, pos.y / length(pos));
  float spotDist = length((spotPos - spotCenter) * vec2(1.0, 2.0));
  float spotMask = smoothstep(0.18, 0.05, spotDist);
  float spotSwirl = snoise(vec3(spotPos * 15.0, t * 0.5)) * 0.3;
  vec3 spotColor = mix(vec3(0.82, 0.25, 0.12), vec3(0.72, 0.18, 0.08), spotSwirl + 0.5);
  baseColor = mix(baseColor, spotColor, spotMask);

  // Subtle band-level detail
  float fineDetail = snoise(vec3(pos.x * 8.0, lat * 20.0, pos.z * 8.0 + t * 0.5)) * 0.06;
  baseColor += fineDetail;

  // Lighting
  float diffuse = max(dot(vNormal, uSunDirection), 0.0);
  float ambient = 0.12;
  float terminator = smoothstep(-0.1, 0.2, dot(vNormal, uSunDirection));

  vec3 lit = baseColor * (diffuse * 0.8 + ambient);
  lit *= mix(0.3, 1.0, terminator);

  gl_FragColor = vec4(lit, 1.0);
}
`;

// ── Saturn — Soft golden bands ──────────────────────────────────
export const SATURN_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 pos = vPosition;
  float t = uTime * 0.02;

  // Latitude banding (softer than Jupiter)
  float lat = atan(pos.y, length(pos.xz));
  float bands = sin(lat * 14.0) * 0.5 + 0.5;
  float subtleTurb = snoise(vec3(pos.x * 2.0, lat * 6.0 + t, pos.z * 2.0)) * 0.08;
  bands += subtleTurb;

  // Saturn palette — soft golds and beiges
  vec3 gold = vec3(0.92, 0.82, 0.55);
  vec3 cream = vec3(0.95, 0.90, 0.78);
  vec3 tan = vec3(0.82, 0.68, 0.42);
  vec3 pale = vec3(0.96, 0.94, 0.88);

  vec3 baseColor = mix(cream, gold, smoothstep(0.3, 0.6, bands));
  baseColor = mix(baseColor, tan, smoothstep(0.6, 0.8, bands));
  baseColor = mix(baseColor, pale, smoothstep(0.0, 0.25, bands) * 0.3);

  // Lighting
  float diffuse = max(dot(vNormal, uSunDirection), 0.0);
  float ambient = 0.12;
  float terminator = smoothstep(-0.1, 0.2, dot(vNormal, uSunDirection));

  vec3 lit = baseColor * (diffuse * 0.8 + ambient);
  lit *= mix(0.3, 1.0, terminator);

  gl_FragColor = vec4(lit, 1.0);
}
`;

// ── Uranus — Smooth pale cyan ───────────────────────────────────
export const URANUS_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 pos = vPosition * 1.5;
  float t = uTime * 0.015;

  // Very smooth atmospheric gradient
  float lat = atan(pos.y, length(pos.xz));
  float gradient = sin(lat * 3.0) * 0.5 + 0.5;
  float subtleNoise = snoise(pos * 2.0 + vec3(t, 0.0, t * 0.3)) * 0.06;

  // Uranus pale cyan palette
  vec3 lightCyan = vec3(0.68, 0.92, 0.90);
  vec3 paleCyan = vec3(0.55, 0.82, 0.82);
  vec3 deepCyan = vec3(0.35, 0.65, 0.70);

  vec3 baseColor = mix(lightCyan, paleCyan, gradient);
  baseColor = mix(baseColor, deepCyan, subtleNoise + 0.3);

  // Very subtle banding
  float bands = sin(lat * 8.0) * 0.03;
  baseColor += bands;

  // Lighting
  float diffuse = max(dot(vNormal, uSunDirection), 0.0);
  float ambient = 0.12;
  float terminator = smoothstep(-0.15, 0.25, dot(vNormal, uSunDirection));

  vec3 lit = baseColor * (diffuse * 0.75 + ambient);
  lit *= mix(0.35, 1.0, terminator);

  gl_FragColor = vec4(lit, 1.0);
}
`;

// ── Neptune — Deep rich blue, stormy ────────────────────────────
export const NEPTUNE_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 pos = vPosition * 2.0;
  float t = uTime * 0.04;

  // Atmospheric bands
  float lat = atan(pos.y, length(pos.xz));
  float bands = sin(lat * 12.0) * 0.5 + 0.5;
  float turbulence = snoise(vec3(pos.x * 3.0, lat * 6.0 + t, pos.z * 3.0)) * 0.12;
  bands += turbulence;

  // Storm patterns
  float storm = fbm(pos * 2.5 + vec3(t * 0.6, 0.0, t * 0.4), 4);
  float stormMask = smoothstep(0.2, 0.5, storm);

  // Neptune deep blue palette
  vec3 deepBlue = vec3(0.08, 0.12, 0.52);
  vec3 mediumBlue = vec3(0.15, 0.25, 0.72);
  vec3 brightBlue = vec3(0.22, 0.42, 0.88);
  vec3 stormWhite = vec3(0.7, 0.78, 0.95);

  vec3 baseColor = mix(deepBlue, mediumBlue, smoothstep(0.3, 0.6, bands));
  baseColor = mix(baseColor, brightBlue, smoothstep(0.6, 0.85, bands));
  baseColor = mix(baseColor, stormWhite, stormMask * 0.2);

  // Dark spot feature
  vec2 darkSpot = vec2(0.3, 0.15);
  vec2 spotPos = vec2(atan(pos.z, pos.x) / 3.14159, pos.y / length(pos));
  float spotDist = length((spotPos - darkSpot) * vec2(1.2, 2.0));
  float spotMask = smoothstep(0.15, 0.04, spotDist);
  baseColor = mix(baseColor, deepBlue * 0.6, spotMask);

  // Lighting
  float diffuse = max(dot(vNormal, uSunDirection), 0.0);
  float ambient = 0.1;
  float terminator = smoothstep(-0.1, 0.2, dot(vNormal, uSunDirection));

  vec3 lit = baseColor * (diffuse * 0.8 + ambient);
  lit *= mix(0.25, 1.0, terminator);

  // Subtle edge glow
  float rim = 1.0 - max(dot(vNormal, normalize(-vPosition)), 0.0);
  lit += vec3(0.1, 0.2, 0.5) * pow(rim, 3.0) * 0.15;

  gl_FragColor = vec4(lit, 1.0);
}
`;

// ── Sun — Animated plasma surface ───────────────────────────────
export const SUN_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const SUN_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 pos = vPosition * 1.8;
  float t = uTime * 0.2;

  // Multi-layered turbulent solar plasma
  float plasma1 = fbm(pos + vec3(t * 0.8, t * 0.3, -t * 0.4), 5);
  float plasma2 = fbm(pos * 2.2 + vec3(-t * 0.5, t * 0.7, t * 0.2), 4);
  float plasma3 = snoise(pos * 4.5 + vec3(t * 0.9, -t * 0.6, t * 0.8)) * 0.3;
  float granules = snoise(pos * 9.0 + vec3(0.0, t * 0.4, 0.0)) * 0.15;

  float plasmaPattern = plasma1 * 0.45 + plasma2 * 0.35 + plasma3 + granules;

  // Rich, fiery Sun palette — vibrant oranges, fiery reds, deep ambers & golden core
  vec3 hotCore = vec3(1.0, 0.92, 0.55);      // incandescent gold core
  vec3 brightOrange = vec3(1.0, 0.55, 0.05); // vibrant solar orange
  vec3 deepCrimson = vec3(0.85, 0.22, 0.02); // fiery crimson red filaments
  vec3 darkFlare = vec3(0.55, 0.10, 0.01);   // deep sunspot / prominence dark red

  vec3 baseColor = mix(hotCore, brightOrange, smoothstep(-0.4, 0.15, plasmaPattern));
  baseColor = mix(baseColor, deepCrimson, smoothstep(0.1, 0.55, plasmaPattern));
  baseColor = mix(baseColor, darkFlare, smoothstep(0.5, 0.85, plasmaPattern));

  // Dynamic fiery solar granulation detail
  float filamentNoise = snoise(vec3(pos.x * 6.0 + t, pos.y * 6.0, pos.z * 6.0));
  baseColor += vec3(0.25, 0.08, 0.0) * smoothstep(0.3, 0.7, filamentNoise);

  // Rim energy
  float rim = 1.0 - max(dot(vNormal, normalize(-vPosition)), 0.0);
  baseColor += vec3(0.6, 0.2, 0.0) * pow(rim, 2.0);

  // Controlled emissive brightness
  baseColor *= 1.45;

  gl_FragColor = vec4(baseColor, 1.0);
}
`;

// ── Atmosphere / Fresnel Glow Shell ─────────────────────────────
export const ATMOSPHERE_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const ATMOSPHERE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uPower;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float fresnel = 1.0 - max(dot(vNormal, vViewDir), 0.0);
  float glow = pow(fresnel, uPower) * uIntensity;
  gl_FragColor = vec4(uColor, glow);
}
`;

// ── Saturn Ring Shader ──────────────────────────────────────────
export const RING_VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vRadius;

uniform float uInnerRadius;
uniform float uOuterRadius;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vRadius = length(position.xy);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const RING_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uInnerRadius;
uniform float uOuterRadius;
uniform vec3 uSunDirection;
uniform float uTime;
uniform vec3 uColorInner;
uniform vec3 uColorMid;
uniform vec3 uColorOuter;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vRadius;

void main() {
  // Normalized radial position (0 = inner, 1 = outer)
  float t = (vRadius - uInnerRadius) / (uOuterRadius - uInnerRadius);
  t = clamp(t, 0.0, 1.0);

  // Ring band pattern — multiple thin rings with gaps
  float ringPattern = 0.0;

  // Multi-layered nested concentric ring bands
  ringPattern += smoothstep(0.0, 0.04, t) * smoothstep(0.28, 0.24, t) * 0.75; // inner ring
  ringPattern += smoothstep(0.26, 0.30, t) * smoothstep(0.62, 0.58, t) * 1.0;  // main bright ring
  ringPattern += smoothstep(0.64, 0.68, t) * smoothstep(0.96, 0.90, t) * 0.75; // outer ring

  // Division gaps
  float gap1 = 1.0 - smoothstep(0.58, 0.61, t) * smoothstep(0.65, 0.62, t);
  float gap2 = 1.0 - smoothstep(0.78, 0.80, t) * smoothstep(0.83, 0.81, t);
  ringPattern *= gap1 * gap2;

  // Delicate fine concentric ring lines
  float fineRings = sin(t * 260.0) * 0.15 + 0.85;
  ringPattern *= fineRings;

  // Subtle orbital dust variation
  float noise = snoise(vec3(t * 35.0, vUv.x * 12.0, uTime * 0.01)) * 0.06;
  ringPattern += noise;

  // Dynamic Ring colors
  vec3 ringColor = mix(uColorInner, uColorMid, smoothstep(0.2, 0.5, t));
  ringColor = mix(ringColor, uColorOuter, smoothstep(0.6, 0.9, t));

  // Edge fade
  float edgeFade = smoothstep(0.0, 0.02, t) * smoothstep(1.0, 0.98, t);
  float alpha = ringPattern * edgeFade * 0.88;

  gl_FragColor = vec4(ringColor, alpha);
}
`;

// ── Shader type map ─────────────────────────────────────────────
export type PlanetShaderType =
  | 'mercury' | 'venus' | 'earth' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

export const PLANET_FRAGMENT_SHADERS: Record<PlanetShaderType, string> = {
  mercury: MERCURY_FRAGMENT,
  venus: VENUS_FRAGMENT,
  earth: EARTH_FRAGMENT,
  mars: MARS_FRAGMENT,
  jupiter: JUPITER_FRAGMENT,
  saturn: SATURN_FRAGMENT,
  uranus: URANUS_FRAGMENT,
  neptune: NEPTUNE_FRAGMENT,
};

// ── Atmosphere config per planet ────────────────────────────────
export interface AtmosphereConfig {
  color: [number, number, number];
  intensity: number;
  power: number;
  scale: number;
}

export const PLANET_ATMOSPHERES: Partial<Record<PlanetShaderType, AtmosphereConfig>> = {
  venus: { color: [1.0, 0.85, 0.4], intensity: 0.6, power: 3.0, scale: 1.15 },
  earth: { color: [0.3, 0.6, 1.0], intensity: 0.7, power: 3.5, scale: 1.12 },
  mars: { color: [0.8, 0.35, 0.15], intensity: 0.25, power: 4.0, scale: 1.08 },
  jupiter: { color: [0.85, 0.65, 0.3], intensity: 0.2, power: 4.0, scale: 1.06 },
  saturn: { color: [0.9, 0.8, 0.5], intensity: 0.2, power: 4.0, scale: 1.06 },
  uranus: { color: [0.5, 0.9, 0.85], intensity: 0.35, power: 3.0, scale: 1.1 },
  neptune: { color: [0.2, 0.4, 0.9], intensity: 0.4, power: 3.0, scale: 1.1 },
};
