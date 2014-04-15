'use strict';

var createWireShader = require('./wireShader.js');

module.exports = function(game, opts) {
  return new WireframePlugin(game, opts);
};
module.exports.pluginInfo = {
  clientOnly: true
};

function WireframePlugin(game, opts) {
  this.shell = game.shell;
  if (!this.shell) throw new Error('voxel-wireframe requires game-shell-voxel');

  this.showWireframe = opts.showWireframe !== undefined ? opts.showWireframe : false

  this.enable();
}

WireframePlugin.prototype.enable = function() {
  this.shell.bind('wireframe', 'F');
  this.shell.on('gl-init', this.onInit = this.shaderInit.bind(this));
  this.shell.on('gl-render', this.onRender = this.render.bind(this));
};

WireframePlugin.prototype.shaderInit = function() {
  this.wireShader = createWireShader(this.shell.gl);
};

WireframePlugin.prototype.disable = function() {
  this.shell.removeListener('gl-render', this.onRender);
  this.shell.removeListener('gl-init', this.onInit);
  this.shell.unbind('wireframe');
};

WireframePlugin.prototype.render = function() {
  if(this.showWireframe || this.shell.wasDown('wireframe')) {
    var gl = this.shell.gl

    //Bind the wire shader
    this.wireShader.bind()
    this.wireShader.attributes.position.location = 0
    this.wireShader.uniforms.projection = this.shell.projection
    this.wireShader.uniforms.model = this.shell.model
    this.wireShader.uniforms.view = this.shell.view

    if(this.shell.mesh) {
      this.shell.mesh.wireVAO.bind() // TODO: refactor wireVAO, created in voxel-mesher. add an event there for voxel-wireframe?
      gl.drawArrays(gl.LINES, 0, this.shell.mesh.wireVertexCount)
      this.shell.mesh.wireVAO.unbind()
    }
  }
};

