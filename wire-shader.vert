attribute vec3 position;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

// matrix translation TODO: refactor into glslify library? see also avatar module
mat4 translate(float x, float y, float z) {
    return mat4(1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                  x,   y,   z, 1.0);
}

mat4 scale(float x, float y, float z) {
    return mat4(  x, 0.0, 0.0, 0.0,
                0.0,   y, 0.0, 0.0,
                0.0, 0.0,   z, 0.0,
                0.0, 0.0, 0.0, 1.0);
}

mat4 translate(float d) {
    return translate(d, d, d);
}

mat4 scale(float d) {
    return scale(d, d, d);
}


// compensate for voxel padding in voxel-mesher
float pad = -1.0;

// avoid z-fighting with voxels and voxel-outline (0.001)
float epsilon = 0.00001;

mat4 offset = translate(pad) * scale(1.0 + epsilon);


void main() {
  gl_Position = projection * view * model * offset * vec4(position, 1.0);
}
