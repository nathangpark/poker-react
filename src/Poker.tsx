import { Suits, Card, CardGroup } from "./Cards";

enum HandType {
  HIGH_CARD = 0,
  PAIR = 1,
  TWO_PAIR = 2,
  THREE_OF_A_KIND = 3,
  STRAIGHT = 4,
  FLUSH = 5,
  FULL_HOUSE = 6,
  FOUR_OF_A_KIND = 7,
  STRAIGHT_FLUSH = 8,
  ROYAL_FLUSH = 9,
}

export class Hand {
  type: HandType;
  worth: number;
  cards: Card[];

  constructor(type: HandType, cards: Card[]) {
    this.type = type;
    this.cards = cards;
    this.worth = getWorth(type, cards);
  }

  public toString(): string {
    return Object.keys(HandType)[this.type + 10].toLowerCase().replaceAll("_", " ")
  }
}

// calculates the numerical worth of a hand
function getWorth(type: HandType, cards: Card[]): number {
  const MAX_WORTH_LENGTH = 6; // 5 cards plus hand type
  const WORTH_BASE = 15;

  // get worth as an array of numbers in base 15
  let worthArr = [];
  worthArr[0] = type as number;
  cards.forEach((card: Card) => {
    worthArr.push(card.value);
  });

  let worth = 0;
  worthArr.forEach((value: number, index: number) => {
    worth += value * Math.pow(WORTH_BASE, 1 - index - 1);
  });
  return worth;
}

// returns Hand if pairs are found, false if not
function getRepeatedCards(
  sorted: Card[],
  repeats: number,
  count: number,
  ignoreValue: number = 0
): Card[] {
  let matched: Card[] = [];
  let value = 0;
  let currentCount = 0;

  for (let i = 0; i < sorted.length - repeats + 1; i++) {
    if (sorted[i].value == ignoreValue) {
      continue;
    }
    value = sorted[i].value;
    if (
      sorted.slice(i, i + repeats).every((card: Card): boolean => {
        return card.value == value;
      })
    ) {
      matched = matched.concat(sorted.slice(i, i + repeats));
      currentCount++;
      i += repeats - 1;
    }
    if (currentCount == count) {
      break;
    }
  }

  return matched;
}

// returns array of cards that make up a straight
function getStraightCards(sorted: Card[]): Card[] {
  let value: number = 0;
  let noDup = removeDuplicateValues(sorted);
  if (noDup.length < 5) return [];
  
  for (let i = 0; i < noDup.length - 4; i++) {
    value = noDup[i].value;
    if (
      noDup.slice(i + 1, i + 5).every((card: Card, index: number): boolean => {
        return card.value == value - index - 1;
      })
    ) {
      return noDup.slice(i, i + 5);
    }
  }

  if (Math.max(...noDup.map((card: Card) => card.value)) == 14) {
    value = noDup[noDup.length - 4].value;
    if (value !== 5) return [];
    if (
      noDup.slice(-3).every((card: Card, index: number): boolean => {
        return card.value == value - index - 1;
      })
    ) {
      return noDup.slice(-4).concat(getHighCards(noDup.slice(-4), noDup));
    }
  }


  return [];
}

function removeDuplicateValues(sorted: Card[]): Card[] {
  let group = new CardGroup(sorted);
  let card: Card = group.cards[0];

  for (let i = 1; i < group.cards.length; i++) {
    if (card.value !== group.cards[i].value) {
      card = group.cards[i];
    } else {
      if (card.id != group.cards[i].id) {
        group.removeAt(i);
        i--;
      }
    }
  }
  return group.cards;
}

function isolateSuit(sorted: Card[], suit: Suits): Card[] {
  let group = new CardGroup(sorted);
  for (let i = 0; i < group.cards.length; i++) {
    if (group.cards[i].suit !== suit) {
      group.removeAt(i);
      i -= i == 0 ? 0 : 1;
    }
  }
  return group.cards;
}

function getFlushCards(sorted: Card[]): Card[] {
  let suitCounts = [0, 0, 0, 0];
  sorted.forEach((card: Card) => {
    if (suitCounts.some((count : number) => count >= 5)) return;
    suitCounts[Object.values(Suits).indexOf(card.suit)] += 1;
  });

  let index = suitCounts.indexOf(5);
  if (index == -1) return [];
  let suit = Object.values(Suits)[index];

  let matched: Card[] = [];
  sorted.forEach((card: Card) => {
    if (card.suit == suit && matched.length < 5) {
      matched.push(card);
    }
  });
  return matched;
}

function getHandStraightFlush(sorted: Card[]): Hand | boolean {
  let matched = getFlushCards(sorted);
  if (matched.length == 0) return false;
  let suit: Suits = matched[0].suit;
  matched = getStraightCards(isolateSuit(sorted, suit));
  if (matched.length == 0) return false;

  return new Hand(
    matched[0].value == 14 ? HandType.ROYAL_FLUSH : HandType.STRAIGHT_FLUSH,
    matched
  );
}

function getHandFlush(sorted: Card[]): Hand | boolean {
  let matched = getFlushCards(sorted);
  return matched.length !== 0 ? new Hand(HandType.FLUSH, matched) : false;
}

function getHandStraight(sorted: Card[]): Hand | boolean {
  let straight = getStraightCards(sorted);
  return straight.length !== 0 ? new Hand(HandType.STRAIGHT, straight) : false;
}

// returns hand if full house, false if otherwise
function getHandFullHouse(sorted: Card[]): Hand | boolean {
  let matched = getRepeatedCards(sorted, 3, 1);
  if (matched.length == 0) return false;
  matched = matched.concat(getRepeatedCards(sorted, 2, 1, matched[0].value));
  if (matched.length == 3) return false;

  return new Hand(HandType.FULL_HOUSE, matched);
}

// returns full hand (with high cards) with a certain number of repeats, used for two-pair, pair, three of a kind
function getHandRepeats(
  sorted: Card[],
  repeats: 2 | 3 | 4,
  count: 1 | 2
): Hand | boolean {
  let matched = getRepeatedCards(sorted, repeats, count);
  if (matched.length == 0) return false;

  const highCard: Card[] = (sorted.length > matched.length) ? getHighCards(matched, sorted) : [];
  return repeats == 4
    ? new Hand(HandType.FOUR_OF_A_KIND, matched.concat(highCard))
    : repeats == 3
    ? new Hand(HandType.THREE_OF_A_KIND, matched.concat(highCard))
    : repeats == 2
    ? new Hand(
        matched.length > 2 ? HandType.TWO_PAIR : HandType.PAIR,
        matched.concat(highCard)
      )
    : false;
}

// return hand of high cards
function getHandHighCard(sorted: Card[]): Hand {
  return new Hand(
    HandType.HIGH_CARD,
    sorted.slice(0, sorted.length > 5 ? 5 : undefined)
  );
}

// returns list of remaining high cards needed to build hand
function getHighCards(matchedCards: Card[], sorted: Card[]): Card[] {
  if (matchedCards.length == 5) return [];

  let highCards: Card[] = [];
  sorted.forEach((card: Card): void => {
    if (
      highCards.length + matchedCards.length < 5 &&
      !matchedCards.some((matched: Card) => {
        return matched.id == card.id;
      })
    ) {
      highCards.push(card);
    }
  });

  if (highCards.length == 0) throw new Error("High card could not be found");

  return highCards;
}

export function match(group: CardGroup, shared: CardGroup): Hand {

  let sortedGroup = new CardGroup(group.cards.concat(shared.cards));
  sortedGroup = new CardGroup(sortedGroup.sortDescending());
  const sorted = sortedGroup.cards;

  let hand: Hand | boolean;
  hand = getHandStraightFlush(sorted);
  hand = !hand ? getHandRepeats(sorted, 4, 1) : hand; // four of a kind
  hand = !hand ? getHandFullHouse(sorted) : hand;
  hand = !hand ? getHandFlush(sorted) : hand;
  hand = !hand ? getHandStraight(sorted) : hand;
  hand = !hand ? getHandRepeats(sorted, 3, 1) : hand; // three of a kind
  hand = !hand ? getHandRepeats(sorted, 2, 2) : hand; // two-pair
  hand = !hand ? getHandRepeats(sorted, 2, 1) : hand; // pair
  hand = !hand ? getHandHighCard(sorted) : hand; // high card

  return hand as Hand;
}