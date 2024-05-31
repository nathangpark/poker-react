interface Props {
  name?: string;
}
function Grid({ name="Grid" }: Props){ 
  return (
    <div className = "grid">
      <h1 className="grid-header">{name}</h1>
      <div className="container">
        <div className="item item-1">1</div>
        <div className="item item-2">2</div>
        <div className="item item-3">3</div>
      </div>
    </div>
  )
}

export default Grid