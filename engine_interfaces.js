import appConsts from './consts.js'

class EngineEntity{
  constructor(x, y, width, height){
    this.motionBehaviorHandlers = []
    this.x = x
    this.y = y
    this.height = height
    this.width = width
    this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height)
    this.rerender = true
  }

  update(processedEvents, processedCollisions){
    var oldX = this.x
    var oldY = this.y
    for (let motionBehaviorHandler of this.motionBehaviorHandlers){
      var deltas = motionBehaviorHandler.calculatePositionDeltas(processedEvents, processedCollisions)
      this.x += deltas[0]
      this.y += deltas[1]
    }
    this.boundingBox.update(this.x, this.y)
    if(oldX == this.x && oldY == this.y){
      this.rerender = false
    } else {
      this.rerender = true
    }
  }

  addMotionBehaviorHandler(motionBehaviorHandler){
    this.motionBehaviorHandlers.push(motionBehaviorHandler)
  }
}

class MotionBehaviorHandler{
  constructor(){
    this.motionBehaviors = []
  }

  calculatePositionDeltas(processedEvents, processedCollisions){
    this.setMotionBehaviorApply(processedEvents, processedCollisions)
    var deltaX = 0
    var deltaY = 0
    for (let motionBehavior of this.motionBehaviors){
      if(motionBehavior.apply){
        var deltas = motionBehavior.update()
        motionBehavior.incrementItersApplied()
        deltaX += deltas[0]
        deltaY += deltas[1]
      } else {
        motionBehavior.itersApplied = 0
      }
    }
    return [deltaX, deltaY]
  }

  setMotionBehaviorApply(processedEvents, processedCollisions){

  }

  addMotionBehavior(motionBehavior){
    this.motionBehaviors.push(motionBehavior)
  }
}

class MotionBehavior{
  constructor(){
    this.apply = false
    this.itersApplied = 0
  }

  incrementItersApplied(){
    this.itersApplied++
  }

  resetCount(){
    this.itersApplied = 0
  }

  update(){
    var deltaX = 0
    var deltaY = 0
    return [deltaX, deltaY]
  }
}

class BoundingBox{
  constructor(x, y, width, height){
    this.topRight = [x + width / 2, y - height / 2]
    this.bottomRight = [x + width / 2, y + height / 2]
    this.bottomLeft = [x - width / 2, y + height / 2]
    this.topLeft = [x - width / 2, y - height / 2]
    this.height = height
    this.width = width
  }

  update(x, y){
    this.topRight = [x + this.width / 2, y + this.height / 2]
    this.bottomRight = [x + this.width / 2, y - this.height / 2]
    this.bottomLeft = [x - this.width / 2, y - this.height / 2]
    this.topLeft = [x - this.width / 2, y + this.height / 2]
  }
}

class EngineEvents{
  constructor(names){
    this.events = {}
    for(let name of names){
      this.events[name] = false
    }
  }

  addEvent(name){
    this.events[name] = false
  }

  removeEvent(name){
    delete this.events[name]
  }

  setEvent(name, bool){
    this.events[name] = bool
  }
}

class Collisions{
  constructor(collisionsToCheck){
    this.collisionsToCheck = collisionsToCheck
    this.collisionsOccured = {}
  }

  assembleCurrentCollisions(entities){
    for (let collider in this.collisionsToCheck){
      this.collisionsOccured[collider] = []
      for (let collidee of this.collisionsToCheck[collider]){
        let box1 = entities[collider].boundingBox
        let box2 = entities[collidee].boundingBox
        var collisionInfo = this.checkCollision(box1, box2)
        if(collisionInfo.collisionDetected){
          this.collisionsOccured[collider].push(collidee)
        }
      }
    }
  }

  checkCollision(box1, box2){
    let box1Lines = this.makeLines(box1)
    let box2Lines = this.makeLines(box2)
    let intersections = {0: [], 1: [], 2: [], 3: []}
    let collisionDetected = false
    for (let side1 = 0; side1 < 4; side1++){
      for (let side2 = 0; side2 < 4; side2++){
        if(this.checkLineIntersection(box1Lines[side1], box2Lines[side2])){
          intersections[side1].push(side2)
          collisionDetected = true
        }
      }
    }
    return {'collisionDetected': collisionDetected, 'intersections': intersections}
  }

  makeLines(box){
    let boxLines = []
    boxLines.push([box.topLeft, box.topRight])
    boxLines.push([box.topRight, box.bottomRight])
    boxLines.push([box.bottomRight, box.bottomLeft])
    boxLines.push([box.bottomLeft, box.topLeft])
    return boxLines
  }

  checkLineIntersection(line1, line2){
    let case1 = this.getOrientation(line1[0], line1[1], line2[0])
    let case2 = this.getOrientation(line1[0], line1[1], line2[1])

    let case3 = this.getOrientation(line2[0], line2[1], line1[0])
    let case4 = this.getOrientation(line2[0], line2[1], line1[1])

    if(case1 == appConsts.BAD_INTERSECTION || case2 == appConsts.BAD_INTERSECTION || case3 == appConsts.BAD_INTERSECTION || case4 == appConsts.BAD_INTERSECTION) {return false}

    if(case1 == case2 || case3 == case4) {
      return false
    }
    else {
      return true
    }
  }

  getOrientation(p1, p2, p3){
    let segSlope = (p2[1] - p1[1]) / (p2[0] - p1[0])
    let endSlope = (p3[1] - p2[1]) / (p3[0] - p2[0])
    if(endSlope == Infinity || endSlope == -Infinity) { return appConsts.BAD_INTERSECTION}
    if(segSlope < endSlope){
      if(p2[0] < p3[0]){
        return appConsts.CLOCKWISE
      } else {
        return appConsts.COUNTERCLOCKWISE
      }
    }
    else {
      if(p2[0] < p3[0]){
        return appConsts.COUNTERCLOCKWISE
      } else {
        return appConsts.CLOCKWISE
      }
    }
  }

  resetCollisionsOccured(){
    this.collisionsOccured = {}
  }
}

class EntityPositionCorrectorHandler{
  constructor(){
    this.entities = null
    this.entityPositionCorrectors = {}
    this.entityPositionCorrectorsToCall = {}
  }

  setEntities(entities){
    this.entities = entities
  }

  addEntityPositionCorrector(name, eps){
    this.entityPositionCorrectors[name] = eps
  }

  removeEntityPositionCorrector(name){
    delete this.entityPositionCorrectors[name]
  }

  initiateCorrections(processedEvents, processedCollisions){
    this.resetEntityPositionCorrectorsToCall()
    this.createEntityPositionCorrectorsToCall(processedEvents, processedCollisions)
    this.callCorrectPosition()
  }

  createEntityPositionCorrectorsToCall(processedEvents, processedCollisions){

  }

  resetEntityPositionCorrectorsToCall(){
    this.entityPositionCorrectorsToCall = {}
  }

  callCorrectPosition(){
    for (let correctorName in this.entityPositionCorrectorsToCall){
      let entitiesNeeded = {}
      for (let entityName of this.entityPositionCorrectorsToCall[correctorName]){
        entitiesNeeded[entityName] = this.entities[entityName]
      }
      this.entityPositionCorrectors[correctorName].correctPosition(entitiesNeeded)
    }
  }

}

class EntityPositionCorrector{
  constructor(){

  }

  correctPosition(entities){

  }
}

class Engine{
  constructor(collisions, events, positionCorrector){
    this.entities = {}
    this.collisions = collisions
    this.events = events
    this.positionCorrector = positionCorrector
  }

  addEntity(entity, name){
    this.entities[name] = entity
  }

  removeEntity(name){
    delete this.entities[name]
  }

  update(){
    this.collisions.resetCollisionsOccured()
    this.collisions.assembleCurrentCollisions(this.entities)
    this.updateEngineEntities()
    this.positionCorrector.initiateCorrections(this.events, this.collisions.collisionsOccured)
    return this.entities
  }

  handleEvents(){

  }

  updateEngineEntities(){
    for (let name in this.entities){
      this.entities[name].update(this.events, this.collisions.collisionsOccured[name])
    }
  }
}

export {
  EngineEntity,
  Engine,
  MotionBehaviorHandler,
  MotionBehavior,
  BoundingBox,
  EngineEvents,
  Collisions,
  EntityPositionCorrector,
  EntityPositionCorrectorHandler
}
