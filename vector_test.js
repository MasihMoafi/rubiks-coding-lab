function getFaceAxesProjection(face, rotX, rotY) {
  // To avoid complex math, we can just use the DOM!
  // In `Cube3D`, the stickers are rendered. We can just check the bounding box or use `getBoundingClientRect` on sticker 0,0 and sticker 0,1.
  // The vector from (0,0) to (0,1) is the local X axis.
  // The vector from (0,0) to (1,0) is the local Y axis.
}
