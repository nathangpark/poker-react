import { Card } from "../Cards";
import Label from "./Label"

interface Props {
  card : Card,
}

const SmallCardComponent = ({card} : Props) => {
  return (
    <>
      <div className={"small-card-background"}>
        <Label card={card} className = "small-label" textClassName=" small-label-text" logoClassName="small-logo"/>
      </div>
    </>
  )
  
}

export default SmallCardComponent;