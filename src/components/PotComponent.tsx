import { CardGroup } from "../Cards";
import { Player } from "../Player";
import CardGroupComponent from "./CardGroupComponent";

interface Props {
  chips : number;
  className?: string;
  cardGroup: CardGroup
  dealtID: number[];
}

const PotComponent = ({chips, cardGroup, dealtID } : Props) => {


  return (
    <div className="pot">
       <div className = "pot-background"/>
      <CardGroupComponent className="pot-cards" cardGroup={cardGroup} dealtID = {dealtID}/>
      <div className="pot-amount">
        Pot: {chips}
      </div>
     
    </div>
  )
}

export default PotComponent;