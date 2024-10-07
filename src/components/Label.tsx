import { Card, Suits } from "../Cards";
import SuitLogo from "./SuitLogo";

interface Props {
  card: Card;
  className?: string;
  textClassName?: string;
  logoClassName?: string;
}

const Label = ({ card, className, textClassName="",logoClassName=""}: Props) => {
  return (
    <div className={"label " + className}>
      <h1 className={"centered card-value " + textClassName}>{card.getFace()}</h1>
      <SuitLogo className={"centered label-suit " + logoClassName} card={card} />
    </div>
  );
};

export default Label;
