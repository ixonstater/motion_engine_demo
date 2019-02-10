import { EngineEntity, Engine, MotionBehaviorHandler, MotionBehavior, BoundingBox, EngineEvents, Collisions, EntityPositionCorrector, EntityPositionCorrectorHandler } from './engine_interfaces.js'
import { Render, RenderEntity } from './render_interface.js'
import consts from './consts.js'


class MyEngine extends Engine{
  constructor(collisions, events, positionCorrector){
    super(collisions, events, positionCorrector)
  }

  handleEvents(eventFlags){
    return eventFlags
  }

  checkCollisions(){
    return {ground: null, circle: null}
  }
}

class Ground extends EngineEntity {
  constructor(x, y, height, width){
    super(x, y, height, width)
  }
}

class Circle extends EngineEntity {
  constructor(x, y, height, width){
    super(x, y, height, width)
  }
}

class CircleMotionHandler extends MotionBehaviorHandler{
  constructor(){
    super()
    this.isJumping = false
    this.isFalling = true
  }

  startJump(){
    this.isJumping = true
    this.stopFall()
    this.motionBehaviors[2].apply = true
  }

  handleJump(){
    if(this.motionBehaviors[2].velocity >= 0){
      this.startFall()
      this.isJumping = false
      this.motionBehaviors[2].apply = false
    }
  }

  startFall(){
    this.motionBehaviors[3].apply = true
    this.isFalling = true
  }

  stopFall(){
    this.motionBehaviors[3].apply = false
    this.motionBehaviors[3].resetCount()
    this.isFalling = false
  }

  analyzeGroundCollision(processedCollisions){
    if(processedCollisions[0] == 'ground' && this.isFalling){
      this.stopFall()
    }
  }

  setMotionBehaviorApply(processedEvents, processedCollisions){
    this.motionBehaviors[0].apply = processedEvents.events.runLeft
    this.motionBehaviors[1].apply = processedEvents.events.runRight
    if(processedEvents.events.jump && !this.isJumping){
      this.startJump()
    } else if (this.isJumping){
      this.handleJump()
    } else if (!this.isFalling){
      this.startFall()
    }
    this.analyzeGroundCollision(processedCollisions)
  }
}

class MoveRight extends MotionBehavior {
  constructor(){
    super()
    this.velocity = consts.RUN_VELOCITY
  }

  update(){
    return [this.velocity, 0]
  }
}

class MoveLeft extends MotionBehavior {
  constructor(){
    super()
    this.velocity = consts.RUN_VELOCITY
  }

  update(){
    return [-this.velocity, 0]
  }
}

class Jump extends MotionBehavior {
  constructor(){
    super()
    this.acceleration = consts.GRAVITY
    this.velocity = consts.INITIAL_JUMP_VELOCITY
  }

  update(){
    this.velocity = consts.INITIAL_JUMP_VELOCITY + consts.GRAVITY * this.itersApplied
    return[0, this.velocity]
  }
}

class Fall extends MotionBehavior {
  constructor(){
    super()
    this.gravity = consts.GRAVITY
    this.apply = true
  }

  update(){
    let velocity = this.itersApplied * this.gravity
    let deltaY = velocity
    let deltaX = 0
    return [deltaX, deltaY]
  }
}

class EntityCorrectionHandler extends EntityPositionCorrectorHandler{
  constructor(){
    super()
  }

  circleHasCollidedWithGround(processedCollisions){
    if(processedCollisions.circle.includes('ground')){
      return true
    }else {
      return false
    }
  }

  createEntityPositionCorrectorsToCall(processedEvents, processedCollisions){
    if(this.circleHasCollidedWithGround(processedCollisions)){
      this.entityPositionCorrectorsToCall.CircleCorrector = ['ground', 'circle']
    }
  }
}

class CorrectCircleOnPlatformHeight extends EntityPositionCorrector{
  constructor(){
    super()
  }

  correctPosition(entities){
    let groundHeight = entities.ground.y - entities.ground.height / 2
    entities.circle.y = groundHeight - entities.circle.height / 2
  }
}

class RenderEntityGround extends RenderEntity{
  constructor(context){
    super(context)
  }

  draw(coords, scaleFactor, width, height){
    let cornerCoords = super.centerToCorner(coords, scaleFactor, width, height)
    let x = cornerCoords[0]
    let y = cornerCoords[1]
    this.context.fillRect(x, y, width * scaleFactor, height * scaleFactor)
  }
}

class RenderEntityCircle extends RenderEntity{
  constructor(context){
    super(context)
  }

  draw(coords, scaleFactor, width, height){
    this.context.beginPath()
    this.context.arc(coords[0] * scaleFactor, coords[1] * scaleFactor, height / 2 * scaleFactor, 2 * Math.PI, false)
    this.context.stroke()
  }
}

class GameEvents extends EngineEvents{
  constructor(names){
    super(names)
  }
}

function mainloop(engine, render, events){
  var state = engine.update(events)
  render.drawEntities(state)
}

function handleKeydownEvents(e, gameEvents){
  switch (e.key){
    case 'ArrowUp':
      gameEvents.jump = true
      break;
    case 'ArrowLeft':
      gameEvents.runLeft = true
      break;
    case 'ArrowRight':
      gameEvents.runRight = true
      break;
  }
}

function handleKeyupEvents(e, gameEvents){
  switch (e.key){
    case 'ArrowUp':
      gameEvents.jump = false
      break;
    case 'ArrowLeft':
      gameEvents.runLeft = false
      break;
    case 'ArrowRight':
      gameEvents.runRight = false
      break;
  }
}

function init(){
  var gameEvents = new GameEvents(['runLeft', 'runRight', 'jump'])
  var gameCollisions = new Collisions({
                                        circle: ['ground']
                                      })
  var positionCorrector = new EntityCorrectionHandler()
  var circleCorrector = new CorrectCircleOnPlatformHeight()

  var myEngine = new MyEngine(gameCollisions, gameEvents, positionCorrector)

  var ground = new Ground(50, 50, 50, 5)
  var circle = new Circle(50, 10, 5, 5)
  var circleMotionHandler = new CircleMotionHandler()
  var circleLeft = new MoveLeft()
  var circleRight = new MoveRight()
  var circleJump = new Jump()
  var circleFall = new Fall()

  var myRender = new Render(document.getElementById('world'), 5)
  var renderGround = new RenderEntityGround(myRender.world.getContext('2d'), 90, 5)
  var renderCircle = new RenderEntityCircle(myRender.world.getContext('2d'), 20, 20)

  renderCircle.context.fillRect(circle.boundingBox.topLeft[0], circle.boundingBox.topLeft[1], circle.width, circle.height)

  circleMotionHandler.addMotionBehavior(circleLeft)
  circleMotionHandler.addMotionBehavior(circleRight)
  circleMotionHandler.addMotionBehavior(circleJump)
  circleMotionHandler.addMotionBehavior(circleFall)
  circle.addMotionBehaviorHandler(circleMotionHandler)

  positionCorrector.setEntities(myEngine.entities)
  positionCorrector.addEntityPositionCorrector('CircleCorrector', circleCorrector)

  myEngine.addEntity(ground, 'ground')
  myEngine.addEntity(circle, 'circle')

  myRender.addEntity('ground', renderGround)
  myRender.addEntity('circle', renderCircle)
  myRender.drawEntities(myEngine.entities)

  document.addEventListener('keydown', (e) => {handleKeydownEvents(e, gameEvents.events)})
  document.addEventListener('keyup', (e) => {handleKeyupEvents(e, gameEvents.events)})

  setInterval( () => { mainloop(myEngine, myRender, gameEvents) }, 17)
}

document.addEventListener('DOMContentLoaded', init)
