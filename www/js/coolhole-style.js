// Some browsers don't support,
// animation-timeline and scroll() as of yet.
// Here we'll do the work to animate the navbar's ConsoleLogger
// on scroll.

//Let's find the navbar
const navbar = document.querySelector(".navbar");

// When we scroll, shift to a solid color once over a Y of 50.
document.onscroll = () => {
  if (scrollY < 25) {
    navbar.classList.remove("navbar-solid");
    navbar.classList.add("navbar-transparent");
  } else {
    navbar.classList.remove("navbar-transparent");
    navbar.classList.add("navbar-solid");
  }
};
