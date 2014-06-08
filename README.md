# voxel-wireframe

Shows a wireframe around the voxels in [game-shell-voxel](https://github.com/deathcap/game-shell-voxel)

![screenshot](http://i.imgur.com/gbooPeT.png "Screenshot")

## Usage

Load with [voxel-plugins](https://github.com/deathcap/voxel-plugins), options:

* `showWireframe`: if true, wireframe will be shown initially (default false)

Press and the 'wireframe' keybinding (default 'F9') with the Shift key to toggle the wireframe interactively
(without shift, F9 by default toggles [voxel-chunkborder](https://github.com/deathcap/voxel-chunkborder)).

`.showWireframe` property can be set to manually show the wireframe, example:

    var wirePlugin = game.plugins.get('voxel-wireframe');

    wirePlugin.showWireframe = true;


## License
Based on [mikolalysenko/voxel-mipmap-demo](https://github.com/mikolalysenko/voxel-mipmap-demo/blob/master/lib/wireShader.js) (c) 2013 Mikola Lysenko. MIT License

MIT

