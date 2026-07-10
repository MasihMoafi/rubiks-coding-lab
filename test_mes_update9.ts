// Wait, for U face with (rotX=0, rotY=0):
// vy = (0, 0, 1). applyRyRx gives y=0, z=1. Wait.
// If rotX=0, rotY=0, U face is looking down from the top?
// U face is rotateX(90deg). It means it's flat on the top of the cube.
// If the cube is not rotated (rotX=0), the U face is perpendicular to the screen! So its Y axis (which goes along Z) is 0 on the screen Y. Yes, perfectly correct!

// Let's test U face with rotX=-22, rotY=38 (the default 3D angle):
