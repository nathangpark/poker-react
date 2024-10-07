import { Card, CardGroup } from "../Cards";
import { Player } from "../Player";
import { Hand } from "../Poker";
import CardGroupComponent from "./CardGroupComponent";
import HandComponent from "./HandComponent";

interface Props {
  player: Player
  dealtID: number[];
  hidden?: boolean;
  revealed: boolean;
  winner: boolean;
  folded?: boolean;
  active: boolean;
  out: boolean;
  action: string;
  actionShown: boolean;
}

const PlayerComponent = ({ player,dealtID, hidden=false, revealed, winner=false, folded, active, out, action="", actionShown}: Props) => {
  return (
    <div className={"player player-position-" + player.position}>
      <div className={"player-background" + (active ? " currently-active" : "")}/>
      <CardGroupComponent
        cardGroup={player.cardGroup as CardGroup}
        dealtID={dealtID}
        hidden={hidden}
      />
      {revealed && !folded && <HandComponent hand={player.hand as Hand}/>}
      <div className={"player-name" + (winner ? " player-winner" : out ? " player-out" : "") }>
        {player.name}: {player.chips}
      </div>
      <div className={"action" +  (actionShown ? " action-shown" : "")}>
        {action}
      </div>
    </div>
  );
};

export default PlayerComponent;
