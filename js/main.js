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
// renderDeckInContainer(masterDeck, document.querySelector(".computer-cards"));

/*----- app's state (variables) -----*/
let shuffledDeck;
let stack;
let bet;
let playerHand;
let dealerHand;
let winner;
let stay;

/*----- cached element references -----*/
// const shuffledContainer = document.querySelector('.player-cards');
const playerCardContainer = document.querySelector("#player-cards");
const computerCardContainer = document.querySelector("#computer-cards");
const plusButton = document.querySelector("#plus");
const minusButton = document.querySelector("#minus");
const dealButton = document.querySelector("#deal");
const doubleButton = document.querySelector("#double");
const hitButton = document.querySelector("#hit");
const stayButton = document.querySelector("#stay");
const chipStack = document.querySelector("#stack");
const currentBet = document.querySelector("#bet");
const replayButton = document.querySelector("#replay");

/*----- event listeners -----*/
document.querySelector(".btn-group").addEventListener("click", addBet);
document.querySelector("#deal").addEventListener("click", deal);
document.querySelector("#hit").addEventListener("click", deal);
document.querySelector("#stay").addEventListener("click", dealerPlay);
document.querySelector("#double").addEventListener("click", double);
document.querySelector("#replay").addEventListener("click", replay);

/*----- functions -----*/

function init() {
  stack = 100;
  bet = 0;
  playerHand = [];
  dealerHand = [];
  winner = null;
  stay = false;
  buildAndShuffleTripleDeck();
  render();
}

function replay() {
  bet = 0;
  winner = null;
  stay = false;
  document.querySelector("#message").remove();
  let usedCards = playerHand.concat(dealerHand);
  usedCards.forEach((card) => {
    shuffledDeck.push(card);
  });
  usedCards = [];
  playerHand = [];
  dealerHand = [];
  render();
}

function render() {
  currentBet.textContent = bet;
  chipStack.textContent = stack;

  playerCardContainer.innerHTML = "";
  computerCardContainer.innerHTML = "";

  minusButton.style.visibility = "hidden";
  plusButton.style.visibility = "hidden";
  dealButton.style.visibility = "hidden";
  doubleButton.style.visibility = "hidden";
  hitButton.style.visibility = "hidden";
  stayButton.style.visibility = "hidden";
  replayButton.style.visibility = "hidden";

  if (bet === 0 && dealerHand.length === 0 && playerHand.length === 0) {
    plusButton.style.visibility = "visible";
  }

  if (
    bet > 0 &&
    stack === 0 &&
    dealerHand.length === 0 &&
    playerHand.length === 0
  ) {
    minusButton.style.visibility = "visible";
    dealButton.style.visibility = "visible";
  }

  if (
    bet > 0 &&
    stack > 0 &&
    dealerHand.length === 0 &&
    playerHand.length === 0
  ) {
    minusButton.style.visibility = "visible";
    dealButton.style.visibility = "visible";
    plusButton.style.visibility = "visible";
  }

  if (bet > 0 && dealerHand.length > 0 && playerHand.length > 0) {
    hitButton.style.visibility = "visible";
    stayButton.style.visibility = "visible";
    renderHandInContainer(dealerHand, computerCardContainer);
    renderHandInContainer(playerHand, playerCardContainer);
  }

  if (playerHand.length === 2) {
    doubleButton.style.visibility = "visible";
  }

  if (stay) {
    minusButton.style.visibility = "hidden";
    plusButton.style.visibility = "hidden";
    dealButton.style.visibility = "hidden";
    doubleButton.style.visibility = "hidden";
    hitButton.style.visibility = "hidden";
    stayButton.style.visibility = "hidden";
    renderHandInContainer(dealerHand, computerCardContainer);
    renderHandInContainer(playerHand, playerCardContainer);
  }

  if (winner) {
    renderHandInContainer(dealerHand, computerCardContainer);
    renderHandInContainer(playerHand, playerCardContainer);
    let message = document.createElement("h2");
    message.setAttribute("id", "message");
    message.innerHTML = `${winner}`;
    computerCardContainer.after(message);
    replayButton.style.visibility = "visible";
  }

  if (stack === 0 && bet === 0) {
    //message: You're broke. Go to the ATM or refresh the page to continue
  }
}

function addBet(e) {
  if (e.target.id === "plus") {
    if (stack > 0) {
      bet += 5;
      stack -= 5;
      render();
    }
  } else if (e.target.id === "minus") {
    bet -= 5;
    stack += 5;
    render();
  }
}

function deal() {
  if (playerHand.length === 0 && dealerHand.length === 0) {
    playerHand = shuffledDeck.splice(0, 2);
    dealerHand = shuffledDeck.splice(2, 2);
  } else {
    playerHand.push(shuffledDeck.splice(0, 1)[0]);
  }
  render();
  if (
    checkTotal(playerHand) > limit ||
    (checkTotal(playerHand) === limit && playerHand.length === 2)
  ) {
    gameOver();
  }
  if (checkTotal(playerHand) === limit) {
    dealerPlay();
  }
}

function double() {
  bet *= 2;
  deal();
  dealerPlay();
}

function checkTotal(hand) {
  let total = 0;
  let handHasAce = [];
  hand.forEach(function (card) {
    total += card.value;
    if (card.value === 11) {
      handHasAce.push(true);
    }
  });
  while (total > 21 && handHasAce.length) {
    total -= 10;
    handHasAce.pop();
  }
  return total;
}

function dealerPlay() {
  stay = true;
  while (checkTotal(dealerHand) < 17) {
    dealerHand.push(shuffledDeck.splice(0, 1)[0]);
  }
  render();
  gameOver();
}

function gameOver() {
  if (playerHand.length === 2 && checkTotal(playerHand) === limit) {
    winner = `Blackjack! You win ${bet * 1.5}`;
    stack += bet * 2.5;
    bet = 0;
  }
  if (
    checkTotal(playerHand) > limit ||
    (checkTotal(playerHand) <= limit &&
      checkTotal(dealerHand) <= limit &&
      checkTotal(playerHand) < checkTotal(dealerHand)) ||
    (dealerHand.length === 2 &&
      checkTotal(dealerHand) === limit &&
      checkTotal(playerHand) !== limit)
  ) {
    winner = "You lose!";
    bet = 0;
  } else if (
    (checkTotal(playerHand) <= limit && checkTotal(dealerHand) > limit) ||
    (checkTotal(playerHand) <= limit &&
      checkTotal(dealerHand) <= limit &&
      checkTotal(playerHand) > checkTotal(dealerHand))
  ) {
    winner = `You win: ${bet * 2}`;
    stack += bet * 2;
    bet = 0;
  } else if (checkTotal(playerHand) === checkTotal(dealerHand)) {
    winner = "Stand Off!";
    stack += bet;
    bet = 0;
  }
  render();
}

function builtTripleDeck(deck) {
  deck.forEach(function (card) {
    deck.push(card);
    deck.push(card);
  });
  return deck;
}

function buildAndShuffleTripleDeck() {
  // Create a copy of the masterDeck (leave masterDeck untouched!)
  const tempDeck = [...masterDeck];
  shuffledDeck = [];
  builtTripleDeck(tempDeck);

  while (tempDeck.length) {
    // Get a random index for a card still in the tempDeck
    const rndIdx = Math.floor(Math.random() * tempDeck.length);
    // Note the [0] after splice - this is because splice always returns an array
    // and we just want the card object in that array
    shuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
  }
}

function renderHandInContainer(hand, container) {
  const cardsHtml = hand.reduce(function (html, card) {
    return html + `<div class="card ${card.face} xlarge"></div>`;
  }, "");
  container.innerHTML = cardsHtml;
  if (hand === dealerHand && dealerHand.length <= 2 && stay === false) {
    container.firstChild.classList.add("back-red");
  }
  if (stay) {
    container.firstChild.classList.remove("back-red");
  }
  console.log(shuffledDeck);
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

init();
