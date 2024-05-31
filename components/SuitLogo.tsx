import { Card, Suits } from "../Cards";

interface Props {
  card: Card;
  className?: string;
}

const SPADES_LOGO = "Spades.svg";
const CLUBS_LOGO = "Clubs.svg";
const DIAMONDS_LOGO = "Diamonds.svg";
const HEARTS_LOGO = "Hearts.svg";

const SuitLogo = ({ card, className = "" }: Props) => {
  let logo: string;
  switch (card.suit) {
    case Suits.Spades:
      logo = SPADES_LOGO;
      break;
    case Suits.Clubs:
      logo = CLUBS_LOGO;
      break;
    case Suits.Diamonds:
      logo = DIAMONDS_LOGO;
      break;
    case Suits.Hearts:
      logo = HEARTS_LOGO;
      break;
  }

  return <img src={logo} className={className} />;
};

export default SuitLogo;
