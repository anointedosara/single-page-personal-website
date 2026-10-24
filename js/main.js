/* =========================================================
   Anointed Osara - personal website

   The page is split in two:
     Parts 1-6  are plain JavaScript and run the interface.
     Parts 7-9  use GSAP and run the animation.

     1. Light / dark theme button
     2. Mobile menu
     3. Things that happen while you scroll
     4. Filtering the projects
     5. The photo viewer (lightbox)
     6. Checking the contact form
     7. The welcome screen
     8. The hero animation
     9. Scroll animations
    10. The year in the footer
   ========================================================= */


/* =========================================================
   1. LIGHT / DARK THEME BUTTON

   The colours live in CSS. All this code does is put
   data-theme="light" or data-theme="dark" on the <html> tag,
   and remember the choice for next time.
   ========================================================= */

var themeButton = document.getElementById("themeButton");
var themeIcon = document.getElementById("themeIcon");

// Read the saved choice. localStorage can fail in private
// browsing, so we guard it to keep the rest of the file running.
var savedTheme = "dark";
try {
  if (localStorage.getItem("theme")) {
    savedTheme = localStorage.getItem("theme");
  }
} catch (error) {
  savedTheme = "dark";
}

function setTheme(name) {
  document.documentElement.setAttribute("data-theme", name);

  if (name === "dark") {
    themeIcon.textContent = "☼";          // sun
    themeButton.setAttribute("aria-label", "Switch to light theme");
  } else {
    themeIcon.textContent = "☽";          // moon
    themeButton.setAttribute("aria-label", "Switch to dark theme");
  }

  try {
    localStorage.setItem("theme", name);
  } catch (error) {
    // Nothing to do - the page works, it just will not remember.
  }
}

setTheme(savedTheme);

themeButton.addEventListener("click", function () {
  var current = document.documentElement.getAttribute("data-theme");

  if (current === "dark") {
    setTheme("light");
  } else {
    setTheme("dark");
  }
});


/* =========================================================
   2. MOBILE MENU

   Adding the class "open" is what slides the menu in - the
   movement itself is done in CSS.
   ========================================================= */

var menuButton = document.getElementById("menuButton");
var nav = document.getElementById("nav");
var navScrim = document.getElementById("navScrim");
var navLinks = document.querySelectorAll(".nav-link");

function openMenu() {
  nav.classList.add("open");
  navScrim.classList.add("open");
  document.body.classList.add("no-scroll");
  menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  nav.classList.remove("open");
  navScrim.classList.remove("open");
  document.body.classList.remove("no-scroll");
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", function () {
  if (nav.classList.contains("open")) {
    closeMenu();
  } else {
    openMenu();
  }
});

// Tapping the dark sheet closes the menu
navScrim.addEventListener("click", closeMenu);

// So does tapping any link in it
navLinks.forEach(function (link) {
  link.addEventListener("click", closeMenu);
});


/* =========================================================
   3. THINGS THAT HAPPEN WHILE YOU SCROLL

   One function handles all of them, and we call it every
   time the page scrolls:
     - fill the orange progress bar
     - draw a line under the header
     - show the back-to-top button
     - underline the menu link for the section you are reading
   ========================================================= */

var header = document.getElementById("header");
var progressBar = document.getElementById("progress");
var topButton = document.getElementById("topButton");
var sections = document.querySelectorAll("main section");

/* Asking the browser for a position (offsetTop, scrollHeight)
   forces it to re-calculate the whole layout. Doing that on
   every scroll event is what makes scrolling stutter, so we
   measure once up front and keep the numbers here. */
var sectionTops = [];
var pageHeight = 0;

function measurePage() {
  pageHeight = document.body.scrollHeight - window.innerHeight;

  sectionTops = [];
  sections.forEach(function (section) {
    sectionTops.push({
      id: section.id,
      top: section.getBoundingClientRect().top + window.scrollY
    });
  });
}

function handleScroll() {
  var scrolled = window.scrollY;

  // How far down the page we are, from 0 to 100
  var percent = 0;
  if (pageHeight > 0) {
    percent = (scrolled / pageHeight) * 100;
  }
  progressBar.style.width = percent + "%";

  // A border under the header once we leave the very top
  if (scrolled > 12) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

  // The back-to-top button only after a decent scroll
  if (scrolled > 500) {
    topButton.hidden = false;
  } else {
    topButton.hidden = true;
  }

  // Find the last section whose top has passed the header
  var currentId = "";
  sectionTops.forEach(function (section) {
    if (scrolled >= section.top - 150) {
      currentId = section.id;
    }
  });

  // Underline the matching menu link and clear the others
  navLinks.forEach(function (link) {
    if (link.getAttribute("href") === "#" + currentId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/* The browser can fire scroll events faster than it can draw.
   This waits for the next frame and skips the extra events, so
   the work happens once per frame instead of dozens of times. */
var scrollQueued = false;

window.addEventListener("scroll", function () {
  if (scrollQueued === true) {
    return;
  }
  scrollQueued = true;

  requestAnimationFrame(function () {
    handleScroll();
    scrollQueued = false;
  });
});

window.addEventListener("resize", function () {
  measurePage();
  handleScroll();
});

measurePage();
handleScroll();   // run once at the start

topButton.addEventListener("click", function () {
  window.scrollTo(0, 0);
});


/* =========================================================
   4. FILTERING THE PROJECTS

   Each card has data-tech in the HTML, like
   data-tech="nextjs typescript mongodb".
   Each button has data-filter, like data-filter="mongodb".
   We show a card when its data-tech contains that word.
   ========================================================= */

var filterButtons = document.querySelectorAll(".chip");
var workCards = document.querySelectorAll(".work-card");
var filterNote = document.getElementById("filterNote");

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    var wanted = button.getAttribute("data-filter");

    // Highlight this button and un-highlight the rest
    filterButtons.forEach(function (other) {
      other.classList.remove("on");
    });
    button.classList.add("on");

    // Show or hide each card, and count how many are left
    var shown = 0;
    var stillVisible = [];

    workCards.forEach(function (card) {
      var techList = card.getAttribute("data-tech").split(" ");
      var matches = false;

      if (wanted === "all") {
        matches = true;
      } else if (techList.indexOf(wanted) !== -1) {
        matches = true;
      }

      if (matches === true) {
        card.classList.remove("hidden");
        stillVisible.push(card);
        shown = shown + 1;
      } else {
        card.classList.add("hidden");
      }
    });

    // Pop the remaining cards back in, one just after another
    if (animationsOn === true) {
      gsap.from(stillVisible, {
        opacity: 0,
        y: 20,
        scale: 0.96,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out"
      });

      /* The row is now a different width, so the sideways
         scrolling has to measure it again. */
      ScrollTrigger.refresh();
    }

    // A short message under the buttons
    if (wanted === "all") {
      filterNote.textContent = "";
    } else {
      filterNote.textContent =
        "Showing " + shown + " of " + workCards.length +
        " projects built with " + button.textContent + ".";
    }
  });
});


/* =========================================================
   5. THE PHOTO VIEWER (LIGHTBOX)

   Clicking a gallery photo copies it into the big viewer.
   We keep the position of the photo in a variable so the
   arrows know which one comes next.
   ========================================================= */

var photos = document.querySelectorAll(".photo");
var lightbox = document.getElementById("lightbox");
var lightboxImage = document.getElementById("lightboxImage");
var lightboxCaption = document.getElementById("lightboxCaption");
var closeButton = document.getElementById("lightboxClose");
var prevButton = document.getElementById("lightboxPrev");
var nextButton = document.getElementById("lightboxNext");

var photoNumber = 0;

function showPhoto(number) {
  // Wrap around at both ends
  if (number < 0) {
    number = photos.length - 1;
  }
  if (number >= photos.length) {
    number = 0;
  }

  photoNumber = number;

  var image = photos[number].querySelector("img");
  var caption = photos[number].querySelector("figcaption");

  lightboxImage.src = image.getAttribute("src");
  lightboxImage.alt = image.getAttribute("alt");
  lightboxCaption.textContent = caption.textContent;

  // A small fade so swapping photos is not a hard cut
  if (animationsOn === true) {
    gsap.from(lightboxImage, { opacity: 0, scale: 0.97, duration: 0.3 });
  }
}

function openLightbox(number) {
  showPhoto(number);
  lightbox.hidden = false;
  document.body.classList.add("no-scroll");
  closeButton.focus();

  if (animationsOn === true) {
    gsap.from(lightbox, { opacity: 0, duration: 0.25 });
  }
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("no-scroll");
}

// Give every photo a click handler. forEach hands us the
// photo and its position in the list.
photos.forEach(function (photo, number) {
  photo.addEventListener("click", function () {
    openLightbox(number);
  });

  // Also open it with Enter, for keyboard users
  photo.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      openLightbox(number);
    }
  });
});

closeButton.addEventListener("click", closeLightbox);

prevButton.addEventListener("click", function () {
  showPhoto(photoNumber - 1);
});

nextButton.addEventListener("click", function () {
  showPhoto(photoNumber + 1);
});

// Clicking the dark background closes it, but clicking the
// photo itself does not
lightbox.addEventListener("click", function (event) {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

// Escape closes, arrow keys move between photos
document.addEventListener("keydown", function (event) {
  if (lightbox.hidden === true) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }
  if (event.key === "ArrowLeft") {
    showPhoto(photoNumber - 1);
  }
  if (event.key === "ArrowRight") {
    showPhoto(photoNumber + 1);
  }
});


/* =========================================================
   6. CHECKING THE CONTACT FORM

   This page is just files on a web host, with no server to
   send a message to. So we check what was typed, then hand
   the message to the visitor's own email app, already filled in.
   ========================================================= */

var contactForm = document.getElementById("contactForm");
var formStatus = document.getElementById("formStatus");

var nameField = document.getElementById("name");
var emailField = document.getElementById("email");
var messageField = document.getElementById("message");

// Shows or clears the red message under one field.
// Pass an empty text to clear it.
function showError(field, text) {
  var box = field.parentElement;              // the surrounding .field
  var errorText = box.querySelector(".error-text");

  errorText.textContent = text;

  if (text === "") {
    box.classList.remove("error");
  } else {
    box.classList.add("error");
  }
}

contactForm.addEventListener("submit", function (event) {
  // Stops the browser reloading the page
  event.preventDefault();

  var visitorName = nameField.value.trim();
  var visitorEmail = emailField.value.trim();
  var visitorMessage = messageField.value.trim();

  var problems = 0;

  // ----- Name -----
  if (visitorName.length < 2) {
    showError(nameField, "Please tell me your name.");
    problems = problems + 1;
  } else {
    showError(nameField, "");
  }

  // ----- Email -----
  // A real address needs an @ with something either side,
  // and a dot after the @.
  var at = visitorEmail.indexOf("@");
  var dot = visitorEmail.lastIndexOf(".");
  var emailLooksRight = at > 0 && dot > at + 1 && dot < visitorEmail.length - 1;

  if (emailLooksRight === false) {
    showError(emailField, "That does not look like a valid email.");
    problems = problems + 1;
  } else {
    showError(emailField, "");
  }

  // ----- Message -----
  if (visitorMessage.length < 10) {
    showError(messageField, "A little more detail, please.");
    problems = problems + 1;
  } else {
    showError(messageField, "");
  }

  // ----- Result -----
  if (problems > 0) {
    formStatus.textContent = "Please fix the highlighted fields.";
    formStatus.classList.remove("success");

    // A short shake to draw the eye to the problem
    if (animationsOn === true) {
      gsap.fromTo(contactForm,
        { x: -6 },
        { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    }
    return;
  }

  // Build the email. encodeURIComponent makes spaces and
  // punctuation safe to put in a link.
  var subject = "Website enquiry from " + visitorName;
  var body = visitorMessage + "\n\nFrom " + visitorName +
             " (" + visitorEmail + ")";

  window.location.href = "mailto:anointedosara@gmail.com" +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body);

  formStatus.textContent =
    "Thanks! Your email app should now open with the message ready to send.";
  formStatus.classList.add("success");
  contactForm.reset();
});

// Clear a field's red message as soon as the visitor fixes it
[nameField, emailField, messageField].forEach(function (field) {
  field.addEventListener("input", function () {
    showError(field, "");
  });
});


/* =========================================================
   THE ANIMATION PARTS START HERE

   Everything below uses GSAP, loaded from a CDN in the HTML.

   We turn the animation off in two cases:
     - GSAP did not load (no internet, blocked CDN)
     - the visitor asked their computer to avoid animation
   In both cases the page simply shows everything in place,
   which is why nothing above is hidden in the CSS.
   ========================================================= */

var gsapLoaded = typeof gsap !== "undefined";
var prefersStill = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var animationsOn = gsapLoaded && prefersStill === false;

if (gsapLoaded === true) {
  gsap.registerPlugin(ScrollTrigger);

  /* On a phone, scrolling hides the address bar, which changes
     the window height. Without this, ScrollTrigger re-measures
     everything mid-scroll and the page jumps. */
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/* Splits a piece of text into one <span> per letter, so each
   letter can be animated on its own. Returns nothing - it
   replaces what is inside the element. */
function splitIntoLetters(element) {
  var text = element.textContent;
  element.textContent = "";

  for (var i = 0; i < text.length; i++) {
    var span = document.createElement("span");
    span.className = "letter";

    // A plain space would collapse, so use a non-breaking one
    if (text[i] === " ") {
      span.innerHTML = "&nbsp;";
    } else {
      span.textContent = text[i];
    }

    element.appendChild(span);
  }
}


/* =========================================================
   7. THE WELCOME SCREEN

   A greeting cycles through a few languages while a bar
   fills up, then the whole panel slides away upwards.
   ========================================================= */

var preloader = document.getElementById("preloader");

function runWelcome(whenFinished) {
  // No animation? Just remove the panel and move on.
  if (animationsOn === false) {
    preloader.remove();
    whenFinished();
    return;
  }

  var hello = document.getElementById("preloaderHello");
  var fill = document.getElementById("preloaderFill");
  var percent = document.getElementById("preloaderPercent");

  // A timeline plays several animations one after another
  var intro = gsap.timeline();

  intro.from(".preloader-inner", { opacity: 0, y: 20, duration: 0.5 });

  /* Blink "Hello" slowly, three times.
     yoyo makes the tween play backwards on each repeat, so
     5 repeats give us 3 fades out and 3 fades back in. */
  intro.to(hello, {
    opacity: 0.12,
    duration: 0.4,
    repeat: 5,
    yoyo: true,
    ease: "sine.inOut"
  });

  // Fill the bar and count the percentage while it blinks.
  // "<" means "start at the same moment as the one before".
  intro.to(fill, { width: "100%", duration: 2.4, ease: "power1.inOut" }, "<");
  intro.to({ value: 0 }, {
    value: 100,
    duration: 2.4,
    ease: "power1.inOut",
    onUpdate: function () {
      percent.textContent = Math.round(this.targets()[0].value) + "%";
    }
  }, "<");

  /* Slide the panel up and out. whenFinished runs on START, not
     on complete, so the hero is already animating as the panel
     lifts. Running it after would show the finished page for a
     moment and then reset it. */
  intro.to(preloader, {
    yPercent: -100,
    duration: 0.9,
    ease: "power3.inOut",
    onStart: whenFinished,
    onComplete: function () {
      preloader.remove();
    }
  }, "+=0.2");
}


/* =========================================================
   8. THE HERO ANIMATION

   Runs once the welcome screen is out of the way.
   ========================================================= */

function runHero() {
  if (animationsOn === false) {
    return null;
  }

  // Split the big name so the letters can rise one by one
  var nameLines = document.querySelectorAll(".hero-name .line");
  nameLines.forEach(splitIntoLetters);

  /* paused: true builds the timeline without playing it. The
     starting positions are applied straight away, so the hero
     is never seen in its finished state behind the welcome
     screen. We press play as the screen lifts. */
  var hero = gsap.timeline({ paused: true });

  // The background photo settles back from a slow zoom
  hero.from(".hero-bg img", {
    scale: 1.15,
    duration: 1.8,
    ease: "power3.out"
  }, 0);

  hero.from(".scroll-dot", { opacity: 0, y: -10, duration: 0.5 }, 0.2);
  hero.from(".hero-hi", { opacity: 0, y: 16, duration: 0.5 }, 0.35);

  // The big headline rises letter by letter from behind its line
  hero.from(".hero-name .letter", {
    yPercent: 110,
    opacity: 0,
    duration: 0.8,
    stagger: 0.03,
    ease: "power3.out"
  }, 0.45);

  hero.from(".hero-tag", { opacity: 0, y: 12, duration: 0.5 }, "-=0.3");

  hero.from(".hero-corners .pill", {
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.1
  }, "-=0.4");

  /* The header floats in last.
     Note we animate the nav's inner list, not .nav itself: on a
     phone .nav is the sliding menu panel, and leaving a left-over
     transform on it stops that panel sliding in. */
  hero.from([".brand", ".nav-list", ".header-tools"], {
    opacity: 0,
    y: -14,
    duration: 0.5,
    stagger: 0.08
  }, "-=0.5");

  return hero;
}


/* Counts the three numbers up when they scroll into view.
   They live in the About section now, not in the hero. */
function runCounters() {
  if (animationsOn === false) {
    return;
  }

  document.querySelectorAll(".stat-number").forEach(function (element) {
    var target = Number(element.getAttribute("data-count"));
    var suffix = element.getAttribute("data-suffix");
    if (suffix === null) {
      suffix = "";
    }

    gsap.to({ value: 0 }, {
      scrollTrigger: { trigger: "#stats", start: "top 85%", once: true },
      value: target,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: function () {
        element.textContent = Math.round(this.targets()[0].value) + suffix;
      }
    });
  });
}


/* =========================================================
   THE TYPING EFFECT IN THE HERO

   We show one more letter each time, wait at the end of the
   word, then delete it one letter at a time and move to the
   next word. setTimeout calls the function again, which is
   how the loop keeps going.
   ========================================================= */

var typedText = document.getElementById("typed");

var roles = [
  "Frontend Developer",
  "React & Next.js",
  "Full-Stack Capable",
  "AI-First Builder"
];

var roleNumber = 0;        // which word we are on
var letterCount = 0;       // how many letters are showing
var deleting = false;      // typing forwards or backwards?
var typingStarted = false; // so it can never be started twice

function startTyping() {
  if (typingStarted === true) {
    return;
  }
  typingStarted = true;
  typeEffect();
}

function typeEffect() {
  var word = roles[roleNumber];
  typedText.textContent = word.slice(0, letterCount);

  var wait = 85;

  if (deleting === false && letterCount === word.length) {
    // Word finished - pause, then start deleting
    deleting = true;
    wait = 1600;
  } else if (deleting === true && letterCount === 0) {
    // Word gone - move to the next one
    deleting = false;
    roleNumber = roleNumber + 1;
    if (roleNumber === roles.length) {
      roleNumber = 0;
    }
    wait = 320;
  } else if (deleting === true) {
    letterCount = letterCount - 1;
    wait = 45;
  } else {
    letterCount = letterCount + 1;
  }

  setTimeout(typeEffect, wait);
}


/* =========================================================
   9. SCROLL ANIMATIONS

   ScrollTrigger starts an animation when an element reaches
   a point on the screen. The settings we reuse are:

     scrollTrigger: {
       trigger: <the element to watch>,
       start: "top 85%"   -> fire when its top reaches 85%
                             of the way down the window
     }
   ========================================================= */

function runScrollAnimations() {
  if (animationsOn === false) {
    return;
  }

  // ---- Section headings: tag, title and subtitle in turn ----
  document.querySelectorAll(".section-head").forEach(function (head) {
    gsap.from(head.children, {
      scrollTrigger: { trigger: head, start: "top 85%", once: true },
      opacity: 0,
      y: 30,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out"
    });
  });

  // ---- About: paragraphs rise, fact rows come in after ----
  gsap.from(".about-text p", {
    scrollTrigger: { trigger: ".about-text", start: "top 85%", once: true },
    opacity: 0,
    y: 24,
    duration: 0.6,
    stagger: 0.12
  });

  gsap.from(".facts li", {
    scrollTrigger: { trigger: ".facts", start: "top 85%", once: true },
    opacity: 0,
    x: 30,
    duration: 0.5,
    stagger: 0.08
  });

  // ---- Skill cards ----
  gsap.from(".skill-card", {
    scrollTrigger: { trigger: ".skills-grid", start: "top 85%", once: true },
    opacity: 0,
    y: 40,
    duration: 0.6,
    stagger: 0.08,
    ease: "power3.out"
  });

  /* ---- Experience ----
     The orange line draws itself downwards as you scroll past
     the timeline. scrub: true ties it to the scrollbar. */
  gsap.from(".timeline-line", {
    scrollTrigger: {
      trigger: ".timeline",
      start: "top 80%",
      end: "bottom 60%",
      scrub: true
    },
    scaleY: 0,
    ease: "none"
  });

  // Each job slides in from the left, with its dot popping
  document.querySelectorAll(".job").forEach(function (job) {
    gsap.from(job, {
      scrollTrigger: { trigger: job, start: "top 85%", once: true },
      opacity: 0,
      x: -30,
      duration: 0.6,
      ease: "power3.out"
    });

    gsap.from(job.querySelector(".job-dot"), {
      scrollTrigger: { trigger: job, start: "top 85%", once: true },
      scale: 0,
      duration: 0.5,
      delay: 0.2,
      ease: "back.out(2)"
    });
  });

  // ---- Filter buttons ----
  gsap.from(".chip", {
    scrollTrigger: { trigger: ".filters", start: "top 90%", once: true },
    opacity: 0,
    y: 16,
    duration: 0.4,
    stagger: 0.05
  });

  /* The project cards and gallery photos are handled by the
     sideways sections further down, not here. */

  // ---- Contact ----
  gsap.from(".contact-list li", {
    scrollTrigger: { trigger: ".contact-list", start: "top 85%", once: true },
    opacity: 0,
    x: -24,
    duration: 0.5,
    stagger: 0.08
  });

  gsap.from(".form .field, .form .btn", {
    scrollTrigger: { trigger: ".form", start: "top 85%", once: true },
    opacity: 0,
    y: 24,
    duration: 0.5,
    stagger: 0.08
  });

  /* ---- Hero parallax ----
     scrub: true ties the animation to the scrollbar, so it
     moves as you scroll instead of playing on its own. */
  gsap.to(".hero-bg img", {
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    },
    yPercent: 18,
    scale: 1.1,
    ease: "none"
  });

  // The words in the middle drift up and fade as you leave
  gsap.to(".hero-center", {
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    },
    y: -90,
    opacity: 0,
    ease: "none"
  });
}


/* =========================================================
   HORIZONTAL SCROLL

   Used by Work and Gallery. The section sticks to the screen
   ("pin") and, instead of the page moving down, the row of
   cards slides sideways. The distance you scroll is the
   width of the row minus one screen, so it ends exactly when
   the last card reaches the right edge.
   ========================================================= */

function makeHorizontal(sectionSelector, rowSelector) {
  var section = document.querySelector(sectionSelector);
  var row = document.querySelector(rowSelector);

  if (section === null || row === null) {
    return;
  }

  // How far the row has to travel
  function distance() {
    return row.scrollWidth - window.innerWidth;
  }

  gsap.to(row, {
    x: function () {
      return -distance();
    },
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      // A longer end means a slower, smoother sideways move
      end: function () {
        return "+=" + (distance() + window.innerHeight * 0.5);
      },
      pin: true,
      scrub: 1,              // 1 = lag slightly behind the scrollbar
      anticipatePin: 1,
      invalidateOnRefresh: true   // recalculate if the window resizes
    }
  });
}


/* Starts the two sideways sections. They are set up after the
   images have loaded, so the widths are measured correctly. */
function runHorizontalSections() {
  if (animationsOn === false) {
    return;
  }

  makeHorizontal("#work", ".work-grid");
  makeHorizontal("#gallery", ".gallery-grid");
}


/* =========================================================
   START EVERYTHING
   The welcome screen runs first, then the hero, then the
   scroll animations are set up.
   ========================================================= */

if (animationsOn === false) {
  // No GSAP, or the visitor prefers no motion: show the page
  // as it is and still run the typing effect.
  if (preloader) {
    preloader.remove();
  }
  startTyping();

} else {

  /* A browser normally puts you back where you were when you
     refresh. With a welcome screen and pinned sections that
     lands you mid-animation, so we always start at the top. */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  /* Build every animation NOW. Creating them applies their
     starting positions immediately, so nothing is ever seen in
     its finished state behind the welcome screen. */
  var heroTimeline = runHero();
  runScrollAnimations();
  runCounters();
  runHorizontalSections();

  var pageStarted = false;

  function startPage() {
    // Make sure this can only ever happen once
    if (pageStarted === true) {
      return;
    }
    pageStarted = true;

    if (heroTimeline) {
      heroTimeline.play();
    }
    startTyping();
  }

  runWelcome(startPage);

  /* Safety net. The welcome screen covers the whole page, so
     if anything ever stopped the animation finishing, a
     visitor would be stuck looking at it. After 8 seconds we
     clear it no matter what. */
  setTimeout(function () {
    var panel = document.getElementById("preloader");
    if (panel) {
      panel.remove();
      startPage();
    }
  }, 8000);

  /* Images change the height of the page as they load, which
     moves every scroll trigger. Measure again once they are in. */
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
    measurePage();
  });

  // Keep the cached positions in step with ScrollTrigger
  ScrollTrigger.addEventListener("refresh", measurePage);
}


/* =========================================================
   10. THE YEAR IN THE FOOTER
   So the copyright line never goes out of date.
   ========================================================= */

document.getElementById("year").textContent = new Date().getFullYear();
