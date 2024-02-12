// Generated by CoffeeScript 2.7.0
(function () {
  //########
  // To help alter the DOM

  var DomBuilder;

  exports.DomBuilder = DomBuilder = class DomBuilder {
    constructor(tag = null) {
      var root;
      this.root = root =
        tag === null ? document.createDocumentFragment() : document.createElement(tag);
      this.current = this.root;
      this.vars = {};
    }

    tag(name) {
      var e;
      this.current.appendChild((e = document.createElement(name)));
      this.current = e;
      return this;
    }

    store(varname) {
      this.vars[varname] = this.current;
      return this;
    }

    rtag(var_name, name) {
      this.tag(name);
      return this.store(var_name);
    }

    end() {
      var cur;
      this.current = cur = this.current.parentNode;
      if (cur === null) {
        throw new Error("Too many end()'s");
      }
      return this;
    }

    text(txt) {
      this.current.appendChild(document.createTextNode(txt));
      return this;
    }

    a(name, value) {
      this.current.setAttribute(name, value);
      return this;
    }

    append(elementReference) {
      this.current.appendChild(elementReference);
      return this;
    }

    DIV() {
      return this.tag("div");
    }

    A() {
      return this.tag("a");
    }

    SPAN() {
      return this.tag("span");
    }

    ID(id) {
      return this.a("id", id);
    }

    CLASS(cls) {
      return this.a("class", cls);
    }

    finalize() {
      var r;
      r = this.root;
      this.root = this.current = this.vars = null;
      return r;
    }
  };

  //Usage:
  // dom = new DimBuilder
  // dom.tag("div").a("id", "my-div").a("class","toolbar").end()
}).call(this);