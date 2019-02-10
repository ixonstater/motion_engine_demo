import { BoundingBox } from "./engine_interfaces.js"
import appConsts from './consts.js'

function checkCollision(box1, box2){
  let box1Lines = makeLines(box1)
  let box2Lines = makeLines(box2)
  let intersections = {0: [], 1: [], 2: [], 3: []}
  for (let side1 = 0; side1 < 4; side1++){
    for (let side2 = 0; side2 < 4; side2++){
      if(checkLineIntersection(box1Lines[side1], box2Lines[side2])){ intersections[side1].push(side2) }
    }
  }
  console.log(intersections)
  return(intersections)
}

function makeLines(box){
  let boxLines = []
  boxLines.push([box.topLeft, box.topRight])
  boxLines.push([box.topRight, box.bottomRight])
  boxLines.push([box.bottomRight, box.bottomLeft])
  boxLines.push([box.bottomLeft, box.topLeft])
  return boxLines
}

function checkLineIntersection(line1, line2){
  let case1 = getOrientation(line1[0], line1[1], line2[0])
  let case2 = getOrientation(line1[0], line1[1], line2[1])

  let case3 = getOrientation(line2[0], line2[1], line1[0])
  let case4 = getOrientation(line2[0], line2[1], line1[1])

  if(case1 == appConsts.BAD_INTERSECTION || case2 == appConsts.BAD_INTERSECTION || case3 == appConsts.BAD_INTERSECTION || case4 == appConsts.BAD_INTERSECTION) {return false}

  if(case1 == case2 || case3 == case4) {
    return false
  }
  else {
    return true
  }
}

function getOrientation(p1, p2, p3){
  let segSlope = (p2[1] - p1[1]) / (p2[0] - p1[0])
  let endSlope = (p3[1] - p2[1]) / (p3[0] - p2[0])
  if(segSlope == Infinity || segSlope == -Infinity || endSlope == Infinity || endSlope == -Infinity) { return appConsts.BAD_INTERSECTION}
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

function fillBoundingBox(ctx, box, color){
  ctx.fillStyle = color
  ctx.fillRect(box.topLeft[0], box.topLeft[1], box.width, box.height)

}

function test(){
  var world = document.getElementById('world')
  world.width = 500
  world.height = 500

  let b1center = [70, 70]
  let b1width = 20
  let b1height = 20

  let b1TopLeft = [b1center[0] - b1width / 2, b1center[1] - b1height / 2]
  var ctx1 = world.getContext('2d')
  var bb1 = new BoundingBox(b1center[0], b1center[1], b1width, b1height)

  let b2center = [70, 60]
  let b2width = 20
  let b2height = 20

  let b2TopLeft = [b2center[0] - b2width / 2, b2center[1] - b2height / 2]
  var ctx2 = world.getContext('2d')
  var bb2 = new BoundingBox(b2center[0], b2center[1], b2height, b2width)

  fillBoundingBox(ctx1, bb1, '#00ff00')
  fillBoundingBox(ctx2, bb2, '#0000ff')
  ctx1.strokeRect(b1TopLeft[0], b1TopLeft[1], b1width, b1height)
  ctx2.strokeRect(b2TopLeft[0], b2TopLeft[1], b2height, b2width)
  let collisions = checkCollision(bb1, bb2)
}

function testGetOrientation(){
  let p1 = [1, 1]
  let p2 = [3, 1]
  let p3 = [2, -2]
  getOrientation(p1, p2, p3)
}

document.addEventListener("DOMContentLoaded", test)
