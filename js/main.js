/*----- constants -----*/

const chipsSound = new Audio('audio/Poker chips hit settle felt table_BLASTWAVEFX_16064.wav');
const cardDown = new Audio('audio/MB_Card_Down_06.wav');
const coinsSound = new Audio('audio/Coins drop multiple wood surface large pile_BLASTWAVEFX_23512.wav');
const cashRegisterSound = new Audio('audio/Springy antique cash register lever and bell quickly.wav');


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

const masterDeck = buildMasterDeck();

/*----- app's state (variables) -----*/
let shuffledDeck;
let stack;
let bet;
let playerHand;
let dealerHand;
let winner;
let dealt;
let stay;

/*----- cached element references -----*/
const playerCardContainer = document.querySelector("#player-cards");
const dealerCardsContainer = document.querySelector("#dealer-cards");
const resetButton = document.querySelector("#reset");
const chips = document.querySelector(".chips");
const dealButton = document.querySelector("#deal");
const doubleButton = document.querySelector("#double");
const hitButton = document.querySelector("#hit");
const stayButton = document.querySelector("#stay");
const chipStack = document.querySelector("#stack");
const currentBet = document.querySelector("#bet");
const replayButton = document.querySelector("#replay");
const playerHandCount = document.querySelector('#player-hand');
const dealerHandCount = document.querySelector('#dealer-hand');
const winningMessage = document.querySelector('#winning-message');


/*----- event listeners -----*/
dealButton.addEventListener("click", () => {
  cardDown.play();
  deal();
});


hitButton.addEventListener("click", () => {
  cardDown.play();
  deal();
});

stayButton.addEventListener("click", dealerPlay);

doubleButton.addEventListener("click", () => {
  cardDown.play();
  double();
});

chips.addEventListener('click', addBet);

resetButton.addEventListener('click', addBet);

replayButton.addEventListener("click", replay);

/*----- functions -----*/

function init() {
  stack = 500;
  bet = 0;
  playerHand = [];
  dealerHand = [];
  winner = null;
  stay = false;
  dealt = false;
  buildAndShuffleTripleDeck();
  render();
}

function replay() {
  bet = 0;
  winner = null;
  stay = false;
  dealt = false;
  winningMessage.textContent = '';
  playerHandCount.textContent = '';
  dealerHandCount.textContent = '';
  let usedCards = playerHand.concat(dealerHand);
  usedCards.forEach((card) => {
    shuffledDeck.push(card);
  });
  usedCards = [];
  playerHand = [];
  dealerHand = [];
  chips.addEventListener('click', addBet);
  render();
}

function render() {
  currentBet.textContent = bet;
  chipStack.textContent = stack;

  

  if (stack >=100) {
    document.querySelector('.second').style.visibility = "visible";
  } else {
    document.querySelector('.second').style.visibility = "hidden";
  }
  if (stack >= 250) {
    document.querySelector('.third').style.visibility = "visible";
  } else {
    document.querySelector('.third').style.visibility = "hidden";
  }
  if(stack > 500) {
    document.querySelector('.first').style.visibility = "visible";
  } else {
    document.querySelector('.first').style.visibility = "hidden";
  }

  playerCardContainer.innerHTML = "";
  dealerCardsContainer.innerHTML = "";

  dealButton.style.visibility = "hidden";
  doubleButton.style.visibility = "hidden";
  hitButton.style.visibility = "hidden";
  stayButton.style.visibility = "hidden";
  replayButton.style.visibility = "hidden";
  resetButton.style.visibility = "hidden";

  if (playerHand.length > 0) {
    playerHandCount.textContent = checkTotal(playerHand);
  }

  if (
    bet > 0 &&
    stack === 0 &&
    dealerHand.length === 0 &&
    playerHand.length === 0
  ) {
    resetButton.style.visibility = "visible";
    dealButton.style.visibility = "visible";
  }

  if (
    bet > 0 &&
    stack > 0 &&
    dealerHand.length === 0 &&
    playerHand.length === 0
  ) {
    resetButton.style.visibility = "visible";
    dealButton.style.visibility = "visible";
  }

  if (bet > 0 && dealerHand.length > 0 && playerHand.length > 0) {
    hitButton.style.visibility = "visible";
    stayButton.style.visibility = "visible";
    setTimeout(renderHandInContainer(dealerHand, dealerCardsContainer), 2000);
    setTimeout(renderHandInContainer(playerHand, playerCardContainer), 2000);
  }

  if (playerHand.length === 2) {
    doubleButton.style.visibility = "visible";
  }

  if (dealt) {
    chips.removeEventListener('click', addBet);
  }

  if (stay) {
    dealButton.style.visibility = "hidden";
    doubleButton.style.visibility = "hidden";
    hitButton.style.visibility = "hidden";
    stayButton.style.visibility = "hidden";
    dealerHandCount.textContent = checkTotal(dealerHand);
    renderHandInContainer(dealerHand, dealerCardsContainer);
    renderHandInContainer(playerHand, playerCardContainer);
  }

  if (winner) {
    winningMessage.textContent = winner;
    replayButton.style.visibility = "visible";
    dealButton.style.visibility = "hidden";
    doubleButton.style.visibility = "hidden";
    hitButton.style.visibility = "hidden";
    stayButton.style.visibility = "hidden";
    dealerHandCount.textContent = checkTotal(dealerHand);
    renderHandInContainer(dealerHand, dealerCardsContainer);
    renderHandInContainer(playerHand, playerCardContainer);
  }

  if (stack === 0 && bet === 0) {
    winningMessage.textContent = "You're broke. Go to the ATM or refresh the page to continue.";
    replayButton.style.visibility = "hidden";
  }
}

function addBet(e) {
  console.log(e.target.id)
  if (stack >= parseInt(e.target.id)) {
    bet += parseInt(e.target.id);
    stack -= parseInt(e.target.id);
    render();
  }
  if (e.target.id === "reset") {
    stack += bet;
    bet = 0;
    render();
  }
  chipsSound.play();
}

function deal() {
  dealt = true;
  if (playerHand.length === 0 && dealerHand.length === 0) {
    playerHand = shuffledDeck.splice(0, 2);
    dealerHand = shuffledDeck.splice(2, 2);
  } else {
    playerHand.push(shuffledDeck.splice(0, 1)[0]);
  }
  if (checkTotal(playerHand) === limit) {
    dealerPlay();
  }
  setTimeout(gameOver(), 600);
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
  ;
  setTimeout(() => {
    render();
    gameOver();
  }, 600);
}

function gameOver() {
  if (checkTotal(playerHand) === limit && playerHand.length === 2 ) {
    cashRegisterSound.play();
    coinsSound.play();
    winner = `Blackjack! You win: $ ${bet * 3/2}`;
    stack += bet * 3/2;
    // bet = 0;
  } else if (
    checkTotal(playerHand) > limit ||
    (checkTotal(playerHand) <= limit &&
      checkTotal(dealerHand) <= limit &&
      checkTotal(playerHand) < checkTotal(dealerHand)) && stay||
    (dealerHand.length === 2 &&
      checkTotal(dealerHand) === limit &&
      checkTotal(playerHand) !== limit) && stay
  ) {
    winner = `You lose!`;
    // bet = 0;
  } else if (
    (checkTotal(playerHand) <= limit && checkTotal(dealerHand) > limit) ||
    (checkTotal(playerHand) <= limit &&
      checkTotal(dealerHand) <= limit &&
      checkTotal(playerHand) > checkTotal(dealerHand)) && stay
  ) {
    cashRegisterSound.play();
    coinsSound.play();
    winner = `You win: $ ${bet * 2}`;
    stack += bet * 2;
    // bet = 0;
  } else if (checkTotal(playerHand) === checkTotal(dealerHand) && stay) {
    winner = `Stand Off!`;
    stack += bet;
    // bet = 0;
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
