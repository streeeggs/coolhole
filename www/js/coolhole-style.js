// Some browsers don't support,
// animation-timeline and scroll() as of yet.
// Here we'll do the work to animate the navbar's ConsoleLogger
// on scroll.

//Let's find the navbar
const navbar = document.querySelector(".navbar");

// When we scroll, shift to a solid color once over a Y of 50.
document.onscroll = () => {
    navbar.style.setProperty("transition", "background-color 150ms");
    if (scrollY < 45) {
        navbar.style.backgroundColor = "transparent";
    } else {
        navbar.style.backgroundColor = "#0C1214";
    }
};

