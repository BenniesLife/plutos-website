// Lightweight foreground atmosphere. Motion follows the same control as the video.
const canvas = document.querySelector("#spore-field");
const context = canvas?.getContext("2d");

if (canvas && context) {
  const scene = document.querySelector(".night-scene");
  const finePointer = window.matchMedia("(pointer: fine)");
  let width = innerWidth;
  let height = innerHeight;
  let running = false;
  let frame = 0;
  let lastTime = 0;
  let pointer = { x: 0, y: 0 };
  const offset = { x: 0, y: 0 };
  const motes = Array.from({ length: width < 761 ? 24 : 46 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.7 + Math.random() * 1.6,
    speed: 0.006 + Math.random() * 0.015,
    phase: Math.random() * Math.PI * 2,
    warm: index % 3 === 0,
  }));

  function resize() {
    width = innerWidth;
    height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (!running) draw(0);
  }

  function draw(delta) {
    context.clearRect(0, 0, width, height);
    for (const mote of motes) {
      mote.y -= mote.speed * delta;
      mote.phase += delta * 0.35;
      if (mote.y < -0.02) {
        mote.y = 1.02;
        mote.x = Math.random();
      }
      const x = mote.x * width + Math.sin(mote.phase) * 26 + offset.x * 1.5;
      const y = mote.y * height;
      context.beginPath();
      context.arc(x, y, mote.radius, 0, Math.PI * 2);
      context.fillStyle = mote.warm
        ? "rgba(218,105,52,0.62)"
        : "rgba(174,169,104,0.34)";
      context.shadowColor = mote.warm ? "#b3451e" : "#a1a866";
      context.shadowBlur = mote.warm ? 12 : 4;
      context.fill();
    }
    context.shadowBlur = 0;
  }

  function tick(time) {
    if (!running) return;
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    offset.x += (pointer.x - offset.x) * 0.035;
    offset.y += (pointer.y - offset.y) * 0.035;
    scene.style.setProperty("--scene-x", `${offset.x.toFixed(2)}px`);
    scene.style.setProperty("--scene-y", `${offset.y.toFixed(2)}px`);
    draw(delta);
    frame = requestAnimationFrame(tick);
  }

  function setRunning(playing) {
    if (playing === running) return;
    running = playing;
    cancelAnimationFrame(frame);
    if (running) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  window.addEventListener("plutos:motion", (event) =>
    setRunning(event.detail.playing),
  );
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (event) => {
      if (!finePointer.matches || !running) return;
      pointer = {
        x: (event.clientX / width - 0.5) * 14,
        y: (event.clientY / height - 0.5) * 10,
      };
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    pointer = { x: 0, y: 0 };
  });
  resize();
  setRunning(document.documentElement.classList.contains("motion-running"));
}
