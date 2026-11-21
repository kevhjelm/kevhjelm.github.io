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

  function showLastUpdated() {
    var header = document.querySelector(".app-header");
    if (!header || header.querySelector(".app-header-updated")) {
      return;
    }
    fetch("last-updated.json")
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        if (!data || !data.lastUpdated) {
          return;
        }
        var date = new Date(data.lastUpdated);
        if (isNaN(date.getTime())) {
          return;
        }
        var el = document.createElement("p");
        el.className = "app-header-updated";
        el.setAttribute("data-date", data.lastUpdated);
        var langSwitch = header.querySelector(".lang-switch");
        header.insertBefore(el, langSwitch || null);
        renderLastUpdated();
      })
      .catch(function () {
        /* no metadata available, e.g. local preview */
      });
  }

  /* ---------------------------------------------------------------
     Language switch (NO / EN)
     Translates the shared parts of the site: header, menu, home page,
     breadcrumbs and footer. Post bodies stay in English.
     The choice is shared with /ugc/ through the "lang" key.
     --------------------------------------------------------------- */
  var LANG_KEY = "lang";

  // [English, Norwegian]. Matching ignores extra whitespace and curly apostrophes.
  var PHRASES = [
    ["Home", "Hjem"],
    ["Menu", "Meny"],
    ["Partly written by AI, controlled by human.", "Delvis skrevet av KI, kontrollert av et menneske."],
    ["On this page you will find my professional work,academic work, lab writeup within security.", "På denne siden finner du mitt profesjonelle og akademiske arbeid, og lab-gjennomganger innen sikkerhet."],

    // Topics and post titles
    ["Security Testing", "Sikkerhetstesting"],
    ["Security Engineering", "Sikkerhetsteknikk"],
    ["Cloud Security", "Skysikkerhet"],
    ["Artificial Intelligence", "Kunstig intelligens"],
    ["Application Security", "Applikasjonssikkerhet"],
    ["Security Architecture", "Sikkerhetsarkitektur"],
    ["Digital Forensics", "Digital etterforskning"],
    ["Pentest Labs", "Pentest-lab"],
    ["Secure Software Development", "Sikker programvareutvikling"],
    ["Implementing CI/CD", "Implementering av CI/CD"],
    ["Implementing CI/CD with GitHub Actions", "Implementering av CI/CD med GitHub Actions"],
    ["AWS Security", "AWS-sikkerhet"],
    ["AWS Security Basics", "Grunnleggende AWS-sikkerhet"],
    ["Azure Security", "Azure-sikkerhet"],
    ["Azure Security Basics", "Grunnleggende Azure-sikkerhet"],
    ["OWASP Top 10 for LLM Applications", "OWASP Top 10 for LLM-applikasjoner"],
    ["Configuring a Palo Alto NGFW for Home Use", "Konfigurere en Palo Alto NGFW for hjemmebruk"],
    ["Cracking Hashes with Hashcat", "Knekke hasher med Hashcat"],
    ["File Analysis", "Filanalyse"],
    ["Firewalls", "Brannmurer"],
    ["Git and Claude Code", "Git og Claude Code"],
    ["Machine Learning Basics", "Grunnleggende maskinlæring"],
    ["What is Machine Learning?", "Hva er maskinlæring?"],
    ["What is AI?", "Hva er KI?"],
    ["What is MCP?", "Hva er MCP?"],
    ["What is OSINT?", "Hva er OSINT?"],
    ["What is digital forensic?", "Hva er digital etterforskning?"],
    ["What is security testing?", "Hva er sikkerhetstesting?"],
    ["Order of votility", "Flyktighetsrekkefølge"],
    ["Securing the pipe", "Sikring av pipelinen"],
    ["AI UGC and AI creators in Norway", "AI UGC og KI-skaper i Norge"],

    // Home page
    ["My name is Kevin and I'm an experienced security consultant, with a background in penetration testing and security operations. I've worked in various roles within security operations centers, handling challenges from basic configuration to incident management. I've applied a wide range of security technologies and have strong technical skills, particularly in system configuration and maintenance. My experience spans across multiple sectors, where I've honed my ability to identify and exploit security vulnerabilities. I hold a solid academic background with master's degrees in information security and networking, along with several certifications that highlight my expertise in security, including recognized certifications in information security and penetration testing. I'm committed to continuous professional development, as demonstrated by the courses I've taken on new security techniques and strategies, ensuring I stay up to date with the latest developments in the field.",
     "Jeg heter Kevin og er en erfaren sikkerhetskonsulent med bakgrunn fra penetrasjonstesting og sikkerhetsdrift. Jeg har hatt ulike roller i sikkerhetsoperasjonssentre (SOC), med oppgaver fra grunnleggende konfigurasjon til hendelseshåndtering. Jeg har tatt i bruk et bredt spekter av sikkerhetsteknologier og har sterke tekniske ferdigheter, særlig innen systemkonfigurasjon og drift. Erfaringen min spenner over flere sektorer, der jeg har finslipt evnen til å identifisere og utnytte sårbarheter. Jeg har en solid akademisk bakgrunn med mastergrader i informasjonssikkerhet og nettverk, i tillegg til flere anerkjente sertifiseringer innen informasjonssikkerhet og penetrasjonstesting. Jeg er opptatt av kontinuerlig faglig utvikling og tar jevnlig kurs i nye sikkerhetsteknikker og strategier, slik at jeg holder meg oppdatert på det siste innen fagfeltet."],
    ["Education & Certifications", "Utdanning og sertifiseringer"],
    ["Publications", "Publikasjoner"],
    ["Job Experience", "Arbeidserfaring"],
    ["NTNU - Master in Information Security (2024)", "NTNU - Master i informasjonssikkerhet (2024)"],
    ["OsloMet - Master of Network and System Administration (2016-2018)", "OsloMet - Master i nettverks- og systemadministrasjon (2016-2018)"],
    ["Offensive Security Engineer | Knowit Cybersecurity & Law (KCL) (2022-DD)", "Offensiv sikkerhetsingeniør | Knowit Cybersecurity & Law (KCL) (2022-DD)"],
    ["Working as a security engineer with a focus on penetration testing, finding, exploiting, reporting, and remediating vulnerabilities.", "Jobber som sikkerhetsingeniør med fokus på penetrasjonstesting: å finne, utnytte, rapportere og utbedre sårbarheter."],
    ["Web application security tools such as Postman, Burp Suite", "Verktøy for webapplikasjonssikkerhet som Postman og Burp Suite"],
    ["Mobile application security using JADX, MobSF", "Mobilapplikasjonssikkerhet med JADX og MobSF"],
    ["Cloud security assessment", "Sikkerhetsvurdering av skytjenester"],
    ["Infrastructure testing, phishing, threat intelligence, Nmap, OSINT", "Infrastrukturtesting, phishing, trusseletterretning, Nmap, OSINT"],
    ["Network & Security Consultant | Netnordic (Oct 2018 - March 2022)", "Nettverks- og sikkerhetskonsulent | Netnordic (okt. 2018 - mars 2022)"],
    ["Configuration, implementation, upgrade, and setup of firewalls and network switches (Extreme Network)", "Konfigurasjon, implementering, oppgradering og oppsett av brannmurer og nettverkssvitsjer (Extreme Network)"],
    ["Performed security assessments and created firewall rules", "Utførte sikkerhetsvurderinger og laget brannmurregler"],
    ["Setup monitoring services (Opsgenie, Oxidized, Librenms)", "Satte opp overvåkingstjenester (Opsgenie, Oxidized, Librenms)"],
    ["Worked with teams and clients to discuss security architecture and rules of engagement", "Samarbeidet med team og kunder om sikkerhetsarkitektur og rules of engagement"],
    ["Onsite Support | Schibsted Media Group (August 2018 – December 2018)", "Onsite-support | Schibsted Media Group (august 2018 – desember 2018)"],
    ["Onsite support, assisting users with PCs, phones, printers, and network issues", "Onsite-support: hjalp brukere med PC-er, telefoner, skrivere og nettverksproblemer"],
    ["Performed PC replacements and setup for new users", "Byttet ut PC-er og satte opp utstyr for nye brukere"],
    ["Handled the return and ordering of new devices", "Håndterte retur og bestilling av nytt utstyr"]
  ];

  var UI_TEXT = {
    en: { updated: "Last updated: ", theme: "Toggle light and dark theme", group: "Language" },
    nb: { updated: "Sist oppdatert: ", theme: "Bytt mellom lyst og mørkt tema", group: "Språk" }
  };

  var MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTHS_NB = ["jan.", "feb.", "mars", "apr.", "mai", "juni", "juli", "aug.", "sep.", "okt.", "nov.", "des."];

  var FLAG_NO =
    '<svg class="flag" viewBox="0 0 22 16" preserveAspectRatio="none" aria-hidden="true"><rect width="22" height="16" fill="#BA0C2F"/><path d="M0 8h22M8 0v16" stroke="#fff" stroke-width="4"/><path d="M0 8h22M8 0v16" stroke="#00205B" stroke-width="2"/></svg>';
  var FLAG_UK =
    '<svg class="flag" viewBox="0 0 60 30" preserveAspectRatio="none" aria-hidden="true"><clipPath id="uk-s"><path d="M0 0v30h60V0z"/></clipPath><clipPath id="uk-t"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath><g clip-path="url(#uk-s)"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30m0-30L0 30" clip-path="url(#uk-t)" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></g></svg>';

  function normalize(s) {
    return s.replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
  }

  var toNb = {};
  var toEn = {};
  PHRASES.forEach(function (p) {
    toNb[normalize(p[0])] = p[1];
    toEn[normalize(p[1])] = p[0];
  });

  function getLang() {
    try {
      var stored = localStorage.getItem(LANG_KEY);
      if (stored === "nb" || stored === "en") {
        return stored;
      }
    } catch (e) {
      /* ignore */
    }
    return "en";
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* ignore */
    }
  }

  // "Dec 15, 2024 -" <-> "15. des. 2024 -" and "10 min read" <-> "10 min lesetid"
  function translatePattern(text, lang) {
    if (lang === "nb") {
      return text
        .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}), (\d{4})/g, function (m, mon, d, y) {
          return d + ". " + MONTHS_NB[MONTHS_EN.indexOf(mon)] + " " + y;
        })
        .replace(/(\d+) min read/g, "$1 min lesetid");
    }
    return text
      .replace(/(\d{1,2})\. (jan\.|feb\.|mars|apr\.|mai|juni|juli|aug\.|sep\.|okt\.|nov\.|des\.) (\d{4})/g, function (m, d, mon, y) {
        return MONTHS_EN[MONTHS_NB.indexOf(mon)] + " " + d + ", " + y;
      })
      .replace(/(\d+) min lesetid/g, "$1 min read");
  }

  function translateNode(node, lang) {
    var raw = node.nodeValue;
    var key = normalize(raw);
    if (!key) {
      return;
    }
    var map = lang === "nb" ? toNb : toEn;
    var next = map[key];
    if (next === undefined) {
      next = translatePattern(key, lang);
      if (next === key) {
        return;
      }
    }
    var lead = raw.match(/^\s*/)[0];
    var trail = raw.match(/\s*$/)[0];
    node.nodeValue = lead + next + trail;
  }

  function translateRoots() {
    // On the home page and the menu, translate the whole main area.
    var selectors = [".app-header", ".breadcrumb", ".app-footer-note"];
    if (document.querySelector(".homepage-header")) {
      selectors.push(".app-container");
    }
    var roots = [];
    selectors.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        roots.push(el);
      });
    });
    return roots;
  }

  function applyLang(lang) {
    translateRoots().forEach(function (root) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          var p = n.parentNode;
          while (p && p !== root) {
            var tag = p.nodeName.toLowerCase();
            if (tag === "svg" || tag === "script" || tag === "style" || tag === "code" || tag === "pre" ||
                (p.classList && p.classList.contains("lang-switch"))) {
              return NodeFilter.FILTER_REJECT;
            }
            p = p.parentNode;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var nodes = [];
      while (walker.nextNode()) {
        nodes.push(walker.currentNode);
      }
      nodes.forEach(function (n) {
        translateNode(n, lang);
      });
    });

    var themeButton = document.querySelector(".theme-toggle");
    if (themeButton) {
      themeButton.setAttribute("aria-label", UI_TEXT[lang].theme);
    }
    var group = document.querySelector(".lang-switch");
    if (group) {
      group.setAttribute("aria-label", UI_TEXT[lang].group);
      Array.prototype.forEach.call(group.querySelectorAll("button"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
      });
    }
    renderLastUpdated();
  }

  function renderLastUpdated() {
    var el = document.querySelector(".app-header-updated");
    if (!el) {
      return;
    }
    var date = new Date(el.getAttribute("data-date"));
    if (isNaN(date.getTime())) {
      return;
    }
    var lang = getLang();
    el.textContent =
      UI_TEXT[lang].updated +
      date.toLocaleDateString(lang === "nb" ? "nb-NO" : "en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function createLangSwitch() {
    var header = document.querySelector(".app-header");
    if (!header || header.querySelector(".lang-switch")) {
      return;
    }
    var group = document.createElement("div");
    group.className = "lang-switch";
    group.setAttribute("role", "group");
    group.innerHTML =
      '<button type="button" data-lang="nb" lang="nb" title="Norsk">' + FLAG_NO + "NO</button>" +
      '<button type="button" data-lang="en" lang="en" title="English">' + FLAG_UK + "EN</button>";
    Array.prototype.forEach.call(group.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        var lang = b.getAttribute("data-lang");
        setStoredLang(lang);
        applyLang(lang);
      });
    });
    header.appendChild(group);
  }

  media.addEventListener("change", function () {
    if (!getStoredTheme()) {
      applyTheme(preferredTheme());
    }
  });

  createToggleButton();
  createLangSwitch();
  applyLang(getLang());
  showLastUpdated();
})();
