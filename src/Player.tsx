import { CardGroup } from "./Cards";
import { Hand } from "./Poker";

const STARTING_CHIP_AMOUNT = 100;

export class Player {
  name: string;
  cardGroup : CardGroup | undefined;
  hand : Hand | undefined;
  position : number;
  chips: number;
  contributed: number;

  constructor(name: string, position: number){
    this.name = name;
    this.cardGroup = undefined;
    this.hand = undefined;
    this.position = position;
    this.chips = STARTING_CHIP_AMOUNT;
    this.contributed = 0;
  }

  public set(cardGroup : CardGroup , hand: Hand){
    this.cardGroup = cardGroup;
    this.hand = hand;
  }

  public setChips(chips : number){
    this.chips = chips;
  }
}