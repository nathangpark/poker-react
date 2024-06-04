import { Card, CardGroup, Deck } from "./Cards";
import CardGroupComponent from "./components/CardGroupComponent";
import { Hand, match } from "./Poker";
import Button from "./components/Button";
import { useState } from "react";
import PlayerComponent from "./components/PlayerComponent";
import { Player } from "./Player";
import PotComponent from "./components/PotComponent";
import BetComponent from "./components/BetComponent";
import { Hook } from "./Hook";
import OpponentSelector from "./components/OpponentSelector";
import TitleComponent from "./components/TitleComponent";

// data

let deck: Deck;
let myCards: CardGroup;
let oppsCards: CardGroup[];
let sharedCards: CardGroup;
let myHand: Hand;
let oppsHand: Hand[];

let winners: Player[];
let winnersStr: string;
let currentGroup: number;

// for dealing
let dealtCount: number = 0;
let dealOrder: number[][];
let undealOrder: number[];

let opponentNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 = 3; // [0,7]
let matchedPlayerCount = 0;
let totalAmount = 0;

// get positions based on number of opponents
function getPositionOrder(): number[] {
  return opponentNumber == 1
    ? [7, 2]
    : opponentNumber == 2
    ? [7, 1, 3]
    : opponentNumber == 3
    ? [7, 4, 2, 5]
    : opponentNumber == 4
    ? [7, 4, 1, 3, 5]
    : opponentNumber == 5
    ? [7, 4, 1, 2, 3, 5]
    : opponentNumber == 6
    ? [7, 6, 4, 1, 2, 3, 5]
    : [7, 6, 4, 1, 2, 3, 5, 8];
}

let positionOrder = getPositionOrder();

let player: Player = new Player("You", positionOrder[0]);
let oppsPlayer: Player[] = [];

let hookSync = new Hook(player, undefined);

let allPlayers: Player[] = [];

// finds winners as list of players, returns list
let findWinners = () => {
  const worths = allPlayers.map((player: Player) =>
    hookSync.foldList.includes(player) ? 0 : (player.hand as Hand).worth
  );
  const maxWorth: number = Math.max(...worths);

  let winners: Player[] = [];
  if ((player.hand as Hand).worth == maxWorth) winners.push(player);
  oppsPlayer.forEach((oppPlayer: Player) => {
    if ((oppPlayer.hand as Hand).worth == maxWorth) winners.push(oppPlayer);
  });
  return winners;
};

//oppsPlayer[2].setChips(0);

function resetCards() {
  allPlayers = [player].concat(oppsPlayer);
  deck = new Deck();
  deck.shuffle();

  myCards = new CardGroup();
  oppsCards = [];
  for (let i = 0; i < opponentNumber; i++) oppsCards.push(new CardGroup());
  sharedCards = new CardGroup();

  if (!hookSync.outList.includes(player)) deck.deal(myCards, 2);
  deck.deal(sharedCards, 5);

  oppsCards.forEach((oppCards: CardGroup, index: number) => {
    if (!hookSync.outList.includes(oppsPlayer[index])) deck.deal(oppCards, 2);
  });

  myHand = match(myCards, sharedCards);
  oppsHand = oppsCards.map((oppCards: CardGroup) =>
    match(oppCards, sharedCards)
  );

  player.set(myCards, myHand);
  oppsPlayer.forEach((oppPlayer: Player, index: number) => {
    oppPlayer.set(oppsCards[index], oppsHand[index]);
  });

  let allCards: Card[] = [];

  // deal order
  for (let i = 0; i < 2; i++) {
    allCards.push(myCards.cards[i]);
    for (let j = 0; j < opponentNumber; j++) {
      allCards.push(oppsCards[j].cards[i]);
    }
  }
  dealOrder = [allCards]
    .concat([sharedCards.cards.slice(0, 3)])
    .concat([sharedCards.cards.slice(3, 4)])
    .concat([sharedCards.cards.slice(4)])
    .map((cards: Card[]) =>
      cards.map((card: Card) => {
        return card !== undefined ? card.id : 0;
      })
    );


  allCards = myCards.cards;
  // undeal order
  for (let i = 0; i < opponentNumber; i++)
    allCards = allCards.concat(oppsCards[i].cards);

  undealOrder = allCards
    .concat(sharedCards.cards.slice(0, 3))
    .concat(sharedCards.cards.slice(3, 4))
    .concat(sharedCards.cards.slice(4))
    .map((card: Card) => card.id);

  currentGroup = 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function App() {
  const [hook, setHook] = useState(hookSync);

  const updateHook = () => {
    setHook(new Hook(player, hookSync));
  };

  const flashAction = async (index: number) => {
    hookSync.actionShownList[index] = true;
    updateHook();
    await sleep(1000);
    hookSync.actionShownList[index] = false;
    updateHook();
  };

  const handleFullReset = async () => {
    hookSync.isResetting = true;
    hookSync.winnerPositions = [];
    hookSync.isRevealed = false;

    allPlayers.forEach((player: Player) => {
      if (player.chips == 0 && !hookSync.outList.includes(player)) hookSync.outList.push(player);
    });

    updateHook();

    await sleep(500);

    for (let i = 0; i <= undealOrder.length; i++) {
      hookSync.dealtList = undealOrder.slice(0, undealOrder.length - i); // put away cards
      updateHook();
      await sleep(150);
    }

    dealtCount = 0;

    hookSync.allCardsDealt = false;
    updateHook();

    resetCards();

    hookSync.currentlyActive = player;
    hookSync.dealtList = [];
    hookSync.foldList = [];
    updateHook();

    if (
      hookSync.outList.includes(player) ||
      oppsPlayer.every((player: Player) => {
        return player.chips == 0;
      })
    ) {
      // GAME OVER
      hookSync = new Hook(player, undefined);
      oppsPlayer = [];
      updateHook();
      return;
    }

    await sleep(1000);
    console.log(dealOrder);

    handleInitialBet();
    await sleep(500 * allPlayers.length);

    handleDeal();
    
    hookSync.isResetting = false;
    updateHook();
  };

  const handleStart = async (opponentNum: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
    opponentNumber = opponentNum;
    positionOrder = getPositionOrder();

    player = new Player("You", positionOrder[0]);
    oppsPlayer = [];
    for (let i = 0; i < opponentNumber; i++)
      oppsPlayer.push(new Player("Bot " + (i + 1), positionOrder[i + 1]));

    resetCards();
    hookSync.started = true;
    updateHook();
    handleInitialBet();
    await sleep(500 * allPlayers.length);
    handleDeal();
  };

  // used by players and bots
  const handleFold = async (foldedPlayer: Player, cardGroup: CardGroup) => {
    if (foldedPlayer == undefined || foldedPlayer.hand == undefined) return;
    foldedPlayer.hand.worth = 0;

    // add player object to foldList
    hookSync.foldList.push(foldedPlayer);
    hookSync.currentlyActive = undefined;
    updateHook();

    // undeal cards that belong to player

    cardGroup.cards.forEach((card: Card) => {
      let indexID: number = hookSync.dealtList.findIndex(
        (id: number) => id == card.id
      );
      if (indexID == -1)
        throw new Error("Could not find card in deal list when folding.");
      hookSync.dealtList.splice(indexID, 1);
      undealOrder.splice(
        undealOrder.findIndex((id: number) => id == card.id),
        1
      );
    });

    dealtCount -= 2;
    updateHook();

    // continue cycle after
    if (foldedPlayer == player) {
      roundCycle(1);
      hookSync.actionList[0] = "Fold";
      flashAction(0);
    }
  };

  // used by players and bots
  const bet = (playerBetting: Player, amount: number) => {
    if (playerBetting.chips < amount) amount = playerBetting.chips;
    playerBetting.chips -= amount;
    hookSync.pot += amount;
    updateHook();
    return;
  };

  // used by player
  const handleBet = (amount: number) => {
    // if raise
    if (totalAmount != amount + player.contributed) {
      matchedPlayerCount = 1;
      if (amount == player.chips) {
        hookSync.actionList[0] = "All in";
      } else {
        hookSync.actionList[0] =
          (totalAmount == 0 ? "Bet " : "Raise ") +
          (amount + player.contributed - totalAmount);
      }
      flashAction(0);
    } else {
      matchedPlayerCount++;
    }

    totalAmount = amount + player.contributed;
    player.contributed += amount;
    bet(player, amount);

    // start cycle at next position
    roundCycle(1);
  };

  const handleCheck = () => {
    hookSync.actionList[0] =
      totalAmount - player.contributed == 0 ? "Check" : "Call";
    flashAction(0);
    handleBet(totalAmount - player.contributed);
  };

  const botDecision = (botPlayer: Player) => {
    let betNeeded = totalAmount - botPlayer.contributed;
    if (betNeeded > botPlayer.chips) betNeeded = botPlayer.chips;
    if (botPlayer.chips == 0) return 0;

    let shownCount =
      currentGroup == 1 ? 0 : currentGroup == 2 ? 3 : currentGroup == 3 ? 4 : 5;
    let currentHand: Hand = match(
      botPlayer.cardGroup as CardGroup,
      new CardGroup(sharedCards.cards.slice(0, shownCount))
    );

    let playOdds = 0;
    let choseRaise = false;
    let choseFold = false;

    if (betNeeded == 0) {
      playOdds = 1;
    } else {
      // worth contribution
      playOdds =
        currentGroup == 1
          ? currentHand.worth / 1
          : currentGroup == 2
          ? currentHand.worth / 2
          : currentGroup == 3
          ? currentHand.worth / 3
          : currentHand.worth / 5;

      // how much commitment would the hand be
      playOdds *=
        botPlayer.chips != betNeeded
          ? (botPlayer.chips - betNeeded) / botPlayer.chips
          : // all in
          currentGroup < 3
          ? 0.2
          : 0.8;

      // how much can be won compared to the bet needed
      playOdds +=
        hookSync.pot > betNeeded && betNeeded > 0
          ? hookSync.pot / (betNeeded * 100)
          : 1;
    }

    if (Math.random() <= playOdds) {
      // call/check/raise
      let raiseOdds =
        currentGroup == 1
          ? currentHand.worth / 2.5
          : currentGroup == 2
          ? currentHand.worth / 4
          : currentGroup == 3
          ? currentHand.worth / 4
          : currentHand.worth / 8;
      raiseOdds *= (botPlayer.chips - betNeeded + 5) / botPlayer.chips;
      raiseOdds *=
        totalAmount > 0 && betNeeded > 0 ? betNeeded / totalAmount : 1;
      choseRaise = Math.random() <= raiseOdds;
    } else {
      choseFold = true;
    }

    if (choseRaise) {
      const HIGH_BET_ODDS = currentHand.worth / 10;
      if (Math.random() <= HIGH_BET_ODDS) {
        return (
          5 * Math.ceil((Math.random() * (botPlayer.chips - betNeeded)) / 5) +
          betNeeded
        );
      } else {
        return (
          5 * Math.ceil((Math.random() * (botPlayer.chips - betNeeded)) / 25) +
          betNeeded
        );
      }
    } else if (choseFold) {
      const BLUFF_ODDS = currentGroup < 2 ? 0 : 0.15;
      if (Math.random() <= BLUFF_ODDS) {
        return (
          5 * Math.ceil((Math.random() * (botPlayer.chips - betNeeded)) / 5) +
          betNeeded
        );
      } else {
        handleFold(botPlayer, botPlayer.cardGroup as CardGroup);
        return 0;
      }
    } else {
      // check/call
      const BLUFF_ODDS = currentGroup < 2 ? 0 : 0.05;
      if (Math.random() <= BLUFF_ODDS) {
        return (
          5 * Math.ceil((Math.random() * (botPlayer.chips - betNeeded)) / 5) +
          betNeeded
        );
      } else {
        return betNeeded;
      }
    }
  };

  const roundCycle = async (index: number) => {
    // start cycle
    while (
      matchedPlayerCount !==
      allPlayers.length - hookSync.foldList.length - hookSync.outList.length
    ) {
      // do not cycle to them if folded or out, skip
      if (
        hookSync.foldList.includes(allPlayers[index]) ||
        hookSync.outList.includes(allPlayers[index])
      ) {
        index += index == allPlayers.length - 1 ? -index : 1;
        continue;
      }
      // if all else who are playing are all in, go next
      if (
        allPlayers.every((player: Player, i: number) => {
          return (
            (i == index ||
              player.chips == 0 ||
              hookSync.foldList.includes(player)) &&
            totalAmount == 0
          );
        })
      ) {
        // go next until done dealing
        if (
          dealOrder[currentGroup] == undefined ||
          allPlayers.length -
            hookSync.foldList.length -
            hookSync.outList.length ==
            1
        ) {
          hookSync.allCardsDealt = true;
          updateHook();
        } else handleDeal();
        return;
      }

      // if all in, skip highlight
      if (allPlayers[index].chips == 0) {
        index += index == allPlayers.length - 1 ? -index : 1;
        matchedPlayerCount++;
        continue;
      }

      hookSync.currentlyActive = allPlayers[index];
      updateHook();

      let betAmount = 0;

      // WHEN PLAYER TURN
      if (index == 0) {
        return;
      }

      // FOR EACH BOT
      await sleep(1000);

      // MAKE CHOICE
      betAmount = botDecision(allPlayers[index]);

      // when raised
      if (betAmount + allPlayers[index].contributed > totalAmount) {
        hookSync.actionList[index] =
          betAmount == allPlayers[index].chips
            ? "All in"
            : (totalAmount == 0 ? "Bet " : "Raise ") +
              (betAmount - totalAmount + allPlayers[index].contributed);

        matchedPlayerCount = 0;
        totalAmount = betAmount + allPlayers[index].contributed;

        hookSync.betMin = betAmount - player.contributed + 5;
        hookSync.needToCall = true;

        updateHook();
        flashAction(index);
      } else if (allPlayers[index].chips <= betAmount) {
        // on all in
        hookSync.actionList[index] = "All in";
        flashAction(index);
      } else if (betAmount + allPlayers[index].contributed < totalAmount) {
        // on fold
        hookSync.actionList[index] = "Fold";
        flashAction(index);
        index += index == allPlayers.length - 1 ? -index : 1;
        continue;
      } else {
        if (totalAmount - allPlayers[index].contributed == 0) {
          hookSync.actionList[index] = "Check";
        } else {
          hookSync.actionList[index] = "Call";
        }
        flashAction(index);
      }

      bet(allPlayers[index], betAmount);
      allPlayers[index].contributed += betAmount;
      matchedPlayerCount++;

      index += index == allPlayers.length - 1 ? -index : 1;
    }

    // after everyone is matched, reset values for round and deal

    allPlayers.forEach((player: Player) => (player.contributed = 0));
    hookSync.currentlyActive = allPlayers.find(
      (player: Player) => !hookSync.foldList.includes(player)
    );

    // if at the end of dealing, set allCardsDealt to true
    if (
      dealOrder[currentGroup] == undefined ||
      allPlayers.length - hookSync.foldList.length == 1
    ) {
      hookSync.allCardsDealt = true;
      updateHook();
    } else handleDeal();
  };

  const handleDeal = async () => {
    if (hookSync.allCardsDealt) return;

    hookSync.isDealing = true;
    matchedPlayerCount = 0;
    totalAmount = 0;

    hookSync.betMin = 5;
    hookSync.needToCall = false;

    updateHook();

    for (let i = 0; i < dealOrder[currentGroup].length; i++) {
      try {
        let id = dealOrder[currentGroup][i];
        hookSync.dealtList.push(id);
        updateHook();
        if (id != 0) await sleep(250);
      } catch {}
    }

    hookSync.isDealing = false;

    updateHook();
    currentGroup++;

    // if player is folded or all in, run cycle on next player thats in
    if (
      hookSync.foldList.includes(player) ||
      (player.chips == 0 && !hookSync.outList.includes(player))
    )
      roundCycle(
        allPlayers.findIndex(
          (player: Player) => !hook.foldList.includes(player)
        )
      );

    // if all others are all in, skip until end
    if (
      allPlayers.every((player: Player, i: number) => {
        return (
          (i == 0 || player.chips == 0 || hookSync.foldList.includes(player)) &&
          totalAmount == 0
        );
      })
    ) {
      // go next until done dealing
      if (
        dealOrder[currentGroup] == undefined ||
        allPlayers.length - hookSync.foldList.length == 1
      ) {
        hookSync.allCardsDealt = true;
        updateHook();
      } else handleDeal();
      return;
    }
  };

  const handleReveal = () => {
    winners = findWinners();
    winnersStr = "";
    winners
      .map((winner: Player) => winner.name)
      .forEach((winner: string, index: number) => {
        winnersStr += winner + (index != winners.length - 1 ? " and " : "");
      });

    if (dealOrder[currentGroup] !== undefined) {
      // round done before all cards are dealt
      let shownCount =
        currentGroup == 1
          ? 0
          : currentGroup == 2
          ? 3
          : currentGroup == 3
          ? 4
          : 5;

      // adjust hands of players
      allPlayers.forEach((player: Player) => {
        player.hand = match(
          player.cardGroup as CardGroup,
          new CardGroup(sharedCards.cards.slice(0, shownCount))
        );
      });

      // adjust undeal order to remove cards
      undealOrder = undealOrder.slice(0, -shownCount + 1);
    }

    allPlayers.forEach((player: Player) => {
      player.chips += winners.includes(player) ? hook.pot / winners.length : 0;
    });

    hookSync.pot = 0;
    hookSync.isRevealed = true;
    hookSync.winnerPositions = winners.map((winner: Player) => winner.position);
    updateHook();
  };

  const handleInitialBet = async () => {
    for (let i = 0; i < allPlayers.length; i++) {
      if (allPlayers[i].chips > 0) {
        hookSync.currentlyActive = allPlayers[i];
        updateHook();
        await sleep(500);
        bet(allPlayers[i], 5);
      }
    }
    hookSync.currentlyActive = allPlayers.find(
      (player: Player) => !hookSync.foldList.includes(player)
    );
    updateHook();
  };

  return (
    <>
      {hook.started && (
        <div className="play-area">
          <div className="table"/>
          {oppsPlayer.map((oppPlayer: Player, index: number) => (
            <PlayerComponent
              player={oppPlayer}
              dealtID={hook.dealtList}
              hidden={!hook.isRevealed}
              revealed={hook.isRevealed}
              key={index}
              winner={hook.winnerPositions.includes(oppPlayer.position)}
              folded={hook.foldList.includes(oppPlayer)}
              active={hook.currentlyActive == oppPlayer}
              out={hook.outList.includes(oppPlayer)}
              action={hook.actionList[index + 1]}
              actionShown={hook.actionShownList[index + 1]}
            />
          ))}
          <PotComponent
            chips={hook.pot}
            cardGroup={sharedCards}
            dealtID={hook.dealtList}
          />
          <PlayerComponent
            player={player}
            dealtID={hook.dealtList}
            revealed={hook.isRevealed}
            winner={hook.winnerPositions.includes(player.position)}
            folded={hook.foldList.includes(player)}
            active={hook.currentlyActive == player}
            out={hook.outList.includes(player)}
            action={hook.actionList[0]}
            actionShown={hook.actionShownList[0]}
          />
          {!hook.isRevealed &&
            !hook.isResetting &&
            !hook.foldList.includes(player) &&
            !hook.allCardsDealt &&
            !hook.isDealing &&
            hook.currentlyActive == player &&
            totalAmount - player.contributed <= player.chips && (
              <BetComponent
                handleBet={handleBet}
                player={player}
                minimum={hook.betMin}
              />
            )}
          {!hook.isRevealed &&
            !hook.isResetting &&
            !hook.foldList.includes(player) &&
            (hook.dealtList.length > 0 || hook.needToCall) &&
            hook.needToCall &&
            !hook.allCardsDealt &&
            !hook.isDealing &&
            hook.currentlyActive == player && (
              <Button
                onClick={() => handleFold(player, myCards)}
                className="btns fold-btn"
              >
                Fold
              </Button>
            )}

          {!hook.isResetting &&
            !hook.allCardsDealt &&
            !hook.isDealing &&
            !hook.foldList.includes(player) &&
            hook.currentlyActive == player && (
              <Button onClick={handleCheck} className="btns deal-btn">
                {hook.needToCall
                  ? totalAmount - player.contributed > player.chips
                    ? "All in"
                    : "Call: " + (totalAmount - player.contributed)
                  : "Check"}
              </Button>
            )}
          {!hook.isResetting && hook.allCardsDealt && !hook.isRevealed && (
            <Button onClick={handleReveal} className="btns deal-btn">
              Reveal
            </Button>
          )}
          {hook.isRevealed && !hook.isDealing && (
            <Button onClick={handleFullReset} className="btns deal-btn">
              Reset
            </Button>
          )}
        </div>
      )}
      {!hook.started && (
        <>
          <TitleComponent />
          <OpponentSelector handleStart={handleStart} />
        </>
      )}
    </>
  );
}

export default App;
