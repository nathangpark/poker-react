export enum Suits {
  Spades = "Spades",
  Clubs = "Clubs",
  Diamonds = "Diamonds",
  Hearts = "Hearts",
}

export class Card {
  value: number;
  suit: Suits;
  id: number;

  constructor(value: number, suit: Suits) {
    this.value = value;
    this.suit = suit;
    const suitId =  
      suit === Suits.Spades
        ? 0
        : suit === Suits.Clubs
        ? 1
        : suit === Suits.Diamonds
        ? 2
        : 3;
    this.id = suitId * 15 + value;
  }

  public getFace() {
    return this.value === 11
      ? "J"
      : this.value === 12
      ? "Q"
      : this.value === 13
      ? "K"
      : this.value === 14
      ? "A"
      : this.value.toString();
  }

  public toString() {
    return this.getFace() + " of " + this.suit;
  }
}



export class CardGroup {
  cards: Card[];

  constructor(cards?: Card[]) {
    this.cards = cards === undefined ? [] : cards.concat([]);
  }

  public addCard(card: Card) {
    this.cards.push(card);
  }

  public removeAt(index: number) {
    if (index > this.cards.length) throw new Error("Index Out of Bounds.");
    return this.cards.splice(index, 1)[0];
  }

  public shuffle() {
    let shuffled = new CardGroup();
    while (this.cards.length != 0) {
      shuffled.addCard(
        this.removeAt(Math.floor(Math.random() * this.cards.length))
      );
    }
    this.cards = shuffled.cards;
    return;
  }

  public sortDescending() {
    return this.cards.sort((a: Card, b: Card) => {
      return b.value - a.value;
    });
  }

  public toString() {
    let str = "";
    this.cards.forEach((card) => {
      str += card + "\n";
    });
    return str;
  }
}

let myCards = new CardGroup();
let firstCard = new Card(10,Suits.Diamonds);

myCards.addCard(firstCard);

myCards.addCard(new Card(10,Suits.Diamonds));

export class Deck extends CardGroup {
  constructor() {
    super();

    Object.values(Suits).forEach((suit: Suits) => {
      for (let value = 2; value <= 14; value++) {
        this.addCard(new Card(value, suit));
      }
    });
  }

  public deal(target: CardGroup, times: number) {
    for (let i = 0; i < times; i++) {
      target.addCard(this.removeAt(0));
    }
  }
}
