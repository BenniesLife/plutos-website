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
    .matchMedia("(min-width: 761px)")
    .addEventListener("change", () => closeMenu());
}

// Some browsers ignore preload="none". Keep the source detached until opened.
const film = document.querySelector(".invitation-film");
const video = film?.querySelector("video");
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
