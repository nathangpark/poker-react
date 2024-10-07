import { useState } from "react";
import { Player } from "../Player";
import Button from "./Button";

interface Props {
  handleStart: (num : 1|2|3|4|5|6|7) => void;
}


const OpponentSelector = ({ handleStart }: Props) => {
  const [amount, setAmount] = useState("3");

  return (
    <div>
      <input
        placeholder="amount"
        type="range"
        className="opp-input"
        min={1}
        max={7}
        step="0.05"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button onClick={() => {handleStart(+amount - (+amount % 1) as 1|2|3|4|5|6|7)}} className="btns start-btn">
        {"Start: " + (+amount - (+amount % 1))}
      </Button>
    </div>
  );
};

export default OpponentSelector;
