(function () {
  "use strict";

  var STORAGE_KEY = "theme";
  var media = window.matchMedia("(prefers-color-scheme: light)");

  var sunIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-sun"><title>Switch to dark theme</title><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';

  var moonIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-moon"><title>Switch to light theme</title><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore, e.g. private browsing */
    }
  }

  function preferredTheme() {
    return media.matches ? "light" : "dark";
  }

  function currentTheme() {
    return getStoredTheme() || preferredTheme();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var button = document.querySelector(".theme-toggle");
    if (button) {
      button.innerHTML = theme === "light" ? moonIcon : sunIcon;
    }
  }

  function toggleTheme() {
    var next = currentTheme() === "light" ? "dark" : "light";
    setStoredTheme(next);
    applyTheme(next);
  }

  function createToggleButton() {
    var container = document.querySelector(".app-header-social");
    if (!container || container.querySelector(".theme-toggle")) {
      return;
    }
    var button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.setAttribute("aria-label", "Toggle light and dark theme");
    button.innerHTML = currentTheme() === "light" ? moonIcon : sunIcon;
    button.addEventListener("click", toggleTheme);
    container.insertBefore(button, container.firstChild);
  }

  media.addEventListener("change", function () {
    if (!getStoredTheme()) {
      applyTheme(preferredTheme());
    }
  });

  createToggleButton();
})();
