import { Card, Suits } from "../Cards";
import Label from "./Label";
import SuitLogo from "./SuitLogo";

interface Props {
  card: Card;
  dealt: boolean;
  hidden: boolean;
}

let smooth = false;

const CardComponent = ({ card, dealt = true, hidden = false }: Props) => {
  return (
    <div className={"card-component" + (dealt ? "" : " undealt") + (smooth ? " card-smooth" : "") }>
      <div className={"card-inner" + (hidden ? " hidden" : " ")}>
        <div className="card-front">
          <Label card={card} />
          <SuitLogo className="big-suit" card={card} />
          <Label className="upside-down" card={card} />
        </div>
        <div className="card-back"></div>
      </div>
    </div>
  );
};

export default CardComponent;
