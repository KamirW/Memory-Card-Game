const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let score = 0;
let disableBoard = false;
let isShowing = true;

document.querySelector(".score").textContent = score;

// Every "then" function takes the previous "then" function's result as an argument
// Could do this without recent JS features, but I'd rather not waste the time...
fetch("/data/cards.json")
    .then((res) => res.json())          // converting the result to a readable js object
        .then((data) => {
            cards = [...data, ...data]; // here I am using the spread operator to populate the array with the cards (doing it twice because I need two of each card)
            shuffleCards();
            generateCards();
        });


function shuffleCards() {
    let index = cards.length;
    let randomIndex, temp;

    while(index !== 0) {
        randomIndex = Math.floor(Math.random() * index);
        index--;

        // Swap the card at random index with card at index
        [cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]];
    }
}


function generateCards() {
    for(let card of cards) {
        // Create the card as an HTML element
        const cardEl = document.createElement("div");
        cardEl.classList.add("card");
        cardEl.setAttribute("data-name", card.name);

        // Load the front and back of a card
        cardEl.innerHTML = `
            <div class="front">
                <img class="img-rounded" src=${card.image} />
            </div>
            <div class="back"></div>
        `;

        // Add the card to the container that holds all the cards
        gridContainer.appendChild(cardEl);

        // Add functionality to the card
        cardEl.addEventListener("click", flip);
    }
}


/**
 * Utility function used for card comparisons
 * @returns null
 */
function flip() {
    if(disableBoard) return;        // Do nothing if the board is currently disabled
    if(this === firstCard) return;  // Do nothing if the same card is clicked twice

    this.classList.add("flipped");  // This is a trigger for the CSS to flip the card

    if(!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    score++;
    document.querySelector(".score").textContent = score;
    disableBoard = true;

    checkMatch();
}


/**
 * Checks for matches
 */
function checkMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    isMatch ? disableCards() : unflip();
}


/**
 * Disables card functionality
 */
function disableCards() {
    firstCard.removeEventListener("click", flip);
    secondCard.removeEventListener("click", flip);

    // Add progress bar updates here
    let currProgress = parseInt(document.getElementById("progress").textContent);
    document.getElementById("progress-bar").style.width = `${Math.ceil(currProgress + (1/(cards.length / 2) * 100))}%`;

    // Not letting the progress go past 100%
    if(parseInt(document.getElementById("progress-bar").style.width.split("%")[0]) > 100) {
        document.getElementById("progress-bar").style.width = "100%";
    }
    document.getElementById("progress").textContent = document.getElementById("progress-bar").style.width;

    resetBoard();
}


/**
 * Flips cards back over
 */
function unflip() {
    // Placing inside of a setTimeout function gives CSS animation time to play
    setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetBoard();
    }, 1000);
}


/**
 * Empties the card variables
 */
function resetBoard() {
    firstCard = null;
    secondCard = null;
    disableBoard = false;
}


/**
 * Reverts game to original starting state
 */
function restart() {
    resetBoard();
    shuffleCards();
    score = 0;
    document.querySelector(".score").textContent = score;
    gridContainer.innerHTML = "";
    generateCards();

    document.getElementById("progress-bar").style.width = "0%";
    document.getElementById("progress").textContent = "0%";
}

function toggleScore() {
    document.querySelector("#score").hidden = isShowing;
    isShowing = !isShowing;
}