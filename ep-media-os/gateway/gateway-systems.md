# EP MEDIA OS — GATEWAY SYSTEMS
*How each cinematic entry experience works. Copy, adapt, deploy.*

---

## WHAT IS A GATEWAY?

A Gateway is the cinematic first interaction on a website.

Instead of loading a standard hero section, the user encounters an object, environment, or interaction that they must engage with before the content reveals.

Gateways create the "premium feeling" that generic templates can never replicate. They signal: *this is not like other websites.*

---

## GATEWAY 01 — HELMET GATEWAY

**Use for:** Sports organizations, teams, athletic programs

**How it works:**
1. Page loads showing a 3D or video helmet in center of screen
2. Helmet slowly rotates via Three.js or CSS 3D transform
3. CTA: "Enter" or user scrolls
4. Scroll (or click) triggers video scrub — helmet "explodes" into the stadium environment
5. Content fades in beneath

**Implementation:**
```html
<!-- Video scrub approach (used in EPSG) -->
<section id="hero" class="ep-hero ep-hero--video">
  <video id="hero-scrub-video" class="ep-hero-video-bg"
         muted playsinline preload="metadata" poster="helmet-poster.jpg">
    <source src="helmet-explode.mp4" type="video/mp4">
  </video>
  <!-- scroll-scrub.js handles currentTime -->
</section>
```

```javascript
// ep-scroll-scrub.js pattern
ScrollTrigger.create({
  trigger: '#hero',
  start: 'top top',
  end: '+=150%',
  pin: true,
  scrub: true,
  onUpdate: (self) => {
    video.currentTime = self.progress * (video.duration - 0.05);
  }
});
```

**Asset needed:** A 3–8 second video of the helmet opening, exploding, or transitioning into the hero scene. Export from Blender, Cinema 4D, or commission via Higgsfield.

**Production time:** 30 min implementation + asset creation time

---

## GATEWAY 02 — DOOR / GATE GATEWAY

**Use for:** Private clubs, real estate, hospitality, luxury brands

**How it works:**
1. Page loads with a full-screen door or gate image/video
2. Glass panel UI overlaid — keypad, handle, or button
3. User interacts: enters code, clicks handle, or presses button
4. Door swings open / fades away → content revealed beneath
5. Animation: CSS transform (rotateY), GSAP timeline, or opacity crossfade

**Access code variation (used in EP Cinematic Listings):**
```javascript
// Hardcode or pull from config
const ACCESS_CODE = '2-5-1';
let entry = '';

keypadBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    entry += btn.dataset.digit;
    updateDisplay(entry);
    if (entry === ACCESS_CODE.replace(/-/g, '')) unlock();
  });
});

function unlock() {
  gate.style.transition = 'opacity 0.8s ease';
  gate.style.opacity = '0';
  setTimeout(() => { gate.remove(); initEstateWorld(); }, 800);
}
```

**Simple CTA variation:**
```html
<div class="ep-gateway-door">
  <img src="door.jpg" class="ep-gateway-bg" alt="">
  <div class="ep-gateway-panel">
    <p class="ep-eyebrow">Private Access</p>
    <h2 class="ep-title">Welcome</h2>
    <button id="gateway-enter" class="ep-btn ep-btn--primary">Enter →</button>
  </div>
</div>
```

**Production time:** 1–2 hours with existing door image

---

## GATEWAY 03 — VIDEO REVEAL GATEWAY

**Use for:** Media companies, production studios, luxury brands, real estate

**How it works:**
1. Page loads with a black screen and a single centered logo or text
2. "Enter" CTA or auto-play after 2 seconds
3. Video fades in — cinematic scene plays (stadium, city, sunset)
4. Text fades over the video
5. Content transitions in as video loops

**Implementation:**
```html
<div id="ep-gateway-reveal" style="position:fixed;inset:0;background:#050505;z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;">
  <img src="logo.svg" alt="Logo" style="width:80px;margin-bottom:40px;opacity:0;animation:fadeIn 1s 0.5s forwards;">
  <button id="gateway-play" class="ep-btn ep-btn--ghost">Enter →</button>
</div>

<video id="gateway-video" autoplay muted loop playsinline
       style="position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1;opacity:0;transition:opacity 1.5s ease;">
  <source src="cinematic-intro.mp4" type="video/mp4">
</video>
```

```javascript
document.getElementById('gateway-play').addEventListener('click', () => {
  const gateway = document.getElementById('ep-gateway-reveal');
  const video   = document.getElementById('gateway-video');
  gateway.style.transition = 'opacity 0.8s ease';
  gateway.style.opacity = '0';
  video.style.opacity = '1';
  setTimeout(() => { gateway.remove(); }, 800);
});
```

**Production time:** 1 hour (with video asset)

---

## GATEWAY 04 — POSTER-TO-VIDEO GATEWAY

**Use for:** Photography studios, creative agencies, product launches

**How it works:**
1. Page loads with a high-quality still image (poster)
2. On hover or first interaction, the image dissolves into a playing video
3. The transition is seamless — image and video are identical frames
4. Creates "magic reveal" effect without video autoplay issues on mobile

**Implementation:**
```html
<div class="ep-poster-gateway" style="position:relative;overflow:hidden;">
  <img id="gateway-poster" src="poster.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity 0.8s ease;z-index:1;">
  <video id="gateway-video" muted loop playsinline preload="metadata"
         style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">
    <source src="cinematic.mp4" type="video/mp4">
  </video>
</div>
```

```javascript
const poster = document.getElementById('gateway-poster');
const video  = document.getElementById('gateway-video');
poster.parentElement.addEventListener('mouseenter', () => {
  video.play();
  poster.style.opacity = '0';
});
```

**Production time:** 30 min implementation (poster + video already aligned)

---

## GATEWAY 05 — CAMERA PUSH GATEWAY

**Use for:** Real estate, venues, premium retail, hospitality

**How it works:**
1. Page loads with wide establishing shot of property/space
2. On scroll: camera slowly pushes toward entrance
3. At scroll end, user is "inside" — transition to interior content
4. Pure CSS scale + GSAP scrub, no 3D required

**Implementation:**
```javascript
gsap.to('.gateway-image', {
  scale: 1.6,
  ease: 'none',
  scrollTrigger: {
    trigger: '.gateway-section',
    start: 'top top',
    end: '+=200%',
    pin: true,
    scrub: true,
  }
});

// When scale crosses threshold, fade in interior content
ScrollTrigger.create({
  trigger: '.gateway-section',
  start: '66% top',
  onEnter: () => {
    gsap.to('.gateway-interior', { opacity: 1, duration: 0.8 });
  }
});
```

**Production time:** 2 hours (great exterior photo required)

---

## GATEWAY 06 — BOWL / STADIUM GATEWAY

**Use for:** Sports leagues, events, major programs

**How it works:**
1. Aerial view of empty stadium or bowl
2. Crowd noise audio option (muted by default)
3. Scroll zooms into field → athletes / logo appears
4. Same camera push technique with a stadium aerial image or video

**Note:** Works extremely well paired with a scrub video of the stadium filling.

---

## GATEWAY 07 — OBJECT GATEWAY (Generic)

**Template for custom objects (furniture, vehicles, equipment):**
```javascript
// Replace 'object.glb' with any GLTF/GLB asset
const loader = new THREE.GLTFLoader();
loader.load('/assets/gateway/object.glb', (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.position.set(0, -0.5, 0);
  gltf.scene.scale.setScalar(1.8);
  // Animate: auto-rotate + mouse parallax
  function animate() {
    requestAnimationFrame(animate);
    gltf.scene.rotation.y += 0.003;
    renderer.render(scene, camera);
  }
  animate();
});
```

---

## CHOOSING THE RIGHT GATEWAY

| Industry          | Recommended Gateway          | Why |
|-------------------|------------------------------|-----|
| Youth Sports      | Helmet Gateway               | Brand icon |
| Pro Sports        | Stadium / Bowl               | Aspirational |
| Real Estate       | Door / Keypad                | Exclusivity |
| Luxury Real Estate| Camera Push                  | Cinematic walkthrough |
| Restaurant        | Poster-to-Video              | Food photography |
| Roofing/HVAC      | Video Reveal                 | Before/after drama |
| Medical/Wellness  | Door (clean, clinical)       | Trust signal |
| Gym/Fitness       | Helmet or Video Reveal       | Energy |
| Photography       | Poster-to-Video              | Portfolio reveal |
| Event Venue       | Bowl / Camera Push           | Atmosphere |
| Fashion/Apparel   | Video Reveal                 | Brand storytelling |

---

## GATEWAY PERFORMANCE RULES

- Gateway video: max 8MB, H.264, 1080p max
- Always provide `poster` image (shown on slow connections)
- Never block page load — gateway loads after critical content
- Always offer a "Skip" or "Enter" button — never trap the user
- Test on iOS Safari: video autoplay requires `muted playsinline`
- Three.js canvas: always `pointer-events: none`
