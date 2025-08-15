const blurbs = {
    fear: { text: "Fear drives humans to innovate or destroy.", image: "./assets/images/fear.png" },
    mind: { text: "The mind is the ultimate frontier.", image: "./assets/images/head.png" }, // skull with tech implants
    overpopulation: { text: "Over Population challenges resources.", image: "./assets/images/overpopulation.png" },
    superhuman: { text: "Super Human capabilities extend beyond biology.", image: "./assets/images/arm.png" }, // an arm with technology and muscle image
    economy: { text: "The economy evolves alongside automation.", image: "./assets/images/economy.png" },
    utopia: { text: "Utopia represents the ultimate vision.", image: "./assets/images/man.png" }, //image is of a peruvian man with tech augments
    war: { text: "War shifts into cyber realms.", image: "./assets/images/war.png" },
    simuology: { text: "Simuology studies the simulated realities.", image: "./assets/images/simuology.png" },
    simulation: { text: "Simulation experiments model societies.", image: "./assets/images/simulation.png" }
};

const wordElements = document.querySelectorAll(".word");
const blurbText = document.getElementById("blurb-text");
const blurbImage = document.getElementById("blurb-image");

// Scatter words randomly within container
const container = document.querySelector(".word-soup");
const containerWidth = container.offsetWidth;
const containerHeight = container.offsetHeight;

wordElements.forEach(word => {
    const x = Math.random() * (containerWidth - 100); // leave margin
    const y = Math.random() * (containerHeight - 50);
    word.style.left = `${x}px`;
    word.style.top = `${y}px`;
});

// Typing animation with cancellation
let typingInterval; // keeps track of current typing

function typeText(text, element) {
    // Cancel previous typing if it exists
    if (typingInterval) clearInterval(typingInterval);

    element.textContent = "";
    let i = 0;

    typingInterval = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(typingInterval);
            typingInterval = null; // reset
        }
    }, 30);
}

// Word click event
wordElements.forEach(word => {
    word.addEventListener("click", () => {
        const key = word.dataset.key;
        const blurb = blurbs[key];
        if (!blurb) return;

        blurbImage.src = blurb.image;
        typeText(blurb.text, blurbText);
    });
});