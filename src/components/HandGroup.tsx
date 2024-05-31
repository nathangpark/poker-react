import { Card, CardGroup } from "../Cards";
import { Hand } from "../Poker";
import SmallCardComponent from "./SmallCardComponent";

interface Props {
  hand: Hand;
}

const HandGroup = ({ hand }: Props) => {
  return (
    <div>
      <div className={"hand-group five-grid-small"}>
        {hand.cards.map((card: Card) => (
          <SmallCardComponent
            card={card}
            key={card.id}
          />
        ))}
      </div>
    </div>
  );
};

export default HandGroup;
