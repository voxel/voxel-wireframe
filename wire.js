'use strict';

var createWireShader = require('./wireShader.js');
var ndarray = require('ndarray');
var ops = require('ndarray-ops');
var createBuffer = require('gl-buffer');
var createVAO = require('gl-vao');

module.exports = function(game, opts) {
  return new WireframePlugin(game, opts);
};
module.exports.pluginInfo = {
  clientOnly: true,
  loadAfter: ['voxel-shader', 'voxel-mesher'],
};

function WireframePlugin(game, opts) {
  this.game = game;
  this.shell = game.shell;
  if (!this.shell) throw new Error('voxel-wireframe requires game-shell-voxel');

  this.shaderPlugin = game.plugins.get('voxel-shader');
  if (!this.shaderPlugin) throw new Error('voxel-wireframe requires voxel-shader plugin');

  this.mesherPlugin = game.plugins.get('voxel-mesher');
  if (!this.mesherPlugin) throw new Error('voxel-wireframe requires voxel-mesher plugin');

  this.showWireframe = opts.showWireframe !== undefined ? opts.showWireframe : false;

  this.enable();
}

WireframePlugin.prototype.enable = function() {
  this.shell.bind('wireframe', 'F');
  this.shell.on('gl-init', this.onInit = this.shaderInit.bind(this));
  this.shell.on('gl-render', this.onRender = this.render.bind(this));
  this.mesherPlugin.on('meshed', this.onMeshed = this.createWireMesh.bind(this));
};

WireframePlugin.prototype.shaderInit = function() {
  this.wireShader = createWireShader(this.shell.gl);
};

WireframePlugin.prototype.disable = function() {
  this.mesherPlugin.removeListener('meshed', this.onMeshed);
  this.shell.removeListener('gl-render', this.onRender);
  this.shell.removeListener('gl-init', this.onInit);
  this.shell.unbind('wireframe');
};

WireframePlugin.prototype.createWireMesh = function(mesh, gl, vert_data) {
  //Create wire mesh
  var wireVertexCount = 2 * mesh.triangleVertexCount
  var wireVertexArray = ndarray(new Uint8Array(wireVertexCount * 3), [mesh.triangleVertexCount, 2, 3])
  var trianglePositions = ndarray(vert_data, [mesh.triangleVertexCount, 3], [8, 1], 0)
  ops.assign(wireVertexArray.pick(undefined, 0, undefined), trianglePositions)
  var wires = wireVertexArray.pick(undefined, 1, undefined)
  for(var i=0; i<3; ++i) {
    ops.assign(wires.lo(i).step(3), trianglePositions.lo((i+1)%3).step(3))
  }
  var wireBuf = createBuffer(gl, wireVertexArray.data)
  var wireVAO = createVAO(gl, [
    { "buffer": wireBuf,
      "type": gl.UNSIGNED_BYTE,
      "size": 3,
      "offset": 0,
      "stride": 3,
      "normalized": false
    }
  ])

  mesh.wireVertexCount = wireVertexCount
  mesh.wireVAO = wireVAO
};

WireframePlugin.prototype.render = function() {
  if(this.showWireframe || this.shell.wasDown('wireframe')) {
    var gl = this.shell.gl

    //Bind the wire shader
    this.wireShader.bind()
    this.wireShader.attributes.position.location = 0
    this.wireShader.uniforms.projection = this.shaderPlugin.projectionMatrix
    this.wireShader.uniforms.view = this.shaderPlugin.viewMatrix

    for (var chunkIndex in this.game.voxels.meshes) {
      var mesh = this.game.voxels.meshes[chunkIndex];
      this.wireShader.uniforms.model = mesh.modelMatrix
      mesh.wireVAO.bind() // set in createWireMesh() above
      gl.drawArrays(gl.LINES, 0, mesh.wireVertexCount)
      mesh.wireVAO.unbind()
    }
  }
};

