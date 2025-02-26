//Define card class
class Card {

    constructor(image, value) {
        this.image = image;
        this.value = value;
    }


    getImage() {
        return this.image;
    }

    setImage(image) {
        this.image = image;
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
    }

}

//Initialize arrays
let deck = []
let playerHand = []
let dealerHand = []
let placeCardSounds = [];

//load sounds
for (let i = 1; i < 9; i++) {
    placeCardSounds.push(new Audio('audio/cardSlide' + i + '.wav'));
}

shuffleArray(placeCardSounds); // shuffle card sounds so they're different each time

generateDeck();

//Add event listeners
document.getElementById('playGameBtn').addEventListener('click', play);
let hitBtn = document.getElementById('hitBtn');
hitBtn.addEventListener('click', hit);
let standBtn = document.getElementById('standBtn');
standBtn.addEventListener('click', stand);
let playAgainBtn = document.getElementById('playAgainBtn');
playAgainBtn.addEventListener('click', playAgain);

//Get and assign elements from the DOM
let enterBet = document.getElementById('betPage');
let table = document.getElementById('table');
let messageElement = document.getElementById('message');
let charlieRule = document.getElementById('charlieRule');
let chipCountElement = document.getElementById('chipCount');
let dealerHandElement = document.createElement('div');
let playerHandElement = document.createElement('div');
let hiddenDealerCard;
playerHandElement.id = 'player_hand';
dealerHandElement.id = 'dealer_hand';
table.appendChild(dealerHandElement);
table.appendChild(playerHandElement);
hitBtn.style.display = "none";
standBtn.style.display = "none";
playAgainBtn.style.display = "none";
let chips = 100;
let bet;
chipCountElement.textContent = chips;


function play() {
    bet = Number(document.getElementById('bet').value);
    if (bet <= 0 || bet > chips) {
        return;
    }
    chips = (chips - bet);
    chipCountElement.textContent = chips;



    hitBtn.style.display = "";
    standBtn.style.display = "";
    enterBet.style.display = "none";

    //Dealer draws two cards from the deck
    dealerHand.push(deck.pop());
    dealerHand.push(deck.pop());


    //Trickery to make it seem like the first card is face down
    let backCard = document.createElement('div');
    backCard.id = 'card';
    let backCardImage = document.createElement('img');
    backCardImage.src = 'images/back.png'
    backCard.appendChild(backCardImage);
    dealerHandElement.appendChild(backCard);


    dealerHand.forEach((e) => {
        let card = document.createElement('div');
        card.id = 'card';
        let cardImg = document.createElement('img');
        cardImg.src = e.getImage();
        card.appendChild(cardImg);
        dealerHandElement.appendChild(card);
        let audio = placeCardSounds[Math.floor(Math.random() * placeCardSounds.length)]; // get random audio element
        audio.play();
    });

    //Hide first dealer card
    hiddenDealerCard = dealerHandElement.children[1];
    hiddenDealerCard.style.display = "none";
    playerHand.push(deck.pop());

    //Create div and image for first player card
    let card = document.createElement('div');
    card.id = 'card';
    let cardImg = document.createElement('img');
    cardImg.src = playerHand[0].getImage();
    card.appendChild(cardImg);
    playerHandElement.appendChild(card);

}

function hit() {
    let audio = placeCardSounds[Math.floor(Math.random() * placeCardSounds.length)]; // get random audio element
    audio.play();

    playerHand.push(deck.pop());
    let playerCard = document.createElement('div');
    playerCard.id = 'card';
    let playerCardImg = document.createElement('img');
    playerCardImg.src = playerHand[playerHand.length - 1].getImage();
    playerCard.appendChild(playerCardImg);
    playerHandElement.appendChild(playerCard);


    let playerHandValue = calculateHand(playerHand);

    if ((playerHandValue > 21)) {
        lose();
    } else if ((playerHandValue <= 21 && charlieRule.checked && playerHand.length == 5) || (playerHandValue === 21)) {
        win();
    }
}


function win() {

    standBtn.style.display = "none";
    hitBtn.style.display = "none";
    messageElement.textContent = "You win!"
    messageElement.style.color = "lightgreen";
    playAgainBtn.style.display = "";
    chips += (bet * 2);
    chipCountElement.textContent = chips;
}

function lose() {

    standBtn.style.display = "none";
    hitBtn.style.display = "none";

    if (chips == 0) {
        messageElement.textContent = "Bust! You ran out of chips!";
        messageElement.style.color = "darkred";
        playAgainBtn.style.display = "none";
        return;
    }
    messageElement.textContent = "Bust!";
    messageElement.style.color = "red";
    playAgainBtn.style.display = "";

}

function draw() {

    standBtn.style.display = "none";
    hitBtn.style.display = "none";
    messageElement.textContent = "It's a draw!";
    messageElement.style.color = "orange";
    playAgainBtn.style.display = "";
    chips = (chips + bet);
    chipCountElement.textContent = chips;

}



function stand() {

    standBtn.style.display = "none";
    hitBtn.style.display = "none";

    let playerHandValue = calculateHand(playerHand);
    let dealerHandValue = calculateHand(dealerHand);


    //Unhide first card
    hiddenDealerCard.style.display = "";
    dealerHandElement.firstChild.style.display = "none";
    let audio = placeCardSounds[Math.floor(Math.random() * placeCardSounds.length)]; // get random audio element
    audio.play();

    // Dealer should draw cards until its hand is at least 17
    let cardInterval = setInterval(() => {
        if ((calculateHand(dealerHand) >= 17)) {
            dealerHandValue = calculateHand(dealerHand); //Recalculate dealer hand after drawing at least 17
            if (playerHandValue > 21) {
                lose();
            } else if (dealerHandValue > 21 || playerHandValue > dealerHandValue) {
                win();
            } else if (playerHandValue === dealerHandValue) {
		draw();
            } else {
                lose();
            }
            clearInterval(cardInterval);
            return;
        }
        dealerHand.push(deck.pop());
        let card = document.createElement('div');
        card.id = 'card';
        let cardImg = document.createElement('img');
        cardImg.src = dealerHand[dealerHand.length - 1].getImage();
        card.appendChild(cardImg);
        dealerHandElement.appendChild(card);
        let audio = placeCardSounds[Math.floor(Math.random() * placeCardSounds.length)]; // get random audio element
        audio.play();
    }, 500);

}


function calculateHand(hand) {
    let handValue = 0;
    let aceCount = 0;

    for (let i = 0; i < hand.length; i++) {
        let cardValue = hand[i].getValue();
        handValue += cardValue;

        if (cardValue === 1) {
            aceCount++;
        }
    }

    while (aceCount > 0 && handValue + 10 <= 21) {
        handValue += 10;
        aceCount--;
    }

    return handValue;
}

function playAgain() {
    deck = []
    playerHand = []
    dealerHand = []

    playAgainBtn.style.display = "none";
    enterBet.style.display = "";
    messageElement.textContent = "";

    generateDeck();
    //Resets dealer and player hand elements by removing all children
    dealerHandElement.innerHTML = "";
    playerHandElement.innerHTML = "";


}

function generateDeck() {
    //Generate Card objects with their respective values
    for (let i = 0; i < 52; i++) {
        //Ternary operations to check if the card should be between 1-10
        let cardValue = (i % 13 + 1);

        //10, King, and Queen values are all 10, Ace is 1 (Ace can be 1 or 10 depending on hand)
        cardValue = (cardValue === 1) ? 1 : (cardValue > 10 ? 10 : cardValue);


        deck.push(new Card('images/cards/0' + (i + 1) + '.png', cardValue));
    }

    //Shuffle deck
    shuffleArray(deck);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
