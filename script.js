const toggle = document.querySelector(".nav-toggle");
const navigation = document.querySelector("#site-nav");

if (toggle && navigation) {
  document.documentElement.classList.add("js");
  toggle.hidden = false;

  function closeMenu(returnFocus = false) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = 'Menu <span aria-hidden="true">+</span>';
    navigation.classList.remove("is-open");
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    if (toggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
    } else {
      toggle.setAttribute("aria-expanded", "true");
      toggle.innerHTML = 'Close <span aria-hidden="true">−</span>';
      navigation.classList.add("is-open");
    }
  });

  navigation.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    closeMenu();
    // Move keyboard focus to the destination before hiding the mobile links.
    const destination = document.querySelector(link.hash);
    if (destination) {
      destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
      destination.addEventListener(
        "blur",
        () => destination.removeAttribute("tabindex"),
        { once: true },
      );
    }
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    )
      closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  window
    .matchMedia("(min-width: 961px)")
    .addEventListener("change", () => closeMenu());
}

// Some browsers ignore preload="none". Keep the source detached until opened.
const film = document.querySelector(".invitation-film");
const video = film?.querySelector("video");
document.querySelector(".film-link")?.addEventListener("click", () => {
  if (film) film.open = true;
});
if (video) video.hidden = false;
film?.addEventListener("toggle", () => {
  if (!video) return;
  const source = video.querySelector("source");
  if (film.open && source && !source.hasAttribute("src")) {
    source.src = source.dataset.src;
    video.load();
  } else if (!film.open) {
    video.pause();
  }
});

// One quiet loop for the whole page, with explicit motion and data controls.
const background = document.querySelector("#background-video");
const motionToggle = document.querySelector(".motion-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const connection = navigator.connection;
let motionRequest = 0;
let userWantsMotion = !reducedMotion.matches && !connection?.saveData;

if (background && motionToggle) {
  background.muted = true;
  motionToggle.hidden = false;

  function updateMotionControl() {
    const playing = !background.paused && !background.error;
    document.documentElement.classList.toggle("motion-running", playing);
    window.dispatchEvent(
      new CustomEvent("plutos:motion", { detail: { playing } }),
    );
    motionToggle.setAttribute("aria-pressed", String(playing));
    motionToggle.innerHTML = playing
      ? 'Pause effects <span aria-hidden="true">Ⅱ</span>'
      : 'Play effects <span aria-hidden="true">▷</span>';
  }

  async function syncBackground() {
    const request = ++motionRequest;
    background.autoplay = userWantsMotion && !document.hidden;
    if (!userWantsMotion || document.hidden) {
      background.pause();
      updateMotionControl();
      return;
    }
    if (!background.hasAttribute("src") || background.error) {
      background.src = background.dataset.src;
      background.load();
    }
    try {
      await background.play();
    } catch {
      // A blocked or failed video must not leave the UI claiming it is playing.
      if (request === motionRequest) {
        background.autoplay = false;
        background.pause();
      }
    }
    if (request === motionRequest) updateMotionControl();
  }

  motionToggle.addEventListener("click", () => {
    userWantsMotion = background.paused;
    syncBackground();
  });
  background.addEventListener("play", updateMotionControl);
  background.addEventListener("error", () => {
    background.pause();
    updateMotionControl();
  });
  background.addEventListener("pause", updateMotionControl);
  reducedMotion.addEventListener("change", () => {
    userWantsMotion = !reducedMotion.matches && !connection?.saveData;
    syncBackground();
  });
  connection?.addEventListener("change", () => {
    if (connection.saveData) {
      userWantsMotion = false;
      syncBackground();
    }
  });
  document.addEventListener("visibilitychange", syncBackground);
  syncBackground();
}
