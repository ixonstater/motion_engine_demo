import appConsts from './consts.js'

class Render {
  constructor(world, scaleFactor) {
    this.world = world
    this.worldContext = world.getContext('2d')
    this.world.width = appConsts.WORLD_WIDTH_PX
    this.world.height = appConsts.WORLD_HEIGHT_PX
    this.entities = {}
    this.scaleFactor = scaleFactor
  }

  addEntity(name, entity){
    this.entities[name] = entity
  }

  removeEntity(name){
    delete this.entities[name]
  }

  clearCanvas(){
    this.worldContext.clearRect(0, 0, this.world.width, this.world.height)
  }

  drawEntities(state){
    this.clearCanvas()
    for (let name in state){
      var stateEntity = state[name]
      var coords = [stateEntity.x, stateEntity.y]
      this.entities[name].draw(coords, this.scaleFactor, stateEntity.width, stateEntity.height)
    }
  }
}

class RenderEntity{
  constructor(context){
    this.context = context
  }

  draw(){

  }

  centerToCorner(coords, scaleFactor, width, height){
    return [(coords[0] - width / 2) * scaleFactor, (coords[1] - height / 2) * scaleFactor]
  }
}

export {
  Render,
  RenderEntity,
}
