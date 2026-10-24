/* =========================================================
   Anointed Osara - personal website
   Plain JavaScript. Each numbered part below does one job:

     1. Light / dark theme button
     2. Mobile menu
     3. Things that happen while you scroll
     4. Fade sections in as you reach them
     5. The typing effect in the hero
     6. Counting the numbers up
     7. Filtering the projects
     8. The photo viewer (lightbox)
     9. Checking the contact form
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
    // Nothing to do - the page still works, it just will not remember.
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

function handleScroll() {
  var scrolled = window.scrollY;

  // How far down the page we are, from 0 to 100
  var pageHeight = document.body.scrollHeight - window.innerHeight;
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
  sections.forEach(function (section) {
    if (scrolled >= section.offsetTop - 150) {
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

window.addEventListener("scroll", handleScroll);
handleScroll();   // run once at the start

topButton.addEventListener("click", function () {
  window.scrollTo(0, 0);
});


/* =========================================================
   4. FADE SECTIONS IN AS YOU REACH THEM

   For each box we ask how far its top is from the top of the
   window. If that is less than the window height, the box is
   on screen, so we add "visible" and CSS fades it in.
   ========================================================= */

var revealBoxes = document.querySelectorAll(".reveal");

function revealOnScroll() {
  revealBoxes.forEach(function (box) {
    var distanceFromTop = box.getBoundingClientRect().top;

    if (distanceFromTop < window.innerHeight - 60) {
      box.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("resize", revealOnScroll);
revealOnScroll();


/* =========================================================
   5. THE TYPING EFFECT IN THE HERO

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

var roleNumber = 0;      // which word we are on
var letterCount = 0;     // how many letters are showing
var deleting = false;    // typing forwards or backwards?

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

typeEffect();


/* =========================================================
   6. COUNTING THE NUMBERS UP

   setInterval runs a function again and again on a timer.
   We add 1 each time and stop with clearInterval once we
   reach the target. The target is read from the HTML.
   ========================================================= */

var statNumbers = document.querySelectorAll(".stat-number");
var statsStarted = false;

function countUp(element) {
  var target = Number(element.getAttribute("data-count"));
  var suffix = element.getAttribute("data-suffix");
  if (suffix === null) {
    suffix = "";
  }

  var current = 0;

  var timer = setInterval(function () {
    current = current + 1;
    element.textContent = current + suffix;

    if (current >= target) {
      clearInterval(timer);
    }
  }, 60);
}

function startCounting() {
  // Only ever run this once
  if (statsStarted === true) {
    return;
  }

  var stats = document.getElementById("stats");
  var distanceFromTop = stats.getBoundingClientRect().top;

  if (distanceFromTop < window.innerHeight) {
    statsStarted = true;

    statNumbers.forEach(function (element) {
      countUp(element);
    });
  }
}

window.addEventListener("scroll", startCounting);
startCounting();


/* =========================================================
   7. FILTERING THE PROJECTS

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
        shown = shown + 1;
      } else {
        card.classList.add("hidden");
      }
    });

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
   8. THE PHOTO VIEWER (LIGHTBOX)

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
}

function openLightbox(number) {
  showPhoto(number);
  lightbox.hidden = false;
  document.body.classList.add("no-scroll");
  closeButton.focus();
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
   9. CHECKING THE CONTACT FORM

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
   10. THE YEAR IN THE FOOTER
   So the copyright line never goes out of date.
   ========================================================= */

document.getElementById("year").textContent = new Date().getFullYear();
