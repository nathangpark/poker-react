import { Card, CardGroup } from "../Cards";
import CardComponent from "./CardComponent";

interface Props {
  className?: string;
  cardGroup: CardGroup;
  dealtID: number[];
  hidden?: boolean;
}

const CardGroupComponent = ({
  cardGroup,
  className = "",
  dealtID,
  hidden = false,
}: Props) => {
  className += cardGroup.cards.length == 2 ? " two-grid" : " five-grid";
  return (
    <div>
      <div className={"card-group " + className}>
        {cardGroup.cards.map((card: Card | undefined) => {
          if (card != undefined) {
            return (
              <CardComponent
                card={card}
                key={card.id}
                dealt={dealtID.includes(card.id)}
                hidden={hidden}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default CardGroupComponent;
