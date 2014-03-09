(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Block, Graph;

Graph = require('../graph');

Block = (function() {
  function Block() {
    this.node = new Graph.Node(this, this.makeOutlets());
  }

  Block.prototype.link = function(program, name, external) {};

  Block.prototype.call = function(program, depth) {
    if (depth == null) {
      depth = 0;
    }
  };

  Block.prototype.externals = function() {
    return {};
  };

  Block.prototype._link = function(module, program, phase, name, external) {
    return program.link(this.node, module, name, external);
  };

  Block.prototype._include = function(module, program) {
    return program.include(this.node, module);
  };

  Block.prototype._call = function(module, program, phase, depth) {
    var ext, external, key, name, outlet, previous, _i, _len, _ref, _ref1, _ref2;
    program.call(this.node, module, depth);
    _ref = this.node.inputs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      outlet = _ref[_i];
      previous = (_ref1 = outlet.input) != null ? _ref1.node.owner : void 0;
      if (outlet.type[0] === '(') {
        _ref2 = this.externals();
        for (key in _ref2) {
          ext = _ref2[key];
          if (!(ext.name === outlet.name)) {
            continue;
          }
          name = key;
          external = ext;
        }
        if (previous != null) {
          previous.link(program, phase, name, external);
        }
      } else {
        if (previous != null) {
          previous.call(program, phase, depth + 1);
        }
      }
    }
    return program;
  };

  return Block;

})();

module.exports = Block;


},{"../graph":8}],2:[function(require,module,exports){
var Block, Callback, Graph, Program,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Graph = require('../graph');

Block = require('./block');

Program = require('../linker');

Callback = (function(_super) {
  __extends(Callback, _super);

  function Callback(graph) {
    this.graph = graph;
    Callback.__super__.constructor.apply(this, arguments);
    this.namespace = Program.entry();
  }

  Callback.prototype.makeOutlets = function() {
    var ins, outlet, outlets, outs, type, _i, _j, _len, _len1, _ref, _ref1;
    outlets = [];
    ins = [];
    outs = [];
    _ref = this.graph.inputs();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      outlet = _ref[_i];
      ins.push(outlet.type);
    }
    _ref1 = this.graph.outputs();
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      outs.push(outlet.type);
    }
    ins = ins.join(',');
    outs = outs.join(',');
    type = "(" + ins + ")(" + outs + ")";
    outlets.push({
      name: 'callback',
      type: type,
      inout: Graph.OUT
    });
    return outlets;
  };

  Callback.prototype.externals = function() {
    var _ref, _ref1;
    return (_ref = (_ref1 = this.subroutine) != null ? _ref1.externals : void 0) != null ? _ref : {};
  };

  Callback.prototype.solo = function(phase) {
    return this.subroutine = Program.compile(this.graph.tail().owner, phase, this.namespace);
  };

  Callback.prototype.link = function(program, phase, name, external) {
    this.solo(phase);
    this._include(this.subroutine, program);
    return this._link(this.subroutine, program, phase, name, external);
  };

  return Callback;

})(Block);

module.exports = Callback;


},{"../graph":8,"../linker":13,"./block":1}],3:[function(require,module,exports){
exports.Block = require('./block');

exports.Shader = require('./shader');

exports.Isolate = require('./isolate');

exports.Callback = require('./callback');

exports.Material = require('./material');


},{"./block":1,"./callback":2,"./isolate":4,"./material":5,"./shader":6}],4:[function(require,module,exports){
var Block, Graph, Isolate, Program,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Graph = require('../graph');

Block = require('./block');

Program = require('../linker');

Isolate = (function(_super) {
  __extends(Isolate, _super);

  function Isolate(graph) {
    this.graph = graph;
    Isolate.__super__.constructor.apply(this, arguments);
    this.namespace = Program.entry();
  }

  Isolate.prototype.makeOutlets = function() {
    var outlet, outlets, _i, _j, _len, _len1, _ref, _ref1;
    outlets = [];
    _ref = this.graph.inputs();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      outlet = _ref[_i];
      outlets.push(outlet);
    }
    _ref1 = this.graph.outputs();
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      outlets.push(outlet);
    }
    return outlets;
  };

  Isolate.prototype.externals = function() {
    var _ref, _ref1;
    return (_ref = (_ref1 = this.subroutine) != null ? _ref1.externals : void 0) != null ? _ref : {};
  };

  Isolate.prototype.solo = function(phase) {
    return this.subroutine = Program.compile(this.graph.tail().owner, phase, this.namespace);
  };

  Isolate.prototype.call = function(program, phase, depth) {
    if (depth == null) {
      depth = 0;
    }
    this.solo(phase);
    return this._call(this.subroutine, program, phase, depth);
  };

  return Isolate;

})(Block);

module.exports = Isolate;


},{"../graph":8,"../linker":13,"./block":1}],5:[function(require,module,exports){
var Block, Material, Shader,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Block = require('./block');

Shader = require('./block');

Material = (function(_super) {
  __extends(Material, _super);

  function Material(vertex, fragment) {
    this.vertex = vertex;
    this.fragment = fragment;
    this.snippets = [this.vertex, this.fragment];
    this.namespace = this.vertex.namespace;
    Material.__super__.constructor.apply(this, arguments);
  }

  Material.prototype.externals = function() {
    var def, ext, key, snippet, _i, _len, _ref, _ref1;
    ext = {};
    _ref = this.snippets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      snippet = _ref[_i];
      _ref1 = snippet.externals;
      for (key in _ref1) {
        def = _ref1[key];
        ext[key] = def;
      }
    }
    return ext;
  };

  Material.prototype.makeOutlets = function() {
    var external, key, outlets, snippet, _i, _len, _ref, _ref1;
    outlets = [];
    _ref = this.snippets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      snippet = _ref[_i];
      outlets = outlets.concat(snippet.main.signature);
      _ref1 = snippet.externals;
      for (key in _ref1) {
        external = _ref1[key];
        outlets.push(external);
      }
    }
    return outlets;
  };

  Material.prototype.solo = function(phase) {
    return this.snippets[{
      vertex: 0,
      fragment: 1
    }[phase]];
  };

  Material.prototype.call = function(program, phase, depth) {
    if (depth == null) {
      depth = 0;
    }
    return this._call(program, solo(phase), phase, depth);
  };

  return Material;

})(Block);

module.exports = Shader;


},{"./block":1}],6:[function(require,module,exports){
var Block, Shader,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Block = require('./block');

Shader = (function(_super) {
  __extends(Shader, _super);

  function Shader(snippet) {
    this.snippet = snippet;
    this.namespace = this.snippet.namespace;
    Shader.__super__.constructor.apply(this, arguments);
  }

  Shader.prototype.externals = function() {
    return this.snippet.externals;
  };

  Shader.prototype.makeOutlets = function() {
    var external, key, outlets, _ref;
    outlets = [];
    outlets = outlets.concat(this.snippet.main.signature);
    _ref = this.snippet.externals;
    for (key in _ref) {
      external = _ref[key];
      outlets.push(external);
    }
    return outlets;
  };

  Shader.prototype.solo = function(phase) {
    return this.snippet;
  };

  Shader.prototype.call = function(program, phase, depth) {
    if (depth == null) {
      depth = 0;
    }
    return this._call(this.snippet, program, phase, depth);
  };

  return Shader;

})(Block);

module.exports = Shader;


},{"./block":1}],7:[function(require,module,exports){

/*
  Graph of nodes with outlets
 */
var Graph;

Graph = (function() {
  Graph.IN = 0;

  Graph.OUT = 1;

  function Graph(nodes, parent) {
    this.parent = parent != null ? parent : null;
    this.nodes = [];
    nodes && this.add(nodes);
  }

  Graph.prototype.inputs = function() {
    var inputs, node, outlet, _i, _j, _len, _len1, _ref, _ref1;
    inputs = [];
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      _ref1 = node.inputs;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        outlet = _ref1[_j];
        if (outlet.input === null) {
          inputs.push(outlet);
        }
      }
    }
    return inputs;
  };

  Graph.prototype.outputs = function() {
    var node, outlet, outputs, _i, _j, _len, _len1, _ref, _ref1;
    outputs = [];
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      _ref1 = node.outputs;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        outlet = _ref1[_j];
        if (outlet.output.length === 0) {
          outputs.push(outlet);
        }
      }
    }
    return outputs;
  };

  Graph.prototype.tail = function() {
    return this.nodes[this.nodes.length - 1];
  };

  Graph.prototype.add = function(node, ignore) {
    var _i, _len, _node;
    if (node.length) {
      for (_i = 0, _len = node.length; _i < _len; _i++) {
        _node = node[_i];
        this.add(_node);
      }
      return;
    }
    if (node.graph && !ignore) {
      throw "Adding node to two graphs at once";
    }
    node.graph = this;
    return this.nodes.push(node);
  };

  Graph.prototype.remove = function(node, ignore) {
    var _i, _len, _node;
    if (node.length) {
      for (_i = 0, _len = node.length; _i < _len; _i++) {
        _node = node[_i];
        this.remove(_node);
      }
      return;
    }
    if (node.graph !== this) {
      throw "Removing node from wrong graph.";
    }
    ignore || node.disconnect();
    this.nodes.splice(this.nodes.indexOf(node), 1);
    return node.graph = null;
  };

  return Graph;

})();

module.exports = Graph;


},{}],8:[function(require,module,exports){
exports.Graph = require('./graph');

exports.Node = require('./node');

exports.Outlet = require('./outlet');

exports.IN = exports.Graph.IN;

exports.OUT = exports.Graph.OUT;


},{"./graph":7,"./node":9,"./outlet":10}],9:[function(require,module,exports){
var Graph, Node, Outlet;

Graph = require('./graph');

Outlet = require('./outlet');


/*
 Node in graph.
 */

Node = (function() {
  function Node(owner, outlets) {
    this.owner = owner;
    this.graph = null;
    this.inputs = [];
    this.outputs = [];
    this.outlets = null;
    this.setOutlets(outlets);
  }

  Node.prototype.getIn = function(name) {
    var outlet;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.inputs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        outlet = _ref[_i];
        if (outlet.name === name) {
          _results.push(outlet);
        }
      }
      return _results;
    }).call(this))[0];
  };

  Node.prototype.getOut = function(name) {
    var outlet;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.outputs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        outlet = _ref[_i];
        if (outlet.name === name) {
          _results.push(outlet);
        }
      }
      return _results;
    }).call(this))[0];
  };

  Node.prototype.get = function(name) {
    return this.getIn(name) || this.getOut(name);
  };

  Node.prototype.setOutlets = function(outlets) {
    var existing, hash, key, make, match, outlet, _i, _j, _k, _len, _len1, _len2, _ref;
    make = function(outlet) {
      return new Outlet(outlet.inout, outlet.name, outlet.hint, outlet.type, outlet.meta);
    };
    if (outlets != null) {
      if (this.outlets == null) {
        this.outlets = {};
        for (_i = 0, _len = outlets.length; _i < _len; _i++) {
          outlet = outlets[_i];
          this._add(make(outlet));
        }
        return;
      }
      hash = function(outlet) {
        return [outlet.name, outlet.inout, outlet.type].join('-');
      };
      match = {};
      for (_j = 0, _len1 = outlets.length; _j < _len1; _j++) {
        outlet = outlets[_j];
        match[hash(outlet)] = true;
      }
      _ref = this.outlets;
      for (key in _ref) {
        outlet = _ref[key];
        key = hash(outlet);
        if (match[key]) {
          match[key] = outlet;
        } else {
          this._remove(outlet);
        }
      }
      for (_k = 0, _len2 = outlets.length; _k < _len2; _k++) {
        outlet = outlets[_k];
        existing = match[hash(outlet)];
        if (existing instanceof Outlet) {
          this._morph(existing, outlet);
        } else {
          this._add(make(outlet));
        }
      }
      this;
    }
    return this.outlets;
  };

  Node.prototype.connect = function(node, empty, force) {
    var hint, hints, others, outlet, outlets, type, _i, _j, _len, _len1, _ref, _ref1;
    outlets = {};
    hints = {};
    _ref = node.inputs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      outlet = _ref[_i];
      if (!force && outlet.input) {
        continue;
      }
      type = outlet.type;
      hint = [type, outlet.hint].join('-');
      if (!hints[hint]) {
        hints[hint] = outlet;
      }
      outlets[type] = outlets[type] || [];
      outlets[type].push(outlet);
    }
    _ref1 = this.outputs;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      if (empty && outlet.output.length) {
        continue;
      }
      type = outlet.type;
      hint = [type, outlet.hint].join('-');
      others = outlets[type];
      if (hints[hint]) {
        hints[hint].connect(outlet);
        delete hints[hint];
        others.splice(others.indexOf(outlet), 1);
        continue;
      }
      if (others && others.length) {
        others.shift().connect(outlet);
      }
    }
    return this;
  };

  Node.prototype.disconnect = function(node) {
    var outlet, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.inputs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      outlet = _ref[_i];
      outlet.disconnect();
    }
    _ref1 = this.outputs;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      outlet.disconnect();
    }
    return this;
  };

  Node.prototype._key = function(outlet) {
    return [outlet.name, outlet.inout].join('-');
  };

  Node.prototype._add = function(outlet) {
    var key;
    key = this._key(outlet);
    if (outlet.node) {
      throw "Adding outlet to two nodes at once.";
    }
    if (this.outlets[key]) {
      throw "Adding two identical outlets to same node. (" + key + ")";
    }
    outlet.setNode(this);
    if (outlet.inout === Graph.IN) {
      this.inputs.push(outlet);
    }
    if (outlet.inout === Graph.OUT) {
      this.outputs.push(outlet);
    }
    return this.outlets[key] = outlet;
  };

  Node.prototype._morph = function(existing, outlet) {
    var key;
    key = this._key(outlet);
    delete this.outlets[key];
    existing.morph(outlet);
    key = this._key(outlet);
    return this.outlets[key] = outlet;
  };

  Node.prototype._remove = function(outlet) {
    var inout, key;
    key = this._key(outlet);
    inout = outlet.inout;
    if (outlet.node !== this) {
      throw "Removing outlet from wrong node.";
    }
    outlet.disconnect();
    outlet.setNode(null);
    delete this.outlets[key];
    if (outlet.inout === Graph.IN) {
      this.inputs.splice(this.inputs.indexOf(outlet), 1);
    }
    if (outlet.inout === Graph.OUT) {
      this.outputs.splice(this.outputs.indexOf(outlet), 1);
    }
    return this;
  };

  return Node;

})();

module.exports = Node;


},{"./graph":7,"./outlet":10}],10:[function(require,module,exports){
var Graph, Outlet;

Graph = require('./graph');


/*
  In/out outlet on node
 */

Outlet = (function() {
  Outlet.index = 0;

  Outlet.id = function(name) {
    return "_io_" + (++Outlet.index) + "_" + name;
  };

  function Outlet(inout, name, hint, type, meta) {
    this.inout = inout;
    this.name = name;
    this.hint = hint;
    this.type = type;
    this.meta = meta;
    if (this.hint == null) {
      this.hint = name;
    }
    this.node = null;
    this.input = null;
    this.output = [];
    this.id = Outlet.id(this.hint);
  }

  Outlet.prototype.morph = function(outlet) {
    this.inout = outlet.inout;
    this.name = outlet.name;
    this.hint = outlet.hint;
    this.type = outlet.type;
    return this.meta = outlet.meta;
  };

  Outlet.prototype.connect = function(outlet) {
    if (this.inout === Graph.IN && outlet.inout === Graph.OUT) {
      return outlet.connect(this);
    }
    if (this.inout !== Graph.OUT || outlet.inout !== Graph.IN) {
      throw "Can only connect out to in.";
    }
    if (outlet.input === this) {
      return;
    }
    outlet.disconnect();
    outlet.input = this;
    return this.output.push(outlet);
  };

  Outlet.prototype.disconnect = function(outlet) {
    var index, _i, _len, _ref;
    if (this.input) {
      this.input.disconnect(this);
    }
    if (this.output.length) {
      if (outlet) {
        index = this.output.indexOf(outlet);
        if (index >= 0) {
          this.output.splice(index, 1);
          return outlet.input = null;
        }
      } else {
        _ref = this.output;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          outlet = _ref[_i];
          outlet.input = null;
        }
        return this.output = [];
      }
    }
  };

  Outlet.prototype.setNode = function(node) {
    this.node = node;
  };

  return Outlet;

})();

module.exports = Outlet;


},{"./graph":7}],11:[function(require,module,exports){
var Linker, ShaderGraph, code1, code2, code3, graph, normalize, shader, shadergraph, snippet, snippets;

Linker = require('./linker');

ShaderGraph = (function() {
  function ShaderGraph(library) {
    if (library == null) {
      library = {};
    }
    if (!(this instanceof ShaderGraph)) {
      return new ShaderGraph(library);
    }
    this.library = new Linker.Library(library);
  }

  ShaderGraph.prototype.shader = function() {
    return new Linker.Factory(this.library);
  };

  ShaderGraph.Graph = require('./graph');

  ShaderGraph.Snippet = require('./snippet');

  ShaderGraph.Block = require('./block');

  ShaderGraph.Linker = require('./linker');

  return ShaderGraph;

})();

module.exports = ShaderGraph;

window.ShaderGraph = ShaderGraph;

code1 = "float foobar(vec3 color) {\n}";

code2 = "float callback(vec3 color);\nfloat foobar(vec3 color) {\n}";

code3 = "float callback(vec3 color);\nvoid main(in vec3 color) {\n  float f = callback(color);\n}";

snippets = {
  'code1': code1,
  'code2': code2,
  'code3': code3
};

shadergraph = ShaderGraph(snippets);

shader = shadergraph.shader();

graph = shader.group().group().snippet('code1').callback().snippet('code2').callback().snippet('code3').end();

snippet = graph.compile();

normalize = function(code) {
  var map, o, p, s;
  map = {};
  o = s = p = 0;
  code = code.replace(/\b_io_[0-9]+([A-Za-z0-9_]+)\b/g, function(match, name) {
    var _ref;
    return (_ref = map[match]) != null ? _ref : map[match] = "_io_" + (++o) + name;
  });
  code = code.replace(/\b_sn_[0-9]+([A-Za-z0-9_]+)\b/g, function(match, name) {
    var _ref;
    return (_ref = map[match]) != null ? _ref : map[match] = "_sn_" + (++s) + name;
  });
  return code = code.replace(/\b_pg_[0-9]+_\b/g, function(match) {
    var _ref;
    return (_ref = map[match]) != null ? _ref : map[match] = "_pg_" + (++p) + "_";
  });
};

window.graph = graph;

window.snippet = snippet;

window.code = normalize(snippet.code);


/*

code = """
// Comment
uniform float uf;
uniform float ufv1[3];
uniform vec2 uv2;
// Comment
uniform vec2 uv2v[3];
uniform vec3 uv3;
uniform vec3 uv3v[3];
uniform vec4 uv4;
uniform vec4 uv4v[3];
uniform sampler2D ut;
uniform sampler2D utv[3];
varying float vf;
varying float vfv1[3];
varying mat3 vm3;
varying mat3 vm3v[3];
varying mat4 vm4;
varying mat4 vm4v[3];
attribute float af;
attribute float afv1[3];
attribute vec3 av3;
attribute vec3 av3v[3];
attribute mat4 am4;
attribute mat4 am4v[3];

void callback1(in vec4 v4in);

void callback2(in vec3 v3in, out vec4 v4out);

void callback3(in vec3 v3in, in vec4 v4in, out vec4 v4out);

void snippetTest(
  in vec3 v3in, in vec4 v4in, mat3 m3vin[3],
  out vec4 v4out, out vec4 v4vout[3], out mat4 m4out, out mat4 m4vout[3],
  inout vec3 v3inout) {
    callback1(v4in);
    callback2(v3in, v4out);
    callback3(v3in, v4in, v4out);
    gl_FragColor = vec4(v4in.xyz, 1.0);
}
"""











code = """
uniform vec3 color;

 *pragma external
const void callback(const in vec4 rgba);

 *pragma export
void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); };

"""







code = """
uniform vec2 sampleStep;

uniform float fadeOut;
uniform float field;
uniform float time;

uniform sampler2D texture;
varying vec2 vUV;

float randf(vec2 xy) {
  return fract(sin(dot(xy, vec2(3.1380, 7.41)) * 13.414) * 1414.32);
}

const float c = .9999875;
const float s = .005;
const mat2 roto1 = mat2(c, s, -s, c);
const mat2 roto2 = mat2(c, -s, s, c);

const float c2 = .9998;
const float s2 = .02;
const mat2 roto3 = mat2(c2, -s2, s2, c2);

vec2 rotozoom(vec2 xy) {
  float r = sqrt(dot(xy, xy));
  xy *= (7.0 * r + sin(r)) * .125 / r;
  xy *= roto1;

  return xy;
}

vec2 planeproject(vec2 xy) {
  float f = .0625 * (15.0 + 1.0 / (-xy.y + 1.5));
  xy *= f;
  xy *= roto2;

  return xy;
}

vec2 ball(vec2 xy) {
  float r = sqrt(dot(xy, xy));
  xy *= (3.0 + 1.75 * tan(r * .5) / r) * .25;
  xy *= roto3;

  return xy;
}

vec2 swirl(vec2 xy) {
  vec2 a = xy * 2.25 * 6.28;
  xy += vec2(sin(a.y), sin(a.x)) * .01;

  vec2 b = xy * 4.5 * 6.28;
  xy += vec2(-sin(b.y), sin(b.x)) * .01;

  vec2 c = xy * 9.0 * 6.28;
  xy += vec2(-sin(c.y), -sin(c.x)) * .01;
  return xy;
}

vec2 warp(vec2 xy, float q) {

  float r = sqrt(dot(xy, xy));
  float th = atan(xy.y, xy.x) * 6.0;
  float f = .99 * (r + sin(r * r * q * .5 + time + sin(th) * 2.0) * .02) / r;

  return xy * f;
}

vec2 tiles(vec2 xy) {

  vec2 grid = floor(xy * 9.0);
  float index = mod(grid.x + grid.y + (1.0 + grid.x) * grid.x * grid.y * 3.0, 4.0);

  float d = .01;
  if (index < .5) {
    xy.x += d;
  }
  else if (index < 1.5) {
    xy.x -= d;
  }
  else if (index < 2.5) {
    xy.y += d;
  }
  else {
    xy.y -= d;
  }

  return xy;
}

vec2 flower(vec2 xy) {
  vec2 orig = xy;
  float r = sqrt(dot(xy, xy));
  float th = atan(xy.y, xy.x);

  float th2 = th + sin(r * 64.0);
  float r2 = r + sin(th * 64.0);

  return mix(orig, vec2(cos(th2) * r2, sin(th2) * r2), .01);
}

vec2 rotate(vec2 xy, vec2 ref, float a) {
  vec2 diff = xy - ref;
  float c = cos(a);
  float s = sin(a);
  return ref + diff * mat2(c, -s, s, c);
}

void callback();

void main() {
  vec2 xy = (vUV * 2.0 - 1.0) * vec2(16.0/9.0, 1.0);
  vec2 pos = xy;

  callback();

  if (field > 0.0) {

    if (field < 1.0) {
      xy = mix(xy, rotozoom(pos), clamp(field, 0.0, 1.0));
    }
    else if (field < 2.0) {
      xy = rotozoom(pos);
      xy = mix(xy, planeproject(pos), clamp(field - 1.0, 0.0, 1.0));
    }
    else if (field < 3.0) {
      xy = planeproject(pos);
      xy = mix(xy, ball(pos), clamp(field - 2.0, 0.0, 1.0));
    }
    else if (field < 4.0) {
      xy = ball(pos);
      xy = mix(xy, rotate(xy, pos, time), clamp(field - 3.0, 0.0, 1.0));
    }
    else if (field < 5.0) {
      xy = ball(pos);
      xy = rotate(xy, pos, time);
      xy = mix(xy, rotate(swirl(pos), pos, time), clamp(field - 4.0, 0.0, 1.0) * .5);
    }
    else if (field < 6.0) {
      xy = ball(pos);
      xy = rotate(xy, pos, time);
      xy = mix(xy, rotate(swirl(pos), pos, time), .5);
      xy = mix(xy, mix(rotate(warp(pos * 1.131, 32.0) / 1.131, pos, -time * 1.711), rotate(warp(pos, 27.0), pos, time), .5), clamp(field - 5.0, 0.0, 1.0));
    }
    else if (field < 7.0) {
      xy = mix(rotate(warp(pos * 1.131, 32.0) / 1.131, pos, -time * 1.711), rotate(warp(pos, 27.0), pos, time), .5);
      xy = mix(xy, rotate(tiles(pos), pos, -time), clamp(field - 6.0, 0.0, 1.0));
    }
    else { //if (field < 8.0) {
      xy = rotate(tiles(pos), pos, -time) * .995;
      xy = mix(xy, flower(pos), clamp(field - 7.0, 0.0, 1.0));
    }

    xy += sampleStep * .2;
  }

  xy *= vec2(9.0/16.0, 1.0);

  vec2 uv = fract(xy * .5 + .5);
  vec4 sample = texture2D(texture, uv);

  gl_FragColor = vec4(sample.xyz - vec3(fadeOut), 1.0);

}

"""







code = """
uniform vec2 sampleStep;

uniform float uf1[2], uf2[3];
uniform float fadeOut;
uniform float field[3];
uniform float time, space;
uniform float aa[2], bb[3], cc, dd, ee[4];

uniform sampler2D texture;
varying vec2 vUV;
// woo
const float cf1, cf2;
vec4 gv4;

 *pragma woo
 *if

float randf(vec2 xy) {
  vec2 a[2], b, c;
  float x = cf1 + cf2;
  float d, e, f;
  return fract(sin(dot(xy, vec2(3.1380, 7.41)) * 1.0 * 2.0 / 3.0 / 4.0 * 5.0) * 1414.32);
}

"""
 */


},{"./block":3,"./graph":8,"./linker":13,"./snippet":18}],12:[function(require,module,exports){
var Block, Factory, Graph, Program, State;

Graph = require('../graph');

Block = require('../block');

Program = require('./program');


/*
  Chainable factory
  
  Exposes methods to build a graph incrementally
 */

Factory = (function() {
  function Factory(library) {
    this.library = library;
    this.end();
  }

  Factory.prototype.snippet = function(name, uniforms) {
    return this._append(this._shader(name, uniforms));
  };

  Factory.prototype.material = function(vertex, fragment, uniforms) {
    return this._append(this._material(vertex, fragment, uniforms));
  };

  Factory.prototype.group = function() {
    this._push();
    this._push();
    return this;
  };

  Factory.prototype.next = function() {
    var sub;
    sub = this._pop();
    this._state.start = this._state.start.concat(sub.start);
    this._state.end = this._state.end.concat(sub.end);
    this._state.nodes = this._state.nodes.concat(sub.nodes);
    this._push();
    return this;
  };

  Factory.prototype.pass = function() {
    this.next();
    this._state.end = this._stack[2].end;
    return this.combine();
  };

  Factory.prototype.combine = function() {
    var from, main, sub, to, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    _ref = this._combine(), sub = _ref[0], main = _ref[1];
    _ref1 = sub.start;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      to = _ref1[_i];
      _ref2 = main.end;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        from = _ref2[_j];
        from.connect(to, true);
      }
    }
    main.end = sub.end;
    return this;
  };

  Factory.prototype.isolate = function() {
    var block, main, sub, subgraph, _ref;
    _ref = this._combine(), sub = _ref[0], main = _ref[1];
    if (sub.nodes.length) {
      subgraph = this._subgraph(sub);
      block = new Block.Isolate(subgraph);
      this._append(block.node);
    }
    return this;
  };

  Factory.prototype.callback = function() {
    var block, main, sub, subgraph, _ref;
    _ref = this._combine(), sub = _ref[0], main = _ref[1];
    if (sub.nodes.length) {
      subgraph = this._subgraph(sub);
      block = new Block.Callback(subgraph);
      this._append(block.node);
    }
    return this;
  };

  Factory.prototype.end = function() {
    var graph;
    graph = this.graph;
    this.graph = new Graph.Graph();
    this._state = new State;
    this._stack = [this._state];
    if (graph) {
      graph.compile = function() {
        return Program.compile(graph.tail().owner);
      };
    }
    return graph;
  };

  Factory.prototype.compile = function() {
    return this.end().compile();
  };

  Factory.prototype._shader = function(name, uniforms) {
    var block, snippet;
    snippet = this.library.fetch(name);
    snippet.apply(uniforms);
    block = new Block.Shader(snippet);
    return block.node;
  };

  Factory.prototype._material = function(vertex, fragment, uniforms) {
    var block;
    vertex = this.library.fetch(vertex);
    fragment = this.library.fetch(fragment);
    vertex.apply(uniforms);
    fragment.apply(uniforms, vertex.namespace);
    block = new Block.Material(vertex, fragment);
    return block.node;
  };

  Factory.prototype._subgraph = function(sub) {
    var node, subgraph, _i, _len, _ref;
    subgraph = new Graph.Graph();
    _ref = sub.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      this.graph.remove(node, true);
      subgraph.add(node, true);
    }
    return subgraph;
  };

  Factory.prototype._combine = function() {
    if (this._stack.length <= 2) {
      throw "Popping factory stack too far";
    }
    this.next()._pop();
    return [this._pop(), this._state];
  };

  Factory.prototype._push = function() {
    this._stack.unshift(new State);
    return this._state = this._stack[0];
  };

  Factory.prototype._pop = function() {
    this._state = this._stack[1];
    return this._stack.shift();
  };

  Factory.prototype._append = function(node) {
    var end, _i, _len, _ref;
    this.graph.add(node);
    _ref = this._state.end;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      end = _ref[_i];
      end.connect(node);
    }
    if (!this._state.start.length) {
      this._state.start = [node];
    }
    this._state.end = [node];
    this._state.nodes.push(node);
    return this;
  };

  Factory.prototype._prepend = function(node) {
    var start, _i, _len, _ref;
    this.graph.add(node);
    _ref = this._state.start;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      start = _ref[_i];
      node.connect(start);
    }
    if (!this._state.end.length) {
      this._state.end = [node];
    }
    this._state.start = [node];
    this._state.nodes.push(node);
    return this;
  };

  return Factory;

})();

State = (function() {
  function State(start, end, nodes) {
    this.start = start != null ? start : [];
    this.end = end != null ? end : [];
    this.nodes = nodes != null ? nodes : [];
  }

  return State;

})();

module.exports = Factory;


},{"../block":3,"../graph":8,"./program":15}],13:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Library = require('./library');

exports.Program = require('./program');

exports.compile = exports.Program.compile;

exports.entry = exports.Program.entry;


},{"./factory":12,"./library":14,"./program":15}],14:[function(require,module,exports){
var Library, Snippet;

Snippet = require('../snippet');


/*
  Snippet library
  
  Takes list of snippets and caches them after compilation
 */

Library = (function() {
  function Library(snippets) {
    this.snippets = snippets != null ? snippets : {};
    this.objects = {};
  }

  Library.prototype.fetch = function(name) {
    if (this.snippets[name] == null) {
      throw "Unknown snippet `" + name + "`";
    }
    if (this.objects[name] == null) {
      this.objects[name] = Snippet.load(name, this.snippets[name]);
    }
    return this.objects[name].clone();
  };

  return Library;

})();

module.exports = Library;


},{"../snippet":18}],15:[function(require,module,exports){
var Graph, Program, Snippet;

Graph = require('../graph');

Snippet = require('../snippet').Snippet;


/*
  GLSL program assembly
  
  Calls, code includes and callbacks are added to its queue
  
  When _assemble() is called, it builds a main() function to
  execute all calls in order and adds stubs to link
  up external callbacks.
  
  The result is a new instance of Snippet that acts as if it
  was parsed from the combined/linked source of the component
  nodes.
  
  If the graph only contains one node, compilation is skipped entirely.
 */

Program = (function() {
  Program.index = 0;

  Program.entry = function() {
    return "_pg_" + (++Program.index) + "_";
  };

  Program.compile = function(block, phase) {
    var program;
    program = new Program(block, this.namespace);
    return program.compile(phase);
  };

  function Program(block, namespace) {
    this.block = block;
    this.namespace = namespace;
    this.modules = {};
    this.calls = {};
    this.links = [];
    this.includes = [];
    this.externals = {};
    this.uniforms = {};
    this.attributes = {};
  }

  Program.prototype.compile = function(phase) {
    var graph;
    graph = this.block.node.graph;
    if (graph.nodes.length === 1) {
      return this._snippet(this.block.solo(phase));
    } else {
      this.block.call(this, phase, 0);
      return this._assemble(phase);
    }
  };

  Program.prototype.link = function(node, module, name, external) {
    return this.links.push({
      node: node,
      module: module,
      name: name,
      external: external
    });
  };

  Program.prototype.include = function(node, module) {
    var def, key, name, outlet, _ref, _ref1, _ref2, _results;
    if (this._included(module)) {
      return;
    }
    this.modules[module.namespace] = module;
    this.includes.push(module.code);
    _ref = module.uniforms;
    for (key in _ref) {
      def = _ref[key];
      this.uniforms[key] = def;
    }
    _ref1 = module.attributes;
    for (key in _ref1) {
      def = _ref1[key];
      this.attributes[key] = def;
    }
    _ref2 = module.externals;
    _results = [];
    for (key in _ref2) {
      def = _ref2[key];
      name = def.name;
      outlet = node.get(name);
      if (!outlet.input) {
        _results.push(this.externals[key] = def);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Program.prototype.call = function(node, module, priority) {
    var exists, ns;
    ns = module.namespace;
    if (exists = this.calls[ns]) {
      exists.priority = Math.max(exists.priority, priority);
    } else {
      this.calls[ns] = {
        node: node,
        module: module,
        priority: priority
      };
    }
    return this;
  };

  Program.prototype._snippet = function(_s) {
    var s;
    s = new Snippet;
    s.namespace = _s.namespace;
    s.code = _s.code;
    s.main = _s.main;
    s.entry = _s.entry;
    s.externals = _s.externals;
    s.uniforms = _s.uniforms;
    s.attributes = _s.attributes;
    return s;
  };

  Program.prototype._included = function(module) {
    return !!this.modules[module.namespace];
  };

  Program.prototype._assemble = function(phase) {
    var INOUT_ARG, RETURN_ARG, body, buildBody, buildLinks, callModules, code, getShadow, isDangling, isShadow, link, links, lookup, main, makeBody, makeCall;
    INOUT_ARG = '_i_n_o_u_t';
    RETURN_ARG = 'return';
    getShadow = function(name) {
      return name.replace(INOUT_ARG, '');
    };
    isShadow = function(name) {
      var collapsed;
      collapsed = getShadow(name);
      return collapsed !== name;
    };
    isDangling = function(node, name) {
      var outlet;
      outlet = node.get(name);
      if (outlet.inout === Graph.IN) {
        return outlet.input === null;
      } else if (outlet.inout === Graph.OUT) {
        return outlet.output.length === 0;
      }
    };
    lookup = function(node, name) {
      var outlet;
      outlet = node.get(name);
      if (outlet.input) {
        outlet = outlet.input;
      }
      name = outlet.name;
      if (isShadow(name)) {
        return lookup(outlet.node, getShadow(name));
      } else {
        return outlet.id;
      }
    };
    makeCall = function(lookup, dangling, entry, signature, body) {
      var arg, args, id, name, param, ret, _i, _len;
      args = [];
      ret = '';
      for (_i = 0, _len = signature.length; _i < _len; _i++) {
        arg = signature[_i];
        param = arg.param;
        name = arg.name;
        if (isShadow(name)) {
          continue;
        }
        id = lookup(name);
        if (name === RETURN_ARG) {
          ret = "" + id + " = ";
        } else {
          args.push(id);
        }
        if (body) {
          if (dangling(name)) {
            if (name === RETURN_ARG) {
              if (body["return"] !== '') {
                throw "Error: two unconnected return values within same graph";
              }
              body.type = arg.spec;
              body["return"] = "  return " + id + ";\n";
              body.vars[id] = "  " + param(id);
              body.signature.push(arg);
            } else {
              body.params.push(param(id, true));
              body.signature.push(arg.copy(id));
            }
          } else {
            body.vars[id] = "  " + param(id);
          }
        }
      }
      args = args.join(', ');
      return "  " + ret + entry + "(" + args + ")";
    };
    buildLinks = function(links) {
      var l;
      links = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = links.length; _i < _len; _i++) {
          l = links[_i];
          _results.push(link(l));
        }
        return _results;
      })();
      return links.join(';\n');
    };
    link = (function(_this) {
      return function(link) {
        var arg, call, entry, external, inner, ins, list, main, map, module, name, node, other, outer, outs, returnVar, same, wrapper, _dangling, _i, _j, _len, _len1, _lookup, _name, _ref, _ref1;
        node = link.node, module = link.module, name = link.name, external = link.external;
        main = module.main;
        entry = module.entry;
        same = true;
        ins = [];
        outs = [];
        map = {};
        returnVar = [module.namespace, RETURN_ARG].join('');
        _ref = external.signature;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          arg = _ref[_i];
          list = arg.inout === Graph.IN ? ins : outs;
          list.push(arg);
        }
        _ref1 = main.signature;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          arg = _ref1[_j];
          list = arg.inout === Graph.IN ? ins : outs;
          other = list.shift();
          _name = other.name;
          if (_name === RETURN_ARG) {
            _name = returnVar;
          }
          map[arg.name] = _name;
        }
        _lookup = function(name) {
          return map[name];
        };
        _dangling = function() {
          return true;
        };
        inner = makeBody();
        call = makeCall(_lookup, _dangling, entry, main.signature, inner);
        map = {
          "return": returnVar
        };
        _lookup = function(name) {
          var _ref2;
          return (_ref2 = map[name]) != null ? _ref2 : name;
        };
        outer = makeBody();
        wrapper = makeCall(_lookup, _dangling, entry, external.signature, outer);
        outer.calls = [call];
        outer.entry = name;
        return buildBody(outer).code;
      };
    })(this);
    callModules = (function(_this) {
      return function(calls) {
        var body, c, call, cs, ns, _i, _len;
        call = function(node, module) {
          var entry, main, _dangling, _lookup;
          _this.include(node, module);
          main = module.main;
          entry = module.entry;
          _lookup = function(name) {
            return lookup(node, name);
          };
          _dangling = function(name) {
            return isDangling(node, name);
          };
          return body.calls.push(makeCall(_lookup, _dangling, entry, main.signature, body));
        };
        body = makeBody();
        cs = (function() {
          var _results;
          _results = [];
          for (ns in calls) {
            c = calls[ns];
            _results.push(c);
          }
          return _results;
        })();
        cs.sort(function(a, b) {
          return b.priority - a.priority;
        });
        for (_i = 0, _len = cs.length; _i < _len; _i++) {
          c = cs[_i];
          call(c.node, c.module);
        }
        return body;
      };
    })(this);
    makeBody = function() {
      return {
        entry: null,
        vars: {},
        "return": '',
        type: 'void',
        calls: [],
        params: [],
        signature: []
      };
    };
    buildBody = function(body) {
      var calls, code, decl, entry, params, ret, type, v, vars, _ref;
      entry = (_ref = body.entry) != null ? _ref : Program.entry();
      vars = (function() {
        var _ref1, _results;
        _ref1 = body.vars;
        _results = [];
        for (v in _ref1) {
          decl = _ref1[v];
          _results.push(decl);
        }
        return _results;
      })();
      params = body.params;
      calls = body.calls;
      type = body.type;
      ret = body["return"];
      calls.push('');
      if (vars.length) {
        vars.push('');
        vars = vars.join(';\n') + '\n';
      } else {
        vars = '';
      }
      calls = calls.join(';\n');
      params = params.join(', ');
      code = "" + type + " " + entry + "(" + params + ") {\n" + vars + calls + ret + "}";
      return {
        signature: body.signature,
        code: code,
        name: entry
      };
    };
    body = callModules(this.calls);
    if (this.namespace) {
      body.entry = this.namespace;
    }
    links = buildLinks(this.links);
    if (links.length) {
      this.includes.push(links);
    }
    main = buildBody(body);
    this.includes.push(main.code);
    code = this.includes.join('\n');
    return this._snippet({
      namespace: main.name,
      code: code,
      main: main,
      entry: main.name,
      externals: this.externals,
      uniforms: this.uniforms,
      attributes: this.attributes
    });
  };

  return Program;

})();

module.exports = Program;


},{"../graph":8,"../snippet":18}],16:[function(require,module,exports){
var compile, replaced, string_compiler, tick, walk;

walk = require('./walk');


/*
  compile snippet back into GLSL, but with certain symbols replaced by placeholders
 */

tick = function() {
  var now;
  now = +(new Date);
  return function(label) {
    var delta;
    delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

replaced = function(signatures) {
  var key, out, s, sig, _i, _j, _len, _len1, _ref, _ref1;
  out = {};
  s = function(sig) {
    return out[sig.name] = true;
  };
  s(signatures.main);
  _ref = ['external', 'internal', 'varying', 'uniform'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    key = _ref[_i];
    _ref1 = signatures[key];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      sig = _ref1[_j];
      s(sig);
    }
  }
  return out;
};

compile = function(program) {
  var ast, code, placeholders, signatures;
  ast = program.ast, code = program.code, signatures = program.signatures;
  placeholders = replaced(signatures);
  return string_compiler(code, placeholders);
};


/*
String-replacement based compiler
 */

string_compiler = function(code, placeholders) {
  var key, re;
  re = new RegExp('\\b(' + ((function() {
    var _results;
    _results = [];
    for (key in placeholders) {
      _results.push(key);
    }
    return _results;
  })()).join('|') + ')\\b', 'g');
  code = code.replace(/\/\/[^\n]*/g, '');
  code = code.replace(/\/\*([^*]|\*[^\/])*\*\//g, '');
  code = code.replace(/^#[^\n]*/mg, '');
  return function(prefix, replaced) {
    var names, _ref;
    if (prefix == null) {
      prefix = '';
    }
    if (replaced == null) {
      replaced = {};
    }
    names = {};
    for (key in placeholders) {
      names[key] = prefix + ((_ref = replaced[key]) != null ? _ref : key);
    }
    return code.replace(re, function(key) {
      return names[key];
    });
  };
};


/*
AST-based compiler
(not used)

glsl-parser's AST is a bit awkward to serialize back into source code

todo: do, while, for, struct, precision
ast_compiler = (ast, placeholders) ->

   * stream out tokens, either strings or string callbacks

  tokens = []
  buffer = ""
  last   = ""
  regex  = /[0-9A-Za-z_{}]/
  indent = ''
  block  = ''

  string = (value) ->

    first = value[0]

    return if value == ';\n' and last == '\n'

    buffer += ' ' if buffer.length and regex.test(last) and regex.test(first)
    buffer += value

    last = buffer[buffer.length - 1]

  maybePlaceholder = (name) ->
    if placeholders[name]
      placeholder name
    else
      string name

  placeholder = (name) ->
    last = buffer[buffer.length - 1]
    buffer += ' ' if buffer.length and regex.test(last)

    combine()
    tokens.push (names) -> names[name]

    last = 'x'

  combine = () ->
    if buffer.length
      tokens.push buffer
      buffer = ""
    tokens

   * process AST nodes
  recurse = (node) ->
    indent += '..'
    walk map, null, child, indent for child, i in node.children
    indent = indent.substring 2

  remap = (node, i) ->
    indent += '..'
    walk map, null, node, indent
    indent = indent.substring 2

  stmtlist = (node) ->
    if node.parent
      block += '  '
      string '{\n'

    recurse node

    if node.parent
      block = block.substring(2)
      string block + '}'

    false

  stmt = (node, data) ->
    if data in ['else']
      string data
    else
      string block

    recurse node
    string ';\n'
    false

  decllist = (node, data) ->
    if data == '='
      for child, i in node.children
        remap child
        if i == 0
          string ' = '
      false
    else
      for child, i in node.children
        if i > 0 && child.type != 'quantifier'
          string ', '
        remap child
      false
   *  else true

  args = (node, data) ->
    c = node.children
    for child, i in c
      if i > 0
        string ', '
      remap child
    false

  ifstmt = (node, data) ->
    c = node.children

    string data
    string '('
    remap c[0]
    string ') '

    remap c[1]
    remap c[2] if c[2]

 *    string block + '\n'
    false

  call = (node, data) ->
    c = node.children

    body = false
    for child, i in c
      if child.type == 'stmtlist'
        body = true
        string ') '
        remap child
      else
        if i > 1
          string ', '
        remap child
        if i == 0
          string '('
    string ')' if !body
    false

  operator = (node, data) ->
    c = node.children

    l = c.length
    if l == 1
       * unary
      string data
      remap c[0]
    else
      data = ' ' + data + ' ' if data != '.'

       * binary
      for child, i in c
        remap child
        string data if i == 0
    false

  ident = (node, data) ->
    maybePlaceholder data
    true

  literal = (node, data) ->
    string data
    true

  group = (node, data) ->
    string '('
    recurse node
    string ')'
    false

  quantifier = (node, data) ->
    string '['
    recurse node
    string ']'
    false

   * map node in tree
  map = (node) ->
    n = node
    d = node.token.data

    switch node.type
      when 'placeholder'  then false
      when 'expr'         then true
      when 'decl'         then true
      when 'stmt'         then stmt         n, d
      when 'literal'      then literal      n, d
      when 'keyword'      then literal      n, d
      when 'ident'        then ident        n, d
      when 'decllist'     then decllist     n, d
      when 'builtin'      then literal      n, d
      when 'binary'       then operator     n, d
      when 'return'       then literal      n, d
      when 'call'         then call         n, d
      when 'function'     then call         n, d
      when 'functionargs' then args         n, d
      when 'if'           then ifstmt       n, d
      when 'else'         then elsestmt     n, d
      when 'group'        then group        n, d
      when 'stmtlist'     then stmtlist     n, d
      when 'quantifier'   then quantifier   n, d
      when 'preprocessor' then false

      else switch node.token.type
        when 'operator'   then operator     n, d
        else false


   * walk tree
  tock = tick()

  walk map, null, ast, ''
  tokens = combine()

  tock "GLSL Compile"

   * assembler function that takes map of symbol names
   * and returns GLSL source code
  (prefix = '', replaced = {}) ->
    names = {}
    for key of placeholders
      names[key] = prefix + (replaced[key] ? key)

    out = ""
    for token in tokens
      if token.call
        out += token(names)
      else
        out += token

    out
 */

module.exports = compile;


},{"./walk":21}],17:[function(require,module,exports){
var decl, get;

module.exports = decl = {};

decl["in"] = 0;

decl.out = 1;

decl.inout = 2;

get = function(n) {
  return n.token.data;
};

decl.node = function(node) {
  var _ref, _ref1;
  if (((_ref = node.children[5]) != null ? _ref.type : void 0) === 'function') {
    return decl["function"](node);
  } else if (((_ref1 = node.token) != null ? _ref1.type : void 0) === 'keyword') {
    return decl.external(node);
  }
};

decl.external = function(node) {
  var c, i, ident, list, next, out, quant, storage, struct, type, _i, _len, _ref;
  c = node.children;
  storage = get(c[1]);
  struct = get(c[3]);
  type = get(c[4]);
  list = c[5];
  if (storage !== 'attribute' && storage !== 'uniform' && storage !== 'varying') {
    storage = 'global';
  }
  out = [];
  _ref = list.children;
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    c = _ref[i];
    if (c.type === 'ident') {
      ident = get(c);
      next = list.children[i + 1];
      quant = (next != null ? next.type : void 0) === 'quantifier';
      out.push({
        decl: 'external',
        storage: storage,
        type: type,
        ident: ident,
        quant: !!quant
      });
    }
  }
  return out;
};

decl["function"] = function(node) {
  var args, body, c, child, decls, func, ident, storage, struct, type;
  c = node.children;
  storage = get(c[1]);
  struct = get(c[3]);
  type = get(c[4]);
  func = c[5];
  ident = get(func.children[0]);
  args = func.children[1];
  body = func.children[2];
  decls = (function() {
    var _i, _len, _ref, _results;
    _ref = args.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      _results.push(decl.argument(child));
    }
    return _results;
  })();
  return [
    {
      decl: 'function',
      storage: storage,
      type: type,
      ident: ident,
      body: !!body,
      args: decls
    }
  ];
};

decl.argument = function(node) {
  var c, ident, inout, list, quant, storage, type;
  c = node.children;
  storage = get(c[1]);
  inout = get(c[2]);
  type = get(c[4]);
  list = c[5];
  ident = get(list.children[0]);
  quant = list.children[1];
  return {
    decl: 'argument',
    storage: storage,
    inout: inout,
    type: type,
    ident: ident,
    quant: !!quant
  };
};

decl.param = function(dir, storage, spec, quant) {
  var prefix, suffix;
  prefix = [];
  if (storage != null) {
    prefix.push(storage);
  }
  if (spec != null) {
    prefix.push(spec);
  }
  prefix.push('');
  prefix = prefix.join(' ');
  suffix = quant ? '[' + quant + ']' : '';
  if (dir !== '') {
    dir += ' ';
  }
  return function(name, long) {
    return (long ? dir : '') + ("" + prefix + name + suffix);
  };
};

decl.type = function(name, spec, quant, dir, storage) {
  var defaults, dirs, inout, param, storages, three, type, value, _ref;
  three = {
    float: 'f',
    vec2: 'v2',
    vec3: 'v3',
    vec4: 'v4',
    mat3: 'm3',
    mat4: 'm4',
    sampler2D: 't',
    samplerCube: 't'
  };
  defaults = {
    float: 0,
    vec2: window.THREE ? new THREE.Vector3() : null,
    vec3: window.THREE ? new THREE.Vector3() : null,
    vec4: window.THREE ? new THREE.Vector4() : null,
    mat4: window.THREE ? new THREE.Matrix4() : null,
    sampler2D: 0,
    samplerCube: 0
  };
  dirs = {
    "in": decl["in"],
    out: decl.out,
    inout: decl.inout
  };
  storages = {
    "const": 'const'
  };
  type = three[spec];
  if (quant) {
    type += 'v';
  }
  value = defaults[type];
  inout = (_ref = dirs[dir]) != null ? _ref : dirs["in"];
  storage = storages[storage];
  param = decl.param(dir, storage, spec, quant);
  return {
    name: name,
    type: type,
    spec: spec,
    param: param,
    value: value,
    inout: inout,
    copy: function(name) {
      return decl.copy(this, name);
    }
  };
};

decl.copy = function(type, _name) {
  var copy, inout, name, param, spec, value, _ref;
  _ref = type, name = _ref.name, type = _ref.type, spec = _ref.spec, param = _ref.param, value = _ref.value, inout = _ref.inout, copy = _ref.copy;
  if (_name != null) {
    name = _name;
  }
  return {
    name: name,
    type: type,
    spec: spec,
    param: param,
    value: value,
    inout: inout,
    copy: copy
  };
};


},{}],18:[function(require,module,exports){
exports.Snippet = require('./snippet');

exports.parse = require('./parse');

exports.compile = require('./compile');

exports.decl = require('./decl');

exports.load = exports.Snippet.load;


},{"./compile":16,"./decl":17,"./parse":19,"./snippet":20}],19:[function(require,module,exports){
var INOUT_ARG, RETURN_ARG, collect, debug, decl, extractSignatures, mapSymbols, parse, parseGLSL, parser, processAST, sortSymbols, tick, tokenizer, walk;

tokenizer = require('../../vendor/glsl-tokenizer');

parser = require('../../vendor/glsl-parser');

decl = require('./decl');

walk = require('./walk');

debug = false;

INOUT_ARG = '_i_n_o_u_t';

RETURN_ARG = 'return';


/*
parse GLSL into AST
extract all global symbols and make type signatures
 */

tick = function() {
  var now;
  now = +(new Date);
  return function(label) {
    var delta;
    delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

parse = function(name, code) {
  var ast, program;
  ast = parseGLSL(name, code);
  return program = processAST(ast, code);
};

parseGLSL = function(name, code) {
  var ast, error, errors, tock, _i, _len, _ref, _ref1;
  if (debug) {
    tock = tick();
  }
  _ref = tokenizer().process(parser(), code), (_ref1 = _ref[0], ast = _ref1[0]), errors = _ref[1];
  if (debug) {
    tock('GLSL Tokenize & Parse');
  }
  if (!ast || errors.length) {
    for (_i = 0, _len = errors.length; _i < _len; _i++) {
      error = errors[_i];
      console.error("[ShaderGraph] " + name + " -", error.message);
    }
    throw "GLSL parse error";
  }
  return ast;
};

processAST = function(ast, code) {
  var externals, internals, main, signatures, symbols, tock, _ref;
  if (debug) {
    tock = tick();
  }
  symbols = [];
  walk(mapSymbols, collect(symbols), ast, '');
  _ref = sortSymbols(symbols), main = _ref[0], internals = _ref[1], externals = _ref[2];
  signatures = extractSignatures(main, internals, externals);
  if (debug) {
    tock('GLSL AST');
  }
  return {
    ast: ast,
    code: code,
    signatures: signatures
  };
};

mapSymbols = function(node, collect) {
  switch (node.type) {
    case 'decl':
      collect(decl.node(node));
      return false;
  }
  return true;
};

collect = function(out) {
  return function(value) {
    var obj, _i, _len, _results;
    if (value != null) {
      _results = [];
      for (_i = 0, _len = value.length; _i < _len; _i++) {
        obj = value[_i];
        _results.push(out.push(obj));
      }
      return _results;
    }
  };
};

sortSymbols = function(symbols) {
  var e, externals, internals, main, maybe, s, _i, _len;
  main = null;
  internals = [];
  externals = [];
  maybe = {};
  for (_i = 0, _len = symbols.length; _i < _len; _i++) {
    s = symbols[_i];
    if (!s.body) {
      if (s.storage === 'global') {
        internals.push(s);
      } else {
        externals.push(s);
        maybe[s.ident] = true;
      }
    } else {
      if (maybe[s.ident]) {
        externals = (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = externals.length; _j < _len1; _j++) {
            e = externals[_j];
            if (e.ident !== s.ident) {
              _results.push(e);
            }
          }
          return _results;
        })();
        delete maybe[s.ident];
      }
      internals.push(s);
      main = s;
    }
  }
  return [main, internals, externals];
};

extractSignatures = function(main, internals, externals) {
  var def, defn, func, sigs, symbol, _i, _j, _len, _len1;
  sigs = {
    uniform: [],
    attribute: [],
    varying: [],
    external: [],
    internal: [],
    global: [],
    main: null
  };
  defn = function(symbol) {
    return decl.type(symbol.ident, symbol.type, symbol.quant, symbol.inout, symbol.storage);
  };
  func = function(symbol, inout) {
    var a, arg, b, d, def, ins, outs, signature, type, _i, _len;
    signature = (function() {
      var _i, _len, _ref, _results;
      _ref = symbol.args;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        _results.push(defn(arg));
      }
      return _results;
    })();
    for (_i = 0, _len = signature.length; _i < _len; _i++) {
      d = signature[_i];
      if (!(d.inout === decl.inout)) {
        continue;
      }
      a = d;
      b = d.copy();
      a.inout = decl["in"];
      b.inout = decl.out;
      b.name += INOUT_ARG;
      signature.push(b);
    }
    if (symbol.type !== 'void') {
      signature.push(decl.type(RETURN_ARG, symbol.type, false, 'out'));
    }
    ins = ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = signature.length; _j < _len1; _j++) {
        d = signature[_j];
        if (d.inout === decl["in"]) {
          _results.push(d.type);
        }
      }
      return _results;
    })()).join(',');
    outs = ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = signature.length; _j < _len1; _j++) {
        d = signature[_j];
        if (d.inout === decl.out) {
          _results.push(d.type);
        }
      }
      return _results;
    })()).join(',');
    type = "(" + ins + ")(" + outs + ")";
    return def = {
      name: symbol.ident,
      type: type,
      signature: signature,
      inout: inout,
      spec: symbol.type
    };
  };
  sigs.main = func(main, decl.out);
  for (_i = 0, _len = internals.length; _i < _len; _i++) {
    symbol = internals[_i];
    sigs.internal.push({
      name: symbol.ident
    });
  }
  for (_j = 0, _len1 = externals.length; _j < _len1; _j++) {
    symbol = externals[_j];
    switch (symbol.decl) {
      case 'external':
        def = defn(symbol);
        sigs[symbol.storage].push(def);
        break;
      case 'function':
        def = func(symbol, decl["in"]);
        sigs.external.push(def);
    }
  }
  return sigs;
};

module.exports = parse;


},{"../../vendor/glsl-parser":22,"../../vendor/glsl-tokenizer":26,"./decl":17,"./walk":21}],20:[function(require,module,exports){
var Snippet, compile, parse;

parse = require('./parse');

compile = require('./compile');

Snippet = (function() {
  Snippet.index = 0;

  Snippet.namespace = function() {
    return "_sn_" + (++Snippet.index) + "_";
  };

  Snippet.load = function(name, code) {
    var assembler, program;
    program = parse(name, code);
    assembler = compile(program);
    return new Snippet(program.signatures, assembler);
  };

  function Snippet(_signatures, _assembler) {
    this._signatures = _signatures;
    this._assembler = _assembler;
    this.namespace = null;
    this.code = null;
    this.main = null;
    this.entry = null;
    this.uniforms = null;
    this.externals = null;
    this.attributes = null;
  }

  Snippet.prototype.clone = function() {
    return new Snippet(this._signatures, this._assembler);
  };

  Snippet.prototype.apply = function(uniforms, namespace) {
    var a, def, e, name, u, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    this.namespace = namespace;
    if (this.namespace == null) {
      this.namespace = Snippet.namespace();
    }
    this.code = this._assembler(this.namespace);
    this.main = this._signatures.main;
    this.entry = this.namespace + this.main.name;
    this.uniforms = {};
    this.externals = {};
    this.attributes = {};
    u = (function(_this) {
      return function(def, name) {
        return _this.uniforms[_this.namespace + (name != null ? name : def.name)] = def;
      };
    })(this);
    e = (function(_this) {
      return function(def) {
        return _this.externals[_this.namespace + def.name] = def;
      };
    })(this);
    a = (function(_this) {
      return function(def) {
        return _this.attributes[def.name] = def;
      };
    })(this);
    _ref = this._signatures.uniform;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      def = _ref[_i];
      u(def);
    }
    _ref1 = this._signatures.external;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      def = _ref1[_j];
      e(def);
    }
    _ref2 = this._signatures.attribute;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      def = _ref2[_k];
      a(def);
    }
    for (name in uniforms) {
      def = uniforms[name];
      u(def, name);
    }
    return null;
  };

  return Snippet;

})();

module.exports = Snippet;


},{"./compile":16,"./parse":19}],21:[function(require,module,exports){
var debug, walk;

debug = false;

walk = function(map, collect, node, indent) {
  var child, i, recurse, _i, _len, _ref, _ref1, _ref2;
  debug && console.log(indent, node.type, (_ref = node.token) != null ? _ref.data : void 0, (_ref1 = node.token) != null ? _ref1.type : void 0);
  recurse = map(node, collect);
  if (recurse) {
    _ref2 = node.children;
    for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
      child = _ref2[i];
      walk(map, collect, child, indent + '  ', debug);
    }
  }
  return null;
};

module.exports = walk;


},{}],22:[function(require,module,exports){
module.exports = require('./lib/index')

},{"./lib/index":24}],23:[function(require,module,exports){
var state
  , token
  , tokens
  , idx

var original_symbol = {
    nud: function() { return this.children && this.children.length ? this : fail('unexpected')() }
  , led: fail('missing operator')
}

var symbol_table = {}

function itself() {
  return this
}

symbol('(ident)').nud = itself
symbol('(keyword)').nud = itself
symbol('(builtin)').nud = itself
symbol('(literal)').nud = itself
symbol('(end)')

symbol(':')
symbol(';')
symbol(',')
symbol(')')
symbol(']')
symbol('}')

infixr('&&', 30)
infixr('||', 30)
infix('|', 43)
infix('^', 44)
infix('&', 45)
infix('==', 46)
infix('!=', 46)
infix('<', 47)
infix('<=', 47)
infix('>', 47)
infix('>=', 47)
infix('>>', 48)
infix('<<', 48)
infix('+', 50)
infix('-', 50)
infix('*', 60)
infix('/', 60)
infix('%', 60)
infix('?', 20, function(left) {
  this.children = [left, expression(0), (advance(':'), expression(0))]
  this.type = 'ternary'
  return this
})
infix('.', 80, function(left) {
  token.type = 'literal'
  state.fake(token)
  this.children = [left, token]
  advance()
  return this
})
infix('[', 80, function(left) {
  this.children = [left, expression(0)]
  this.type = 'binary'
  advance(']')
  return this
})
infix('(', 80, function(left) {
  this.children = [left]
  this.type = 'call'

  if(token.data !== ')') while(1) {
    this.children.push(expression(0))
    if(token.data !== ',') break
    advance(',')
  }
  advance(')')
  return this
})

prefix('-')
prefix('+')
prefix('!')
prefix('~')
prefix('defined')
prefix('(', function() {
  this.type = 'group'
  this.children = [expression(0)]
  advance(')')
  return this 
})
prefix('++')
prefix('--')
suffix('++')
suffix('--')

assignment('=')
assignment('+=')
assignment('-=')
assignment('*=')
assignment('/=')
assignment('%=')
assignment('&=')
assignment('|=')
assignment('^=')
assignment('>>=')
assignment('<<=')

module.exports = function(incoming_state, incoming_tokens) {
  state = incoming_state
  tokens = incoming_tokens
  idx = 0
  var result

  if(!tokens.length) return

  advance()
  result = expression(0)
  result.parent = state[0]
  emit(result)

  if(idx < tokens.length) {
    throw new Error('did not use all tokens')
  }

  result.parent.children = [result]

  function emit(node) {
    state.unshift(node, false)
    for(var i = 0, len = node.children.length; i < len; ++i) {
      emit(node.children[i])
    }
    state.shift()
  }

}

function symbol(id, binding_power) {
  var sym = symbol_table[id]
  binding_power = binding_power || 0
  if(sym) {
    if(binding_power > sym.lbp) {
      sym.lbp = binding_power
    }
  } else {
    sym = Object.create(original_symbol)
    sym.id = id 
    sym.lbp = binding_power
    symbol_table[id] = sym
  }
  return sym
}

function expression(rbp) {
  var left, t = token
  advance()

  left = t.nud()
  while(rbp < token.lbp) {
    t = token
    advance()
    left = t.led(left)
  }
  return left
}

function infix(id, bp, led) {
  var sym = symbol(id, bp)
  sym.led = led || function(left) {
    this.children = [left, expression(bp)]
    this.type = 'binary'
    return this
  }
}

function infixr(id, bp, led) {
  var sym = symbol(id, bp)
  sym.led = led || function(left) {
    this.children = [left, expression(bp - 1)]
    this.type = 'binary'
    return this
  }
  return sym
}

function prefix(id, nud) {
  var sym = symbol(id)
  sym.nud = nud || function() {
    this.children = [expression(70)]
    this.type = 'unary'
    return this
  }
  return sym
}

function suffix(id) {
  var sym = symbol(id, 150)
  sym.led = function(left) {
    this.children = [left]
    this.type = 'suffix'
    return this
  }
}

function assignment(id) {
  return infixr(id, 10, function(left) {
    this.children = [left, expression(9)]
    this.assignment = true
    this.type = 'assign'
    return this
  })
}

function advance(id) {
  var next
    , value
    , type
    , output

  if(id && token.data !== id) {
    return state.unexpected('expected `'+ id + '`, got `'+token.data+'`')
  }

  if(idx >= tokens.length) {
    token = symbol_table['(end)']
    return
  }

  next = tokens[idx++]
  value = next.data
  type = next.type

  if(type === 'ident') {
    output = state.scope.find(value) || state.create_node()
    type = output.type
  } else if(type === 'builtin') {
    output = symbol_table['(builtin)']
  } else if(type === 'keyword') {
    output = symbol_table['(keyword)']
  } else if(type === 'operator') {
    output = symbol_table[value]
    if(!output) {
      return state.unexpected('unknown operator `'+value+'`')
    }
  } else if(type === 'float' || type === 'integer') {
    type = 'literal'
    output = symbol_table['(literal)']
  } else {
    return state.unexpected('unexpected token.')
  }

  if(output) {
    if(!output.nud) { output.nud = itself }
    if(!output.children) { output.children = [] }
  }

  output = Object.create(output)
  output.token = next
  output.type = type
  if(!output.data) output.data = value

  return token = output
}

function fail(message) {
  return function() { return state.unexpected(message) }
}

},{}],24:[function(require,module,exports){
module.exports = parser

var through = require('../../through')
  , full_parse_expr = require('./expr')
  , Scope = require('./scope')

// singleton!
var Advance = new Object

var DEBUG = false

var _ = 0
  , IDENT = _++
  , STMT = _++
  , STMTLIST = _++
  , STRUCT = _++
  , FUNCTION = _++
  , FUNCTIONARGS = _++
  , DECL = _++
  , DECLLIST = _++
  , FORLOOP = _++
  , WHILELOOP = _++
  , IF = _++
  , EXPR = _++
  , PRECISION = _++
  , COMMENT = _++
  , PREPROCESSOR = _++
  , KEYWORD = _++
  , KEYWORD_OR_IDENT = _++
  , RETURN = _++
  , BREAK = _++
  , CONTINUE = _++
  , DISCARD = _++
  , DOWHILELOOP = _++
  , PLACEHOLDER = _++
  , QUANTIFIER = _++

var DECL_ALLOW_ASSIGN = 0x1
  , DECL_ALLOW_COMMA = 0x2
  , DECL_REQUIRE_NAME = 0x4
  , DECL_ALLOW_INVARIANT = 0x8
  , DECL_ALLOW_STORAGE = 0x10
  , DECL_NO_INOUT = 0x20
  , DECL_ALLOW_STRUCT = 0x40
  , DECL_STATEMENT = 0xFF
  , DECL_FUNCTION = DECL_STATEMENT & ~(DECL_ALLOW_ASSIGN | DECL_ALLOW_COMMA | DECL_NO_INOUT | DECL_ALLOW_INVARIANT | DECL_REQUIRE_NAME)
  , DECL_STRUCT = DECL_STATEMENT & ~(DECL_ALLOW_ASSIGN | DECL_ALLOW_INVARIANT | DECL_ALLOW_STORAGE | DECL_ALLOW_STRUCT)

var QUALIFIERS = ['const', 'attribute', 'uniform', 'varying']

var NO_ASSIGN_ALLOWED = false
  , NO_COMMA_ALLOWED = false

// map of tokens to stmt types
var token_map = {
    'block-comment': COMMENT
  , 'line-comment': COMMENT
  , 'preprocessor': PREPROCESSOR
}

// map of stmt types to human
var stmt_type = _ = [ 
    'ident'
  , 'stmt'
  , 'stmtlist'
  , 'struct'
  , 'function'
  , 'functionargs'
  , 'decl'
  , 'decllist'
  , 'forloop'
  , 'whileloop'
  , 'i'+'f'
  , 'expr'
  , 'precision'
  , 'comment'
  , 'preprocessor'
  , 'keyword'
  , 'keyword_or_ident'
  , 'return'
  , 'break'
  , 'continue'
  , 'discard'
  , 'do-while'
  , 'placeholder'
  , 'quantifier'
]

function parser() {
  var stmtlist = n(STMTLIST)
    , stmt = n(STMT)
    , decllist = n(DECLLIST)
    , precision = n(PRECISION)
    , ident = n(IDENT)
    , keyword_or_ident = n(KEYWORD_OR_IDENT)
    , fn = n(FUNCTION)
    , fnargs = n(FUNCTIONARGS)
    , forstmt = n(FORLOOP)
    , ifstmt = n(IF)
    , whilestmt = n(WHILELOOP)
    , returnstmt = n(RETURN)
    , dowhilestmt = n(DOWHILELOOP)
    , quantifier = n(QUANTIFIER)

  var parse_struct
    , parse_precision
    , parse_quantifier
    , parse_forloop
    , parse_if
    , parse_return
    , parse_whileloop
    , parse_dowhileloop
    , parse_function
    , parse_function_args

  var stream = through(write, end)
    , check = arguments.length ? [].slice.call(arguments) : []
    , depth = 0
    , state = []
    , tokens = []
    , whitespace = []
    , errored = false
    , program
    , token
    , node

  // setup state
  state.shift = special_shift
  state.unshift = special_unshift
  state.fake = special_fake
  state.unexpected = unexpected
  state.scope = new Scope(state)
  state.create_node = function() {
    var n = mknode(IDENT, token)
    n.parent = stream.program
    return n
  }

  setup_stative_parsers()

  // setup root node
  node = stmtlist()
  node.expecting = '(eof)'
  node.mode = STMTLIST
  node.token = {type: '(program)', data: '(program)'}
  program = node

  stream.program = program
  stream.scope = function(scope) {
    if(arguments.length === 1) {
      state.scope = scope
    }
    return state.scope
  }

  state.unshift(node)
  return stream

  // stream functions ---------------------------------------------

  function write(input) {
    if(input.type === 'whitespace' || input.type === 'line-comment' || input.type === 'block-comment') {

      whitespace.push(input)
      return
    }
    tokens.push(input)
    token = token || tokens[0]

    if(token && whitespace.length) {
      token.preceding = token.preceding || []
      token.preceding = token.preceding.concat(whitespace)
      whitespace = []
    }

    while(take()) switch(state[0].mode) {
      case STMT: parse_stmt(); break
      case STMTLIST: parse_stmtlist(); break
      case DECL: parse_decl(); break
      case DECLLIST: parse_decllist(); break
      case EXPR: parse_expr(); break
      case STRUCT: parse_struct(true, true); break
      case PRECISION: parse_precision(); break
      case IDENT: parse_ident(); break
      case KEYWORD: parse_keyword(); break
      case KEYWORD_OR_IDENT: parse_keyword_or_ident(); break
      case FUNCTION: parse_function(); break
      case FUNCTIONARGS: parse_function_args(); break
      case FORLOOP: parse_forloop(); break
      case WHILELOOP: parse_whileloop(); break
      case DOWHILELOOP: parse_dowhileloop(); break
      case RETURN: parse_return(); break
      case IF: parse_if(); break
      case QUANTIFIER: parse_quantifier(); break
    }
  }
  
  function end(tokens) {
    if(arguments.length) {
      write(tokens)
    }

    if(state.length > 1) {
      unexpected('unexpected EOF')
      return
    }

    stream.emit('end')
  }

  function take() {
    if(errored || !state.length)
      return false

    return (token = tokens[0]) && !stream.paused
  }

  // ----- state manipulation --------

  function special_fake(x) {
    state.unshift(x)
    state.shift()
  }

  function special_unshift(_node, add_child) {
    _node.parent = state[0]

    var ret = [].unshift.call(this, _node)

    add_child = add_child === undefined ? true : add_child

    if(DEBUG) {
      var pad = ''
      for(var i = 0, len = this.length - 1; i < len; ++i) {
        pad += ' |'
      }
      console.log(pad, '\\'+_node.type, _node.token.data)
    }

    if(add_child && node !== _node) node.children.push(_node)
    node = _node

    return ret
  }

  function special_shift() {
    var _node = [].shift.call(this)
      , okay = check[this.length]
      , emit = false

    if(DEBUG) {
      var pad = ''
      for(var i = 0, len = this.length; i < len; ++i) {
        pad += ' |'
      }
      console.log(pad, '/'+_node.type)
    }

    if(check.length) { 
      if(typeof check[0] === 'function') {
        emit = check[0](_node)
      } else if(okay !== undefined) {
        emit = okay.test ? okay.test(_node.type) : okay === _node.type
      }
    } else {
      emit = true
    }

    if(emit) stream.emit('data', _node) 
  
    node = _node.parent
    return _node
  }

  // parse states ---------------

  function parse_stmtlist() {
    // determine the type of the statement
    // and then start parsing
    return stative(
      function() { state.scope.enter(); return Advance }
    , normal_mode
    )()

    function normal_mode() {
      if(token.data === state[0].expecting) {
        return state.scope.exit(), state.shift()
      }
      switch(token.type) {
        case 'preprocessor':
          state.fake(adhoc())
          tokens.shift()
        return
        default:
          state.unshift(stmt())
        return 
      }
    }
  }

  function parse_stmt() {
    if(state[0].brace) {
      if(token.data !== '}') {
        return unexpected('expected `}`, got '+token.data)
      }
      state[0].brace = false
      return tokens.shift(), state.shift()
    }
    switch(token.type) {
      case 'eof': return state.shift()
      case 'keyword': 
        switch(token.data) {
          case 'for': return state.unshift(forstmt());
          case 'if': return state.unshift(ifstmt());
          case 'while': return state.unshift(whilestmt());
          case 'do': return state.unshift(dowhilestmt());
          case 'break': return state.fake(mknode(BREAK, token)), tokens.shift()
          case 'continue': return state.fake(mknode(CONTINUE, token)), tokens.shift()
          case 'discard': return state.fake(mknode(DISCARD, token)), tokens.shift()
          case 'return': return state.unshift(returnstmt());
          case 'precision': return state.unshift(precision());
        }
        return state.unshift(decl(DECL_STATEMENT))
      case 'ident':
        var lookup
        if(lookup = state.scope.find(token.data)) {
          if(lookup.parent.type === 'struct') {
            // this is strictly untrue, you could have an
            // expr that starts with a struct constructor.
            //      ... sigh
            return state.unshift(decl(DECL_STATEMENT))
          }
          return state.unshift(expr(';'))
        }
      case 'operator':
        if(token.data === '{') {
          state[0].brace = true
          var n = stmtlist()
          n.expecting = '}'
          return tokens.shift(), state.unshift(n)
        }
        if(token.data === ';') {
          return tokens.shift(), state.shift()
        }
      default: return state.unshift(expr(';'))
    }
  }

  function parse_decl() {
    var stmt = state[0]

    return stative(
      invariant_or_not,
      storage_or_not,
      parameter_or_not,
      precision_or_not,
      struct_or_type,
      maybe_name,
      maybe_lparen,     // lparen means we're a function
      is_decllist,
      done
    )()

    function invariant_or_not() {
      if(token.data === 'invariant') {
        if(stmt.flags & DECL_ALLOW_INVARIANT) {
          state.unshift(keyword())
          return Advance
        } else {
          return unexpected('`invariant` is not allowed here') 
        }
      } else {
        state.fake(mknode(PLACEHOLDER, {data: '', position: token.position}))
        return Advance
      }
    }

    function storage_or_not() {
      if(is_storage(token)) {
        if(stmt.flags & DECL_ALLOW_STORAGE) {
          state.unshift(keyword()) 
          return Advance
        } else {
          return unexpected('storage is not allowed here') 
        }
      } else {
        state.fake(mknode(PLACEHOLDER, {data: '', position: token.position}))
        return Advance
      }
    }

    function parameter_or_not() {
      if(is_parameter(token)) {
        if(!(stmt.flags & DECL_NO_INOUT)) {
          state.unshift(keyword()) 
          return Advance
        } else {
          return unexpected('parameter is not allowed here') 
        }
      } else {
        state.fake(mknode(PLACEHOLDER, {data: '', position: token.position}))
        return Advance
      }
    }

    function precision_or_not() {
      if(is_precision(token)) {
        state.unshift(keyword())
        return Advance
      } else {
        state.fake(mknode(PLACEHOLDER, {data: '', position: token.position}))
        return Advance
      }
    }

    function struct_or_type() {
      if(token.data === 'struct') {
        if(!(stmt.flags & DECL_ALLOW_STRUCT)) {
          return unexpected('cannot nest structs')
        }
        state.unshift(struct())
        return Advance
      }

      if(token.type === 'keyword') {
        state.unshift(keyword())
        return Advance
      }

      var lookup = state.scope.find(token.data)

      if(lookup) {
        state.fake(Object.create(lookup))
        tokens.shift()
        return Advance  
      }
      return unexpected('expected user defined type, struct or keyword, got '+token.data)
    }

    function maybe_name() {
      if(token.data === ',' && !(stmt.flags & DECL_ALLOW_COMMA)) {
        return state.shift()
      }

      if(token.data === '[') {
        // oh lord.
        state.unshift(quantifier())
        return
      }

      if(token.data === ')') return state.shift()

      if(token.data === ';') {
        return stmt.stage + 3
      }

      if(token.type !== 'ident') {
        return unexpected('expected identifier, got '+token.data)
      }

      stmt.collected_name = tokens.shift()
      return Advance      
    }

    function maybe_lparen() {
      if(token.data === '(') {
        tokens.unshift(stmt.collected_name)
        delete stmt.collected_name
        state.unshift(fn())
        return stmt.stage + 2 
      }
      return Advance
    }

    function is_decllist() {
      tokens.unshift(stmt.collected_name)
      delete stmt.collected_name
      state.unshift(decllist())
      return Advance
    }

    function done() {
      return state.shift()
    }
  }
  
  function parse_decllist() {
    // grab ident

    if(token.type === 'ident') {
      var name = token.data
      state.unshift(ident())
      state.scope.define(name)
      return
    }

    if(token.type === 'operator') {

      if(token.data === ',') {
        // multi-decl!
        if(!(state[1].flags & DECL_ALLOW_COMMA)) {
          return state.shift()
        }

        return tokens.shift()
      } else if(token.data === '=') {
        if(!(state[1].flags & DECL_ALLOW_ASSIGN)) return unexpected('`=` is not allowed here.')

        tokens.shift()

        state.unshift(expr(',', ';'))
        return
      } else if(token.data === '[') {
        state.unshift(quantifier())
        return
      }
    }
    return state.shift()
  }

  function parse_keyword_or_ident() {
    if(token.type === 'keyword') {
      state[0].type = 'keyword'
      state[0].mode = KEYWORD
      return
    }

    if(token.type === 'ident') {
      state[0].type = 'ident'
      state[0].mode = IDENT
      return
    }

    return unexpected('expected keyword or user-defined name, got '+token.data)
  }

  function parse_keyword() {
    if(token.type !== 'keyword') {
      return unexpected('expected keyword, got '+token.data)
    }

    return state.shift(), tokens.shift()
  }

  function parse_ident() {
    if(token.type !== 'ident') {
      return unexpected('expected user-defined name, got '+token.data)
    }

    state[0].data = token.data
    return state.shift(), tokens.shift()
  }


  function parse_expr() {
    var expecting = state[0].expecting

    state[0].tokens = state[0].tokens || []

    if(state[0].parenlevel === undefined) {
      state[0].parenlevel = 0
      state[0].bracelevel = 0
    }
    if(state[0].parenlevel < 1 && expecting.indexOf(token.data) > -1) {
      return parseexpr(state[0].tokens)
    }
    if(token.data === '(') {
      ++state[0].parenlevel
    } else if(token.data === ')') {
      --state[0].parenlevel
    }

    switch(token.data) {
      case '{': ++state[0].bracelevel; break
      case '}': --state[0].bracelevel; break
      case '(': ++state[0].parenlevel; break
      case ')': --state[0].parenlevel; break
    }

    if(state[0].parenlevel < 0) return unexpected('unexpected `)`')
    if(state[0].bracelevel < 0) return unexpected('unexpected `}`')

    state[0].tokens.push(tokens.shift())
    return

    function parseexpr(tokens) {
      return full_parse_expr(state, tokens), state.shift()
    }
  }

  // node types ---------------

  function n(type) {
    // this is a function factory that suffices for most kinds of expressions and statements
    return function() {
      return mknode(type, token)
    }
  }

  function adhoc() {
    return mknode(token_map[token.type], token, node)
  }

  function decl(flags) {
    var _ = mknode(DECL, token, node)
    _.flags = flags

    return _
  }

  function struct(allow_assign, allow_comma) {
    var _ = mknode(STRUCT, token, node)
    _.allow_assign = allow_assign === undefined ? true : allow_assign
    _.allow_comma = allow_comma === undefined ? true : allow_comma
    return _
  }

  function expr() {
    var n = mknode(EXPR, token, node)

    n.expecting = [].slice.call(arguments)
    return n
  }
  
  function keyword(default_value) {
    var t = token
    if(default_value) {
      t = {'type': '(implied)', data: '(default)', position: t.position} 
    }
    return mknode(KEYWORD, t, node)
  }

  // utils ----------------------------

  function unexpected(str) {
    errored = true
    stream.emit('error', new Error(
      (str || 'unexpected '+state) +
      ' at line '+state[0].token.line
    ))
  }

  function assert(type, data) {
    return 1,
      assert_null_string_or_array(type, token.type) && 
      assert_null_string_or_array(data, token.data)
  }

  function assert_null_string_or_array(x, y) {
    switch(typeof x) {
      case 'string': if(y !== x) {
        unexpected('expected `'+x+'`, got '+y+'\n'+token.data);
      } return !errored

      case 'object': if(x && x.indexOf(y) === -1) {
        unexpected('expected one of `'+x.join('`, `')+'`, got '+y);
      } return !errored
    }
    return true
  }

  // stative ----------------------------

  function stative() {
    var steps = [].slice.call(arguments)
      , step
      , result

    return function() {
      var current = state[0]

      current.stage || (current.stage = 0)

      step = steps[current.stage]
      if(!step) return unexpected('parser in undefined state!')

      result = step()

      if(result === Advance) return ++current.stage
      if(result === undefined) return
      current.stage = result
    } 
  }

  function advance(op, t) {
    t = t || 'operator'
    return function() {
      if(!assert(t, op)) return

      var last = tokens.shift()
        , children = state[0].children
        , last_node = children[children.length - 1]

      if(last_node && last_node.token && last.preceding) {
        last_node.token.succeeding = last_node.token.succeeding || []
        last_node.token.succeeding = last_node.token.succeeding.concat(last.preceding)
      }
      return Advance
    }
  }

  function advance_expr(until) {
    return function() { return state.unshift(expr(until)), Advance }
  }

  function advance_ident(declare) {
    return declare ? function() {
      var name = token.data
      return assert('ident') && (state.unshift(ident()), state.scope.define(name), Advance)
    } :  function() {
      if(!assert('ident')) return

      var s = Object.create(state.scope.find(token.data))
      s.token = token

      return (tokens.shift(), Advance)
    }
  }

  function advance_stmtlist() {
    return function() {
      var n = stmtlist()
      n.expecting = '}'
      return state.unshift(n), Advance
    }
  }

  function maybe_stmtlist(skip) {
    return function() {
      var current = state[0].stage
      if(token.data !== '{') { return state.unshift(stmt()), current + skip }
      return tokens.shift(), Advance
    }
  }

  function popstmt() {
    return function() { return state.shift(), state.shift() }
  }


  function setup_stative_parsers() {

    // could also be
    // struct { } decllist
    parse_struct =
        stative(
          advance('struct', 'keyword')
        , function() {
            if(token.data === '{') {
              state.fake(mknode(IDENT, {data:'', position: token.position, type:'ident'}))
              return Advance
            }

            return advance_ident(true)()
          }
        , function() { state.scope.enter(); return Advance }
        , advance('{')
        , function() {
            if(token.data === '}') {
              state.scope.exit()
              tokens.shift()
              return state.shift()
            }
            if(token.data === ';') { tokens.shift(); return }
            state.unshift(decl(DECL_STRUCT))
          }
        )

    parse_precision =
        stative(
          function() { return tokens.shift(), Advance }
        , function() { 
            return assert(
            'keyword', ['lowp', 'mediump', 'highp']
            ) && (state.unshift(keyword()), Advance) 
          }
        , function() { return (state.unshift(keyword()), Advance) }
        , function() { return state.shift() } 
        )

    parse_quantifier =
        stative(
          advance('[')
        , advance_expr(']')
        , advance(']')
        , function() { return state.shift() }
        )

    parse_forloop = 
        stative(
          advance('for', 'keyword')
        , advance('(')
        , function() {
            var lookup
            if(token.type === 'ident') {
              if(!(lookup = state.scope.find(token.data))) {
                lookup = state.create_node()
              }
             
              if(lookup.parent.type === 'struct') {
                return state.unshift(decl(DECL_STATEMENT)), Advance
              }
            } else if(token.type === 'builtin' || token.type === 'keyword') {
              return state.unshift(decl(DECL_STATEMENT)), Advance
            }
            return advance_expr(';')()
          }
        , advance(';')
        , advance_expr(';')
        , advance(';')
        , advance_expr(')')
        , advance(')')
        , maybe_stmtlist(3)
        , advance_stmtlist()
        , advance('}')
        , popstmt()
        )

    parse_if = 
        stative(
          advance('if', 'keyword')
        , advance('(')
        , advance_expr(')')
        , advance(')')
        , maybe_stmtlist(3)
        , advance_stmtlist()
        , advance('}')
        , function() {
            if(token.data === 'else') {
              return tokens.shift(), state.unshift(stmt()), Advance
            }
            return popstmt()()
          }
        , popstmt()
        )

    parse_return =
        stative(
          advance('return', 'keyword')
        , function() {
            if(token.data === ';') return Advance
            return state.unshift(expr(';')), Advance
          }
        , function() { tokens.shift(), popstmt()() } 
        )

    parse_whileloop =
        stative(
          advance('while', 'keyword')
        , advance('(')
        , advance_expr(')')
        , advance(')')
        , maybe_stmtlist(3)
        , advance_stmtlist()
        , advance('}')
        , popstmt()
        )

    parse_dowhileloop = 
      stative(
        advance('do', 'keyword')
      , maybe_stmtlist(3)
      , advance_stmtlist()
      , advance('}')
      , advance('while', 'keyword')
      , advance('(')
      , advance_expr(')')
      , advance(')')
      , popstmt()
      )

    parse_function =
      stative(
        function() {
          for(var i = 1, len = state.length; i < len; ++i) if(state[i].mode === FUNCTION) {
            return unexpected('function definition is not allowed within another function')
          }

          return Advance
        }
      , function() {
          if(!assert("ident")) return

          var name = token.data
            , lookup = state.scope.find(name)

          state.unshift(ident())
          state.scope.define(name)

          state.scope.enter(lookup ? lookup.scope : null)
          return Advance
        }
      , advance('(')
      , function() { return state.unshift(fnargs()), Advance }
      , advance(')')
      , function() { 
          // forward decl
          if(token.data === ';') {
            return state.scope.exit(), state.shift(), state.shift()
          }
          return Advance
        }
      , advance('{')
      , advance_stmtlist()
      , advance('}')
      , function() { state.scope.exit(); return Advance } 
      , function() { return state.shift(), state.shift(), state.shift() }
      )

    parse_function_args =
      stative(
        function() {
          if(token.data === 'void') { state.fake(keyword()); tokens.shift(); return Advance }
          if(token.data === ')') { state.shift(); return }
          if(token.data === 'struct') {
            state.unshift(struct(NO_ASSIGN_ALLOWED, NO_COMMA_ALLOWED))
            return Advance
          }
          state.unshift(decl(DECL_FUNCTION))
          return Advance
        }
      , function() {
          if(token.data === ',') { tokens.shift(); return 0 }
          if(token.data === ')') { state.shift(); return }
          unexpected('expected one of `,` or `)`, got '+token.data)
        }
      )
  }
}

function mknode(mode, sourcetoken) {
  return {
      mode: mode
    , token: sourcetoken
    , children: []
    , type: stmt_type[mode]
//    , id: (Math.random() * 0xFFFFFFFF).toString(16)
  }
}

function is_storage(token) {
  return token.data === 'const' ||
         token.data === 'attribute' ||
         token.data === 'uniform' ||
         token.data === 'varying'
}

function is_parameter(token) {
  return token.data === 'in' ||
         token.data === 'inout' ||
         token.data === 'out'
}

function is_precision(token) {
  return token.data === 'highp' ||
         token.data === 'mediump' ||
         token.data === 'lowp'
}

},{"../../through":30,"./expr":23,"./scope":25}],25:[function(require,module,exports){
module.exports = scope

function scope(state) {
  if(this.constructor !== scope)
    return new scope(state)

  this.state = state
  this.scopes = []
  this.current = null
}

var cons = scope
  , proto = cons.prototype

proto.enter = function(s) {
  this.scopes.push(
    this.current = this.state[0].scope = s || {}
  )
}

proto.exit = function() {
  this.scopes.pop()
  this.current = this.scopes[this.scopes.length - 1]
}

proto.define = function(str) {
  this.current[str] = this.state[0]
}

proto.find = function(name, fail) {
  for(var i = this.scopes.length - 1; i > -1; --i) {
    if(this.scopes[i].hasOwnProperty(name)) {
      return this.scopes[i][name]
    }
  }

  return null
}

},{}],26:[function(require,module,exports){
module.exports = tokenize

var through = require('../through')

var literals = require('./lib/literals')
  , operators = require('./lib/operators')
  , builtins = require('./lib/builtins')

var NORMAL = 999          // <-- never emitted
  , TOKEN = 9999          // <-- never emitted 
  , BLOCK_COMMENT = 0 
  , LINE_COMMENT = 1
  , PREPROCESSOR = 2
  , OPERATOR = 3
  , INTEGER = 4
  , FLOAT = 5
  , IDENT = 6
  , BUILTIN = 7
  , KEYWORD = 8
  , WHITESPACE = 9
  , EOF = 10 
  , HEX = 11

var map = [
    'block-comment'
  , 'line-comment'
  , 'preprocessor'
  , 'operator'
  , 'integer'
  , 'float'
  , 'ident'
  , 'builtin'
  , 'keyword'
  , 'whitespace'
  , 'eof'
  , 'integer'
]

function tokenize() {
  var stream = through(write, end)

  var i = 0
    , total = 0
    , mode = NORMAL 
    , c
    , last
    , content = []
    , token_idx = 0
    , token_offs = 0
    , line = 1
    , start = 0
    , isnum = false
    , isoperator = false
    , input = ''
    , len

  return stream

  function token(data) {
    if(data.length) {
      stream.queue({
        type: map[mode]
      , data: data
      , position: start
      , line: line
      })
    }
  }

  function write(chunk) {
    i = 0
    input += chunk.toString()
    len = input.length

    while(c = input[i], i < len) switch(mode) {
      case BLOCK_COMMENT: i = block_comment(); break
      case LINE_COMMENT: i = line_comment(); break
      case PREPROCESSOR: i = preprocessor(); break 
      case OPERATOR: i = operator(); break
      case INTEGER: i = integer(); break
      case HEX: i = hex(); break
      case FLOAT: i = decimal(); break
      case TOKEN: i = readtoken(); break
      case WHITESPACE: i = whitespace(); break
      case NORMAL: i = normal(); break
    }

    total += i
    input = input.slice(i)
  } 

  function end(chunk) {
    if(content.length) {
      token(content.join(''))
    }

    mode = EOF
    token('(eof)')

    stream.queue(null)
  }

  function normal() {
    content = content.length ? [] : content

    if(last === '/' && c === '*') {
      start = total + i - 1
      mode = BLOCK_COMMENT
      last = c
      return i + 1
    }

    if(last === '/' && c === '/') {
      start = total + i - 1
      mode = LINE_COMMENT
      last = c
      return i + 1
    }

    if(c === '#') {
      mode = PREPROCESSOR
      start = total + i
      return i
    }

    if(/\s/.test(c)) {
      mode = WHITESPACE
      start = total + i
      return i
    }

    isnum = /\d/.test(c)
    isoperator = /[^\w_]/.test(c)

    start = total + i
    mode = isnum ? INTEGER : isoperator ? OPERATOR : TOKEN
    return i
  }

  function whitespace() {
    if(c === '\n') ++line

    if(/[^\s]/g.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }

  function preprocessor() {
    if(c === '\n') ++line

    if(c === '\n' && last !== '\\') {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }

  function line_comment() {
    return preprocessor()
  }

  function block_comment() {
    if(c === '/' && last === '*') {
      content.push(c)
      token(content.join(''))
      mode = NORMAL
      return i + 1
    }

    if(c === '\n') ++line

    content.push(c)
    last = c
    return i + 1
  }

  function operator() {
    if(last === '.' && /\d/.test(c)) {
      mode = FLOAT
      return i
    }

    if(last === '/' && c === '*') {
      mode = BLOCK_COMMENT
      return i
    }

    if(last === '/' && c === '/') {
      mode = LINE_COMMENT
      return i
    }

    if(c === '.' && content.length) {
      while(determine_operator(content));
      
      mode = FLOAT
      return i
    }

    if(c === ';') {
      if(content.length) while(determine_operator(content));
      token(c)
      mode = NORMAL
      return i + 1
    }

    var is_composite_operator = content.length === 2 && c !== '='
    if(/[\w_\d\s]/.test(c) || is_composite_operator) {
      while(determine_operator(content));
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function determine_operator(buf) {
    var j = 0
      , k = buf.length
      , idx

    do {
      idx = operators.indexOf(buf.slice(0, buf.length + j).join(''))
      if(idx === -1) { 
        j -= 1
        k -= 1
        if (k < 0) return 0
        continue
      }
      
      token(operators[idx])

      start += operators[idx].length
      content = content.slice(operators[idx].length)
      return content.length
    } while(1)
  }

  function hex() {
    if(/[^a-fA-F0-9]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1    
  }

  function integer() {
    if(c === '.') {
      content.push(c)
      mode = FLOAT
      last = c
      return i + 1
    }

    if(/[eE]/.test(c)) {
      content.push(c)
      mode = FLOAT
      last = c
      return i + 1
    }

    if(c === 'x' && content.length === 1 && content[0] === '0') {
      mode = HEX
      content.push(c)
      last = c
      return i + 1
    }

    if(/[^\d]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function decimal() {
    if(c === 'f') {
      content.push(c)
      last = c
      i += 1
    }

    if(/[eE]/.test(c)) {
      content.push(c)
      last = c
      return i + 1
    }

    if(/[^\d]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }

  function readtoken() {
    if(/[^\d\w_]/.test(c)) {
      var contentstr = content.join('')
      if(literals.indexOf(contentstr) > -1) {
        mode = KEYWORD
      } else if(builtins.indexOf(contentstr) > -1) {
        mode = BUILTIN
      } else {
        mode = IDENT
      }
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }
}

},{"../through":30,"./lib/builtins":27,"./lib/literals":28,"./lib/operators":29}],27:[function(require,module,exports){
module.exports = [
    'gl_Position'
  , 'gl_PointSize'
  , 'gl_ClipVertex'
  , 'gl_FragCoord'
  , 'gl_FrontFacing'
  , 'gl_FragColor'
  , 'gl_FragData'
  , 'gl_FragDepth'
  , 'gl_Color'
  , 'gl_SecondaryColor'
  , 'gl_Normal'
  , 'gl_Vertex'
  , 'gl_MultiTexCoord0'
  , 'gl_MultiTexCoord1'
  , 'gl_MultiTexCoord2'
  , 'gl_MultiTexCoord3'
  , 'gl_MultiTexCoord4'
  , 'gl_MultiTexCoord5'
  , 'gl_MultiTexCoord6'
  , 'gl_MultiTexCoord7'
  , 'gl_FogCoord'
  , 'gl_MaxLights'
  , 'gl_MaxClipPlanes'
  , 'gl_MaxTextureUnits'
  , 'gl_MaxTextureCoords'
  , 'gl_MaxVertexAttribs'
  , 'gl_MaxVertexUniformComponents'
  , 'gl_MaxVaryingFloats'
  , 'gl_MaxVertexTextureImageUnits'
  , 'gl_MaxCombinedTextureImageUnits'
  , 'gl_MaxTextureImageUnits'
  , 'gl_MaxFragmentUniformComponents'
  , 'gl_MaxDrawBuffers'
  , 'gl_ModelViewMatrix'
  , 'gl_ProjectionMatrix'
  , 'gl_ModelViewProjectionMatrix'
  , 'gl_TextureMatrix'
  , 'gl_NormalMatrix'
  , 'gl_ModelViewMatrixInverse'
  , 'gl_ProjectionMatrixInverse'
  , 'gl_ModelViewProjectionMatrixInverse'
  , 'gl_TextureMatrixInverse'
  , 'gl_ModelViewMatrixTranspose'
  , 'gl_ProjectionMatrixTranspose'
  , 'gl_ModelViewProjectionMatrixTranspose'
  , 'gl_TextureMatrixTranspose'
  , 'gl_ModelViewMatrixInverseTranspose'
  , 'gl_ProjectionMatrixInverseTranspose'
  , 'gl_ModelViewProjectionMatrixInverseTranspose'
  , 'gl_TextureMatrixInverseTranspose'
  , 'gl_NormalScale'
  , 'gl_DepthRangeParameters'
  , 'gl_DepthRange'
  , 'gl_ClipPlane'
  , 'gl_PointParameters'
  , 'gl_Point'
  , 'gl_MaterialParameters'
  , 'gl_FrontMaterial'
  , 'gl_BackMaterial'
  , 'gl_LightSourceParameters'
  , 'gl_LightSource'
  , 'gl_LightModelParameters'
  , 'gl_LightModel'
  , 'gl_LightModelProducts'
  , 'gl_FrontLightModelProduct'
  , 'gl_BackLightModelProduct'
  , 'gl_LightProducts'
  , 'gl_FrontLightProduct'
  , 'gl_BackLightProduct'
  , 'gl_FogParameters'
  , 'gl_Fog'
  , 'gl_TextureEnvColor'
  , 'gl_EyePlaneS'
  , 'gl_EyePlaneT'
  , 'gl_EyePlaneR'
  , 'gl_EyePlaneQ'
  , 'gl_ObjectPlaneS'
  , 'gl_ObjectPlaneT'
  , 'gl_ObjectPlaneR'
  , 'gl_ObjectPlaneQ'
  , 'gl_FrontColor'
  , 'gl_BackColor'
  , 'gl_FrontSecondaryColor'
  , 'gl_BackSecondaryColor'
  , 'gl_TexCoord'
  , 'gl_FogFragCoord'
  , 'gl_Color'
  , 'gl_SecondaryColor'
  , 'gl_TexCoord'
  , 'gl_FogFragCoord'
  , 'gl_PointCoord'
  , 'radians'
  , 'degrees'
  , 'sin'
  , 'cos'
  , 'tan'
  , 'asin'
  , 'acos'
  , 'atan'
  , 'pow'
  , 'exp'
  , 'log'
  , 'exp2'
  , 'log2'
  , 'sqrt'
  , 'inversesqrt'
  , 'abs'
  , 'sign'
  , 'floor'
  , 'ceil'
  , 'fract'
  , 'mod'
  , 'min'
  , 'max'
  , 'clamp'
  , 'mix'
  , 'step'
  , 'smoothstep'
  , 'length'
  , 'distance'
  , 'dot'
  , 'cross'
  , 'normalize'
  , 'faceforward'
  , 'reflect'
  , 'refract'
  , 'matrixCompMult'
  , 'lessThan'
  , 'lessThanEqual'
  , 'greaterThan'
  , 'greaterThanEqual'
  , 'equal'
  , 'notEqual'
  , 'any'
  , 'all'
  , 'not'
  , 'texture2D'
  , 'texture2DProj'
  , 'texture2DLod'
  , 'texture2DProjLod'
  , 'textureCube'
  , 'textureCubeLod'
]

},{}],28:[function(require,module,exports){
module.exports = [
  // current
    'precision'
  , 'highp'
  , 'mediump'
  , 'lowp'
  , 'attribute'
  , 'const'
  , 'uniform'
  , 'varying'
  , 'break'
  , 'continue'
  , 'do'
  , 'for'
  , 'while'
  , 'if'
  , 'else'
  , 'in'
  , 'out'
  , 'inout'
  , 'float'
  , 'int'
  , 'void'
  , 'bool'
  , 'true'
  , 'false'
  , 'discard'
  , 'return'
  , 'mat2'
  , 'mat3'
  , 'mat4'
  , 'vec2'
  , 'vec3'
  , 'vec4'
  , 'ivec2'
  , 'ivec3'
  , 'ivec4'
  , 'bvec2'
  , 'bvec3'
  , 'bvec4'
  , 'sampler1D'
  , 'sampler2D'
  , 'sampler3D'
  , 'samplerCube'
  , 'sampler1DShadow'
  , 'sampler2DShadow'
  , 'struct'

  // future
  , 'asm'
  , 'class'
  , 'union'
  , 'enum'
  , 'typedef'
  , 'template'
  , 'this'
  , 'packed'
  , 'goto'
  , 'switch'
  , 'default'
  , 'inline'
  , 'noinline'
  , 'volatile'
  , 'public'
  , 'static'
  , 'extern'
  , 'external'
  , 'interface'
  , 'long'
  , 'short'
  , 'double'
  , 'half'
  , 'fixed'
  , 'unsigned'
  , 'input'
  , 'output'
  , 'hvec2'
  , 'hvec3'
  , 'hvec4'
  , 'dvec2'
  , 'dvec3'
  , 'dvec4'
  , 'fvec2'
  , 'fvec3'
  , 'fvec4'
  , 'sampler2DRect'
  , 'sampler3DRect'
  , 'sampler2DRectShadow'
  , 'sizeof'
  , 'cast'
  , 'namespace'
  , 'using'
]

},{}],29:[function(require,module,exports){
module.exports = [
    '<<='
  , '>>='
  , '++'
  , '--'
  , '<<'
  , '>>'
  , '<='
  , '>='
  , '=='
  , '!='
  , '&&'
  , '||'
  , '+='
  , '-='
  , '*='
  , '/='
  , '%='
  , '&='
  , '^='
  , '|='
  , '('
  , ')'
  , '['
  , ']'
  , '.'
  , '!'
  , '~'
  , '*'
  , '/'
  , '%'
  , '+'
  , '-'
  , '<'
  , '>'
  , '&'
  , '^'
  , '|'
  , '?'
  , ':'
  , '='
  , ','
  , ';'
  , '{'
  , '}'
]

},{}],30:[function(require,module,exports){
var through;

through = function(write, end) {
  var errors, output;
  output = [];
  errors = [];
  return {
    output: output,
    parser: null,
    write: write,
    end: end,
    process: function(parser, data) {
      this.parser = parser;
      write(data);
      this.flush();
      return this.parser.flush();
    },
    flush: function() {
      end();
      return [output, errors];
    },
    queue: function(obj) {
      var _ref;
      if (obj != null) {
        return (_ref = this.parser) != null ? _ref.write(obj) : void 0;
      }
    },
    emit: function(type, node) {
      if (type === 'data') {
        if (node.parent == null) {
          output.push(node);
        }
      }
      if (type === 'error') {
        return errors.push(node);
      }
    }
  };
};

module.exports = through;


},{}]},{},[11])