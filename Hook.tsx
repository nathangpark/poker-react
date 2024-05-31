import { Player } from "./Player";

export class Hook {
  started: boolean;

  dealtList: number[];
  foldList: Player[];
  outList: Player[];

  currentlyActive: Player | undefined;
  needToCall: boolean;

  isDealing: boolean;
  isResetting: boolean;

  allCardsDealt: boolean;
  isRevealed: boolean;

  pot: number;
  winnerPositions: number[];

  betMin: number;
  actionList: string [];
  actionShownList : boolean[];

  constructor(startingPlayer: Player, prevHook: Hook | undefined) {
    if (prevHook == undefined) {
      this.started = false;
      this.dealtList = [];
      this.foldList = [];
      this.currentlyActive = startingPlayer;
      this.needToCall = false;
      this.isDealing = true;
      this.isResetting = false;
      this.allCardsDealt = false;
      this.isRevealed = false;
      this.pot = 0;
      this.winnerPositions = [];
      this.betMin = 5;
      this.outList = [];
      this.actionList = [];
      this.actionList.length = 7;

      this.actionShownList = [];
      this.actionShownList.length = 7;
      this.actionShownList.forEach((actionShown : boolean) => actionShown = false);
    } else {
      this.started = prevHook.started;
      this.dealtList = prevHook.dealtList;
      this.foldList = prevHook.foldList;
      this.currentlyActive = prevHook.currentlyActive;
      this.needToCall = prevHook.needToCall;
      this.isDealing = prevHook.isDealing;
      this.isResetting = prevHook.isResetting;
      this.allCardsDealt = prevHook.allCardsDealt;
      this.isRevealed = prevHook.isRevealed;
      this.pot = prevHook.pot;
      this.winnerPositions = prevHook.winnerPositions;
      this.betMin = prevHook.betMin;
      this.outList = prevHook.outList;
      this.actionList = prevHook.actionList;
      this.actionShownList = prevHook.actionShownList;
    }
  }
}
