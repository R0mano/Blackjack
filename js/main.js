/*----- constants -----*/
const suits = ["s", "c", "d", "h"];
const ranks = [
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

const limit = 21;

// Build a 'master' deck of 'card' objects used to create shuffled decks
const masterDeck = buildMasterDeck();
renderDeckInContainer(masterDeck, document.querySelector(".computer-cards"));


/*----- app's state (variables) -----*/
let shuffledDeck;
let stack;
let bet;
let playerHand;
let dealerHand;

/*----- cached element references -----*/
// const shuffledContainer = document.querySelector('.player-cards');
const playerCardContainer = document.querySelector("#computer-cards");
const computerCardContainer = document.querySelector("#computer-cards");
const plusButton = document.querySelector("#plus");
const minusButton = document.querySelector("#minus");
const setButton = document.querySelector("#set");
const doubleButton = document.querySelector("#double");
const hitButton = document.querySelector("#hit");
const stayButton = document.querySelector("#stay");
const chipStack = document.querySelector("#stack");
const currentBet = document.querySelector("#bet");

/*----- event listeners -----*/


/*----- functions -----*/

function init() {
    stack = 100;
    bet = 0;
    playerHand = null;
    dealerHand = null;
    

}

function builtTripleDeck(deck) {
    deck.forEach(function(card) {
      deck.push(card);
      deck.push(card);
    });
    return deck;
  }

function renderShuffledDeck() {
  // Create a copy of the masterDeck (leave masterDeck untouched!)
  const tempDeck = [...masterDeck];
  shuffledDeck = [];
  builtTripleDeck(tempDeck);
  
  while (tempDeck.length) {
    // Get a random index for a card still in the tempDeck
    const rndIdx = Math.floor(Math.random() * tempDeck.length);
    // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
    shuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
  }
//   renderDeckInContainer(shuffledDeck, playerCardContainer);
}

function renderDeckInContainer(deck, container) {
  container.innerHTML = "";
  // Let's build the cards as a string of HTML
  // Use reduce when you want to 'reduce' the array into a single thing - in this case a string of HTML markup
  const cardsHtml = deck.reduce(function (html, card) {
    return html + `<div class="card ${card.face}"></div>`;
  }, "");
  container.innerHTML = cardsHtml;
}

function buildMasterDeck() {
  const deck = [];
  // Use nested forEach to generate card objects
  suits.forEach(function (suit) {
    ranks.forEach(function (rank) {
      deck.push({
        // The 'face' property maps to the library's CSS classes for cards
        face: `${suit}${rank}`,
        // Setting the 'value' property for game of blackjack, not war
        value: Number(rank) || (rank === "A" ? 11 : 10),
      });
    });
  });
  return deck;
}

renderShuffledDeck();
