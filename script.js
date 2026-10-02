/* ============================================================
   MARIANNE.DEV — the JavaScript
   ============================================================
   One file, four small independent jobs. Nothing here is needed
   for the page to be readable; every feature it adds is an
   enhancement on top of working HTML.

     1. Mobile menu     — open and close the slide-out drawer
     2. Reveal on scroll — fade sections in as they appear
     3. Footer year      — write the current year into the footer
     4. Contact form     — check the fields, then open email

   The order does not matter, because each part of this file stands on
   its own and none of them depend on any other.
   ============================================================ */


/* ------------------------------------------------------------
   1. MOBILE MENU
   ------------------------------------------------------------
   On phones the sidebar is off-screen until the hamburger is
   tapped. This code adds and removes one class, "nav-open", on
   the <body>. The CSS does the rest — see section 5 of
   style.css, which slides the drawer in when it sees the class.

   Adding a class rather than setting styles directly keeps all
   the drawing in the stylesheet, where it is easy to find. */

const pageBody = document.body;

const menuButton = document.querySelector('.menu-btn');
const closeButton = document.querySelector('.side-close');
const scrim = document.querySelector('.scrim');

// Open the drawer or close it, whichever it is not doing now.
function setMenu(open) {
  pageBody.classList.toggle('nav-open', open);

  // Keep the button's accessibility attributes in step, so a
  // screen reader announces the right label and state.
  if (menuButton) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
}

if (menuButton) {
  menuButton.addEventListener('click', function () {
    const isOpen = pageBody.classList.contains('nav-open');
    setMenu(!isOpen);
  });
}

// Tapping the dimmed area outside the drawer closes it.
if (scrim) {
  scrim.addEventListener('click', function () {
    setMenu(false);
  });
}

// The X button inside the drawer closes it too. Without this the
// drawer would cover the hamburger that opened it.
if (closeButton) {
  closeButton.addEventListener('click', function () {
    setMenu(false);
  });
}

// Escape is the keyboard way out of an open drawer.
document.addEventListener('keydown', function (event) {
  if (event.key !== 'Escape') return;
  if (!pageBody.classList.contains('nav-open')) return;

  setMenu(false);

  // Send focus back to the button so the keyboard user is not
  // dropped at the top of the document.
  if (menuButton) {
    menuButton.focus();
  }
});

// Following a link inside the drawer navigates to a new page, so
// close it first — otherwise the panel is still covering the page
// you asked for.
const navLinks = document.querySelectorAll('.sidebar .side-link');
navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    setMenu(false);
  });
});

// If the window is widened past the phone breakpoint, the sidebar
// docks to the side again. Drop the open state so it doesn't
// linger as a stale class in the desktop layout.
const desktopQuery = window.matchMedia('(min-width: 901px)');
desktopQuery.addEventListener('change', function (event) {
  if (event.matches) {
    setMenu(false);
  }
});


/* ------------------------------------------------------------
   2. Reveal on scroll
   ------------------------------------------------------------
   Sections with class="reveal" start invisible (see the
   ".js .reveal" rules in style.css) and fade in the first time
   they scroll into view.

   We watch the main panel rather than the window, because the
   panel is the element that actually scrolls. IntersectionObserver
   is the tool for "tell me when this becomes visible" and it does
   the work off the main thread, so scrolling stays smooth. */

const scrollPanel = document.querySelector('.main');
const revealItems = document.querySelectorAll('.reveal');

if (revealItems.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      // The .in class is what the CSS animates to. Once an item
      // has been revealed, stop watching it.
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, {
    root: scrollPanel,
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.05
  });

  revealItems.forEach(function (item) {
    observer.observe(item);
  });
} else {
  // No IntersectionObserver available. Show everything at once
  // rather than leaving the page blank.
  revealItems.forEach(function (item) {
    item.classList.add('in');
  });
}


/* ------------------------------------------------------------
   3. Footer year
   ------------------------------------------------------------
   Each page has an empty <span id="year"></span>. Filling it in
   here means the copyright date never goes out of date. */

const yearSlot = document.querySelector('#year');
if (yearSlot) {
  yearSlot.textContent = new Date().getFullYear();
}


/* ------------------------------------------------------------
   4. Contact form
   ------------------------------------------------------------
   Checks that the fields are filled in, and that the email looks
   like an email. There is no server behind this form, so a valid
   submission hands the text to the visitor's own email app
   through a mailto: link. */

const contactForm = document.querySelector('#contact-form');

if (contactForm) {

  // Show or clear the error message under one field. Each field's
  // message lives in a <p> with the field's id plus "-error".
  function showError(field, message) {
    const box = document.querySelector('#' + field.id + '-error');
    if (!box) return;

    field.setAttribute('aria-invalid', String(Boolean(message)));
    box.textContent = message || '';
    box.classList.toggle('show', Boolean(message));
  }

  // Check one field. Returns true if it passed, false if not.
  function checkField(field) {
    const value = field.value.trim();
    let message = '';

    if (!value) {
      message = 'This field is required.';
    } else if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
      // The pattern just wants: some text, an @, some text, a
      // dot, some text.
      message = 'Enter a valid email address.';
    }

    showError(field, message);
    return message === '';
  }

  // Check each field as the visitor leaves it, and re-check while
  // they type if it was already showing an error, so the message
  // clears itself as soon as it is fixed.
  const fields = contactForm.querySelectorAll('input, textarea');

  fields.forEach(function (field) {
    field.addEventListener('blur', function () {
      checkField(field);
    });

    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') {
        checkField(field);
      }
    });
  });

  contactForm.addEventListener('submit', function (event) {
    // Stop the browser doing its own thing, since we handle it.
    event.preventDefault();

    // Re-check everything, then focus the first one that failed.
    const allFields = Array.from(contactForm.querySelectorAll('input, textarea'));
    const failed = allFields.filter(function (field) {
      return !checkField(field);
    });

    if (failed.length) {
      failed[0].focus();
      return;
    }

    // All good — build the email and hand it to the mail app.
    const name = contactForm.elements.name.value.trim();
    const email = contactForm.elements.email.value.trim();
    const message = contactForm.elements.message.value.trim();

    // encodeURIComponent escapes the characters that would
    // otherwise break a mailto: link, such as spaces and &.
    const subject = encodeURIComponent('Portfolio message from ' + name);
    const emailBody = encodeURIComponent(message + '\n\n— ' + name + '\n' + email);

    window.location.href = 'mailto:iandevsu@gmail.com?subject=' + subject + '&body=' + emailBody;
  });
}
