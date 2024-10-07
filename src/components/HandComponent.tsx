import { Hand } from "../Poker"
import HandGroup from "./HandGroup";

interface Props {
  hand : Hand;
  className ?: string;
}

const HandComponent = ({ hand,className = "" }:Props) => {  

  return (
    <div className={"hand-background " + className}>
      <h2 className="hand-title">
        {hand.toString()}
      </h2>
      <HandGroup hand={hand}/>
    </div>
  )
}

export default HandComponent