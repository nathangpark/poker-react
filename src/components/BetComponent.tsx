import { useState } from "react";
import { Player } from "../Player";
import Button from "./Button";

interface Props {
  handleBet: (amount : number) => void;
  player: Player;
  minimum: number;
}


const BetComponent = ({ handleBet, player, minimum }: Props) => {
  const [amount, setAmount] = useState(minimum + "");
  if (+amount < minimum) {
    setAmount(minimum + "");
  }
  return (
    <div className="bet-component">
      <input
        placeholder="amount"
        type="range"
        className="input-btn"
        min={minimum}
        max={player.chips}
        step="0.2"
        value={+amount > minimum ? +amount : minimum}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button onClick={() => {handleBet(+amount - (+amount % 5));}} className="btns bet-btn">
        {"Bet:" + (+amount - (+amount % 5))}
      </Button>
    </div>
  );
};

export default BetComponent;
