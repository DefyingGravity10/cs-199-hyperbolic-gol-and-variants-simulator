(function () { function r(e, n, t) { function o(i, f) { if (!n[i]) { if (!e[i]) { var c = "function" == typeof require && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = "MODULE_NOT_FOUND", a } var p = n[i] = { exports: {} }; e[i][0].call(p.exports, function (r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({
  1: [function (require, module, exports) {
    Math.acosh = Math.acosh || function (x) {
      return Math.log(x + Math.sqrt(x * x - 1));
    };


  }, {}], 2: [function (require, module, exports) {
    var ChainMap, evaluateTotalisticAutomaton, neighborsSum;

    ({ ChainMap } = require("./chain_map.coffee"));

    exports.neighborsSum = neighborsSum = function (cells, tiling, plus = (function (x, y) {
      return x + y;
    }), plusInitial = 0) {
      var sums;
      sums = new ChainMap();
      cells.forItems(function (cell, value) {
        var i, len, neighbor, ref;
        ref = tiling.moore(cell);
        for (i = 0, len = ref.length; i < len; i++) {
          neighbor = ref[i];
          sums.putAccumulate(neighbor, value, plus, plusInitial);
        }
        //don't forget the cell itself! It must also present, with zero (initial) neighbor sum
        if (sums.get(cell) === null) {
          return sums.put(cell, plusInitial);
        }
      });
      return sums;
    };

    exports.evaluateTotalisticAutomaton = evaluateTotalisticAutomaton = function (cells, tiling, nextStateFunc, plus, plusInitial) {
      var newCells, sums;
      newCells = new ChainMap();
      sums = neighborsSum(cells, tiling, plus, plusInitial);
      sums.forItems(function (cell, neighSum) {
        var cellState, nextState, ref;
        cellState = (ref = cells.get(cell)) != null ? ref : 0;
        nextState = nextStateFunc(cellState, neighSum);
        if (nextState !== 0) {
          return newCells.put(cell, nextState);
        }
      });
      return newCells;
    };


  }, { "./chain_map.coffee": 3 }], 3: [function (require, module, exports) {
    //Hash map that uses chain as key
    var ChainMap;

    exports.ChainMap = ChainMap = class ChainMap {
      constructor(initialSize = 16) {
        var i;
        //table size MUST be power of 2! Or else write your own implementation of % that works with negative hashes.
        if (initialSize & (initialSize - 1) !== 0) { //this trick works!
          throw new Error("size must be power of 2");
        }
        this.table = (function () {
          var j, ref, results;
          results = [];
          for (i = j = 0, ref = initialSize; j < ref; i = j += 1) {
            results.push([]);
          }
          return results;
        })();
        this.count = 0;
        this.maxFillRatio = 0.7;
        this.sizeMask = initialSize - 1;
      }

      _index(chain) {
        return chain.hash() & this.sizeMask;
      }

      putAccumulate(chain, value, accumulateFunc, accumulateInitial) {
        var cell, j, key_value, len;
        cell = this.table[this._index(chain)];
        for (j = 0, len = cell.length; j < len; j++) {
          key_value = cell[j];
          if (key_value[0].equals(chain)) {
            //Update existing value
            key_value[1] = accumulateFunc(key_value[1], value);
            return;
          }
        }
        cell.push([chain, accumulateFunc(accumulateInitial, value)]);
        this.count += 1;
        if (this.count > this.maxFillRatio * this.table.length) {
          this._growTable();
        }
        return this;
      }

      put(chain, value) {
        return this.putAccumulate(chain, value, function (x, y) {
          return y;
        });
      }

      get(chain) {
        var j, key_value, len, ref;
        ref = this.table[this._index(chain)];
        // console.log "geting for #{chain}"
        for (j = 0, len = ref.length; j < len; j++) {
          key_value = ref[j];
          if (key_value[0].equals(chain)) {
            //console.log "   found something"
            return key_value[1];
          }
        }
        //console.log "   not found"
        return null;
      }

      remove(chain) {
        var index, j, key_value, len, tableCell;
        tableCell = this.table[this._index(chain)];
        for (index = j = 0, len = tableCell.length; j < len; index = ++j) {
          key_value = tableCell[index];
          if (key_value[0].equals(chain)) {
            tableCell.splice(index, 1);
            this.count -= 1;
            return true;
          }
        }
        return false;
      }

      _growTable() {
        var cell, j, k, key, len, len1, newTable, ref, value;
        newTable = new ChainMap(this.table.length * 2);
        ref = this.table;
        //console.log "Growing table to #{newTable.table.length}"
        for (j = 0, len = ref.length; j < len; j++) {
          cell = ref[j];
          for (k = 0, len1 = cell.length; k < len1; k++) {
            [key, value] = cell[k];
            newTable.put(key, value);
          }
        }
        this.table = newTable.table;
        this.sizeMask = newTable.sizeMask;
      }

      forItems(callback) {
        var cell, j, k, key, len, len1, ref, value;
        ref = this.table;
        for (j = 0, len = ref.length; j < len; j++) {
          cell = ref[j];
          for (k = 0, len1 = cell.length; k < len1; k++) {
            [key, value] = cell[k];
            callback(key, value);
          }
        }
      }

      copy() {
        var cell, copied, key_value;
        copied = new ChainMap(1); //minimal size
        copied.count = this.count;
        copied.maxFillRatio = this.maxFillRatio;
        copied.sizeMask = this.sizeMask;
        copied.table = (function () {
          var j, len, ref, results;
          ref = this.table;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            cell = ref[j];
            results.push((function () {
              var k, len1, results1;
              results1 = [];
              for (k = 0, len1 = cell.length; k < len1; k++) {
                key_value = cell[k];
                results1.push(key_value.slice(0));
              }
              return results1;
            })());
          }
          return results;
        }).call(this);
        return copied;
      }

    };


  }, {}], 4: [function (require, module, exports) {
    var M, decomposeToTranslations, decomposeToTranslations2, decomposeToTranslationsFmin, fminsearch;

    M = require("./matrix3.coffee");

    ({ fminsearch } = require("./fminsearch.coffee"));

    //{hyperbolicRealJordan}= require "./hyperbolic_jordan"
    exports.decomposeToTranslations2 = decomposeToTranslations2 = function (m) { };

    // M = V D V^-1

    //   D is diag [1, exp(d), exp(-d)]
    // In the same time

    // M = T^-1 Tau T  
    //   where T, Tau are pure translations
    // Therefore,
    //   Tau = R Tau0 R^-1
    //   where R is pure rotation, Tau0 - translation along x.

    // Therefore
    //   Tau0 = V0 D V0^-1

    // where V0 [ 0,1,1; 1,0,0; 0,1,-1]

    // Combining this

    // V D V^-1 =  T^-1 R V0 S D S^-1 V0^-1 R^-1 T  

    // V = T^-1 R V0 S

    // where S - arbitrary nonzero diagonal matrix
    // T^-1 R = V S^-1 V0^-1
    exports.decomposeToTranslations = decomposeToTranslations = function (m, eps = 1e-5) {
      var angle, fitness, res, shiftAndDecompose, t1x, t1y, t2x, t2y;
      //Another idea, reducing number of parameters

      // Approximate paramters of matrix T1, fitness is rotation amount of the T2
      shiftAndDecompose = function ([t1x, t1y]) {
        var T1, Tau, iT1;
        T1 = M.translationMatrix(t1x, t1y);
        iT1 = M.hyperbolicInv(T1);
        Tau = M.mul(T1, M.mul(m, iT1));
        //decompose Tau to rotation and translation part
        return M.hyperbolicDecompose(Tau);
      };
      //fitness is absolute value of angle
      fitness = function (t1xy) {
        return Math.abs(shiftAndDecompose(t1xy)[0]);
      };
      res = fminsearch(fitness, [0.0, 0.0], 0.1, eps);
      if (res.reached && res.f < eps * 10) {
        [t1x, t1y] = res.x;
        [angle, t2x, t2y] = shiftAndDecompose([t1x, t1y]);
        return [M.translationMatrix(t1x, t1y), M.translationMatrix(t2x, t2y)];
      } else {
        return [null, null];
      }
    };

    exports.decomposeToTranslationsFmin = decomposeToTranslationsFmin = function (m, eps = 1e-5) {
      var dx1, dx2, dy1, dy2, fitness, res, t1, t2, x;
      //Decompose hyperbolic matrix to 3 translations: M = T1^-1 T2 T1
      //not always possible.
      fitness = function ([dx1, dy1, dx2, dy2]) {
        var d, t1, t2;
        t1 = M.translationMatrix(dx1, dy1);
        t2 = M.translationMatrix(dx2, dy2);
        //calculate difference
        d = M.mul(M.hyperbolicInv(t1), M.mul(t2, t1));
        M.addScaledInplace(d, m, -1);
        return M.amplitude(d);
      };
      //detect transllation
      x = M.mulv(m, [0, 0, 1]);
      res = fminsearch(fitness, [0.0, 0.0, x[0], x[1]], 0.1, eps);
      if (res.reached && res.f < eps * 10) {
        [dx1, dy1, dx2, dy2] = res.x;
        t1 = M.translationMatrix(dx1, dy1);
        t2 = M.translationMatrix(dx2, dy2);
        return [t1, t2];
      } else {
        return [null, null];
      }
    };

    exports.decomposeToTranslationsAggresively = function (m, eps = 1e-5, attempts = 1000) {
      var angle, attempt, d, decomposeTranslated, i, ref, t0, t1, t2, x;

      //detect range
      x = M.mulv(m, [0, 0, 1]);
      d = Math.sqrt(x[0] ** 2 + x[1] ** 2);
      decomposeTranslated = function (t0, eps) {
        var mPrime, t1, t2;
        mPrime = M.mul(M.hyperbolicInv(t0), M.mul(m, t0));
        [t1, t2] = decomposeToTranslationsFmin(mPrime, eps);
        //t0^-1 m t0 = t1^-1 t2 t1
        // m = t0 t1^-1 t2 t1 t0^-1

        if (t1 !== null) {
          return [M.mul(t1, M.hyperbolicInv(t0)), t2];
        } else {
          return [null, null];
        }
      };
      //attempts with radom pre-translation
      for (attempt = i = 0, ref = attempts; (0 <= ref ? i < ref : i > ref); attempt = 0 <= ref ? ++i : --i) {
        d = Math.random() * d * 3;
        angle = Math.random() * Math.PI * 2;
        t0 = M.translationMatrix(d * Math.cos(angle), d * Math.sin(angle));
        [t1, t2] = decomposeTranslated(t0, 1e-2);
        if (t1 !== null) {
          //fine optiomization
          console.log("fine optimization");
          return decomposeTranslated(t1);
        }
      }
      console.log("All attempts failed");
      return [null, null];
    };


  }, { "./fminsearch.coffee": 6, "./matrix3.coffee": 8 }], 5: [function (require, module, exports) {
    var ChainMap, extractClusterAt, importFieldTo, newNode, unity;

    ({ unity, newNode } = require("./vondyck_chain.coffee"));

    ({ ChainMap } = require("./chain_map.coffee"));

    //High-level utils for working with hyperbolic cellular fields
    exports.extractClusterAt = extractClusterAt = function (cells, tiling, chain) {
      var c, cluster, i, len, neighbor, ref, stack;
      //use cycle instead of recursion in order to avoid possible stack overflow.
      //Clusters may be big.
      stack = [chain];
      cluster = [];
      while (stack.length > 0) {
        c = stack.pop();
        if (cells.get(c) === null) {
          continue;
        }
        cells.remove(c);
        cluster.push(c);
        ref = tiling.moore(c);
        for (i = 0, len = ref.length; i < len; i++) {
          neighbor = ref[i];
          if (cells.get(neighbor) !== null) {
            stack.push(neighbor);
          }
        }
      }
      return cluster;
    };

    exports.allClusters = function (cells, tiling) {
      var cellsCopy, clusters;
      cellsCopy = cells.copy();
      clusters = [];
      cells.forItems(function (chain, value) {
        if (cellsCopy.get(chain) !== null) {
          return clusters.push(extractClusterAt(cellsCopy, tiling, chain));
        }
      });
      return clusters;
    };


    //Generate JS object from this field.
    // object tries to efectively store states of the field cells in the tree.
    // Position of echa cell is represented by chain.
    // Chains can be long; for nearby chains, their tails are the same.
    // Storing chains in list would cause duplication of repeating tails.

    // Object structure:
    // {
    //   g: 'a' or 'b', name of the group generator. Not present in root!
    //   p: integer, power of the generator. Not present in root!
    //   [v:] value of the cell. Optional.
    //   [cs]: [children] array of child trees
    // }
    exports.exportField = function (cells) {
      var chain2treeNode, putChain, root;
      root = {};
      chain2treeNode = new ChainMap();
      chain2treeNode.put(unity, root);
      putChain = function (chain) { //returns tree node for that chain
        var node, parentNode;
        node = chain2treeNode.get(chain);
        if (node === null) {
          parentNode = putChain(chain.t);
          node = {};
          node[chain.letter] = chain.p;
          if (parentNode.cs != null) {
            parentNode.cs.push(node);
          } else {
            parentNode.cs = [node];
          }
          chain2treeNode.put(chain, node);
        }
        return node;
      };
      cells.forItems(function (chain, value) {
        return putChain(chain).v = value;
      });
      return root;
    };

    exports.importFieldTo = importFieldTo = function (fieldData, callback) {
      var putNode;
      putNode = function (rootChain, rootNode) {
        var childNode, i, len, ref;
        if (rootNode.v != null) {
          //node is a cell that stores some value?
          callback(rootChain, rootNode.v);
        }
        if (rootNode.cs != null) {
          ref = rootNode.cs;
          for (i = 0, len = ref.length; i < len; i++) {
            childNode = ref[i];
            if (childNode.a != null) {
              putNode(newNode('a', childNode.a, rootChain), childNode);
            } else if (childNode.b != null) {
              putNode(newNode('b', childNode.b, rootChain), childNode);
            } else {
              throw new Error("Node has neither A nor B generator");
            }
          }
        }
      };
      return putNode(unity, fieldData);
    };

    exports.importField = function (fieldData, cells = new ChainMap(), preprocess) {
      importFieldTo(fieldData, function (chain, value) {
        if (preprocess != null) {
          chain = preprocess(chain);
        }
        return cells.put(chain, value);
      });
      return cells;
    };

    //Generate random value in range from 1 to nStates-1
    exports.randomStateGenerator = function (nStates) {
      return function () {
        return (Math.floor(Math.random() * (nStates - 1)) | 0) + 1;
      };
    };

    exports.randomFill = function (field, density, center, r, tiling, randomState) {
      var cell, i, len, ref;
      if (density < 0 || density > 1.0) {
        throw new Error("Density must be in [0;1]");
      }
      //by default, fill with ones.    
      randomState = randomState != null ? randomState : function () {
        return 1;
      };
      ref = tiling.farNeighborhood(center, r);
      for (i = 0, len = ref.length; i < len; i++) {
        cell = ref[i];
        if (Math.random() < density) {
          field.put(cell, randomState());
        }
      }
    };

    //Fill randomly, visiting numCells cells around the given center.
    exports.randomFillFixedNum = function (field, density, center, numCells, tiling, randomState) {
      var visited;
      if (density < 0 || density > 1.0) {
        throw new Error("Density must be in [0;1]");
      }
      //by default, fill with ones.    
      randomState = randomState != null ? randomState : function () {
        return 1;
      };
      visited = 0;
      tiling.forFarNeighborhood(center, function (cell, _) {
        if (visited >= numCells) {
          //Time to stop iteration?
          return false;
        }
        if (Math.random() < density) {
          field.put(cell, randomState());
        }
        visited += 1;
        //Continue
        return true;
      });
    };

    exports.stringifyFieldData = function (data) {
      var doStringify, parts;
      parts = [];
      doStringify = function (data) {
        var child, gen, i, len, pow, ref, results;
        if (data.v != null) {
          parts.push("|" + data.v);
        }
        if (data.cs != null) {
          ref = data.cs;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            child = ref[i];
            parts.push('(');
            if (child.a != null) {
              gen = 'a';
              pow = child.a;
            } else if (child.b != null) {
              gen = 'b';
              pow = child.b;
            } else {
              //parts.push "b#{child.b}"
              throw new Error("bad data, neither a nor b");
            }
            if (pow < 0) {
              gen = gen.toUpperCase();
              pow = -pow;
            }
            parts.push(gen);
            if (pow !== 1) {
              parts.push(`${pow}`);
            }
            doStringify(child);
            results.push(parts.push(')'));
          }
          return results;
        }
      };
      doStringify(data);
      return parts.join("");
    };

    //Parse what stringifyFieldData returns.
    // Produce object, suitable for importField
    exports.parseFieldData = function (text) {
      var allRes, awaitChar, integer, parseChildSpec, parseValueSpec, pos, skipSpaces;
      integer = function (text, pos) {
        var c, getResult, sign, value;
        //console.log "parsing from #{pos}: '#{text}'"
        sign = 1;
        value = '';
        getResult = function () {
          var v;
          if (value === '') {
            return null;
          } else {
            v = sign * parseInt(value, 10);
            //console.log "parsed int: #{v}"
            return [v, pos];
          }
        };
        while (true) {
          if (pos >= text.length) {
            return getResult();
          }
          c = text[pos];
          if (c === '-') {
            sign = -sign;
          } else if (c >= '0' && c <= '9') {
            value += c;
          } else {
            return getResult();
          }
          pos += 1;
        }
      };
      skipSpaces = function (text, pos) {
        var ref;
        while (pos < text.length && ((ref = text[pos]) === ' ' || ref === '\t' || ref === '\r' || ref === '\n')) {
          pos += 1;
        }
        return pos;
      };
      awaitChar = function (char, text, pos) {
        var c;
        pos = skipSpaces(text, pos);
        if (pos >= text.length) {
          return null;
        }
        c = text[pos];
        pos += 1;
        if (c !== char) {
          return null;
        }
        return pos;
      };
      parseChildSpec = function (text, pos) {
        var gen, genLower, power, powerRes, powerSign, value, valueRes;
        //parse
        pos = awaitChar('(', text, pos);
        if (pos === null) {
          return null;
        }
        //parse generator name...
        pos = skipSpaces(text, pos);
        if (pos >= text.length) {
          return null;
        }
        gen = text[pos];
        pos += 1;
        if (gen !== 'a' && gen !== 'b' && gen !== 'A' && gen !== 'B') {
          return null;
        }
        genLower = gen.toLowerCase();
        powerSign = genLower === gen ? 1 : -1;
        gen = genLower;

        //parse generaotr power
        pos = skipSpaces(text, pos);
        powerRes = integer(text, pos);
        if (powerRes === null) {
          power = 1;
        } else {
          [power, pos] = powerRes;
        }
        power *= powerSign;
        //parse cell state and children
        pos = skipSpaces(text, pos);
        valueRes = parseValueSpec(text, pos);
        if (valueRes === null) {
          return null;
        }
        [value, pos] = valueRes;

        //store previously parsed generator and power
        value[gen] = power;
        //console.log "Value updated with generator data, waiting for ) from #{pos}, '#{text.substring(pos)}'"
        pos = skipSpaces(text, pos);
        pos = awaitChar(')', text, pos);
        if (pos === null) {
          return null;
        }
        //ok, parsed child fine!
        //console.log "parsed child OK"
        return [value, pos];
      };
      parseValueSpec = function (text, pos) {
        var childRes, children, intResult, pos1, value;
        value = {};
        pos = skipSpaces(text, pos);
        pos1 = awaitChar('|', text, pos);
        if (pos1 !== null) {
          //has value
          pos = pos1;
          intResult = integer(text, pos);
          if (intResult !== null) {
            [value.v, pos] = intResult;
          }
        }
        //parse children
        children = [];
        //console.log "parsing children from from #{pos}, '#{text.substring(pos)}'"
        while (true) {
          childRes = parseChildSpec(text, pos);
          if (childRes === null) {
            //console.log "no more children..."
            break;
          }
          children.push(childRes[0]);
          pos = childRes[1];
        }
        //console.log "parsed #{children.length} children"
        if (children.length > 0) {
          value.cs = children;
        }
        return [value, pos];
      };
      //finally, parse all
      allRes = parseValueSpec(text, 0);
      if (allRes === null) {
        throw new Error("Faield to parse!");
      }
      pos = allRes[1];
      pos = skipSpaces(text, pos);
      if (pos !== text.length) {
        throw new Error("garbage after end");
      }
      return allRes[0];
    };

    /*        
    """
    exports.parseFieldData1 = (data) ->
      #data format (separators not included) is:
     *
     * text ::= value_spec
     * value_spec ::= [value]? ( '(' child_spec ')' )*
     * value ::= integer
     * child_spec ::= generator power value_spec
     * generator ::= a | b
     * power ::= integer
     *
     *
    
      #parser returns either null or pair:
     *  (parse result, next position)
     *
     * optional combinator
     * parse result is value of the inner parser or null
     * always succeeds
     *
      optional = (parser) -> (text, start) ->
        parsed = parser(text, start)
        if parsed is null
          [null, start]
        else
          parsed
    
      literal = (lit) -> (text, pos) ->
        for lit_i, i in lit
          if pos+i >= text.length
            return null
          if text[pos+i] isnt lit_i
            return null
        return [lit, pos+lit.length]
    
      oneOf = (parsers...) -> (text, pos) ->
        for p in parsers
          res = p(text,pos)
          return res if res isnt null
        return null
    
      word = (allowedChars) ->
        charSet = {}
        for c in allowedChars
          charSet[c] = true
        return (text, start) ->
          parseResult = ""
          pos = start
          while pos < text.length
            c = text[pos]
            if charSet.hasOwnProperty c
              parseResult += c
              pos += 1
            else
              break
          if parseResult is ""
            null
          else
    
      seq = (parsers) -> (text, pos) ->
        results = []
        for p in parsers
          r = p(text, pos)
          if r isnt null
            results.push r
            pos = r[1]
          else
            return null
        return [results, pos]
    
      map = (parser, func) -> (text, pos) ->
        r = parser(text, pos)
        return null if r is null
        return [func(r[0]), r[1]]
    
      integer = seq( optional(literal('-')), word('123456789')
      integer = map( parseInteger, [sign, digits]->
        parseInt((sign or '')+digits, 10) )
    
      parseInteger = (text, start) ->
        hasSign = false
        """
     */


  }, { "./chain_map.coffee": 3, "./vondyck_chain.coffee": 15 }], 6: [function (require, module, exports) {
    var addInplace, amplitude, combine2, scaleInplace;

    combine2 = function (v1, k1, v2, k2) {
      var i, l, ref, results;
      results = [];
      for (i = l = 0, ref = v1.length; l < ref; i = l += 1) {
        results.push(v1[i] * k1 + v2[i] * k2);
      }
      return results;
    };

    scaleInplace = function (v, k) {
      var i, l, ref;
      for (i = l = 0, ref = v.length; l < ref; i = l += 1) {
        v[i] *= k;
      }
      return v;
    };

    addInplace = function (v1, v2) {
      var i, l, len, v2i;
      for (i = l = 0, len = v2.length; l < len; i = ++l) {
        v2i = v2[i];
        v1[i] += v2[i];
      }
      return v1;
    };

    amplitude = function (x) {
      var xi;
      return Math.max(...((function () {
        var l, len, results;
        results = [];
        for (l = 0, len = x.length; l < len; l++) {
          xi = x[l];
          results.push(Math.abs(xi));
        }
        return results;
      })()));
    };

    //optimal parameters for Rozenbrock optimiation
    exports.alpha = 2.05;

    exports.beta = 0.46;

    exports.gamma = 0.49;

    exports.fminsearch = function (func, x0, step, tol = 1e-6, maxiter = 10000) {
      var alpha, beta, evaluations, f0, fe, fg, fh, fi, findCenter, fr, fs, gamma, i, iter, l, m, makeAnswerOK, n, poly, polySize, ref, ref1, rval, sortPoints, withValue, x, xc, xe, xh, xi, xr, xs;
      alpha = exports.alpha;
      beta = exports.beta;
      gamma = exports.gamma;
      n = x0.length;
      //generate initial polygon
      poly = (function () {
        var l, ref, results;
        results = [];
        for (i = l = 0, ref = n; l <= ref; i = l += 1) {
          results.push(x0.slice(0));
        }
        return results;
      })();
      for (i = l = 1, ref = n; l <= ref; i = l += 1) {
        poly[i][i - 1] += step;
      }
      evaluations = n + 1;
      findCenter = function () {
        var m, ref1, xc;
        xc = withValue[0][0].slice(0);
        for (i = m = 1, ref1 = n - 1; m <= ref1; i = m += 1) {
          addInplace(xc, withValue[i][0]);
        }
        scaleInplace(xc, 1.0 / n);
        return xc;
      };
      polySize = function () {
        var j, len, m, maxima, minima, o, ref1, xi, xij;
        minima = withValue[0][0].slice(0);
        maxima = withValue[0][0].slice(0);
        for (i = m = 1, ref1 = withValue.length; m < ref1; i = m += 1) {
          xi = withValue[i][0];
          for (j = o = 0, len = xi.length; o < len; j = ++o) {
            xij = xi[j];
            if (xij < minima[j]) {
              minima[j] = xij;
            }
            if (xij > maxima[j]) {
              maxima[j] = xij;
            }
          }
        }
        return Math.max(...((function () {
          var p, ref2, results;
          results = [];
          for (i = p = 0, ref2 = n; p < ref2; i = p += 1) {
            results.push(maxima[i] - minima[i]);
          }
          return results;
        })()));
      };
      makeAnswerOK = function () {
        var rval;
        return rval = {
          reached: true,
          x: withValue[0][0],
          f: withValue[0][1],
          steps: iter,
          evaluations: evaluations
        };
      };
      withValue = (function () {
        var len, m, results;
        results = [];
        for (m = 0, len = poly.length; m < len; m++) {
          x = poly[m];
          results.push([x, func(x)]);
        }
        return results;
      })();
      //sort by function value
      sortPoints = function () {
        return withValue.sort(function (a, b) {
          return a[1] - b[1];
        });
      };
      iter = 0;
      while (iter < maxiter) {
        iter += 1;
        sortPoints();

        //worst is last

        //find center of all points except the last (worst) one.
        xc = findCenter();
        //Best, worst and first-before-worst values.
        f0 = withValue[0][1];
        fg = withValue[n - 1][1];
        [xh, fh] = withValue[n];
        //console.log "I=#{iter}\tf0=#{f0}\tfg=#{fg}\tfh=#{fh}"

        //reflect
        //xr = xc-(xh-xc) = 2xc - xh
        xr = combine2(xc, 2.0, xh, -1.0);
        fr = func(xr);
        evaluations += 1;
        if (fr < f0) {
          //extend
          // xe = xc+ (xr-xc)*alpha = xr*alpha + xc*(1-alpha)
          xe = combine2(xr, alpha, xc, 1 - alpha);
          fe = func(xe);
          evaluations += 1;
          if (fe < fr) {
            //use fe
            withValue[n] = [xe, fe];
          } else {
            //use fr
            withValue[n] = [xr, fr];
          }
        } else if (fr < fg) {
          //use xr
          withValue[n] = [xr, fr];
        } else {
          // This is present in the original decription of the method, but it makes result even slightly worser!
          //if fr < fh
          //  #swap xr, xg
          //  [[xr, fr], withValue[n-1]] = [withValue[n-1], [xr, fr]]
          //  # my own invertion - makes worser.
          //  #xc = findCenter()

          //now fr >= fh
          //shrink
          //xs = xc+ (xr-xc)*beta
          xs = combine2(xh, beta, xc, 1 - beta);
          fs = func(xs);
          evaluations += 1;
          if (fs < fh) {
            //use shrink
            withValue[n] = [xs, fs];
            if (polySize() < tol) {
              return makeAnswerOK();
            }
          } else {
            //global shrink
            x0 = withValue[0][0];
            //check exit
            if (polySize() < tol) {
              return makeAnswerOK();
            }
            //global shrink
            for (i = m = 1, ref1 = n; (1 <= ref1 ? m <= ref1 : m >= ref1); i = 1 <= ref1 ? ++m : --m) {
              xi = combine2(withValue[i][0], gamma, x0, 1 - gamma);
              fi = func(xi);
              withValue[i] = [xi, fi];
            }
            evaluations += n;
          }
        }
      }
      sortPoints();
      return rval = {
        reached: false,
        x: withValue[0][0],
        f: withValue[0][1],
        steps: iter,
        evaluations: evaluations
      };
    };


  }, {}], 7: [function (require, module, exports) {
    //Based on http://www.math.rwth-aachen.de/~Gerhard.Hiss/Students/DiplomarbeitPfeiffer.pdf
    //algorithm 3, 4
    //import itertools

    //values are encoded as simple strings.
    // User is responsible 
    var RewriteRuleset, findOverlap, knuthBendixCompletion, le2cmp, overlap, print, shortLex, simplifyRules, sortPairReverse, splitBy;

    print = function (...s) {
      return console.log(s.join(" "));
    };

    //COnvert "less or equal" function to the JS-compatible comparator function
    le2cmp = function (leFunc) {
      return function (a, b) {
        if (a === b) {
          return 0;
        } else if (leFunc(a, b)) {
          return -1;
        } else {
          return 1;
        }
      };
    };

    exports.RewriteRuleset = RewriteRuleset = class RewriteRuleset {
      constructor(rules) {
        this.rules = rules;
      }

      pprint() {
        var j, len, ref, v, w;
        print("{");
        ref = this._sortedItems();
        for (j = 0, len = ref.length; j < len; j++) {
          [v, w] = ref[j];
          print(`  ${v} -> ${w}`);
        }
        return print("}");
      }

      copy() {
        return new RewriteRuleset(JSON.parse(JSON.stringify(this.rules)));
      }

      _sortedItems() {
        var items;
        items = this.items();
        items.sort(le2cmp(shortLex));
        return items;
      }

      suffices() {
        var k, results;
        results = [];
        for (k in this.rules) {
          results.push(k);
        }
        return results;
      }

      size() {
        return this.suffices().length;
      }

      items() {
        var k, ref, results, v;
        ref = this.rules;
        results = [];
        for (k in ref) {
          v = ref[k];
          results.push([k, v]);
        }
        return results;
      }

      __equalOneSided(other) {
        var k, ref, v;
        ref = this.rules;
        for (k in ref) {
          v = ref[k];
          if (other.rules[k] !== v) {
            return false;
          }
        }
        return true;
      }

      equals(other) {
        return this.__equalOneSided(other) && other.__equalOneSided(this);
      }


      //__hash__: ()-> return hash(@rules)
      add(v, w) {
        return this.rules[v] = w;
      }

      remove(v) {
        return delete this.rules[v];
      }

      normalize(lessOrEq) {
        var SS, ref, v, w;
        SS = {};
        ref = this.rules;
        for (v in ref) {
          w = ref[v];
          [v, w] = sortPairReverse(v, w, lessOrEq);
          //v is biggest now
          if (SS[v] == null) {
            SS[v] = w;
          } else {
            //resolve conflict by chosing the lowest of 2.
            SS[v] = sortPairReverse(w, SS[v], lessOrEq)[1];
          }
        }
        return new RewriteRuleset(SS);
      }

      __ruleLengths() {
        var k, lens, lenslist;
        lens = {};
        for (k in this.rules) {
          lens[k.length] = null;
        }
        lenslist = (function () {
          var results;
          results = [];
          for (k in lens) {
            results.push(parseInt(k, 10));
          }
          return results;
        })();
        lenslist.sort();
        return lenslist;
      }

      appendRewrite(s, xs_) {
        var i, j, l, len, lengths, ref, rewriteAs, rules, suffix, suffixLen, xs;
        //"""Append elements of the string xs_ to the string s, running all rewrite rules"""
        rules = this.rules;
        if (xs_.length === 0) {
          return s;
        }
        xs = xs_.split("");
        xs.reverse();
        lengths = this.__ruleLengths();
        while (xs.length > 0) {
          s = s + xs.pop();
          for (j = 0, len = lengths.length; j < len; j++) {
            suffixLen = lengths[j];
            suffix = s.substring(s.length - suffixLen);
            //console.log "suf: #{suffix}, len: #{suffixLen}"
            rewriteAs = rules[suffix];
            if (rewriteAs != null) {
              //Rewrite found!
              //console.log "   Rewrite found: #{suffix}, #{rewriteAs}"
              s = s.substring(0, s.length - suffixLen);
              for (i = l = ref = rewriteAs.length - 1; l >= 0; i = l += -1) {
                xs.push(rewriteAs[i]);
              }
              continue;
            }
          }
        }
        return s;
      }

      has(key) {
        return this.rules.hasOwnProperty(key);
      }

      rewrite(s) {
        return this.appendRewrite("", s);
      }

    };

    exports.shortLex = shortLex = function (s1, s2) {
      //"""Shortlex less or equal comparator"""
      if (s1.length > s2.length) {
        return false;
      }
      if (s1.length < s2.length) {
        return true;
      }
      return s1 <= s2;
    };

    exports.overlap = overlap = function (s1, s2) {
      var i, i1, i2, istart, j, ref, ref1, s1_i, s2_0;
      //"""Two strings: s1, s2.
      //Reutnrs x,y,z such as:
      //s1 = xy
      //s2 = yz
      //"""
      if (s2.length === 0) {
        return [s1, "", s2];
      }
      [i1, i2] = [0, 0];
      //i1, i2: indices in s1, s2
      s2_0 = s2[0];
      istart = Math.max(0, s1.length - s2.length);
      for (i = j = ref = istart, ref1 = s1.length; (ref <= ref1 ? j < ref1 : j > ref1); i = ref <= ref1 ? ++j : --j) {
        s1_i = s1[i];
        if (s1_i === s2_0) {
          //console.log "Comparing #{s1.substring(i+1)} and #{s2.substring(1, s1.length-i)}"
          if (s1.substring(i + 1) === s2.substring(1, s1.length - i)) {
            return [s1.substring(0, i), s1.substring(i), s2.substring(s1.length - i)];
          }
        }
      }
      return [s1, "", s2];
    };

    exports.splitBy = splitBy = function (s1, s2) {
      var i, j, ref;
      //"""Split sequence s1 by sequence s2.
      //Returns True and prefix + postfix, or just False and None None
      //"""
      if (s2.length === 0) {
        [true, s1, ""];
      }
      for (i = j = 0, ref = s1.length - s2.length + 1; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        if (s1.substring(i, i + s2.length) === s2) {
          return [true, s1.substring(0, i), s1.substring(i + s2.length)];
        }
      }
      return [false, null, null];
    };

    sortPairReverse = function (a, b, lessOrEq) {
      //"""return a1, b1 such that a1 >= b1"""
      if (lessOrEq(a, b)) {
        return [b, a];
      } else {
        return [a, b];
      }
    };

    findOverlap = function (v1, w1, v2, w2) {
      var hasSplit, x, y, z;
      //"""Find a sequence that is can be rewritten in 2 ways using given rules"""
      // if v1=xy and v2=yz
      [x, y, z] = overlap(v1, v2);
      if (y) { //if there is nonempty overlap
        return [true, x + w2, w1 + z];
      }
      [hasSplit, x, z] = splitBy(v1, v2);
      if (hasSplit) { // and x.length>0 and z.length>0
        return [true, w1, x + w2 + z];
      }
      return [false, null, null];
    };

    knuthBendixCompletion = function (S, lessOrEqual) {
      var SS, hasOverlap, j, l, len, len1, ref, ref1, s1, s2, t1, t2, v1, v2, w1, w2;
      //"""S :: dict of rewrite rules: (original, rewrite)
      //lessorequal :: (x, y) -> boolean
      //"""
      SS = S.copy();
      ref = S.items();

      for (j = 0, len = ref.length; j < len; j++) {
        [v1, w1] = ref[j];
        ref1 = S.items();
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          [v2, w2] = ref1[l];
          // if v1=xy and v2=yz
          //[x, y, z] = overlap(v1, v2)
          [hasOverlap, s1, s2] = findOverlap(v1, w1, v2, w2);
          if (hasOverlap) {
            t1 = S.rewrite(s1);
            t2 = S.rewrite(s2);
            if (t1 !== t2) {
              //dprint ("Conflict found", v1, w1, v2, w2)
              [t1, t2] = sortPairReverse(t1, t2, lessOrEqual);
              //dprint("    add rule:", (t1,t2) )
              SS.add(t1, t2);
            }
          }
        }
      }
      return SS;
    };

    simplifyRules = function (S_, lessOrEqual) {
      var S, Slist, addBack, v, vv, vw, vw1, w, ww;
      S = S_.copy();
      Slist = S_.items(); //used to iterate
      while (Slist.length > 0) {
        [v, w] = vw = Slist.pop();
        S.remove(v);
        vv = S.rewrite(vw[0]);
        ww = S.rewrite(vw[1]);
        addBack = true;
        if (vv === ww) {
          //dprint("Redundant rewrite", v, w)
          addBack = false;
        } else {
          vw1 = sortPairReverse(vv, ww, lessOrEqual);
          if (vw1[0] !== vw[0] && vw1[1] !== vw[1]) {
            //dprint ("Simplify rule:", vw, "->", vw1 )
            S.add(...vw1);
            Slist.push(vw1);
            addBack = false;
          }
        }
        if (addBack) {
          S.add(v, w);
        }
      }
      return S;
    };

    exports.knuthBendix = function (S0, lessOrEqual = shortLex, maxIters = 1000, maxRulesetSize = 1000, onIteration = null) {
      var S, SS, SSS, i, j, ref;
      //"""Main funciton of the Knuth-Bendix completion algorithm.
      //arguments:
      //S - original rewrite table
      //lessOrEqual - comparator for strings. shortLex is the default one.
      //maxIters - maximal number of iterations. If reached, exception is raised.
      //maxRulesetSize - maximal number of ruleset. If reached, exception is raised.
      //onIteration - callback, called each iteration of the method. It receives iteration number and current table.
      //"""
      S = S0.normalize(lessOrEqual);
      for (i = j = 0, ref = maxIters; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        if (S.size() > maxRulesetSize) {
          throw new Error("Ruleset grew too big");
        }
        SS = simplifyRules(S, lessOrEqual);
        SSS = knuthBendixCompletion(SS, lessOrEqual);
        if (SSS.equals(S)) {
          //Convergence achieved!
          return SSS;
        }
        if (onIteration != null) {
          onIteration(i, S);
        }
        S = SSS;
      }
      throw new Error("Iterations exceeded");
    };


  }, {}], 8: [function (require, module, exports) {
    //Operations on 3x3 matrices
    // Matrices stored as arrays, row by row
    var add, addScaledInplace, amplitude, approxEq, approxEqv, cleanupHyperbolicMoveMatrix, copy, eye, hrot, hyperbolicInv, inv, mul, mulv, rot, rotationMatrix, set, smul, translationMatrix, transpose, zero;

    exports.eye = eye = function () {
      return [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];
    };

    exports.zero = zero = function () {
      return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    };

    exports.set = set = function (m, i, j, v) {
      m[i * 3 + j] = v;
      return m;
    };

    exports.rot = rot = function (i, j, angle) {
      var c, m, s;
      m = eye();
      s = Math.sin(angle);
      c = Math.cos(angle);
      set(m, i, i, c);
      set(m, i, j, -s);
      set(m, j, i, s);
      set(m, j, j, c);
      return m;
    };

    exports.hrot = hrot = function (i, j, sinhD) {
      var c, m, s;
      m = eye();
      s = sinhD;
      c = Math.sqrt(sinhD * sinhD + 1);
      set(m, i, i, c);
      set(m, i, j, s);
      set(m, j, i, s);
      set(m, j, j, c);
      return m;
    };

    exports.mul = mul = function (m1, m2) {
      var i, j, k, l, m, o, p, s;
      m = zero();
      for (i = l = 0; l < 3; i = ++l) {
        for (j = o = 0; o < 3; j = ++o) {
          s = 0.0;
          for (k = p = 0; p < 3; k = ++p) {
            s += m1[i * 3 + k] * m2[k * 3 + j];
          }
          m[i * 3 + j] = s;
        }
      }
      return m;
    };

    exports.approxEq = approxEq = function (m1, m2, eps = 1e-6) {
      var d, i, l;
      d = 0.0;
      for (i = l = 0; l < 9; i = ++l) {
        d += Math.abs(m1[i] - m2[i]);
      }
      return d < eps;
    };

    exports.copy = copy = function (m) {
      return m.slice(0);
    };

    exports.mulv = mulv = function (m, v) {
      return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
    };

    exports.approxEqv = approxEqv = function (v1, v2, eps = 1e-6) {
      var d, i, l;
      d = 0.0;
      for (i = l = 0; l < 3; i = ++l) {
        d += Math.abs(v1[i] - v2[i]);
      }
      return d < eps;
    };

    /*
     * m: matrix( [m0, m1, m2], [m3,m4,m5], [m6,m7,m8] );
     * ratsimp(invert(m)*determinant(m));
     * determinant(
     */
    exports.inv = inv = function (m) {
      var iD;
      //Calculated with maxima
      iD = 1.0 / (m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]));
      return [(m[4] * m[8] - m[5] * m[7]) * iD, (m[2] * m[7] - m[1] * m[8]) * iD, (m[1] * m[5] - m[2] * m[4]) * iD, (m[5] * m[6] - m[3] * m[8]) * iD, (m[0] * m[8] - m[2] * m[6]) * iD, (m[2] * m[3] - m[0] * m[5]) * iD, (m[3] * m[7] - m[4] * m[6]) * iD, (m[1] * m[6] - m[0] * m[7]) * iD, (m[0] * m[4] - m[1] * m[3]) * iD];
    };

    exports.smul = smul = function (k, m) {
      var l, len, mi, results;
      results = [];
      for (l = 0, len = m.length; l < len; l++) {
        mi = m[l];
        results.push(mi * k);
      }
      return results;
    };

    exports.add = add = function (m1, m2) {
      var i, l, results;
      results = [];
      for (i = l = 0; l < 9; i = ++l) {
        results.push(m1[i] + m2[i]);
      }
      return results;
    };

    exports.addScaledInplace = addScaledInplace = function (m, m1, k) {
      var i, l, ref;
      for (i = l = 0, ref = m.length; (0 <= ref ? l < ref : l > ref); i = 0 <= ref ? ++l : --l) {
        m[i] += m1[i] * k;
      }
      return m;
    };

    exports.transpose = transpose = function (m) {
      return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
    };

    exports.hyperbolicInv = hyperbolicInv = function (m) {
      //x' S x = 1, S = diag (-1, -1, 1)
      //x' M' S M x = 1
      //M' S M = S
      //M^-1 = SM'S
      return [m[0], m[3], -m[6], m[1], m[4], -m[7], -m[2], -m[5], m[8]];
    };

    exports.cleanupHyperbolicMoveMatrix = cleanupHyperbolicMoveMatrix = function (m) {
      return smul(0.5, add(m, inv(hyperbolicInv(m))));
    };

    exports.translationMatrix = translationMatrix = function (dx, dy) {
      var dt, k, r2, xxk, xyk, yyk;
      //Formulae obtained with Maxima,
      // as combination of (inverse rotate) * (shift by x) * (rotate)
      // distance is acosh( dx^2 + dy^2 + 1 )
      r2 = dx * dx + dy * dy;
      dt = Math.sqrt(r2 + 1);
      k = r2 < 1e-6 ? 0.5 : (dt - 1) / r2;
      xxk = dx * dx * k;
      xyk = dx * dy * k;
      yyk = dy * dy * k;
      return [xxk + 1, xyk, dx, xyk, yyk + 1, dy, dx, dy, dt];
    };

    exports.rotationMatrix = rotationMatrix = function (angle) {
      var c, s;
      s = Math.sin(angle);
      c = Math.cos(angle);
      return [c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0];
    };

    exports.amplitude = amplitude = function (m) {
      var mi;
      return Math.max(...((function () {
        var l, len, results;
        results = [];
        for (l = 0, len = m.length; l < len; l++) {
          mi = m[l];
          results.push(Math.abs(mi));
        }
        return results;
      })()));
    };


    //Decompose hyperbolic matrix to translation and rotation
    // returns 3 values: rotation angle, dx, dy
    // dx and dy are parameters of the translationMatrix
    exports.hyperbolicDecompose = function (m) {
      var R, T, cos, dx, dy, sin, t;
      //first, detect translation, look, how far it translates origin
      [dx, dy, t] = mulv(m, [0, 0, 1]);
      //multiply out the translation
      T = translationMatrix(-dx, -dy);
      R = mul(T, m);
      //now R shoulw be purely rotation matrix
      //TODO validate this?
      cos = (R[0] + R[4]) * 0.5;
      sin = (R[1] - R[3]) * 0.5;
      return [Math.atan2(sin, cos), dx, dy];
    };

    /*  array of matrix powers, from 0th to (n-1)th
    */
    exports.powers = function (matrix, n) {
      var i, l, m_n, pows, ref;
      //current power
      m_n = eye();
      pows = [m_n];
      for (i = l = 1, ref = n; (1 <= ref ? l < ref : l > ref); i = 1 <= ref ? ++l : --l) {
        m_n = mul(matrix, m_n);
        pows.push(m_n);
      }
      return pows;
    };


  }, {}], 9: [function (require, module, exports) {
    var ChainMap, M, drawBezierApproxArcTo, drawPoincareCircleTo, len2, unity, visiblePolygonSize;

    M = require("./matrix3.coffee");

    ({ unity } = require("./vondyck_chain.coffee"));

    ({ ChainMap } = require("./chain_map.coffee"));

    len2 = function (x, y) {
      return x * x + y * y;
    };

    //determine cordinates of the cell, containing given point
    exports.makeXYT2path = function (tiling, maxSteps = 100) {
      var cell2point, nearestNeighbor, vectorDist;
      cell2point = function (cell) {
        return M.mulv(tiling.repr(cell), [0.0, 0.0, 1.0]);
      };
      vectorDist = function ([x1, y1, t1], [x2, y2, t2]) {
        //actually, this is the correct way:
        // Math.acosh t1*t2 - x1*x2 - y1*y2
        //however, acosh is costy, and we need only comparisions...
        return t1 * t2 - x1 * x2 - y1 * y2 - 1;
      };
      nearestNeighbor = function (cell, xyt) {
        var dBest, dNei, j, len, nei, neiBest, ref;
        dBest = null;
        neiBest = null;
        ref = tiling.moore(cell);
        for (j = 0, len = ref.length; j < len; j++) {
          nei = ref[j];
          dNei = vectorDist(cell2point(nei), xyt);
          if ((dBest === null) || (dNei < dBest)) {
            dBest = dNei;
            neiBest = nei;
          }
        }
        return [neiBest, dBest];
      };
      return function (xyt) {
        var cell, cellDist, nextNei, nextNeiDist, step;
        //FInally, search    
        cell = unity; //start search at origin
        cellDist = vectorDist(cell2point(cell), xyt);
        //Just in case, avoid infinite iteration
        step = 0;
        while (step < maxSteps) {
          step += 1;
          [nextNei, nextNeiDist] = nearestNeighbor(cell, xyt);
          if (nextNeiDist > cellDist) {
            break;
          } else {
            cell = nextNei;
            cellDist = nextNeiDist;
          }
        }
        return cell;
      };
    };

    //Convert poincare circle coordinates to hyperbolic (x,y,t) representation
    exports.poincare2hyperblic = function (x, y) {
      var r2, th;
      // direct conversion:
      // x = xh / (th + 1)
      // y = yh / (th + 1)

      //   when th^2 - xh^2 - yh^2 == 1

      // r2 = x^2 + y^2 = (xh^2+yh^2)/(th+1)^2 = (th^2-1)/(th+1)^2 = (th-1)/(th+1)

      // r2 th + r2 = th - 1
      // th (r2-1) = -1-r2
      // th = (r2+1)/(1-r2)
      r2 = x * x + y * y;
      if (r2 >= 1.0) {
        return null;
      }
      th = (r2 + 1) / (1 - r2);
      // th + 1 = (r2+1)/(1-r2)+1 = (r2+1+1-r2)/(1-r2) = 2/(1-r2)
      return [x * (th + 1), y * (th + 1), th];
    };


    // Create list of cells, that in Poincare projection are big enough.
    exports.visibleNeighborhood = function (tiling, minCellSize) {
      var cells, visibleCells, walk;
      //Visible size of the polygon far away
      cells = new ChainMap();
      walk = function (cell) {
        var cellSize, j, len, nei, ref;
        if (cells.get(cell) !== null) {
          return;
        }
        cellSize = visiblePolygonSize(tiling, tiling.repr(cell));
        cells.put(cell, cellSize);
        if (cellSize > minCellSize) {
          ref = tiling.moore(cell);
          for (j = 0, len = ref.length; j < len; j++) {
            nei = ref[j];
            walk(nei);
          }
        }
      };
      walk(unity);
      visibleCells = [];
      cells.forItems(function (cell, size) {
        if (size >= minCellSize) {
          return visibleCells.push(cell);
        }
      });
      return visibleCells;
    };

    exports.makeCellShapePoincare = function (tiling, cellTransformMatrix, context) {
      var i, inv_t0, inv_t1, j, len, pPrev, ref, t0, t1, vertex, x0, x1, xx0, xx1, y0, y1, yy0, yy1;
      pPrev = null;
      ref = tiling.cellShape;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        vertex = ref[i];
        [x0, y0, t0] = pPrev != null ? pPrev : M.mulv(cellTransformMatrix, vertex);
        [x1, y1, t1] = pPrev = M.mulv(cellTransformMatrix, tiling.cellShape[(i + 1) % tiling.cellShape.length]);
        //poincare coordinates
        inv_t0 = 1.0 / (t0 + 1);
        xx0 = x0 * inv_t0;
        yy0 = y0 * inv_t0;
        inv_t1 = 1.0 / (t1 + 1);
        xx1 = x1 * inv_t1;
        yy1 = y1 * inv_t1;
        if (i === 0) {
          context.moveTo(xx0, yy0);
        }
        drawPoincareCircleTo(context, xx0, yy0, xx1, yy1);
      }
    };

    //context.closePath()
    exports.drawPoincareCircleTo = drawPoincareCircleTo = function (context, x0, y0, x1, y1) {
      var cross, delta2, k0, k1, r, r2, sq_l0, sq_l1;
      //Calculate radius of the circular arc.
      sq_l0 = len2(x0, y0);
      // (x0^2+y0^2)*inv_t0^2 = (t0^2-1)/(t0+1)^2 = (t0-1)/(t0+1) = 1-2/(t0+1)
      sq_l1 = len2(x1, y1); // = 1-2/(t1+1)
      k0 = (1 + 1 / sq_l0) * 0.5; // = (1+(t0+1)/(t0-1)) * 0.5 = t0/(t0-1)
      k1 = (1 + 1 / sq_l1) * 0.5; // = t1/(t1-1)
      delta2 = len2(x0 * k0 - x1 * k1, y0 * k0 - y1 * k1);
      //x0*k0 = x0/(t0+1)*t0/(t0-1) = (x0t0)/(t0^2-1)

      //k_ is not needed anymore
      if (delta2 < 1e-4) { // 0.01^2 lenght of a path too small, create straight line instead to make it faster.
        context.lineTo(x1, y1);
        return;
      }
      cross = x0 * y1 - x1 * y0;
      r2 = (sq_l0 * sq_l1 * delta2) / (cross * cross) - 1;
      r = -Math.sqrt(r2);
      if (cross < 0) {
        r = -r;
      }
      if (Math.abs(r) < 100) {
        return drawBezierApproxArcTo(context, x0, y0, x1, y1, r, r < 0);
      } else {
        return context.lineTo(x1, y1);
      }
    };

    exports.drawBezierApproxArcTo = drawBezierApproxArcTo = function (context, x0, y0, x1, y1, r, reverse) {
      var ct, d, d2, kx, ky, p11x, p11y, p12x, p12y, r_ct, vx_x, vx_y, vy_x, vy_y, xc, yc;
      d2 = len2(x0 - x1, y0 - y1);
      d = Math.sqrt(d2);
      ct = Math.sqrt(r * r - d2 * 0.25);
      if (reverse) {
        ct = -ct;
      }
      //Main formulas for calculating bezier points. Math was used to get them.
      r_ct = r - ct;
      kx = (4.0 / 3.0) * r_ct / d;
      ky = -(8.0 / 3.0) * r * r_ct / d2 + 1.0 / 6.0;
      //Get the bezier control point positions
      //vx is a perpendicular vector, vy is parallel
      vy_x = x1 - x0;
      vy_y = y1 - y0;
      vx_x = vy_y;
      vx_y = -vy_x; // #rotated by Pi/2
      xc = (x0 + x1) * 0.5;
      yc = (y0 + y1) * 0.5;
      p11x = xc + vx_x * kx + vy_x * ky;
      p11y = yc + vx_y * kx + vy_y * ky;

      //p12x = xc + vx_x * kx - vy_x * ky
      //p12y = yc + vx_y * kx - vy_y * ky
      p12x = xc + vy_y * kx - vy_x * ky;
      p12y = yc + -vy_x * kx - vy_y * ky;
      return context.bezierCurveTo(p11x, p11y, p12x, p12y, x1, y1);
    };

    exports.hyperbolic2poincare = function ([x, y, t], dist) {
      var d, its, r2, s2;
      //poincare coordinates
      // t**2 - x**2 - y**2 = 1

      // if scaled, 
      //  s = sqrt(t**2 - x**2 - y**2)

      // xx = x/s, yy=y/s, tt=t/s, tt+1 = (t+s)/s

      // xxx = xx/(tt+1) = x/s/(t+s)*s = x/(t+s)
      // yyy = y/(t+s)
      r2 = x ** 2 + y ** 2;
      s2 = t ** 2 - r2;
      if (s2 <= 0) {
        its = 1.0 / Math.sqrt(r2);
      } else {
        its = 1.0 / (t + Math.sqrt(s2));
      }
      if (dist) {
        // Length of a vector, might be denormalized
        // s2 = t**2 - x**2 - y**2
        // s = sqrt(s2)

        // xx = x/s
        // yy = y/s
        // tt = t/s

        // d = acosh tt = acosh t/sqrt(t**2 - x**2 - y**2)
        //  = log( t/sqrt(t**2 - x**2 - y**2) + sqrt(t**2/(t**2 - x**2 - y**2) - 1) ) =
        //  = log( (t + sqrt(x**2 + y**2)) / sqrt(t**2 - x**2 - y**2) ) =

        //  = log(t + sqrt(x**2 + y**2)) - 0.5*log(t**2 - x**2 - y**2)
        d = s2 <= 0 ? 2e308 : Math.acosh(t / Math.sqrt(s2));
        return [x * its, y * its, d];
      } else {
        return [x * its, y * its];
      }
    };

    exports.visiblePolygonSize = visiblePolygonSize = function (tiling, cellTransformMatrix) {
      var i, j, len, ref, t, vertex, x, xmax, xmin, xx, y, ymax, ymin, yy;
      xmin = xmax = ymin = ymax = 0.0;
      ref = tiling.cellShape;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        vertex = ref[i];
        [x, y, t] = M.mulv(cellTransformMatrix, vertex);
        xx = x / t;
        yy = y / t;
        if (i === 0) {
          xmin = xmax = xx;
          ymin = ymax = yy;
        } else {
          xmin = Math.min(xmin, xx);
          xmax = Math.max(xmax, xx);
          ymin = Math.min(ymin, yy);
          ymax = Math.max(ymax, yy);
        }
      }
      return Math.max(xmax - xmin, ymax - ymin);
    };


  }, { "./chain_map.coffee": 3, "./matrix3.coffee": 8, "./vondyck_chain.coffee": 15 }], 10: [function (require, module, exports) {
    "use strict";
    var ChainMap, M, RegularTiling, VonDyck, eliminateFinalA, reverseShortlexLess, takeLastA, unity;

    ({ VonDyck } = require("./vondyck.coffee"));

    ({ ChainMap } = require("./chain_map.coffee"));

    ({ unity, reverseShortlexLess } = require("./vondyck_chain.coffee"));

    M = require("./matrix3.coffee");

    exports.RegularTiling = RegularTiling = class RegularTiling extends VonDyck {
      constructor(n, m) {
        super(n, m, 2);
        this.solve();
        if (this.representation != null) {
          this.cellShape = this._generateNGon();
        }
      }

      toString() {
        return `VonDyck(${this.n}, ${this.m}, ${this.k})`;
      }

      //Convert path to an unique cell identifier by taking a shortest version of all rotated variants
      toCell(chain) {
        return eliminateFinalA(chain, this.appendRewrite, this.n);
      }

      //Return moore neighbors of a cell  
      moore(chain) {
        var i, j, k, nStep, neighbors, powerA, powerB, ref, ref1;
        //reutrns Moore (vertex) neighborhood of the cell.
        // it contains N cells of von Neumann neighborhood
        //    and N*(M-3) cells, sharing single vertex.
        // In total, N*(M-2) cells.
        neighbors = new Array(this.n * (this.m - 2));
        i = 0;
        for (powerA = j = 0, ref = this.n; j < ref; powerA = j += 1) {
          for (powerB = k = 1, ref1 = this.m - 1; k < ref1; powerB = k += 1) {
            //adding truncateA to eliminate final rotation of the chain.
            nStep = powerA ? [['b', powerB], ['a', powerA]] : [['b', powerB]];
            neighbors[i] = this.toCell(this.appendRewrite(chain, nStep));
            i += 1;
          }
        }
        return neighbors;
      }

      //calls a callback fucntion for each cell in the far neighborhood of the original.
      // starts from the original cell, and then calls the callback for more and more far cells, encircling it.
      // stops when callback returns false.
      forFarNeighborhood(center, callback) {
        var cell, cells, j, k, l, len, len1, len2, neighCell, newLayer, prevLayer, radius, ref, thisLayer;
        cells = new ChainMap();
        cells.put(center, true);
        //list of cells of the latest complete layer
        thisLayer = [center];
        //list of cells in the previous complete layer
        prevLayer = [];
        //Radius of the latest complete layer
        radius = 0;
        if (!callback(center, radius)) {
          return;
        }
        while (true) {
          //now for each cell in the latest layer, find neighbors, that are not marked yet.
          // They would form a new layer.
          radius += 1;
          newLayer = [];
          for (j = 0, len = thisLayer.length; j < len; j++) {
            cell = thisLayer[j];
            ref = this.moore(cell);
            for (k = 0, len1 = ref.length; k < len1; k++) {
              neighCell = ref[k];
              if (!cells.get(neighCell)) {
                //Detected new unvisited cell - register it and call a callback
                newLayer.push(neighCell);
                cells.put(neighCell, true);
                if (!callback(neighCell, radius)) {
                  return;
                }
              }
            }
          }
          //new layer complete at this point.
          // Now move to the next layer.
          // memory optimization: remove from the visited map cells of the prevLayer, since they are not neeed anymore.
          // actually, this is quite minor optimization, since cell counts grow exponentially, but I would like to do it.
          for (l = 0, len2 = prevLayer.length; l < len2; l++) {
            cell = prevLayer[l];
            if (!cells.remove(cell)) {
              throw new Error("Assertion failed: cell not present");
            }
          }
          //rename layers
          prevLayer = thisLayer;
          thisLayer = newLayer;
        }
      }

      //And loop!
      //The loop is only finished by 'return'.

      // r - radius
      // appendRewrite: rewriter for chains.
      // n,m - parameters of the tessellation
      // Return value:
      //  list of chains to append
      farNeighborhood(center, r) {
        var cell, cells, getCellList, i, j, k, l, len, len1, nei, ref, ref1, ref2;
        //map of visited cells
        cells = new ChainMap();
        cells.put(center, true);
        getCellList = function (cells) {
          var cellList;
          cellList = [];
          cells.forItems(function (cell, state) {
            return cellList.push(cell);
          });
          return cellList;
        };
        for (i = j = 0, ref = r; j < ref; i = j += 1) {
          ref1 = getCellList(cells);
          for (k = 0, len = ref1.length; k < len; k++) {
            cell = ref1[k];
            ref2 = this.moore(cell);
            for (l = 0, len1 = ref2.length; l < len1; l++) {
              nei = ref2[l];
              cells.put(nei, true);
            }
          }
        }
        return getCellList(cells);
      }


      //produces shape (array of 3-vectors)
      _generateNGon() {
        var i, i2, j, k, ref, ref1, results, results1;
        //Take center of generator B and rotate it by action of A
        if (this.k === 2) {
          results = [];
          for (i = j = 0, ref = this.n; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
            results.push(M.mulv(this.representation.aPower(i), this.representation.centerB));
          }
          return results;
        } else {
          //dead code actually, but interesting for experiments
          results1 = [];
          for (i2 = k = 0, ref1 = this.n * 2; (0 <= ref1 ? k < ref1 : k > ref1); i2 = 0 <= ref1 ? ++k : --k) {
            i = (i2 / 2) | 0;
            if ((i2 % 2) === 0) {
              results1.push(M.mulv(this.representation.aPower(i), this.representation.centerB));
            } else {
              results1.push(M.mulv(this.representation.aPower(i), this.representation.centerAB));
            }
          }
          return results1;
        }
      }

    };

    //Remove last element of a chain, if it is A.
    takeLastA = function (chain) {
      if ((chain === unity) || (chain.letter !== 'a')) {
        return chain;
      } else {
        return chain.t;
      }
    };

    // Add all possible rotations powers of A generator) to the end of the chain,
    // and choose minimal of all chains (by some ordering).
    eliminateFinalA = function (chain, appendRewrite, orderA) {
      var bestChain, chain_i, i, j, ref;
      chain = takeLastA(chain);
      //zero chain is always shortest, return it.
      if (chain === unity) {
        return chain;
      }
      //now chain ends with B power, for sure.
      //if chain.letter isnt 'b' then throw new Error "two A's in the chain!"

      //bPower = chain.p

      //TODO: only try to append A powers that cause rewriting.
      bestChain = chain;
      for (i = j = 1, ref = orderA; (1 <= ref ? j < ref : j > ref); i = 1 <= ref ? ++j : --j) {
        chain_i = appendRewrite(chain, [['a', i]]);
        if (reverseShortlexLess(chain_i, bestChain)) {
          bestChain = chain_i;
        }
      }
      //console.log "EliminateA: got #{chain}, produced #{bestChain}"
      return bestChain;
    };


  }, { "./chain_map.coffee": 3, "./matrix3.coffee": 8, "./vondyck.coffee": 14, "./vondyck_chain.coffee": 15 }], 11: [function (require, module, exports) {
    var BaseFunc, BinaryTransitionFunc, DayNightTransitionFunc, GenericTransitionFunc, binaryTransitionFunc2GenericCode, dayNightBinaryTransitionFunc2GenericCode, isDayNightRule, parseIntChecked, parseTransitionFunction,
      indexOf = [].indexOf;

    ({ parseIntChecked } = require("./utils.coffee"));

    BaseFunc = (function () {
      class BaseFunc {
        plus(x, y) {
          return x + y;
        }

        setGeneration(g) { }

        getType() {
          throw new Error("Function type undefined");
        }

        toGeneric() {
          throw new Error("Function type undefined");
        }

        evaluate() {
          throw new Error("Function type undefined");
        }

        changeGrid(n, m) {
          return this;
        }

      };

      BaseFunc.prototype.plusInitial = 0;

      return BaseFunc;

    }).call(this);


    // Generic TF is given by its code.
    // Code is a JS object with 3 fields:
    // states: N #integer
    // sum: (r, x) -> r'  #default is (x,y) -> x+y
    // sumInitial: value r0 #default is 0
    // next: (sum, value) -> value
    exports.GenericTransitionFunc = GenericTransitionFunc = class GenericTransitionFunc extends BaseFunc {
      constructor(code1) {
        super(BaseFunc);
        this.code = code1;
        this.generation = 0;
        this._parse();
      }

      toString() {
        return this.code;
      }

      isStable() {
        return this.evaluate(0, 0) === 0;
      }

      setGeneration(g) {
        return this.generation = g;
      }

      getType() {
        return "custom";
      }

      _parse() {
        var ref, ref1, tfObject;
        tfObject = eval('(' + this.code + ')');
        if (tfObject.states == null) {
          throw new Error("Numer of states not specified");
        }
        if (tfObject.next == null) {
          throw new Error("Transition function not specified");
        }
        this.numStates = tfObject.states;
        this.plus = (ref = tfObject.sum) != null ? ref : (function (x, y) {
          return x + y;
        });
        this.plusInitial = (ref1 = tfObject.sumInitial) != null ? ref1 : 0;
        this.evaluate = tfObject.next;
        if (this.numStates <= 1) {
          throw new Error("Number of states must be 2 or more");
        }
      }

      toGeneric() {
        return this;
      }

    };


    //DayNight functions are those, who transform empty field to filled and back.
    // They can be effectively simulated as a pair of 2 rules, applying one rule for even generations and another for odd.
    isDayNightRule = function (binaryFunc) {
      return binaryFunc.evaluate(0, 0) === 1 && binaryFunc.evaluate(1, binaryFunc.numNeighbors) === 0;
    };

    exports.DayNightTransitionFunc = DayNightTransitionFunc = (function () {
      class DayNightTransitionFunc extends BaseFunc {
        constructor(base) {
          super(BaseFunc);
          this.base = base;
          if (!isDayNightRule(this.base)) {
            throw new Error("base function is not flashing");
          }
          this.phase = 0;
        }

        toString() {
          return this.base.toString();
        }

        getType() {
          return "binary";
        }

        setGeneration(g) {
          return this.phase = g & 1;
        }

        isStable() {
          return this.base.evaluate(0, 0) === 1 && this.base.evaluate(1, this.base.numNeighbors) === 0;
        }

        evaluate(x, s) {
          if (this.phase) {
            return 1 - this.base.evaluate(x, s);
          } else {
            return this.base.evaluate(1 - x, this.base.numNeighbors - s);
          }
        }

        toGeneric() {
          return new GenericTransitionFunc(dayNightBinaryTransitionFunc2GenericCode(this));
        }

        changeGrid(n, m) {
          return new DayNightTransitionFunc(this.base.changeGrid(n, m));
        }

      };

      DayNightTransitionFunc.prototype.numStates = 2;

      return DayNightTransitionFunc;

    }).call(this);

    exports.BinaryTransitionFunc = BinaryTransitionFunc = (function () {
      class BinaryTransitionFunc extends BaseFunc {
        constructor(n1, m1, bornAt, stayAt) {
          var arr, s;
          super(BaseFunc);
          this.n = n1;
          this.m = m1;
          this.numNeighbors = this.n * (this.m - 2);
          this.table = (function () {
            var j, len, ref, results;
            ref = [bornAt, stayAt];
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              arr = ref[j];
              results.push((function () {
                var k, ref1, results1;
                results1 = [];
                for (s = k = 0, ref1 = this.numNeighbors; k <= ref1; s = k += 1) {
                  if (indexOf.call(arr, s) >= 0) {
                    results1.push(1);
                  } else {
                    results1.push(0);
                  }
                }
                return results1;
              }).call(this));
            }
            return results;
          }).call(this);
        }

        isStable() {
          return table[0][0] === 0;
        }

        plus(x, y) {
          return x + y;
        }

        getType() {
          return "binary";
        }

        evaluate(state, sum) {
          if (state !== 0 && state !== 1) {
            throw new Error(`Bad state: ${state}`);
          }
          if (sum < 0 || sum > this.numNeighbors) {
            throw new Error(`Bad sum: ${sum}`);
          }
          return this.table[state][sum];
        }

        toString() {
          return "B " + this._nonzeroIndices(this.table[0]).join(" ") + " S " + this._nonzeroIndices(this.table[1]).join(" ");
        }

        _nonzeroIndices(arr) {
          var i, j, len, results, x;
          results = [];
          for (i = j = 0, len = arr.length; j < len; i = ++j) {
            x = arr[i];
            if (x !== 0) {
              results.push(i);
            }
          }
          return results;
        }

        toGeneric() {
          return new GenericTransitionFunc(binaryTransitionFunc2GenericCode(this));
        }

        changeGrid(n, m) {
          //OK, that's dirty but easy
          return parseTransitionFunction(this.toString(), n, m, false);
        }

      };

      BinaryTransitionFunc.prototype.plusInitial = 0;

      BinaryTransitionFunc.prototype.numStates = 2;

      return BinaryTransitionFunc;

    }).call(this);


    // BxxxSxxx
    exports.parseTransitionFunction = parseTransitionFunction = function (str, n, m, allowDayNight = true) {
      var bArray, func, match, sArray, strings2array;
      match = str.match(/^\s*B([\d\s]+)S([\d\s]+)$/);
      if (match == null) {
        throw new Error(`Bad function string: ${str}`);
      }
      strings2array = function (s) {
        var j, len, part, ref, results;
        ref = s.split(' ');
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          part = ref[j];
          if (part) {
            results.push(parseIntChecked(part));
          }
        }
        return results;
      };
      bArray = strings2array(match[1]);
      sArray = strings2array(match[2]);
      func = new BinaryTransitionFunc(n, m, bArray, sArray);
      //If allowed, convert function to day/night rule
      if (allowDayNight && isDayNightRule(func)) {
        return new DayNightTransitionFunc(func);
      } else {
        return func;
      }
    };

    exports.binaryTransitionFunc2GenericCode = binaryTransitionFunc2GenericCode = function (binTf) {
      var code, conditionBorn, conditionStay, row2condition;
      row2condition = function (row) {
        var nextValue, sum;
        return ((function () {
          var j, len, results;
          results = [];
          for (sum = j = 0, len = row.length; j < len; sum = ++j) {
            nextValue = row[sum];
            if (nextValue) {
              results.push(`s===${sum}`);
            }
          }
          return results;
        })()).join(" || ");
      };
      conditionBorn = row2condition(binTf.table[0]);
      conditionStay = row2condition(binTf.table[1]);
      return code = [
        `//Automatically generated code for binary rule ${binTf}
{
    //number of states
    'states': 2,

    //Neighbors sum calculation is default. Code for reference.
    //'plus': function(s,x){ return s+x; },
    //'plusInitial': 0,
    
    //Transition function. Takes current state and sum, returns new state.
    //this.generation stores current generation number
    'next': function(x, s){
        if (x===1 && (${conditionStay})) return 1;
        if (x===0 && (${conditionBorn})) return 1;
        return 0;
     }
}`
      ];
    };

    exports.dayNightBinaryTransitionFunc2GenericCode = dayNightBinaryTransitionFunc2GenericCode = function (binTf) {
      var code, conditionBorn, conditionBornInv, conditionStay, conditionStayInv, row2condition, row2conditionInv;
      row2condition = function (row) {
        var nextValue, sum;
        return ((function () {
          var j, len, results;
          results = [];
          for (sum = j = 0, len = row.length; j < len; sum = ++j) {
            nextValue = row[sum];
            if (nextValue) {
              results.push(`s===${sum}`);
            }
          }
          return results;
        })()).join(" || ");
      };
      row2conditionInv = function (row) {
        var nextValue, sum;
        return ((function () {
          var j, len, results;
          results = [];
          for (sum = j = 0, len = row.length; j < len; sum = ++j) {
            nextValue = row[sum];
            if (nextValue) {
              results.push(`s===${binTf.base.numNeighbors - sum}`);
            }
          }
          return results;
        })()).join(" || ");
      };
      conditionBorn = row2condition(binTf.base.table[0]);
      conditionStay = row2condition(binTf.base.table[1]);
      conditionBornInv = row2conditionInv(binTf.base.table[0]);
      conditionStayInv = row2conditionInv(binTf.base.table[1]);
      return code = [
        `//Automatically generated code for population-inverting binary rule ${binTf}
{
    //number of states
    'states': 2,

    //Neighbors sum calculation is default. Code for reference.
    //'plus': function(s,x){ return s+x; },
    //'plusInitial': 0,
    
    //Transition function. Takes current state and sum, returns new state.
    'next': function(x, s){
        var phase = this.generation & 1;

        //The original rule ${binTf} inverts state of an empty field
        //To calculate it efficiently, we instead invert each odd generation, so that population never goes to infinity.
        
        
        if (phase === 0){
            //On even generations, invert output
            if (x===1 && (${conditionStay})) return 0;
            if (x===0 && (${conditionBorn})) return 0;
            return 1
        } else {
            //On odd generations, invert input state and nighbors sum
            if (x===0 && (${conditionStayInv})) return 1;
            if (x===1 && (${conditionBornInv})) return 1;
            return 0;
        }
     }
}`
      ];
    };


  }, { "./utils.coffee": 13 }], 12: [function (require, module, exports) {
    var CenteredVonDyck, M, mod;

    M = require("./matrix3.coffee");

    ({ mod } = require("./utils.coffee"));

    // exports.TriangleGroup = class TriangleGroup
    //   constructor: (p,q,r) ->
    //     [sp,sq,sr] = (Math.cos(Math.PI/n) for n in [p,q,r])
    //     @pqr = [p,q,r]

    //     m = [-1.0,sp,sr, \
    //          sp,-1.0,sq, \
    //          sr,sq,-1.0]
    //     @m = m

    //     im = M.add M.smul(2, m), M.eye()

    //     sigma = (k) ->
    //       s = M.zero()
    //       e = M.eye()
    //       for i in [0...3]
    //         for j in [0...3]
    //           M.set s, i, j, (if i is k then im else e)[i*3+j]
    //       return s
    //     @m_pqr = (sigma(i) for i in [0...3])
    //     toString = ->
    //       "Trg(#{@pqr[0]},#{@pqr[1]},#{@pqr[2]})"%self.pqr
    /*
     * Impoementation of VD groups of order (n, m, 2)
     * with 2 generators: a, b
     *  and rules: a^n = b^m = abab = e
     *
     *  such that `a` has fixed point (0,0,1)
     */
    exports.CenteredVonDyck = CenteredVonDyck = class CenteredVonDyck {
      constructor(n, m, k = 2) {
        var PI, alpha, beta, cos, gamma, sin, sqrt;
        //a^n = b^m = (abab) = e
        ({ cos, sin, sqrt, PI } = Math);
        alpha = PI / n;
        beta = PI / m;
        gamma = PI / k;
        this.n = n;
        this.m = m;
        this.k = k;
        //Representation of generator A: rotation of the 2N-gon
        this.a = M.rot(0, 1, 2 * alpha);

        //Hyp.cosine of the distance from the center of ne 2N-gon to the order-K vertex. (when K=2, it is the center of the edge of N-gon)
        this.cosh_x = (cos(beta) + cos(alpha) * cos(gamma)) / (sin(alpha) * sin(gamma));

        //Hyp.cosine of the distance from the center of ne 2N-gon to the order-N vertex.
        this.cosh_r = (cos(gamma) + cos(alpha) * cos(beta)) / (sin(alpha) * sin(beta));
        if (this.cosh_r < 1.0 + 1e-10) { //treshold
          throw new Error(`von Dyck group {${n},${m},${k}} is not hyperbolic, representation not supported.`);
        }
        this.sinh_r = sqrt(this.cosh_r ** 2 - 1);
        this.sinh_x = sqrt(this.cosh_x ** 2 - 1);
        //REpresentation of generator B: rotation of the 2N-gon around the vertex of order M.
        this.b = M.mul(M.mul(M.hrot(0, 2, this.sinh_r), M.rot(0, 1, 2 * beta)), M.hrot(0, 2, -this.sinh_r));
        this.aPowers = M.powers(this.a, n);
        this.bPowers = M.powers(this.b, m);
        //Points, that are invariant under generator action. Rotation centers.
        this.centerA = [0.0, 0.0, 1.0];
        this.centerB = [this.sinh_r, 0.0, this.cosh_r];
        this.centerAB = [this.sinh_x * cos(alpha), this.sinh_x * sin(alpha), this.cosh_x];
      }

      aPower(i) {
        return this.aPowers[mod(i, this.n)];
      }

      bPower(i) {
        return this.bPowers[mod(i, this.m)];
      }

      generatorPower(g, i) {
        if (g === 'a') {
          return this.aPower(i);
        } else if (g === 'b') {
          return this.bPower(i);
        } else {
          throw new Error(`Unknown generator: ${g}`);
        }
      }

      toString() {
        return `CenteredVonDyck(${this.n},${this.m},${this.k})`;
      }

    };


  }, { "./matrix3.coffee": 8, "./utils.coffee": 13 }], 13: [function (require, module, exports) {
    "use strict";
    exports.formatString = function (s, args) {
      return s.replace(/{(\d+)}/g, function (match, number) {
        var ref;
        return (ref = args[number]) != null ? ref : match;
      });
    };

    exports.pad = function (num, size) {
      var s;
      s = num + "";
      while (s.length < size) {
        s = "0" + s;
      }
      return s;
    };

    exports.parseIntChecked = function (s) {
      var v;
      v = parseInt(s, 10);
      if (Number.isNaN(v)) {
        throw new Error(`Bad number: ${s}`);
      }
      return v;
    };

    exports.parseFloatChecked = function (s) {
      var v;
      v = parseFloat(s);
      if (Number.isNaN(v)) {
        throw new Error(`Bad number: ${s}`);
      }
      return v;
    };

    //mathematical modulo
    exports.mod = function (i, n) {
      return ((i % n) + n) % n;
    };


  }, {}], 14: [function (require, module, exports) {
    var CenteredVonDyck, RewriteRuleset, VonDyck, knuthBendix, makeAppendRewrite, parseChain, unity, vdRule;

    ({ makeAppendRewrite, vdRule } = require("./vondyck_rewriter.coffee"));

    ({ parseChain, unity } = require("./vondyck_chain.coffee"));

    ({ RewriteRuleset, knuthBendix } = require("../core/knuth_bendix.coffee"));

    ({ CenteredVonDyck } = require("./triangle_group_representation.coffee"));

    //Top-level interface for vonDyck groups.
    exports.VonDyck = VonDyck = class VonDyck {
      constructor(n, m, k = 2) {
        this.n = n;
        this.m = m;
        this.k = k;
        if (this.n <= 0) {
          throw new Error("bad N");
        }
        if (this.m <= 0) {
          throw new Error("bad M");
        }
        if (this.k <= 0) {
          throw new Error("bad K");
        }
        this.unity = unity;
        //Matrix representation is only supported for hyperbolic groups at the moment.
        this.representation = (function () {
          switch (this.type()) {
            case "hyperbolic":
              return new CenteredVonDyck(this.n, this.m, this.k);
            case "euclidean":
              return null;
            case "spheric":
              return null;
          }
        }).call(this);
      }

      //Return group type. One of "hyperbolic", "euclidean" or "spheric"
      type() {
        var den, num;
        //1/n+1/m+1/k  ?  1

        // (nm+nk+mk) ? nmk
        num = this.n * this.m + this.n * this.k + this.m * this.k;
        den = this.n * this.m * this.k;
        if (num < den) {
          return "hyperbolic";
        } else if (num === den) {
          return "euclidean";
        } else {
          return "spheric";
        }
      }

      toString() {
        return `VonDyck(${this.n}, ${this.m}, ${this.k})`;
      }

      parse(s) {
        return parseChain(s);
      }

      solve() {
        var rewriteRuleset;
        rewriteRuleset = knuthBendix(vdRule(this.n, this.m, this.k));
        return this.appendRewrite = makeAppendRewrite(rewriteRuleset);
      }

      //console.log "Solved group #{@} OK"
      appendRewrite(chain, stack) {
        throw new Error("Group not solved");
      }

      rewrite(chain) {
        return this.appendRewrite(this.unity, chain.asStack());
      }

      repr(chain) {
        return chain.repr(this.representation);
      }

      inverse(chain) {
        return this.appendInverse(unity, chain);
      }


      // appends c^-1 to a
      appendInverse(a, c) {
        var e_p, elementsWithPowers, i, len;
        elementsWithPowers = c.asStack();
        elementsWithPowers.reverse();
        for (i = 0, len = elementsWithPowers.length; i < len; i++) {
          e_p = elementsWithPowers[i];
          e_p[1] *= -1;
        }
        return this.appendRewrite(a, elementsWithPowers);
      }

      append(c1, c2) {
        return this.appendRewrite(c1, c2.asStack());
      }

    };


  }, { "../core/knuth_bendix.coffee": 7, "./triangle_group_representation.coffee": 12, "./vondyck_chain.coffee": 15, "./vondyck_rewriter.coffee": 16 }], 15: [function (require, module, exports) {
    /* Implementation of values of von Dyck groups.
     *  Each value is a chain of powers of 2 generators: A and B
     *
     *  Example:
     *    x = a*b*a-1*b^2*a*b-3
     *
     *  vD groups have additional relations for generators:
     *   a^n === b^m === (ab)^k,
     *  however this implementation is agnostic about these details.
     *  They are implemented by the js_rewriter module.
     *
     *  (To this module actually implements free group of 2 generators...)
     *
     *  To facilitate chain appending/truncating, theyt are implemented as a functional data structure.
     *  Root element is `unity`, it represens identity element of the group.
     */
    var M, Node, NodeA, NodeB, chainEquals, newNode, nodeConstructors, reverseShortlexLess, showChain, truncateA, truncateB, unity;

    M = require("./matrix3.coffee");

    exports.Node = Node = class Node {
      hash() {
        var h;
        if ((h = this.h) !== null) {
          return h;
        } else {
          //seen here: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
          h = this.t.hash();
          return this.h = (((h << 5) - h) + (this.letterCode << 7) + this.p) | 0;
        }
      }

      repr(generatorMatrices) {
        var m;
        if ((m = this.mtx) !== null) {
          return m;
        } else {
          return this.mtx = M.mul(this.t.repr(generatorMatrices), generatorMatrices.generatorPower(this.letter, this.p));
        }
      }

      len() {
        return this.l;
      }

      equals(c) {
        return chainEquals(this, c);
      }

      a(pow) {
        return new NodeA(pow, this);
      }

      b(pow) {
        return new NodeB(pow, this);
      }

      toString() {
        return showChain(this);
      }

      /* Convert chain to array of pairs: [letter, power], where letter is "a" or "b" and power is integer.
       * Top element of the chain becomes first element of the array
        */
      asStack() {
        var node, result;
        result = [];
        node = this;
        while (node !== unity) {
          result.push([node.letter, node.p]);
          node = node.t;
        }
        return result;
      }


      //Append elements from the array to the chain.
      // First element of the array becomes top element of the chain;
      // stack itself becomes empty
      appendStack(stack) {
        var chain, e, p;
        chain = this;
        while (stack.length > 0) {
          [e, p] = stack.pop();
          chain = newNode(e, p, chain);
        }
        return chain;
      }

    };

    exports.unity = unity = new Node();

    unity.l = 0;

    unity.h = 0;

    unity.mtx = M.eye();

    unity.repr = function (g) {
      return this.mtx; //jsut overload with a faster code.
    };

    exports.NodeA = NodeA = (function () {
      class NodeA extends Node {
        constructor(p1, t) {
          super(Node);
          this.p = p1;
          this.t = t;
          this.l = this.t === unity ? 1 : this.t.l + 1;
          this.h = null;
          this.mtx = null; //support for calculating matrix representations
        }

      };

      NodeA.prototype.letter = 'a';

      NodeA.prototype.letterCode = 0;

      return NodeA;

    }).call(this);

    exports.NodeB = NodeB = (function () {
      class NodeB extends Node {
        constructor(p1, t) {
          super(Node);
          this.p = p1;
          this.t = t;
          this.l = this.t === unity ? 1 : this.t.l + 1;
          this.h = null;
          this.mtx = null;
        }

      };

      NodeB.prototype.letter = 'b';

      NodeB.prototype.letterCode = 1;

      return NodeB;

    }).call(this);

    chainEquals = function (a, b) {
      while (true) {
        if (a === b) {
          return true;
        }
        if (a === unity || b === unity) {
          return false; //a is E and b is E, but not both
        }
        if ((a.letter !== b.letter) || (a.p !== b.p)) {
          return false;
        }
        a = a.t;
        b = b.t;
      }
    };

    showChain = function (node) {
      var letter, parts, power;
      if (node === unity) {
        return 'e';
      }
      parts = [];
      while (node !== unity) {
        letter = node.letter;
        power = node.p;
        if (power < 0) {
          letter = letter.toUpperCase();
          power = -power;
        }
        //Adding in reverse order!
        if (power !== 1) {
          parts.push(`^${power}`);
        }
        parts.push(letter);
        node = node.t;
      }
      return parts.reverse().join('');
    };

    //reverse of showChain
    exports.parseChain = function (s) {
      var letter, letterLow, match, power, prepend, ref, updPrepender;
      if (s === '' || s === 'e') {
        return unity;
      }
      prepend = function (tail) {
        return tail;
      };
      updPrepender = function (prepender, letter, power) {
        return function (tail) {
          return newNode(letter, power, prepender(tail));
        };
      };
      while (s) {
        match = s.match(/([aAbB])(?:\^(\d+))?/);
        if (!match) {
          throw new Error(`Bad syntax: ${s}`);
        }
        s = s.substr(match[0].length);
        letter = match[1];
        power = parseInt((ref = match[2]) != null ? ref : '1', 10);
        letterLow = letter.toLowerCase();
        if (letter !== letterLow) {
          power = -power;
        }
        prepend = updPrepender(prepend, letterLow, power);
      }
      return prepend(unity);
    };

    exports.truncateA = truncateA = function (chain) {
      while ((chain !== unity) && (chain.letter === "a")) {
        chain = chain.t;
      }
      return chain;
    };

    exports.truncateB = truncateB = function (chain) {
      while ((chain !== unity) && (chain.letter === "b")) {
        chain = chain.t;
      }
      return chain;
    };

    exports.nodeConstructors = nodeConstructors = {
      a: NodeA,
      b: NodeB
    };

    exports.newNode = newNode = function (letter, power, parent) {
      return new nodeConstructors[letter](power, parent);
    };

    /*
     * Reverse compare 2 chains by shortlex algorithm
     */
    exports.reverseShortlexLess = reverseShortlexLess = function (c1, c2) {
      if (c1 === unity) {
        return c2 !== unity;
      } else {
        //c1 not unity
        if (c2 === unity) {
          return false;
        } else {
          //neither is unity
          if (c1.l !== c2.l) {
            return c1.l < c2.l;
          }
          //both are equal length
          while (c1 !== unity) {
            if (c1.letter !== c2.letter) {
              return c1.letter < c2.letter;
            }
            if (c1.p !== c2.p) {
              return c1.p < c2.p;
            }
            //go upper
            c1 = c1.t;
            c2 = c2.t;
          }
          //exactly equal
          return false;
        }
      }
    };


  }, { "./matrix3.coffee": 8 }], 16: [function (require, module, exports) {
    //Generates JS code that effectively rewrites
    /*
    #Every string is a sequence of powers of 2 operators: A and B.
    #powers are limited to be in range -n/2 ... n/2 and -m/2 ... m/2
     *
     *
    #rewrite rules work on these pow cahins:
     *
     *
    #Trivial rewrites:
     *   a^-1 a       -> e
     *   b^-1 b       -> e
     *   a a^-1       -> e
     *   b b^-1       -> e
     *
    #Power modulo rewrites.
     *   b^2  -> b^-2
     *   b^-3 -> b
     *   #allower powers: -2, -1, 1
     *   #rewrite rule: (p + 2)%4-2
     *
     *   a^2  -> a^-2
     *   a^-3 -> a
     *   #allower powers: -2, -1, 1
     *   #rewrite rule: (p+2)%4-2
     *
    #Non-trivial rewrites
     * Ending with b
     *   a b  -> b^-1 a^-1
     *   b^-1 a^-1 b^-1       -> a       *
     *   a b^-2       -> b^-1 a^-1 b     *
     *   b a^-1 b^-1  -> b^-2 a          *
     *
     * Ending with a
     *   b a  -> a^-1 b^-1
     *   a^-1 b^-1 a^-1       -> b       *
     *   a b^-1 a^-1  -> a^-2 b          *
     *   b a^-2       -> a^-1 b^-1 a     *
     *
     *
    #As a tree, sorted in reverse order. Element in square braces is "eraser" for the last element in the matching pattern.
     *
    #- Root B
     *  - b^-2   
     *    - a       REW: [a^-1] b^-1 a^-1 b
     *  - b^-1
     *    - a^-1
     *       - b    REW: [b^-1] b^-2 a
     *       - b^-1 REW: [b] a
     *  - b
     *    - a       REW: [a^-1] b^-1 a^-1
     *
    #- Root A
     *  - a^-2 
     *    - b       REW: [b^-1] a^-1 b^-1 a
     *  - a^-1
     *    - b^-1
     *       - a    REW: [a^-1] a^-2 b
     *       - a^-1 REW: [a] b
     *  - a
     *    - b       REW: [b^-1] a^-1 b^-1
     *   
    #Idea: 2 rewriters. For chains ending with A and with B.
    #Chains are made in functional style, stored from end. 
     *
     *
    #See sample_rewriter.js for working code.
     *    
     */
    var CodeGenerator, JsCodeGenerator, NodeA, NodeB, RewriteRuleset, chain2string, collectPowers, elementOrder, elementPowerRange, extendLastPowerRewriteTable, groupByPower, groupPowersVd, makeAppendRewrite, makeAppendRewriteRef, mod, newNode, nodeConstructors, otherElem, powerRewriteRules, repeat, repeatRewrite, reverseSuffixTable, string2chain, tailInRewriteTable, ungroupPowersVd, unity, vdRule;

    ({ RewriteRuleset } = require("./knuth_bendix.coffee"));

    ({ unity, NodeA, NodeB, nodeConstructors, newNode } = require("./vondyck_chain.coffee"));

    collectPowers = function (elemsWithPowers) {
      /* List (elem, power::int) -> List (elem, power::int)
         */
      var elem, grouped, j, len, newPower, power;
      grouped = [];
      for (j = 0, len = elemsWithPowers.length; j < len; j++) {
        [elem, power] = elemsWithPowers[j];
        if (grouped.length === 0) {
          grouped.push([elem, power]);
        } else if (grouped[grouped.length - 1][0] === elem) {
          newPower = grouped[grouped.length - 1][1] + power;
          if (newPower !== 0) {
            grouped[grouped.length - 1][1] = newPower;
          } else {
            grouped.pop();
          }
        } else {
          grouped.push([elem, power]);
        }
      }
      return grouped;
    };

    exports.groupByPower = groupByPower = function (s) {
      var i, j, last, lastPow, ref, result, x;
      last = null;
      lastPow = null;
      result = [];
      for (i = j = 0, ref = s.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        x = s[i];
        if (last === null) {
          last = x;
          lastPow = 1;
        } else {
          if (x === last) {
            lastPow += 1;
          } else {
            result.push([last, lastPow]);
            last = x;
            lastPow = 1;
          }
        }
      }
      if (last !== null) {
        result.push([last, lastPow]);
      }
      return result;
    };

    //collect powers, assuming convention that uppercase letters degignate negative powers
    exports.groupPowersVd = groupPowersVd = function (s) {
      var j, len, p, ref, results, x;
      ref = groupByPower(s);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        [x, p] = ref[j];
        if (x.toUpperCase() === x) {
          results.push([x.toLowerCase(), -p]);
        } else {
          results.push([x, p]);
        }
      }
      return results;
    };

    otherElem = function (e) {
      return {
        'a': 'b',
        'b': 'a'
      }[e];
    };

    mod = function (x, y) {
      return (x % y + y) % y;
    };

    exports.JsCodeGenerator = JsCodeGenerator = class JsCodeGenerator {
      constructor(debug = false, pretty = false) {
        this.out = [];
        this.ident = 0;
        this.debug = debug;
        this.pretty = pretty;
      }

      get() {
        var code;
        if (this.ident !== 0) {
          throw new RuntimeError("Attempt to get generated code while not finished");
        }
        code = this.out.join("");
        this.reset();
        return code;
      }

      reset() {
        return this.out = [];
      }

      line(text) {
        var i, j, ref;
        if (!this.debug && text.match(/^console\.log/)) {
          return;
        }
        if (!this.pretty && text.match(/^\/\//)) {
          return;
        }
        if (this.pretty || text.match(/\/\//)) {
          for (i = j = 0, ref = this.ident; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
            this.out.push("    ");
          }
        }
        this.out.push(text);
        return this.out.push(this.pretty ? "\n" : " ");
      }

      if_(conditionText) {
        return this.line(`if(${conditionText})`);
      }

      op(expressionText) {
        return this.line(`${expressionText};`);
      }

      block(callback) {
        this.line("{");
        this.ident += 1;
        callback();
        this.ident -= 1;
        return this.line("}");
      }

    };

    exports.CodeGenerator = CodeGenerator = class CodeGenerator extends JsCodeGenerator {
      constructor(rewriteTable, out, debug = false, pretty = false) {
        var powerRewrites, rangeA, rangeB;
        super(debug, pretty);
        powerRewrites = powerRewriteRules(rewriteTable);
        rangeA = elementPowerRange(powerRewrites, 'a');
        rangeB = elementPowerRange(powerRewrites, 'b');
        this.minPower = {
          'a': rangeA[0],
          'b': rangeB[0]
        };
        this.elementOrder = {
          'a': elementOrder(powerRewrites, 'a'),
          'b': elementOrder(powerRewrites, 'b')
        };

        //extend rewrite table with new rules
        rewriteTable = rewriteTable.copy();
        extendLastPowerRewriteTable(rewriteTable, 'a', rangeA[0], rangeA[1]);
        extendLastPowerRewriteTable(rewriteTable, 'b', rangeB[0], rangeB[1]);
        this.rewriteTable = rewriteTable;
        this.suffixTree = reverseSuffixTable(rewriteTable);
      }

      generateAppendRewriteOnce() {
        this.line("(function(chain, stack )");
        this.block(() => {
          this.line("if (stack.length === 0) {throw new Error('empty stack');}");
          this.op("var _e = stack.pop(), element = _e[0], power = _e[1]");
          this.line("if (chain === unity)");
          this.block(() => {
            this.line("//empty chain");
            this.line('console.log("Append to empth chain:"+_e);');
            this.line(`var order=(element==='a')?${this.elementOrder['a']}:${this.elementOrder['b']};`);
            this.line(`var lowestPow=(element==='a')?${this.minPower['a']}:${this.minPower['b']};`);
            return this.line('chain = newNode( element, mod(power-lowestPow, order)+lowestPow, chain);');
          });
          this.line('else');
          this.block(() => {
            return this.generateMain();
          });
          return this.line("return chain;");
        });
        this.line(")");
        return this.get();
      }

      generateMain() {
        this.line('if (chain.letter==="a")');
        this.block(() => {
          this.line('console.log("Append "+JSON.stringify(_e)+" to chain ending with A:"+chain);');
          this.generatePowerAccumulation("a");
          return this.generateRewriterFrom("b");
        });
        this.line('else if (chain.letter==="b")');
        this.block(() => {
          this.line('console.log("Append "+JSON.stringify(_e)+" to chain ending with B:"+chain);');
          this.generatePowerAccumulation("b");
          return this.generateRewriterFrom("a");
        });
        return this.line('else throw new Error("Chain neither a nor b?");');
      }

      generatePowerAccumulation(letter) {
        this.line(`if (element === \"${letter}\")`);
        return this.block(() => {
          var lowestPow, order;
          this.line(`console.log(\"    element is ${letter}\");`);
          lowestPow = this.minPower[letter];
          order = this.elementOrder[letter];
          this.line(`var newPower = ((chain.p + power - ${lowestPow})%${order}+${order})%${order}+${lowestPow};`);
          this.line("chain = chain.t;");
          this.line('if (newPower !== 0)');
          this.block(() => {
            var nodeClass;
            nodeClass = this._nodeClass(letter);
            this.line('console.log("    new power is "+newPower);');
            //and append modified power to the stack
            return this.line(`stack.push(['${letter}', newPower]);`);
          });
          if (this.debug) {
            this.line('else');
            return this.block(() => {
              return this.line('console.log("      power reduced to 0, new chain="+chain);');
            });
          }
        });
      }

      generateRewriterFrom(newElement) {
        /*Generate rewriters, when `newElement` is added, and it is not the same as the last element of the chain*/
        this.line("else");
        return this.block(() => {
          var mo, nodeConstructor, o;
          this.line(`//Non-trivial rewrites, when new element is ${newElement}`);
          nodeConstructor = this._nodeClass(newElement);
          o = this.elementOrder[newElement];
          mo = this.minPower[newElement];
          this.line(`chain = new ${nodeConstructor}((((power - ${mo})%${o}+${o})%${o}+${mo}), chain);`);
          return this.generateRewriteBySuffixTree(newElement, this.suffixTree, 'chain');
        });
      }

      generateRewriteBySuffixTree(newElement, suffixTree, chain) {
        var compOperator, e_p, e_p_str, elem, elemPower, first, isLeaf, results, subTable, suf;
        first = true;
        results = [];
        for (e_p_str in suffixTree) {
          subTable = suffixTree[e_p_str];
          e_p = JSON.parse(e_p_str);
          this.line(`// e_p = ${JSON.stringify(e_p)}`);
          [elem, elemPower] = e_p;
          if (elem !== newElement) {
            continue;
          }
          if (!first) {
            this.line("else");
          } else {
            first = false;
          }
          isLeaf = subTable["rewrite"] != null;
          if (isLeaf) {
            compOperator = elemPower < 0 ? "<=" : ">=";
            suf = subTable["original"];
            this.line(`//reached suffix: ${suf}`);
            this.line(`if (${chain}.p${compOperator}${elemPower})`);
            this.line(`// before call leaf: ep = ${elemPower}`);
            results.push(this.block(() => {
              return this.generateLeafRewrite(elem, elemPower, subTable["rewrite"], chain);
            }));
          } else {
            this.line(`if (${chain}.p === ${elemPower})`);
            results.push(this.block(() => {
              this.line(`if (${chain}.t)`);
              return this.block(() => {
                return this.generateRewriteBySuffixTree(otherElem(newElement), subTable, chain + ".t");
              });
            }));
          }
        }
        return results;
      }

      generateLeafRewrite(elem, elemPower, rewrite, chain) {
        var e, p, revRewrite, sPowers;
        if (elemPower == null) {
          throw new Error("power?");
        }
        this.line(`console.log( 'Leaf: rewrite this to ${rewrite}');`);
        this.line(`//elem: ${elem}, power: ${elemPower}: rewrite this to ${rewrite}`);
        this.line(`console.log( 'Truncate chain from ' + chain + ' to ' + ${chain} + ' with additional elem: ${elem}^${-elemPower}' );`);
        this.line(`chain = ${chain};`);
        this.line("//Append rewrite");
        revRewrite = rewrite.slice(0);
        revRewrite.reverse();
        revRewrite.push([elem, -elemPower]);
        sPowers = ((function () {
          var j, len, ref, results;
          ref = collectPowers(revRewrite);
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            [e, p] = ref[j];
            results.push(`[\"${e}\",${p}]`);
          }
          return results;
        })()).join(",");
        return this.line(`stack.push(${sPowers});`);
      }

      _nodeClass(letter) {
        return {
          "a": "NodeA",
          "b": "NodeB"
        }[letter];
      }

    };

    //extracts from table rules, rewriting single powers                
    powerRewriteRules = function (rewriteTable) {
      var gKey, gRewrite, j, key, len, p, p1, ref, result, rewrite, x, x_;
      result = [];
      ref = rewriteTable.items();
      for (j = 0, len = ref.length; j < len; j++) {
        [key, rewrite] = ref[j];
        gKey = groupPowersVd(key);
        gRewrite = groupPowersVd(rewrite);
        if (gKey.length === 1 && gRewrite.length === 1) {
          [x, p] = gKey[0];
          [x_, p1] = gRewrite[0];
          if (x === x_) {
            result.push([x, p, p1]);
          }
        }
      }
      return result;
    };

    //for given lsit of power rewrites, return range of allowed powers for element
    // (range bounds are inclusive)
    elementPowerRange = function (powerRewrites, letter) {
      /*search for rules of type a^n -> a^m*/
      var maxPower, minPower, p1, p2, powers, x;
      powers = (function () {
        var j, len, results;
        results = [];
        for (j = 0, len = powerRewrites.length; j < len; j++) {
          [x, p1, p2] = powerRewrites[j];
          if (x === letter) {
            results.push(p1);
          }
        }
        return results;
      })();
      if (powers.length === 0) {
        throw new Error(`No power rewrites for ${letter}`);
      }
      minPower = Math.min(...powers) + 1;
      maxPower = Math.max(...powers) - 1;
      return [minPower, maxPower];
    };

    elementOrder = function (powerRewrites, letter) {
      var orders, p1, p2, x;
      orders = (function () {
        var j, len, results;
        results = [];
        for (j = 0, len = powerRewrites.length; j < len; j++) {
          [x, p1, p2] = powerRewrites[j];
          if (x === letter) {
            results.push(Math.abs(p1 - p2));
          }
        }
        return results;
      })();
      if (orders.length === 0) {
        throw new Error(`No power rewrites for ${letter}`);
      }
      return Math.min(...orders);
    };

    reverseSuffixTable = function (ruleset, ignorePowers = true) {
      var e_p, e_p_str, gRewrite, gSuffix, j, l, len, ref, revTable, rewrite, suffix, table, table1;
      revTable = {};
      ref = ruleset.items();
      for (j = 0, len = ref.length; j < len; j++) {
        [suffix, rewrite] = ref[j];
        gSuffix = groupPowersVd(suffix);
        //gSuffix.reverse()
        gRewrite = groupPowersVd(rewrite);
        //gRewrite.reverse()
        if (ignorePowers) {
          if (gSuffix.length === 1 && gRewrite.length === 1 && gSuffix[0][0] === gRewrite[0][0]) {
            continue;
          }
          if (gSuffix.length === 2 && gRewrite.length === 0) {
            continue;
          }
        }
        table = revTable;
        for (l = gSuffix.length - 1; l >= 0; l += -1) {
          e_p = gSuffix[l];
          e_p_str = JSON.stringify(e_p);
          if (table.hasOwnProperty(e_p_str)) {
            table = table[e_p_str];
          } else {
            table1 = {};
            table[e_p_str] = table1;
            table = table1;
          }
        }
        table["rewrite"] = gRewrite;
        table["original"] = gSuffix;
      }
      return revTable;
    };

    exports.repeatRewrite = repeatRewrite = function (appendRewriteOnce) {
      return function (chain, stack) {
        while (stack.length > 0) {
          chain = appendRewriteOnce(chain, stack);
        }
        return chain;
      };
    };

    exports.canAppend = function (appendRewriteOnce) {
      return function (chain, element, power) {
        var stack;
        stack = [[element, power]];
        appendRewriteOnce(chain, stack);
        return stack.length === 0;
      };
    };

    exports.makeAppendRewrite = makeAppendRewrite = function (s) {
      var appendRewrite, appendRewriteOnce, g, rewriterCode;
      g = new CodeGenerator(s);
      g.debug = false;
      rewriterCode = g.generateAppendRewriteOnce();
      //console.log rewriterCode
      appendRewriteOnce = eval(rewriterCode);
      if (appendRewriteOnce == null) {
        throw new Error("Rewriter failed to compile");
      }
      appendRewrite = repeatRewrite(appendRewriteOnce);
      return appendRewrite;
    };

    repeat = function (pattern, count) {
      var result;
      if (count < 1) {
        return '';
      }
      result = '';
      while (count > 1) {
        if (count & 1) {
          result += pattern;
        }
        count >>= 1;
        pattern += pattern;
      }
      return result + pattern;
    };

    exports.vdRule = vdRule = function (n, m, k = 2) {
      /*
       * Create initial ruleset for von Dyck group with inverse elements
       * https://en.wikipedia.org/wiki/Triangle_group#von_Dyck_groups
       */
      var r;
      r = {
        'aA': "",
        'Aa': "",
        'bB': "",
        'Bb': ""
      };
      r[repeat('BA', k)] = "";
      r[repeat('ab', k)] = "";
      r[repeat('A', n)] = "";
      r[repeat('a', n)] = "";
      r[repeat('B', m)] = "";
      r[repeat('b', m)] = "";
      return new RewriteRuleset(r);
    };

    exports.string2chain = string2chain = function (s) {
      var grouped;
      //last element of the string is chain head
      grouped = groupPowersVd(s);
      grouped.reverse();
      return unity.appendStack(grouped);
    };

    exports.chain2string = chain2string = function (chain) {
      var e, p, s;
      s = "";
      while (chain !== unity) {
        e = chain.letter;
        p = chain.p;
        if (p < 0) {
          e = e.toUpperCase();
          p = -p;
        }
        s = repeat(e, p) + s;
        chain = chain.t;
      }
      return s;
    };

    //take list of pairs: [element, power] and returns list of single elements,
    // assuming convention that negative power is uppercase letter.
    ungroupPowersVd = function (stack) {
      var e, i, j, l, len, p, ref, ungroupedStack;
      ungroupedStack = [];
      for (j = 0, len = stack.length; j < len; j++) {
        [e, p] = stack[j];
        if (p < 0) {
          p = -p;
          e = e.toUpperCase();
        }
        for (i = l = 0, ref = p; l < ref; i = l += 1) {
          ungroupedStack.push(e);
        }
      }
      return ungroupedStack;
    };


    //#Creates reference rewriter, using strings internally.
    // Slow, but better tested than the compiled.
    exports.makeAppendRewriteRef = makeAppendRewriteRef = function (rewriteRule) {
      return function (chain, stack) {
        var sChain, ungroupedStack;
        sChain = chain2string(chain);
        ungroupedStack = ungroupPowersVd(stack);
        ungroupedStack.reverse();
        //console.log "Ref rewriter: chain=#{sChain}, stack=#{ungroupedStack.join('')}"    
        return string2chain(rewriteRule.appendRewrite(sChain, ungroupedStack.join('')));
      };
    };

    //Takes some rewrite ruleset and extends it by adding new rules with increased power of last element
    // Example:
    //  Original table:
    //    b^2 a^1 -> XXX
    //  Extended table
    //    b^2 a^2 -> XXXa
    //    b^2 a^3 -> XXXa^2
    //    ... 
    //    b^2 a^maxPower -> XXXa^{maxPower-1}

    //  if power is negative, it is extended to minPower.
    //  This function modifies existing rewrite table.
    exports.extendLastPowerRewriteTable = extendLastPowerRewriteTable = function (rewriteRule, element, minPower, maxPower) {
      var gRewrite, gSuffix, j, l, lastPower, len, newRewrite, newSuffix, p, power, ref, ref1, ref2, ref3, rewrite, step, suffix;
      if (minPower > 0) {
        throw new Error("min power must be non-positive");
      }
      if (maxPower < 0) {
        throw new Error("max power must be non-negative");
      }
      ref = rewriteRule.items();

      //newRules = []
      for (j = 0, len = ref.length; j < len; j++) {
        [suffix, rewrite] = ref[j];
        gSuffix = groupPowersVd(suffix);
        if (gSuffix.length === 0) {
          throw new Error('empty suffix!?');
        }
        if (gSuffix[gSuffix.length - 1][0] !== element) {
          continue;
        }
        gRewrite = groupPowersVd(rewrite);
        power = gSuffix[gSuffix.length - 1][1];
        step = power > 0 ? 1 : -1;
        lastPower = power > 0 ? maxPower : minPower;
        //prepare placeholder item. 0 will be replaced with additional power
        gRewrite.push([element, 0]);

        //console.log "SUFFIX  PLACEHOLDER: #{JSON.stringify gSuffix}"
        //console.log "REWRITE PLACEHOLDER: #{JSON.stringify gRewrite}"
        for (p = l = ref1 = power + step, ref2 = lastPower, ref3 = step; ref3 !== 0 && (ref3 > 0 ? l <= ref2 : l >= ref2); p = l += ref3) {
          //Update power...
          gSuffix[gSuffix.length - 1][1] = p;
          gRewrite[gRewrite.length - 1][1] = p - power;

          //console.log "   Upd: SUFFIX  PLACEHOLDER: #{JSON.stringify gSuffix}"
          //console.log "   Upd: REWRITE PLACEHOLDER: #{JSON.stringify gRewrite}"

          //and generate new strings      
          newSuffix = ungroupPowersVd(gSuffix).join('');
          newRewrite = ungroupPowersVd(collectPowers(gRewrite)).join('');
          if (!tailInRewriteTable(rewriteRule, newSuffix)) {
            rewriteRule.add(newSuffix, newRewrite);
          }
        }
      }
      //console.log "Adding new extended rule: #{newSuffix} -> #{newRewrite}"
      //TODO: don't add rules whose suffices are already in the table.
      return rewriteRule;
    };

    //Returns True, if string tail (of nonzero length) is present in the rewrite table
    tailInRewriteTable = function (rewriteTable, s) {
      var j, ref, suffixTail, suffixTailLen;
      for (suffixTailLen = j = 1, ref = s.length; j < ref; suffixTailLen = j += 1) {
        suffixTail = s.substring(s.length - suffixTailLen);
        if (rewriteTable.has(suffixTail)) {
          return true;
        }
      }
      return false;
    };

    exports.makeAppendRewriteVerified = function (rewriteRule) {
      var appendRewrite, appendRewriteRef;
      //Reference rewriter
      appendRewriteRef = makeAppendRewriteRef(rewriteRule);
      //compiled rewriter
      appendRewrite = makeAppendRewrite(rewriteRule);
      return function (chain, stack) {
        var j, k, len, ref, refValue, v, value;
        console.log("========= before verification =======");
        refValue = appendRewriteRef(chain, stack.slice(0));
        value = appendRewrite(chain, stack.slice(0));
        if (!refValue.equals(value)) {
          ref = rewriteRule.items();
          for (j = 0, len = ref.length; j < len; j++) {
            [k, v] = ref[j];
            console.log(`  ${k} -> ${v}`);
          }
          throw new Error(`rewriter verification failed. args: chain = ${chain}, stack: ${JSON.stringify(stack)}, refValue: ${refValue}, value: ${value}`);
        }
        return value;
      };
    };


  }, { "./knuth_bendix.coffee": 7, "./vondyck_chain.coffee": 15 }], 17: [function (require, module, exports) {
    /*!!
     *  Canvas 2 Svg v1.0.19
     *  A low level canvas to SVG converter. Uses a mock canvas context to build an SVG document.
     *
     *  Licensed under the MIT license:
     *  http://www.opensource.org/licenses/mit-license.php
     *
     *  Author:
     *  Kerry Liu
     *
     *  Copyright (c) 2014 Gliffy Inc.
     */

    ; (function () {
      "use strict";

      var STYLES, ctx, CanvasGradient, CanvasPattern, namedEntities;

      //helper function to format a string
      function format(str, args) {
        var keys = Object.keys(args), i;
        for (i = 0; i < keys.length; i++) {
          str = str.replace(new RegExp("\\{" + keys[i] + "\\}", "gi"), args[keys[i]]);
        }
        return str;
      }

      //helper function that generates a random string
      function randomString(holder) {
        var chars, randomstring, i;
        if (!holder) {
          throw new Error("cannot create a random attribute name for an undefined object");
        }
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        randomstring = "";
        do {
          randomstring = "";
          for (i = 0; i < 12; i++) {
            randomstring += chars[Math.floor(Math.random() * chars.length)];
          }
        } while (holder[randomstring]);
        return randomstring;
      }

      //helper function to map named to numbered entities
      function createNamedToNumberedLookup(items, radix) {
        var i, entity, lookup = {}, base10, base16;
        items = items.split(',');
        radix = radix || 10;
        // Map from named to numbered entities.
        for (i = 0; i < items.length; i += 2) {
          entity = '&' + items[i + 1] + ';';
          base10 = parseInt(items[i], radix);
          lookup[entity] = '&#' + base10 + ';';
        }
        //FF and IE need to create a regex from hex values ie &nbsp; == \xa0
        lookup["\\xa0"] = '&#160;';
        return lookup;
      }

      //helper function to map canvas-textAlign to svg-textAnchor
      function getTextAnchor(textAlign) {
        //TODO: support rtl languages
        var mapping = { "left": "start", "right": "end", "center": "middle", "start": "start", "end": "end" };
        return mapping[textAlign] || mapping.start;
      }

      //helper function to map canvas-textBaseline to svg-dominantBaseline
      function getDominantBaseline(textBaseline) {
        //INFO: not supported in all browsers
        var mapping = { "alphabetic": "alphabetic", "hanging": "hanging", "top": "text-before-edge", "bottom": "text-after-edge", "middle": "central" };
        return mapping[textBaseline] || mapping.alphabetic;
      }

      // Unpack entities lookup where the numbers are in radix 32 to reduce the size
      // entity mapping courtesy of tinymce
      namedEntities = createNamedToNumberedLookup(
        '50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,' +
        '5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,' +
        '5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,' +
        '5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,' +
        '68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,' +
        '6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,' +
        '6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,' +
        '75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,' +
        '7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,' +
        '7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,' +
        'sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,' +
        'st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,' +
        't9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,' +
        'tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,' +
        'u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,' +
        '81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,' +
        '8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,' +
        '8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,' +
        '8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,' +
        '8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,' +
        'nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,' +
        'rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,' +
        'Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,' +
        '80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,' +
        '811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro', 32);


      //Some basic mappings for attributes and default values.
      STYLES = {
        "strokeStyle": {
          svgAttr: "stroke", //corresponding svg attribute
          canvas: "#000000", //canvas default
          svg: "none",       //svg default
          apply: "stroke"    //apply on stroke() or fill()
        },
        "fillStyle": {
          svgAttr: "fill",
          canvas: "#000000",
          svg: null, //svg default is black, but we need to special case this to handle canvas stroke without fill
          apply: "fill"
        },
        "lineCap": {
          svgAttr: "stroke-linecap",
          canvas: "butt",
          svg: "butt",
          apply: "stroke"
        },
        "lineJoin": {
          svgAttr: "stroke-linejoin",
          canvas: "miter",
          svg: "miter",
          apply: "stroke"
        },
        "miterLimit": {
          svgAttr: "stroke-miterlimit",
          canvas: 10,
          svg: 4,
          apply: "stroke"
        },
        "lineWidth": {
          svgAttr: "stroke-width",
          canvas: 1,
          svg: 1,
          apply: "stroke"
        },
        "globalAlpha": {
          svgAttr: "opacity",
          canvas: 1,
          svg: 1,
          apply: "fill stroke"
        },
        "font": {
          //font converts to multiple svg attributes, there is custom logic for this
          canvas: "10px sans-serif"
        },
        "shadowColor": {
          canvas: "#000000"
        },
        "shadowOffsetX": {
          canvas: 0
        },
        "shadowOffsetY": {
          canvas: 0
        },
        "shadowBlur": {
          canvas: 0
        },
        "textAlign": {
          canvas: "start"
        },
        "textBaseline": {
          canvas: "alphabetic"
        },
        "lineDash": {
          svgAttr: "stroke-dasharray",
          canvas: [],
          svg: null,
          apply: "stroke"
        }
      };

      /**
       *
       * @param gradientNode - reference to the gradient
       * @constructor
       */
      CanvasGradient = function (gradientNode, ctx) {
        this.__root = gradientNode;
        this.__ctx = ctx;
      };

      /**
       * Adds a color stop to the gradient root
       */
      CanvasGradient.prototype.addColorStop = function (offset, color) {
        var stop = this.__ctx.__createElement("stop"), regex, matches;
        stop.setAttribute("offset", offset);
        if (color.indexOf("rgba") !== -1) {
          //separate alpha value, since webkit can't handle it
          regex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi;
          matches = regex.exec(color);
          stop.setAttribute("stop-color", format("rgb({r},{g},{b})", { r: matches[1], g: matches[2], b: matches[3] }));
          stop.setAttribute("stop-opacity", matches[4]);
        } else {
          stop.setAttribute("stop-color", color);
        }
        this.__root.appendChild(stop);
      };

      CanvasPattern = function (pattern, ctx) {
        this.__root = pattern;
        this.__ctx = ctx;
      };

      /**
       * The mock canvas context
       * @param o - options include:
       * width - width of your canvas (defaults to 500)
       * height - height of your canvas (defaults to 500)
       * enableMirroring - enables canvas mirroring (get image data) (defaults to false)
       * document - the document object (defaults to the current document)
       */
      ctx = function (o) {

        var defaultOptions = { width: 500, height: 500, enableMirroring: false }, options;

        //keep support for this way of calling C2S: new C2S(width,height)
        if (arguments.length > 1) {
          options = defaultOptions;
          options.width = arguments[0];
          options.height = arguments[1];
        } else if (!o) {
          options = defaultOptions;
        } else {
          options = o;
        }

        if (!(this instanceof ctx)) {
          //did someone call this without new?
          return new ctx(options);
        }

        //setup options
        this.width = options.width || defaultOptions.width;
        this.height = options.height || defaultOptions.height;
        this.enableMirroring = options.enableMirroring !== undefined ? options.enableMirroring : defaultOptions.enableMirroring;

        this.canvas = this;   ///point back to this instance!
        this.__document = options.document || document;
        this.__canvas = this.__document.createElement("canvas");
        this.__ctx = this.__canvas.getContext("2d");

        this.__setDefaultStyles();
        this.__stack = [this.__getStyleState()];
        this.__groupStack = [];

        //the root svg element
        this.__root = this.__document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.__root.setAttribute("version", 1.1);
        this.__root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.__root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        this.__root.setAttribute("width", this.width);
        this.__root.setAttribute("height", this.height);

        //make sure we don't generate the same ids in defs
        this.__ids = {};

        //defs tag
        this.__defs = this.__document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this.__root.appendChild(this.__defs);

        //also add a group child. the svg element can't use the transform attribute
        this.__currentElement = this.__document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.__root.appendChild(this.__currentElement);
      };


      /**
       * Creates the specified svg element
       * @private
       */
      ctx.prototype.__createElement = function (elementName, properties, resetFill) {
        if (typeof properties === "undefined") {
          properties = {};
        }

        var element = this.__document.createElementNS("http://www.w3.org/2000/svg", elementName),
          keys = Object.keys(properties), i, key;
        if (resetFill) {
          //if fill or stroke is not specified, the svg element should not display. By default SVG's fill is black.
          element.setAttribute("fill", "none");
          element.setAttribute("stroke", "none");
        }
        for (i = 0; i < keys.length; i++) {
          key = keys[i];
          element.setAttribute(key, properties[key]);
        }
        return element;
      };

      /**
       * Applies default canvas styles to the context
       * @private
       */
      ctx.prototype.__setDefaultStyles = function () {
        //default 2d canvas context properties see:http://www.w3.org/TR/2dcontext/
        var keys = Object.keys(STYLES), i, key;
        for (i = 0; i < keys.length; i++) {
          key = keys[i];
          this[key] = STYLES[key].canvas;
        }
      };

      /**
       * Applies styles on restore
       * @param styleState
       * @private
       */
      ctx.prototype.__applyStyleState = function (styleState) {
        var keys = Object.keys(styleState), i, key;
        for (i = 0; i < keys.length; i++) {
          key = keys[i];
          this[key] = styleState[key];
        }
      };

      /**
       * Gets the current style state
       * @return {Object}
       * @private
       */
      ctx.prototype.__getStyleState = function () {
        var i, styleState = {}, keys = Object.keys(STYLES), key;
        for (i = 0; i < keys.length; i++) {
          key = keys[i];
          styleState[key] = this[key];
        }
        return styleState;
      };

      /**
       * Apples the current styles to the current SVG element. On "ctx.fill" or "ctx.stroke"
       * @param type
       * @private
       */
      ctx.prototype.__applyStyleToCurrentElement = function (type) {
        var keys = Object.keys(STYLES), i, style, value, id, regex, matches;
        for (i = 0; i < keys.length; i++) {
          style = STYLES[keys[i]];
          value = this[keys[i]];
          if (style.apply) {
            //is this a gradient or pattern?
            if (style.apply.indexOf("fill") !== -1 && value instanceof CanvasPattern) {
              //pattern
              if (value.__ctx) {
                //copy over defs
                while (value.__ctx.__defs.childNodes.length) {
                  id = value.__ctx.__defs.childNodes[0].getAttribute("id");
                  this.__ids[id] = id;
                  this.__defs.appendChild(value.__ctx.__defs.childNodes[0]);
                }
              }
              this.__currentElement.setAttribute("fill", format("url(#{id})", { id: value.__root.getAttribute("id") }));
            }
            else if (style.apply.indexOf("fill") !== -1 && value instanceof CanvasGradient) {
              //gradient
              this.__currentElement.setAttribute("fill", format("url(#{id})", { id: value.__root.getAttribute("id") }));
            } else if (style.apply.indexOf(type) !== -1 && style.svg !== value) {
              if ((style.svgAttr === "stroke" || style.svgAttr === "fill") && value.indexOf("rgba") !== -1) {
                //separate alpha value, since illustrator can't handle it
                regex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi;
                matches = regex.exec(value);
                this.__currentElement.setAttribute(style.svgAttr, format("rgb({r},{g},{b})", { r: matches[1], g: matches[2], b: matches[3] }));
                //should take globalAlpha here
                var opacity = matches[4];
                var globalAlpha = this.globalAlpha;
                if (globalAlpha != null) {
                  opacity *= globalAlpha;
                }
                this.__currentElement.setAttribute(style.svgAttr + "-opacity", opacity);
              } else {
                var attr = style.svgAttr;
                if (keys[i] === 'globalAlpha') {
                  attr = type + '-' + style.svgAttr;
                  if (this.__currentElement.getAttribute(attr)) {
                    //fill-opacity or stroke-opacity has already been set by stroke or fill.
                    continue;
                  }
                }
                //otherwise only update attribute if right type, and not svg default
                this.__currentElement.setAttribute(attr, value);


              }
            }
          }
        }

      };

      /**
       * Will return the closest group or svg node. May return the current element.
       * @private
       */
      ctx.prototype.__closestGroupOrSvg = function (node) {
        node = node || this.__currentElement;
        if (node.nodeName === "g" || node.nodeName === "svg") {
          return node;
        } else {
          return this.__closestGroupOrSvg(node.parentNode);
        }
      };

      /**
       * Returns the serialized value of the svg so far
       * @param fixNamedEntities - Standalone SVG doesn't support named entities, which document.createTextNode encodes.
       *                           If true, we attempt to find all named entities and encode it as a numeric entity.
       * @return serialized svg
       */
      ctx.prototype.getSerializedSvg = function (fixNamedEntities) {
        var serialized = new XMLSerializer().serializeToString(this.__root),
          keys, i, key, value, regexp, xmlns;

        //IE search for a duplicate xmnls because they didn't implement setAttributeNS correctly
        xmlns = /xmlns="http:\/\/www\.w3\.org\/2000\/svg".+xmlns="http:\/\/www\.w3\.org\/2000\/svg/gi;
        if (xmlns.test(serialized)) {
          serialized = serialized.replace('xmlns="http://www.w3.org/2000/svg', 'xmlns:xlink="http://www.w3.org/1999/xlink');
        }

        if (fixNamedEntities) {
          keys = Object.keys(namedEntities);
          //loop over each named entity and replace with the proper equivalent.
          for (i = 0; i < keys.length; i++) {
            key = keys[i];
            value = namedEntities[key];
            regexp = new RegExp(key, "gi");
            if (regexp.test(serialized)) {
              serialized = serialized.replace(regexp, value);
            }
          }
        }

        return serialized;
      };


      /**
       * Returns the root svg
       * @return
       */
      ctx.prototype.getSvg = function () {
        return this.__root;
      };
      /**
       * Will generate a group tag.
       */
      ctx.prototype.save = function () {
        var group = this.__createElement("g"), parent = this.__closestGroupOrSvg();
        this.__groupStack.push(parent);
        parent.appendChild(group);
        this.__currentElement = group;
        this.__stack.push(this.__getStyleState());
      };
      /**
       * Sets current element to parent, or just root if already root
       */
      ctx.prototype.restore = function () {
        this.__currentElement = this.__groupStack.pop();
        //Clearing canvas will make the poped group invalid, currentElement is set to the root group node.
        if (!this.__currentElement) {
          this.__currentElement = this.__root.childNodes[1];
        }
        var state = this.__stack.pop();
        this.__applyStyleState(state);

      };

      /**
       * Helper method to add transform
       * @private
       */
      ctx.prototype.__addTransform = function (t) {

        //if the current element has siblings, add another group
        var parent = this.__closestGroupOrSvg();
        if (parent.childNodes.length > 0) {
          var group = this.__createElement("g");
          parent.appendChild(group);
          this.__currentElement = group;
        }

        var transform = this.__currentElement.getAttribute("transform");
        if (transform) {
          transform += " ";
        } else {
          transform = "";
        }
        transform += t;
        this.__currentElement.setAttribute("transform", transform);
      };

      /**
       *  scales the current element
       */
      ctx.prototype.scale = function (x, y) {
        if (y === undefined) {
          y = x;
        }
        this.__addTransform(format("scale({x},{y})", { x: x, y: y }));
      };

      /**
       * rotates the current element
       */
      ctx.prototype.rotate = function (angle) {
        var degrees = (angle * 180 / Math.PI);
        this.__addTransform(format("rotate({angle},{cx},{cy})", { angle: degrees, cx: 0, cy: 0 }));
      };

      /**
       * translates the current element
       */
      ctx.prototype.translate = function (x, y) {
        this.__addTransform(format("translate({x},{y})", { x: x, y: y }));
      };

      /**
       * applies a transform to the current element
       */
      ctx.prototype.transform = function (a, b, c, d, e, f) {
        this.__addTransform(format("matrix({a},{b},{c},{d},{e},{f})", { a: a, b: b, c: c, d: d, e: e, f: f }));
      };

      /**
       * Create a new Path Element
       */
      ctx.prototype.beginPath = function () {
        var path, parent;

        // Note that there is only one current default path, it is not part of the drawing state.
        // See also: https://html.spec.whatwg.org/multipage/scripting.html#current-default-path
        this.__currentDefaultPath = "";
        this.__currentPosition = {};

        path = this.__createElement("path", {}, true);
        parent = this.__closestGroupOrSvg();
        parent.appendChild(path);
        this.__currentElement = path;
      };

      /**
       * Helper function to apply currentDefaultPath to current path element
       * @private
       */
      ctx.prototype.__applyCurrentDefaultPath = function () {
        if (this.__currentElement.nodeName === "path") {
          var d = this.__currentDefaultPath;
          this.__currentElement.setAttribute("d", d);
        } else {
          throw new Error("Attempted to apply path command to node " + this.__currentElement.nodeName);
        }
      };

      /**
       * Helper function to add path command
       * @private
       */
      ctx.prototype.__addPathCommand = function (command) {
        this.__currentDefaultPath += " ";
        this.__currentDefaultPath += command;
      };

      /**
       * Adds the move command to the current path element,
       * if the currentPathElement is not empty create a new path element
       */
      ctx.prototype.moveTo = function (x, y) {
        if (this.__currentElement.nodeName !== "path") {
          this.beginPath();
        }

        // creates a new subpath with the given point
        this.__currentPosition = { x: x, y: y };
        this.__addPathCommand(format("M {x} {y}", { x: x, y: y }));
      };

      /**
       * Closes the current path
       */
      ctx.prototype.closePath = function () {
        this.__addPathCommand("Z");
      };

      /**
       * Adds a line to command
       */
      ctx.prototype.lineTo = function (x, y) {
        this.__currentPosition = { x: x, y: y };
        if (this.__currentDefaultPath.indexOf('M') > -1) {
          this.__addPathCommand(format("L {x} {y}", { x: x, y: y }));
        } else {
          this.__addPathCommand(format("M {x} {y}", { x: x, y: y }));
        }
      };

      /**
       * Add a bezier command
       */
      ctx.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
        this.__currentPosition = { x: x, y: y };
        this.__addPathCommand(format("C {cp1x} {cp1y} {cp2x} {cp2y} {x} {y}",
          { cp1x: cp1x, cp1y: cp1y, cp2x: cp2x, cp2y: cp2y, x: x, y: y }));
      };

      /**
       * Adds a quadratic curve to command
       */
      ctx.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
        this.__currentPosition = { x: x, y: y };
        this.__addPathCommand(format("Q {cpx} {cpy} {x} {y}", { cpx: cpx, cpy: cpy, x: x, y: y }));
      };


      /**
       * Return a new normalized vector of given vector
       */
      var normalize = function (vector) {
        var len = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
        return [vector[0] / len, vector[1] / len];
      };

      /**
       * Adds the arcTo to the current path
       *
       * @see http://www.w3.org/TR/2015/WD-2dcontext-20150514/#dom-context-2d-arcto
       */
      ctx.prototype.arcTo = function (x1, y1, x2, y2, radius) {
        // Let the point (x0, y0) be the last point in the subpath.
        var x0 = this.__currentPosition && this.__currentPosition.x;
        var y0 = this.__currentPosition && this.__currentPosition.y;

        // First ensure there is a subpath for (x1, y1).
        if (typeof x0 == "undefined" || typeof y0 == "undefined") {
          return;
        }

        // Negative values for radius must cause the implementation to throw an IndexSizeError exception.
        if (radius < 0) {
          throw new Error("IndexSizeError: The radius provided (" + radius + ") is negative.");
        }

        // If the point (x0, y0) is equal to the point (x1, y1),
        // or if the point (x1, y1) is equal to the point (x2, y2),
        // or if the radius radius is zero,
        // then the method must add the point (x1, y1) to the subpath,
        // and connect that point to the previous point (x0, y0) by a straight line.
        if (((x0 === x1) && (y0 === y1))
          || ((x1 === x2) && (y1 === y2))
          || (radius === 0)) {
          this.lineTo(x1, y1);
          return;
        }

        // Otherwise, if the points (x0, y0), (x1, y1), and (x2, y2) all lie on a single straight line,
        // then the method must add the point (x1, y1) to the subpath,
        // and connect that point to the previous point (x0, y0) by a straight line.
        var unit_vec_p1_p0 = normalize([x0 - x1, y0 - y1]);
        var unit_vec_p1_p2 = normalize([x2 - x1, y2 - y1]);
        if (unit_vec_p1_p0[0] * unit_vec_p1_p2[1] === unit_vec_p1_p0[1] * unit_vec_p1_p2[0]) {
          this.lineTo(x1, y1);
          return;
        }

        // Otherwise, let The Arc be the shortest arc given by circumference of the circle that has radius radius,
        // and that has one point tangent to the half-infinite line that crosses the point (x0, y0) and ends at the point (x1, y1),
        // and that has a different point tangent to the half-infinite line that ends at the point (x1, y1), and crosses the point (x2, y2).
        // The points at which this circle touches these two lines are called the start and end tangent points respectively.

        // note that both vectors are unit vectors, so the length is 1
        var cos = (unit_vec_p1_p0[0] * unit_vec_p1_p2[0] + unit_vec_p1_p0[1] * unit_vec_p1_p2[1]);
        var theta = Math.acos(Math.abs(cos));

        // Calculate origin
        var unit_vec_p1_origin = normalize([
          unit_vec_p1_p0[0] + unit_vec_p1_p2[0],
          unit_vec_p1_p0[1] + unit_vec_p1_p2[1]
        ]);
        var len_p1_origin = radius / Math.sin(theta / 2);
        var x = x1 + len_p1_origin * unit_vec_p1_origin[0];
        var y = y1 + len_p1_origin * unit_vec_p1_origin[1];

        // Calculate start angle and end angle
        // rotate 90deg clockwise (note that y axis points to its down)
        var unit_vec_origin_start_tangent = [
          -unit_vec_p1_p0[1],
          unit_vec_p1_p0[0]
        ];
        // rotate 90deg counter clockwise (note that y axis points to its down)
        var unit_vec_origin_end_tangent = [
          unit_vec_p1_p2[1],
          -unit_vec_p1_p2[0]
        ];
        var getAngle = function (vector) {
          // get angle (clockwise) between vector and (1, 0)
          var x = vector[0];
          var y = vector[1];
          if (y >= 0) { // note that y axis points to its down
            return Math.acos(x);
          } else {
            return -Math.acos(x);
          }
        };
        var startAngle = getAngle(unit_vec_origin_start_tangent);
        var endAngle = getAngle(unit_vec_origin_end_tangent);

        // Connect the point (x0, y0) to the start tangent point by a straight line
        this.lineTo(x + unit_vec_origin_start_tangent[0] * radius,
          y + unit_vec_origin_start_tangent[1] * radius);

        // Connect the start tangent point to the end tangent point by arc
        // and adding the end tangent point to the subpath.
        this.arc(x, y, radius, startAngle, endAngle);
      };

      /**
       * Sets the stroke property on the current element
       */
      ctx.prototype.stroke = function () {
        if (this.__currentElement.nodeName === "path") {
          this.__currentElement.setAttribute("paint-order", "fill stroke markers");
        }
        this.__applyCurrentDefaultPath();
        this.__applyStyleToCurrentElement("stroke");
      };

      /**
       * Sets fill properties on the current element
       */
      ctx.prototype.fill = function () {
        if (this.__currentElement.nodeName === "path") {
          this.__currentElement.setAttribute("paint-order", "stroke fill markers");
        }
        this.__applyCurrentDefaultPath();
        this.__applyStyleToCurrentElement("fill");
      };

      /**
       *  Adds a rectangle to the path.
       */
      ctx.prototype.rect = function (x, y, width, height) {
        if (this.__currentElement.nodeName !== "path") {
          this.beginPath();
        }
        this.moveTo(x, y);
        this.lineTo(x + width, y);
        this.lineTo(x + width, y + height);
        this.lineTo(x, y + height);
        this.lineTo(x, y);
        this.closePath();
      };


      /**
       * adds a rectangle element
       */
      ctx.prototype.fillRect = function (x, y, width, height) {
        var rect, parent;
        rect = this.__createElement("rect", {
          x: x,
          y: y,
          width: width,
          height: height
        }, true);
        parent = this.__closestGroupOrSvg();
        parent.appendChild(rect);
        this.__currentElement = rect;
        this.__applyStyleToCurrentElement("fill");
      };

      /**
       * Draws a rectangle with no fill
       * @param x
       * @param y
       * @param width
       * @param height
       */
      ctx.prototype.strokeRect = function (x, y, width, height) {
        var rect, parent;
        rect = this.__createElement("rect", {
          x: x,
          y: y,
          width: width,
          height: height
        }, true);
        parent = this.__closestGroupOrSvg();
        parent.appendChild(rect);
        this.__currentElement = rect;
        this.__applyStyleToCurrentElement("stroke");
      };


      /**
       * Clear entire canvas:
       * 1. save current transforms
       * 2. remove all the childNodes of the root g element
       */
      ctx.prototype.__clearCanvas = function () {
        var current = this.__closestGroupOrSvg(),
          transform = current.getAttribute("transform");
        var rootGroup = this.__root.childNodes[1];
        var childNodes = rootGroup.childNodes;
        for (var i = childNodes.length - 1; i >= 0; i--) {
          if (childNodes[i]) {
            rootGroup.removeChild(childNodes[i]);
          }
        }
        this.__currentElement = rootGroup;
        //reset __groupStack as all the child group nodes are all removed.
        this.__groupStack = [];
        if (transform) {
          this.__addTransform(transform);
        }
      };

      /**
       * "Clears" a canvas by just drawing a white rectangle in the current group.
       */
      ctx.prototype.clearRect = function (x, y, width, height) {
        //clear entire canvas
        if (x === 0 && y === 0 && width === this.width && height === this.height) {
          this.__clearCanvas();
          return;
        }
        var rect, parent = this.__closestGroupOrSvg();
        rect = this.__createElement("rect", {
          x: x,
          y: y,
          width: width,
          height: height,
          fill: "#FFFFFF"
        }, true);
        parent.appendChild(rect);
      };

      /**
       * Adds a linear gradient to a defs tag.
       * Returns a canvas gradient object that has a reference to it's parent def
       */
      ctx.prototype.createLinearGradient = function (x1, y1, x2, y2) {
        var grad = this.__createElement("linearGradient", {
          id: randomString(this.__ids),
          x1: x1 + "px",
          x2: x2 + "px",
          y1: y1 + "px",
          y2: y2 + "px",
          "gradientUnits": "userSpaceOnUse"
        }, false);
        this.__defs.appendChild(grad);
        return new CanvasGradient(grad, this);
      };

      /**
       * Adds a radial gradient to a defs tag.
       * Returns a canvas gradient object that has a reference to it's parent def
       */
      ctx.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
        var grad = this.__createElement("radialGradient", {
          id: randomString(this.__ids),
          cx: x1 + "px",
          cy: y1 + "px",
          r: r1 + "px",
          fx: x0 + "px",
          fy: y0 + "px",
          "gradientUnits": "userSpaceOnUse"
        }, false);
        this.__defs.appendChild(grad);
        return new CanvasGradient(grad, this);

      };

      /**
       * Parses the font string and returns svg mapping
       * @private
       */
      ctx.prototype.__parseFont = function () {
        var regex = /^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-,\'\"\sa-z]+?)\s*$/i;
        var fontPart = regex.exec(this.font);
        var data = {
          style: fontPart[1] || 'normal',
          size: fontPart[4] || '10px',
          family: fontPart[6] || 'sans-serif',
          weight: fontPart[3] || 'normal',
          decoration: fontPart[2] || 'normal',
          href: null
        };

        //canvas doesn't support underline natively, but we can pass this attribute
        if (this.__fontUnderline === "underline") {
          data.decoration = "underline";
        }

        //canvas also doesn't support linking, but we can pass this as well
        if (this.__fontHref) {
          data.href = this.__fontHref;
        }

        return data;
      };

      /**
       * Helper to link text fragments
       * @param font
       * @param element
       * @return {*}
       * @private
       */
      ctx.prototype.__wrapTextLink = function (font, element) {
        if (font.href) {
          var a = this.__createElement("a");
          a.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", font.href);
          a.appendChild(element);
          return a;
        }
        return element;
      };

      /**
       * Fills or strokes text
       * @param text
       * @param x
       * @param y
       * @param action - stroke or fill
       * @private
       */
      ctx.prototype.__applyText = function (text, x, y, action) {
        var font = this.__parseFont(),
          parent = this.__closestGroupOrSvg(),
          textElement = this.__createElement("text", {
            "font-family": font.family,
            "font-size": font.size,
            "font-style": font.style,
            "font-weight": font.weight,
            "text-decoration": font.decoration,
            "x": x,
            "y": y,
            "text-anchor": getTextAnchor(this.textAlign),
            "dominant-baseline": getDominantBaseline(this.textBaseline)
          }, true);

        textElement.appendChild(this.__document.createTextNode(text));
        this.__currentElement = textElement;
        this.__applyStyleToCurrentElement(action);
        parent.appendChild(this.__wrapTextLink(font, textElement));
      };

      /**
       * Creates a text element
       * @param text
       * @param x
       * @param y
       */
      ctx.prototype.fillText = function (text, x, y) {
        this.__applyText(text, x, y, "fill");
      };

      /**
       * Strokes text
       * @param text
       * @param x
       * @param y
       */
      ctx.prototype.strokeText = function (text, x, y) {
        this.__applyText(text, x, y, "stroke");
      };

      /**
       * No need to implement this for svg.
       * @param text
       * @return {TextMetrics}
       */
      ctx.prototype.measureText = function (text) {
        this.__ctx.font = this.font;
        return this.__ctx.measureText(text);
      };

      /**
       *  Arc command!
       */
      ctx.prototype.arc = function (x, y, radius, startAngle, endAngle, counterClockwise) {
        // in canvas no circle is drawn if no angle is provided.
        if (startAngle === endAngle) {
          return;
        }
        startAngle = startAngle % (2 * Math.PI);
        endAngle = endAngle % (2 * Math.PI);
        if (startAngle === endAngle) {
          //circle time! subtract some of the angle so svg is happy (svg elliptical arc can't draw a full circle)
          endAngle = ((endAngle + (2 * Math.PI)) - 0.001 * (counterClockwise ? -1 : 1)) % (2 * Math.PI);
        }
        var endX = x + radius * Math.cos(endAngle),
          endY = y + radius * Math.sin(endAngle),
          startX = x + radius * Math.cos(startAngle),
          startY = y + radius * Math.sin(startAngle),
          sweepFlag = counterClockwise ? 0 : 1,
          largeArcFlag = 0,
          diff = endAngle - startAngle;

        // https://github.com/gliffy/canvas2svg/issues/4
        if (diff < 0) {
          diff += 2 * Math.PI;
        }

        if (counterClockwise) {
          largeArcFlag = diff > Math.PI ? 0 : 1;
        } else {
          largeArcFlag = diff > Math.PI ? 1 : 0;
        }

        this.lineTo(startX, startY);
        this.__addPathCommand(format("A {rx} {ry} {xAxisRotation} {largeArcFlag} {sweepFlag} {endX} {endY}",
          { rx: radius, ry: radius, xAxisRotation: 0, largeArcFlag: largeArcFlag, sweepFlag: sweepFlag, endX: endX, endY: endY }));

        this.__currentPosition = { x: endX, y: endY };
      };

      /**
       * Generates a ClipPath from the clip command.
       */
      ctx.prototype.clip = function () {
        var group = this.__closestGroupOrSvg(),
          clipPath = this.__createElement("clipPath"),
          id = randomString(this.__ids),
          newGroup = this.__createElement("g");

        this.__applyCurrentDefaultPath();
        group.removeChild(this.__currentElement);
        clipPath.setAttribute("id", id);
        clipPath.appendChild(this.__currentElement);

        this.__defs.appendChild(clipPath);

        //set the clip path to this group
        group.setAttribute("clip-path", format("url(#{id})", { id: id }));

        //clip paths can be scaled and transformed, we need to add another wrapper group to avoid later transformations
        // to this path
        group.appendChild(newGroup);

        this.__currentElement = newGroup;

      };

      /**
       * Draws a canvas, image or mock context to this canvas.
       * Note that all svg dom manipulation uses node.childNodes rather than node.children for IE support.
       * http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-drawimage
       */
      ctx.prototype.drawImage = function () {
        //convert arguments to a real array
        var args = Array.prototype.slice.call(arguments),
          image = args[0],
          dx, dy, dw, dh, sx = 0, sy = 0, sw, sh, parent, svg, defs, group,
          currentElement, svgImage, canvas, context, id;

        if (args.length === 3) {
          dx = args[1];
          dy = args[2];
          sw = image.width;
          sh = image.height;
          dw = sw;
          dh = sh;
        } else if (args.length === 5) {
          dx = args[1];
          dy = args[2];
          dw = args[3];
          dh = args[4];
          sw = image.width;
          sh = image.height;
        } else if (args.length === 9) {
          sx = args[1];
          sy = args[2];
          sw = args[3];
          sh = args[4];
          dx = args[5];
          dy = args[6];
          dw = args[7];
          dh = args[8];
        } else {
          throw new Error("Inavlid number of arguments passed to drawImage: " + arguments.length);
        }

        parent = this.__closestGroupOrSvg();
        currentElement = this.__currentElement;
        var translateDirective = "translate(" + dx + ", " + dy + ")";
        if (image instanceof ctx) {
          //canvas2svg mock canvas context. In the future we may want to clone nodes instead.
          //also I'm currently ignoring dw, dh, sw, sh, sx, sy for a mock context.
          svg = image.getSvg().cloneNode(true);
          if (svg.childNodes && svg.childNodes.length > 1) {
            defs = svg.childNodes[0];
            while (defs.childNodes.length) {
              id = defs.childNodes[0].getAttribute("id");
              this.__ids[id] = id;
              this.__defs.appendChild(defs.childNodes[0]);
            }
            group = svg.childNodes[1];
            if (group) {
              //save original transform
              var originTransform = group.getAttribute("transform");
              var transformDirective;
              if (originTransform) {
                transformDirective = originTransform + " " + translateDirective;
              } else {
                transformDirective = translateDirective;
              }
              group.setAttribute("transform", transformDirective);
              parent.appendChild(group);
            }
          }
        } else if (image.nodeName === "CANVAS" || image.nodeName === "IMG") {
          //canvas or image
          svgImage = this.__createElement("image");
          svgImage.setAttribute("width", dw);
          svgImage.setAttribute("height", dh);
          svgImage.setAttribute("preserveAspectRatio", "none");

          if (sx || sy || sw !== image.width || sh !== image.height) {
            //crop the image using a temporary canvas
            canvas = this.__document.createElement("canvas");
            canvas.width = dw;
            canvas.height = dh;
            context = canvas.getContext("2d");
            context.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
            image = canvas;
          }
          svgImage.setAttribute("transform", translateDirective);
          svgImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href",
            image.nodeName === "CANVAS" ? image.toDataURL() : image.getAttribute("src"));
          parent.appendChild(svgImage);
        }
      };

      /**
       * Generates a pattern tag
       */
      ctx.prototype.createPattern = function (image, repetition) {
        var pattern = this.__document.createElementNS("http://www.w3.org/2000/svg", "pattern"), id = randomString(this.__ids),
          img;
        pattern.setAttribute("id", id);
        pattern.setAttribute("width", image.width);
        pattern.setAttribute("height", image.height);
        if (image.nodeName === "CANVAS" || image.nodeName === "IMG") {
          img = this.__document.createElementNS("http://www.w3.org/2000/svg", "image");
          img.setAttribute("width", image.width);
          img.setAttribute("height", image.height);
          img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href",
            image.nodeName === "CANVAS" ? image.toDataURL() : image.getAttribute("src"));
          pattern.appendChild(img);
          this.__defs.appendChild(pattern);
        } else if (image instanceof ctx) {
          pattern.appendChild(image.__root.childNodes[1]);
          this.__defs.appendChild(pattern);
        }
        return new CanvasPattern(pattern, this);
      };

      ctx.prototype.setLineDash = function (dashArray) {
        if (dashArray && dashArray.length > 0) {
          this.lineDash = dashArray.join(",");
        } else {
          this.lineDash = null;
        }
      };

      /**
       * Not yet implemented
       */
      ctx.prototype.drawFocusRing = function () { };
      ctx.prototype.createImageData = function () { };
      ctx.prototype.getImageData = function () { };
      ctx.prototype.putImageData = function () { };
      ctx.prototype.globalCompositeOperation = function () { };
      ctx.prototype.setTransform = function () { };

      //add options for alternative namespace
      if (typeof window === "object") {
        window.C2S = ctx;
      }

      // CommonJS/Browserify
      if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = ctx;
      }

    }());

  }, {}], 18: [function (require, module, exports) {
    //source: https://gist.github.com/paulirish/1579671
    (function () {
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
          || window[vendors[x] + 'CancelRequestAnimationFrame'];
      }

      if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function () { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
        };

      if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
          clearTimeout(id);
        };
    }());

  }, {}], 19: [function (require, module, exports) {
    "use strict";
    var Animator, E, M, decomposeToTranslations, flipSetTimeout, formatString, interpolateHyperbolic, pad, parseIntChecked;

    //Hyperbolic computations core
    M = require("../core/matrix3.coffee");

    ({ decomposeToTranslations } = require("../core/decompose_to_translations.coffee"));

    //Misc utilities
    ({ E, flipSetTimeout } = require("./htmlutil.coffee"));

    ({ formatString, pad, parseIntChecked } = require("../core/utils.coffee"));

    interpolateHyperbolic = function (T) {
      var Tdist, Tdx, Tdy, Tr, Tr2, Trot, dirX, dirY;
      [Trot, Tdx, Tdy] = M.hyperbolicDecompose(T);
      //Real distance translated is acosh( sqrt(1+dx^2+dy^2))
      Tr2 = Tdx ** 2 + Tdy ** 2;
      Tdist = Math.acosh(Math.sqrt(Tr2 + 1.0));
      Tr = Math.sqrt(Tr2);
      if (Tr < 1e-6) {
        dirX = 0.0;
        dirY = 0.0;
      } else {
        dirX = Tdx / Tr;
        dirY = Tdy / Tr;
      }
      return function (p) {
        var dist, dx, dy, r, rot;
        rot = Trot * p;
        dist = Tdist * p;
        r = Math.sqrt(Math.cosh(dist) ** 2 - 1.0);
        dx = r * dirX;
        dy = r * dirY;
        return M.mul(M.translationMatrix(dx, dy), M.rotationMatrix(rot));
      };
    };

    exports.Animator = Animator = class Animator {
      constructor(application) {
        this.application = application;
        this.oldSize = null;
        this.uploadWorker = null;
        this.busy = false;
        this.reset();
      }

      assertNotBusy() {
        if (this.busy) {
          throw new Error("Animator is busy");
        }
      }

      reset() {
        if (this.busy) {
          this.cancelWork();
        }
        this.startChain = null;
        this.startOffset = null;
        this.endChain = null;
        this.endOffset = null;
        return this._updateButtons();
      }

      _updateButtons() {
        E('animate-view-start').disabled = this.startChain === null;
        E('animate-view-end').disabled = this.endChain === null;
        E('btn-upload-animation').disabled = (this.startChain === null) || (this.endChain === null);
        E('btn-animate-cancel').style.display = this.busy ? '' : 'none';
        E('btn-upload-animation').style.display = !this.busy ? '' : 'none';
        return E('btn-animate-derotate').disabled = !((this.startChain != null) && (this.endChain != null));
      }

      setStart(observer) {
        this.assertNotBusy();
        this.startChain = observer.getViewCenter();
        this.startOffset = observer.getViewOffsetMatrix();
        return this._updateButtons();
      }

      setEnd(observer) {
        this.assertNotBusy();
        this.endChain = observer.getViewCenter();
        this.endOffset = observer.getViewOffsetMatrix();
        return this._updateButtons();
      }

      viewStart(observer) {
        this.assertNotBusy();
        return observer.navigateTo(this.startChain, this.startOffset);
      }

      viewEnd(observer) {
        this.assertNotBusy();
        return observer.navigateTo(this.endChain, this.endOffset);
      }

      derotate() {
        var R, _, c, dx, dy, r, s, t1, t2;
        console.log("offset matrix:");
        console.dir(this.offsetMatrix());
        [t1, t2] = decomposeToTranslations(this.offsetMatrix());
        if (t1 === null) {
          alert("Derotation not possible");
          return;
        }
        //@endOffset * Mdelta * @startOffset^-1 = t1^-1 * t2 * t1
        this.endOffset = M.mul(t1, this.endOffset);
        this.startOffset = M.mul(t1, this.startOffset);
        //and now apply similarity rotation to both of the start and end points so that t2 is strictly vertical
        [dx, dy, _] = M.mulv(t2, [0, 0, 1]);
        r = Math.sqrt(dx ** 2 + dy ** 2);
        if (r > 1e-6) {
          s = dy / r;
          c = dx / r;
          R = [c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0];
          R = M.mul(R, M.rotationMatrix(-Math.PI / 2));
          this.endOffset = M.mul(R, this.endOffset);
          this.startOffset = M.mul(R, this.startOffset);
        }
        return alert("Start and end point adjusted.");
      }

      _setCanvasSize() {
        var canvas, size;
        size = parseIntChecked(E('animate-size').value);
        if (size <= 0 || size >= 65536) {
          throw new Error(`Size ${size} is inappropriate`);
        }
        this.application.setCanvasResize(true);
        canvas = this.application.getCanvas();
        this.oldSize = [canvas.width, canvas.height];
        return canvas.width = canvas.height = size;
      }

      _restoreCanvasSize() {
        var canvas;
        if (!this.oldSize) {
          throw new Error("restore withou set");
        }
        canvas = this.application.getCanvas();
        [canvas.width, canvas.height] = this.oldSize;
        this.oldSize = null;
        this.application.setCanvasResize(false);
        return this.application.redraw();
      }

      _beginWork() {
        this.busy = true;
        this._setCanvasSize();
        this._updateButtons();
        return console.log("Started animation");
      }

      _endWork() {
        this._restoreCanvasSize();
        console.log("End animation");
        this.busy = false;
        return this._updateButtons();
      }

      cancelWork() {
        if (!this.busy) {
          return;
        }
        if (this.uploadWorker) {
          clearTimeout(this.uploadWorker);
        }
        this.uploadWorker = null;
        return this._endWork();
      }

      //matrix between first and last points
      offsetMatrix() {
        var Mdelta, T, app, inv, tiling;
        //global (surreally big) view matrix is:

        // Moffset * M(chain)

        // where Moffset is view offset, and M(chain) is transformation matrix of the chain.
        // We need to find matrix T such that

        //  T * MoffsetStart * M(chainStart) = MoffsetEnd * M(chainEnd)

        // Solvign this, get:
        // T = MoffsetEnd * (M(chainEnd) * M(chainStart)^-1) * MoffsetStart^-1

        // T = MoffsetEnd * M(chainEnd + invChain(chainStart) * MoffsetStart^-1
        tiling = this.application.tiling;
        //Not very sure but lets try
        //Mdelta = tiling.repr tiling.appendInverse(@endChain, @startChain)
        inv = function (c) {
          return tiling.inverse(c);
        };
        app = function (c1, c2) {
          return tiling.append(c1, c2);
        };
        // e, S bad
        // S, e bad

        // E, s good? Seems to be good, but power calculation is wrong.
        Mdelta = tiling.repr(app(inv(this.endChain), this.startChain));
        T = M.mul(M.mul(this.endOffset, Mdelta), M.hyperbolicInv(this.startOffset));
        return T;
      }

      animate(observer, stepsPerGen, generations, callback) {
        var T, Tinterp, framesBeforeGeneration, imageNameTemplate, index, totalSteps, uploadStep;
        if (!((this.startChain != null) && (this.endChain != null))) {
          return;
        }
        this.assertNotBusy();
        T = this.offsetMatrix();

        //Make interpolator for this matrix
        Tinterp = interpolateHyperbolic(M.hyperbolicInv(T));
        index = 0;
        totalSteps = generations * stepsPerGen;
        framesBeforeGeneration = stepsPerGen;
        imageNameTemplate = E('upload-name').value;
        this._beginWork();
        uploadStep = () => {
          var imageName, p;
          this.uploadWorker = null;
          //If we were cancelled - return quickly
          if (!this.busy) {
            return;
          }
          this.application.getObserver().navigateTo(this.startChain, this.startOffset);
          p = index / totalSteps;
          this.application.getObserver().modifyView(M.hyperbolicInv(Tinterp(p)));
          this.application.drawEverything();
          imageName = formatString(imageNameTemplate, [pad(index, 4)]);
          return this.application.uploadToServer(imageName, (ajax) => {
            //if we were cancelled, return quickly
            if (!this.busy) {
              return;
            }
            if (ajax.readyState === XMLHttpRequest.DONE && ajax.status === 200) {
              console.log("Upload success");
              index += 1;
              framesBeforeGeneration -= 1;
              if (framesBeforeGeneration === 0) {
                this.application.doStep();
                framesBeforeGeneration = stepsPerGen;
              }
              if (index <= totalSteps) {
                console.log("request next frame");
                return this.uploadWorker = flipSetTimeout(50, uploadStep);
              } else {
                return this._endWork();
              }
            } else {
              console.log("Upload failure, cancel");
              console.log(ajax.responseText);
              return this._endWork();
            }
          });
        };
        return uploadStep();
      }

    };


  }, { "../core/decompose_to_translations.coffee": 4, "../core/matrix3.coffee": 8, "../core/utils.coffee": 13, "./htmlutil.coffee": 24 }], 20: [function (require, module, exports) {
    "use strict";
    var Animator, Application, BinaryTransitionFunc, ButtonGroup, C2S, ChainMap, DayNightTransitionFunc, DefaultConfig, DomBuilder, E, FieldObserver, GenerateFileList, GenericTransitionFunc, GhostClickDetector, M, MIN_WIDTH, MouseToolCombo, Navigator, OpenDialog, PaintStateSelector, RegularTiling, SaveDialog, SvgDialog, UriConfig, ValidatingInput, addClass, application, autoplayCriticalPopulation, canvas, canvasSizeUpdateBlocked, context, dirty, doCanvasMouseDown, doCanvasMouseMove, doCanvasMouseUp, doCanvasTouchEnd, doCanvasTouchLeave, doCanvasTouchMove, doCanvasTouchStart, doClearMemory, doCloseEditor, doDisableGeneric, doEditAsGeneric, doExport, doExportClose, doExportVisible, doImport, doImportCancel, doMemorize, doNavigateHome, doOpenEditor, doRemember, doSetFixedSize, doSetGrid, doSetPanMode, doSetRuleGeneric, doShowImport, doStartPlayer, doStopPlayer, doTogglePlayer, documentWidth, dragHandler, drawEverything, dtMax, encodeVisible, evaluateTotalisticAutomaton, exportField, fpsDefault, fpsLimiting, getAjax, getCanvasCursorPosition, ghostClickDetector, importField, isPanMode, lastTime, memo, minVisibleSize, mouseMoveReceiver, parseFieldData, parseFloatChecked, parseIntChecked, parseTransitionFunction, parseUri, player, playerTimeout, randomFillFixedNum, randomFillNum, randomFillPercent, randomStateGenerator, redraw, redrawLoop, removeClass, serverSupportsUpload, shortcuts, showExportDialog, stringifyFieldData, unity, updateCanvasSize, updateGeneration, updateGenericRuleStatus, updateMemoryButtons, updatePlayButtons, updatePopulation, uploadToServer, windowHeight, windowWidth;

    //Core hyperbolic group compuatation library
    ({ unity } = require("../core/vondyck_chain.coffee"));

    ({ ChainMap } = require("../core/chain_map.coffee"));

    ({ RegularTiling } = require("../core/regular_tiling.coffee"));

    ({ evaluateTotalisticAutomaton } = require("../core/cellular_automata.coffee"));

    ({ stringifyFieldData, parseFieldData, importField, randomFillFixedNum, exportField, randomStateGenerator } = require("../core/field.coffee"));

    ({ GenericTransitionFunc, BinaryTransitionFunc, DayNightTransitionFunc, parseTransitionFunction } = require("../core/rule.coffee"));

    M = require("../core/matrix3.coffee");

    //Application components
    ({ Animator } = require("./animator.coffee"));

    ({ MouseToolCombo } = require("./mousetool.coffee"));

    ({ Navigator } = require("./navigator.coffee"));

    ({ FieldObserver } = require("./observer.coffee"));

    ({ GenerateFileList, OpenDialog, SaveDialog } = require("./indexeddb.coffee"));

    //{FieldObserverWithRemoreRenderer} = require "./observer_remote.coffee"

    //Misc utilities
    ({ E, getAjax, ButtonGroup, windowWidth, windowHeight, documentWidth, removeClass, addClass, ValidatingInput } = require("./htmlutil.coffee"));

    ({ DomBuilder } = require("./dom_builder.coffee"));

    ({ parseIntChecked, parseFloatChecked } = require("../core/utils.coffee"));

    ({ parseUri } = require("./parseuri.coffee"));

    ({ getCanvasCursorPosition } = require("./canvas_util.coffee"));

    C2S = require("../ext/canvas2svg.js");

    //{lzw_encode} = require "../ext/lzw.coffee"
    require("../ext/polyfills.js");

    require("../core/acosh_polyfill.coffee");

    ({ GhostClickDetector } = require("./ghost_click_detector.coffee"));

    MIN_WIDTH = 100;

    minVisibleSize = 1 / 100;

    canvasSizeUpdateBlocked = false;

    randomFillNum = 2000;

    randomFillPercent = 0.4;

    DefaultConfig = class DefaultConfig {
      getGrid() {
        return [7, 3];
      }

      getCellData() {
        return "";
      }

      getGeneration() {
        return 0;
      }

      getFunctionCode() {
        return "B 3 S 2 3";
      }

      getViewBase() {
        return unity;
      }

      getViewOffset() {
        return M.eye();
      }

    };

    UriConfig = class UriConfig {
      constructor() {
        this.keys = parseUri("" + window.location).queryKey;
      }

      getGrid() {
        var e, m, match, n;
        if (this.keys.grid != null) {
          try {
            match = this.keys.grid.match(/(\d+)[,;](\d+)/);
            if (!match) {
              throw new Error(`Syntax is bad: ${this.keys.grid}`);
            }
            n = parseIntChecked(match[1]);
            m = parseIntChecked(match[2]);
            return [n, m];
          } catch (error) {
            e = error;
            alert(`Bad grid paramters: ${this.keys.grid}`);
          }
        }
        return [7, 3];
      }

      getCellData() {
        return this.keys.cells;
      }

      getGeneration() {
        var e;
        if (this.keys.generation != null) {
          try {
            return parseIntChecked(this.keys.generation);
          } catch (error) {
            e = error;
            alert(`Bad generationn umber: ${this.keys.generation}`);
          }
        }
        return 0;
      }

      getFunctionCode() {
        if (this.keys.rule != null) {
          return this.keys.rule.replace(/_/g, ' ');
        } else {
          return "B 3 S 2 3";
        }
      }

      getViewBase() {
        if (this.keys.viewbase == null) {
          return unity;
        }
        return RegularTiling.prototype.parse(this.keys.viewbase);
      }

      getViewOffset() {
        var dx, dy, part, rot;
        if (this.keys.viewoffset == null) {
          return M.eye();
        }
        [rot, dx, dy] = (function () {
          var i, len, ref, results;
          ref = this.keys.viewoffset.split(':');
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            part = ref[i];
            results.push(parseFloatChecked(part));
          }
          return results;
        }).call(this);
        return M.mul(M.translationMatrix(dx, dy), M.rotationMatrix(rot));
      }

    };

    Application = class Application {
      constructor() {
        this.tiling = null;
        this.observer = null;
        this.navigator = null;
        this.animator = null;
        this.cells = null;
        this.generation = 0;
        this.transitionFunc = null;
        this.lastBinaryTransitionFunc = null;

        //@ObserverClass = FieldObserverWithRemoreRenderer
        this.ObserverClass = FieldObserver;
        this.margin = 16; //margin pixels
      }

      setCanvasResize(enable) {
        return canvasSizeUpdateBlocked = enable;
      }

      getCanvasResize() {
        return canvasSizeUpdateBlocked;
      }

      redraw() {
        return redraw();
      }

      getObserver() {
        return this.observer;
      }

      drawEverything() {
        return drawEverything(canvas.width, canvas.height, context);
      }

      uploadToServer(name, cb) {
        return uploadToServer(name, cb);
      }

      getCanvas() {
        return canvas;
      }

      getTransitionFunc() {
        return this.transitionFunc;
      }

      getMargin() {
        if (this.observer.isDrawingHomePtr) {
          return this.margin;
        } else {
          return 0;
        }
      }

      setShowLiveBorders(isDrawing) {
        this.observer.isDrawingLiveBorders = isDrawing;
        return redraw();
      }

      setDrawingHomePtr(isDrawing) {
        this.observer.isDrawingHomePtr = isDrawing;
        redraw();
        if (typeof localStorage !== "undefined" && localStorage !== null) {
          localStorage.setItem("observer.isDrawingHomePtr", isDrawing ? "1" : "0");
          return console.log(`store ${isDrawing}`);
        }
      }


      //Convert canvas X,Y coordinates to relative X,Y in (0..1) range
      canvas2relative(x, y) {
        var isize, s;
        s = Math.min(canvas.width, canvas.height) - 2 * this.getMargin();
        isize = 2.0 / s;
        return [(x - canvas.width * 0.5) * isize, (y - canvas.height * 0.5) * isize];
      }

      initialize(config = new DefaultConfig()) {
        var cellData, isDrawing, m, n;
        [n, m] = config.getGrid();
        this.tiling = new RegularTiling(n, m);
        cellData = config.getCellData();
        if (cellData) {
          console.log(`import: ${cellData}`);
          this.importData(cellData);
        } else {
          this.cells = new ChainMap();
          this.cells.put(unity, 1);
        }
        this.observer = new this.ObserverClass(this.tiling, minVisibleSize, config.getViewBase(), config.getViewOffset());
        if ((isDrawing = typeof localStorage !== "undefined" && localStorage !== null ? localStorage.getItem('observer.isDrawingHomePtr') : void 0) != null) {
          isDrawing = isDrawing === '1';
          E('flag-origin-mark').checked = isDrawing;
          this.observer.isDrawingHomePtr = isDrawing;
          console.log(`restore ${isDrawing}`);
        } else {
          this.setDrawingHomePtr(E('flag-origin-mark').checked);
          this.setShowLiveBorders(E('flag-live-borders').checked);
        }
        this.observer.onFinish = function () {
          return redraw();
        };
        this.navigator = new Navigator(this);
        this.animator = new Animator(this);
        this.paintStateSelector = new PaintStateSelector(this, E("state-selector"), E("state-selector-buttons"));
        this.transitionFunc = parseTransitionFunction(config.getFunctionCode(), application.tiling.n, application.tiling.m);
        this.lastBinaryTransitionFunc = this.transitionFunc;
        this.openDialog = new OpenDialog(this);
        this.saveDialog = new SaveDialog(this);
        this.svgDialog = new SvgDialog(this);
        this.ruleEntry = new ValidatingInput(E('rule-entry'), ((ruleStr) => {
          console.log("Parsing TF {@tiling.n} {@tiling.m}");
          return parseTransitionFunction(ruleStr, this.tiling.n, this.tiling.m);
        }), (function (rule) {
          return "" + rule;
        }), this.transitionFunc);
        this.ruleEntry.onparsed = (rule) => {
          return this.doSetRule();
        };
        this.updateRuleEditor();
        return this.updateGridUI();
      }

      updateRuleEditor() {
        switch (this.transitionFunc.getType()) {
          case "binary":
            E('controls-rule-simple').style.display = "";
            return E('controls-rule-generic').style.display = "none";
          case "custom":
            E('controls-rule-simple').style.display = "none";
            return E('controls-rule-generic').style.display = "";
          default:
            console.dir(this.transitionFunc);
            throw new Error("Bad transition func");
        }
      }

      doSetRule() {
        var ref;
        if (this.ruleEntry.message != null) {
          alert(`Failed to parse function: ${this.ruleEntry.message}`);
          this.transitionFunc = (ref = this.lastBinaryTransitionFunc) != null ? ref : this.transitionFunc;
        } else {
          console.log("revalidate");
          this.ruleEntry.revalidate();
          this.transitionFunc = this.ruleEntry.value;
          this.lastBinaryTransitionFunc = this.transitionFunc;
        }
        this.paintStateSelector.update(this.transitionFunc);
        console.log(this.transitionFunc);
        E('controls-rule-simple').style.display = "";
        return E('controls-rule-generic').style.display = "none";
      }

      setGridImpl(n, m) {
        var oldObserver, ref, ref1;
        this.tiling = new RegularTiling(n, m);
        //transition function should be changed too.
        if (this.transitionFunc != null) {
          this.transitionFunc = this.transitionFunc.changeGrid(this.tiling.n, this.tiling.m);
        }
        if ((ref = this.observer) != null) {
          ref.shutdown();
        }
        oldObserver = this.observer;
        this.observer = new this.ObserverClass(this.tiling, minVisibleSize);
        this.observer.isDrawingHomePtr = oldObserver.isDrawingHomePtr;
        this.observer.onFinish = function () {
          return redraw();
        };
        if ((ref1 = this.navigator) != null) {
          ref1.clear();
        }
        doClearMemory();
        doStopPlayer();
        return this.updateGridUI();
      }

      updateGridUI() {
        E('entry-n').value = "" + application.tiling.n;
        E('entry-m').value = "" + application.tiling.m;
        return E('grid-num-neighbors').innerHTML = (this.tiling.m - 2) * this.tiling.n;
      }


      //Actions
      doRandomFill() {
        randomFillFixedNum(this.cells, randomFillPercent, unity, randomFillNum, this.tiling, randomStateGenerator(this.transitionFunc.numStates));
        updatePopulation();
        return redraw();
      }

      doStep(onFinish) {
        //Set generation for thse rules who depend on it
        this.transitionFunc.setGeneration(this.generation);
        this.cells = evaluateTotalisticAutomaton(this.cells, this.tiling, this.transitionFunc.evaluate.bind(this.transitionFunc), this.transitionFunc.plus, this.transitionFunc.plusInitial);
        this.generation += 1;
        redraw();
        updatePopulation();
        updateGeneration();
        return typeof onFinish === "function" ? onFinish() : void 0;
      }

      doReset() {
        this.cells = new ChainMap();
        this.generation = 0;
        this.cells.put(unity, 1);
        updatePopulation();
        updateGeneration();
        return redraw();
      }

      doSearch() {
        var found;
        found = this.navigator.search(this.cells);
        updateCanvasSize();
        if (found > 0) {
          return this.navigator.navigateToResult(0);
        }
      }

      importData(data) {
        var e, m, match, n, normalizeChain;
        try {
          console.log(`importing ${data}`);
          match = data.match(/^(\d+)\$(\d+)\$(.*)$/);
          if (match == null) {
            throw new Error("Data format unrecognized");
          }
          n = parseIntChecked(match[1]);
          m = parseIntChecked(match[2]);
          if (n !== this.tiling.n || m !== this.tiling.m) {
            console.log("Need to change grid");
            this.setGridImpl(n, m);
          }
          //normzlize chain coordinates, so that importing of user-generated data could be possible
          normalizeChain = (chain) => {
            return this.tiling.toCell(this.tiling.rewrite(chain));
          };
          this.cells = importField(parseFieldData(match[3]), null, normalizeChain);
          return console.log(`Imported ${this.cells.count} cells`);
        } catch (error) {
          e = error;
          alert(`Faield to import data: ${e}`);
          return this.cells = new ChainMap();
        }
      }

      loadData(record, cellData) {
        var assert;
        assert = function (x) {
          if (x == null) {
            throw new Error("Assertion failure");
          }
          return x;
        };
        this.setGridImpl(assert(record.gridN), assert(record.gridM));
        this.animator.reset();
        this.cells = importField(parseFieldData(assert(cellData)));
        this.generation = assert(record.generation);
        this.observer.navigateTo(this.tiling.parse(assert(record.base)), assert(record.offset));
        console.log(`LOading func type= ${record.funcType}`);
        switch (record.funcType) {
          case "binary":
            this.transitionFunc = parseTransitionFunction(record.funcId, record.gridN, record.gridM);
            this.ruleEntry.setValue(this.transitionFunc);
            break;
          case "custom":
            this.transitionFunc = new GenericTransitionFunc(record.funcId);
            this.paintStateSelector.update(this.transitionFunc);
            break;
          default:
            throw new Error(`unknown TF type ${record.funcType}`);
        }
        updatePopulation();
        updateGeneration();
        this.updateRuleEditor();
        return redraw();
      }

      getSaveData(fname) {
        var catalogRecord, fieldData, funcId, funcType;
        //[data, catalogRecord]
        fieldData = stringifyFieldData(exportField(this.cells));
        funcId = "" + this.getTransitionFunc();
        funcType = this.getTransitionFunc().getType();
        catalogRecord = {
          gridN: this.tiling.n,
          gridM: this.tiling.m,
          name: fname,
          funcId: funcId,
          funcType: funcType,
          base: this.getObserver().getViewCenter().toString(),
          offset: this.getObserver().getViewOffsetMatrix(),
          size: fieldData.length,
          time: Date.now(),
          field: null,
          generation: this.generation
        };
        return [fieldData, catalogRecord];
      }

      toggleCellAt(x, y) {
        var cell, e, xp, yp;
        [xp, yp] = this.canvas2relative(x, y);
        try {
          cell = this.observer.cellFromPoint(xp, yp);
        } catch (error) {
          e = error;
          return;
        }
        if (this.cells.get(cell) === this.paintStateSelector.state) {
          this.cells.remove(cell);
        } else {
          this.cells.put(cell, this.paintStateSelector.state);
        }
        return redraw();
      }

      doExportSvg() {
        var svgContext, sz;
        sz = 512;
        svgContext = new C2S(sz, sz);
        drawEverything(sz, sz, svgContext);
        // Show the generated SVG image
        return this.svgDialog.show(svgContext.getSerializedSvg());
      }

      doExportUrl() {
        var basePath, dx, dy, keys, rot, ruleStr, uri;
        //Export field state as URL
        keys = [];
        keys.push(`grid=${this.tiling.n},${this.tiling.m}`);
        if (this.cells.count !== 0) {
          keys.push(`cells=${this.tiling.n}$${this.tiling.m}$${stringifyFieldData(exportField(this.cells))}`);
        }
        keys.push(`generation=${this.generation}`);
        if (this.transitionFunc.getType() === "binary") {
          ruleStr = "" + this.transitionFunc;
          ruleStr = ruleStr.replace(/\s/g, '_');
          keys.push(`rule=${ruleStr}`);
        }
        keys.push(`viewbase=${this.getObserver().getViewCenter()}`);
        [rot, dx, dy] = M.hyperbolicDecompose(this.getObserver().getViewOffsetMatrix());
        keys.push(`viewoffset=${rot}:${dx}:${dy}`);
        basePath = location.href.replace(location.search, '');
        uri = basePath + "?" + keys.join("&");
        return showExportDialog(uri);
      }

    };

    SvgDialog = class SvgDialog {
      constructor(application1) {
        this.application = application1;
        this.dialog = E('svg-export-dialog');
        this.imgContainer = E('svg-image-container');
      }

      close() {
        this.imgContainer.innerHTML = "";
        return this.dialog.style.display = "none";
      }

      show(svg) {
        var dataUri, dom;
        dataUri = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
        dom = new DomBuilder();
        dom.tag('img').a('src', dataUri).a('alt', 'SVG image').a('title', 'Use right click to save SVG image').end();
        this.imgContainer.innerHTML = "";
        this.imgContainer.appendChild(dom.finalize());
        //@imgContainer.innerHTML = svg
        return this.dialog.style.display = "";
      }

    };

    updateCanvasSize = function () {
      var canvasRect, containerAvail, docW, h, navWrap, usedWidth, w, winH, winW;
      if (canvasSizeUpdateBlocked) {
        return;
      }
      docW = documentWidth();
      winW = windowWidth();
      if (docW > winW) {
        console.log("overflow");
        usedWidth = docW - canvas.width;
        //console.log "#Win: #{windowWidth()}, doc: #{documentWidth()}, used: #{usedWidth}"
        w = winW - usedWidth;
      } else {
        //console.log "underflow"
        containerAvail = E('canvas-container').clientWidth;
        //console.log "awail width: #{containerAvail}"
        w = containerAvail;
      }
      //now calculae available height
      canvasRect = canvas.getBoundingClientRect();
      winH = windowHeight();
      h = winH - canvasRect.top;
      navWrap = E('navigator-wrap');
      navWrap.style.height = `${winH - navWrap.getBoundingClientRect().top - 16}px`;
      //get the smaller of both
      w = Math.min(w, h);

      //reduce it a bit
      w -= 16;

      //make width multiple of 16
      w = w & ~15;

      //console.log "New w is #{w}"
      if (w <= MIN_WIDTH) {
        w = MIN_WIDTH;
      }
      if (canvas.width !== w) {
        canvas.width = canvas.height = w;
        redraw();
        E('image-size').value = "" + w;
      }
    };

    doSetFixedSize = function (isFixed) {
      var size;
      if (isFixed) {
        size = parseIntChecked(E('image-size').value);
        if (size <= 0 || size >= 65536) {
          throw new Error(`Bad size: ${size}`);
        }
        canvasSizeUpdateBlocked = true;
        canvas.width = canvas.height = size;
        return redraw();
      } else {
        canvasSizeUpdateBlocked = false;
        return updateCanvasSize();
      }
    };

    PaintStateSelector = class PaintStateSelector {
      constructor(application1, container, buttonContainer) {
        this.application = application1;
        this.container = container;
        this.buttonContainer = buttonContainer;
        this.state = 1;
        this.numStates = 2;
      }

      update() {
        var btnId, color, dom, i, id2state, numStates, ref, state;
        numStates = this.application.getTransitionFunc().numStates;
        //only do something if number of states changed
        if (numStates === this.numStates) {
          return;
        }
        this.numStates = numStates;
        console.log(`Num states changed to ${numStates}`);
        if (this.state >= numStates) {
          this.state = 1;
        }
        this.buttonContainer.innerHTML = '';
        if (numStates <= 2) {
          this.container.style.display = 'none';
          this.buttons = null;
          return this.state2id = null;
        } else {
          this.container.style.display = '';
          dom = new DomBuilder();
          id2state = {};
          this.state2id = {};
          for (state = i = 1, ref = numStates; (1 <= ref ? i < ref : i > ref); state = 1 <= ref ? ++i : --i) {
            color = this.application.observer.getColorForState(state);
            btnId = `select-state-${state}`;
            this.state2id[state] = btnId;
            id2state[btnId] = state;
            dom.tag('button').store('btn').CLASS(state === this.state ? 'btn-selected' : '').ID(btnId).a('style', `background-color:${color}`).text('' + state).end();
          }
          //dom.vars.btn.onclick = (e)->
          this.buttonContainer.appendChild(dom.finalize());
          this.buttons = new ButtonGroup(this.buttonContainer, 'button');
          return this.buttons.addEventListener('change', (e, btnId, oldBtn) => {
            if ((state = id2state[btnId]) != null) {
              return this.state = state;
            }
          });
        }
      }

      setState(newState) {
        if (newState === this.state) {
          return;
        }
        if (this.state2id[newState] == null) {
          return;
        }
        this.state = newState;
        if (this.buttons) {
          return this.buttons.setButton(this.state2id[newState]);
        }
      }

    };

    serverSupportsUpload = function () {
      return (("" + window.location).match(/:8000\//)) && true;
    };

    // ============================================  app code ===============

    if (serverSupportsUpload()) {
      console.log("Enable upload");
      E('animate-controls').style.display = '';
    }

    canvas = E("canvas");

    context = canvas.getContext("2d");

    dragHandler = null;

    ghostClickDetector = new GhostClickDetector();

    player = null;

    playerTimeout = 500;

    autoplayCriticalPopulation = 90000;

    doStartPlayer = function () {
      var runPlayerStep;
      if (player != null) {
        return;
      }
      runPlayerStep = function () {
        if (application.cells.count >= autoplayCriticalPopulation) {
          alert(`Population reached ${application.cells.count}, stopping auto-play`);
          player = null;
        } else {
          player = setTimeout((function () {
            return application.doStep(runPlayerStep);
          }), playerTimeout);
        }
        return updatePlayButtons();
      };
      return runPlayerStep();
    };

    doStopPlayer = function () {
      if (player) {
        clearTimeout(player);
        player = null;
        return updatePlayButtons();
      }
    };

    doTogglePlayer = function () {
      if (player) {
        return doStopPlayer();
      } else {
        return doStartPlayer();
      }
    };

    updateGenericRuleStatus = function (status) {
      var span;
      span = E('generic-tf-status');
      span.innerHTML = status;
      return span.setAttribute('class', 'generic-tf-status-#{status.toLowerCase()}');
    };

    updatePlayButtons = function () {
      E('btn-play-start').style.display = player ? "none" : '';
      return E('btn-play-stop').style.display = !player ? "none" : '';
    };

    dirty = true;

    redraw = function () {
      return dirty = true;
    };

    drawEverything = function (w, h, context) {
      var s, s1;
      if (!application.observer.canDraw()) {
        return false;
      }
      context.fillStyle = "white";
      //context.clearRect 0, 0, canvas.width, canvas.height
      context.fillRect(0, 0, w, h);
      context.save();
      s = Math.min(w, h) / 2;
      s1 = s - application.getMargin();
      context.translate(s, s);
      application.observer.draw(application.cells, context, s1);
      context.restore();
      return true;
    };

    fpsLimiting = true;

    lastTime = Date.now();

    fpsDefault = 30;

    dtMax = 1000.0 / fpsDefault;

    redrawLoop = function () {
      var t, tDraw;
      if (dirty) {
        if (!fpsLimiting || ((t = Date.now()) - lastTime > dtMax)) {
          if (drawEverything(canvas.width, canvas.height, context)) {
            tDraw = Date.now() - t;
            //adaptively update FPS
            dtMax = dtMax * 0.9 + tDraw * 2 * 0.1;
            dirty = false;
          }
          lastTime = t;
        }
      }
      return requestAnimationFrame(redrawLoop);
    };

    isPanMode = true;

    doCanvasMouseDown = function (e) {
      var isPanAction, x, y;
      //Allow normal right-click to support image sacing
      E('canvas-container').focus();
      if (e.button === 2) {
        return;
      }
      if (typeof canvas.setCapture === "function") {
        canvas.setCapture(true);
      }
      e.preventDefault();
      [x, y] = getCanvasCursorPosition(e, canvas);
      isPanAction = (e.button === 1) ^ e.shiftKey ^ isPanMode;
      if (!isPanAction) {
        application.toggleCellAt(x, y);
        return updatePopulation();
      } else {
        return dragHandler = new MouseToolCombo(application, x, y);
      }
    };

    doCanvasMouseUp = function (e) {
      e.preventDefault();
      if (dragHandler !== null) {
        if (dragHandler != null) {
          dragHandler.mouseUp(e);
        }
        return dragHandler = null;
      }
    };

    doCanvasTouchStart = function (e) {
      if (e.touches.length === 1) {
        doCanvasMouseDown(e);
        return e.preventDefault();
      }
    };

    doCanvasTouchLeave = function (e) {
      return doCanvasMouseOut(e);
    };

    doCanvasTouchEnd = function (e) {
      e.preventDefault();
      return doCanvasMouseUp(e);
    };

    doCanvasTouchMove = function (e) {
      return doCanvasMouseMove(e);
    };

    doSetPanMode = function (mode) {
      var bedit, bpan;
      isPanMode = mode;
      bpan = E('btn-mode-pan');
      bedit = E('btn-mode-edit');
      removeClass(bpan, 'button-active');
      removeClass(bedit, 'button-active');
      return addClass((isPanMode ? bpan : bedit), 'button-active');
    };

    doCanvasMouseMove = function (e) {
      var isPanAction;
      isPanAction = e.shiftKey ^ isPanMode;
      E('canvas-container').style.cursor = isPanAction ? 'move' : 'default';
      if (dragHandler !== null) {
        e.preventDefault();
        return dragHandler.mouseMoved(e);
      }
    };

    doOpenEditor = function () {
      E('generic-tf-code').value = application.transitionFunc.code;
      return E('generic-tf-editor').style.display = '';
    };

    doCloseEditor = function () {
      return E('generic-tf-editor').style.display = 'none';
    };

    doSetRuleGeneric = function () {
      var e;
      try {
        console.log("Set generic rule");
        application.transitionFunc = new GenericTransitionFunc(E('generic-tf-code').value);
        updateGenericRuleStatus('Compiled');
        application.paintStateSelector.update(application.transitionFunc);
        application.updateRuleEditor();
        E('controls-rule-simple').style.display = "none";
        E('controls-rule-generic').style.display = "";
        return true;
      } catch (error) {
        e = error;
        alert(`Failed to parse function: ${e}`);
        updateGenericRuleStatus('Error');
        return false;
      }
    };

    doSetGrid = function () {
      var e, m, n;
      try {
        n = parseInt(E('entry-n').value, 10);
        m = parseInt(E('entry-m').value, 10);
        if (Number.isNaN(n) || n <= 0) {
          throw new Error("Parameter N is bad");
        }
        if (Number.isNaN(m) || m <= 0) {
          throw new Error("Parameter M is bad");
        }
        //if 1/n + 1/m <= 1/2
        if (2 * (n + m) >= n * m) {
          throw new Error(`Tessellation {${n}; ${m}} is not hyperbolic and not supported.`);
        }
      } catch (error) {
        e = error;
        alert("" + e);
        return;
      }
      application.setGridImpl(n, m);
      application.doReset();
      return application.animator.reset();
    };

    updatePopulation = function () {
      return E('population').innerHTML = "" + application.cells.count;
    };

    updateGeneration = function () {
      return E('generation').innerHTML = "" + application.generation;
    };


    //exportTrivial = (cells) ->
    //  parts = []
    //  cells.forItems (cell, value)->
    //    parts.push ""+cell
    //    parts.push ""+value
    //  return parts.join " "
    doExport = function () {
      var data, m, n;
      data = stringifyFieldData(exportField(application.cells));
      n = application.tiling.n;
      m = application.tiling.m;
      return showExportDialog(`${n}$${m}$${data}`);
    };

    doExportClose = function () {
      return E('export-dialog').style.display = 'none';
    };

    uploadToServer = function (imgname, callback) {
      var cb, dataURL;
      dataURL = canvas.toDataURL();
      cb = function (blob) {
        var ajax, formData;
        formData = new FormData();
        formData.append("file", blob, imgname);
        ajax = getAjax();
        ajax.open('POST', '/uploads/', false);
        ajax.onreadystatechange = function () {
          return callback(ajax);
        };
        return ajax.send(formData);
      };
      return canvas.toBlob(cb, "image/png");
    };

    memo = null;

    doMemorize = function () {
      memo = {
        cells: application.cells.copy(),
        viewCenter: application.observer.getViewCenter(),
        viewOffset: application.observer.getViewOffsetMatrix(),
        generation: application.generation
      };
      console.log("Position memoized");
      return updateMemoryButtons();
    };

    doRemember = function () {
      if (memo === null) {
        return console.log("nothing to remember");
      } else {
        application.cells = memo.cells.copy();
        application.generation = memo.generation;
        application.observer.navigateTo(memo.viewCenter, memo.viewOffset);
        updatePopulation();
        return updateGeneration();
      }
    };

    doClearMemory = function () {
      memo = null;
      return updateMemoryButtons();
    };

    updateMemoryButtons = function () {
      return E('btn-mem-get').disabled = E('btn-mem-clear').disabled = memo === null;
    };

    encodeVisible = function () {
      var cell, i, iCenter, len, ref, state, translatedCell, visibleCells;
      iCenter = application.tiling.inverse(application.observer.cellFromPoint(0, 0));
      visibleCells = new ChainMap();
      ref = application.observer.visibleCells(application.cells);
      for (i = 0, len = ref.length; i < len; i++) {
        [cell, state] = ref[i];
        translatedCell = application.tiling.append(iCenter, cell);
        translatedCell = application.tiling.toCell(translatedCell);
        visibleCells.put(translatedCell, state);
      }
      return exportField(visibleCells);
    };

    showExportDialog = function (sdata) {
      E('export').value = sdata;
      E('export-dialog').style.display = '';
      E('export').focus();
      return E('export').select();
    };

    doExportVisible = function () {
      var data, m, n;
      n = application.tiling.n;
      m = application.tiling.m;
      data = stringifyFieldData(encodeVisible());
      return showExportDialog(`${n}$${m}$${data}`);
    };

    doShowImport = function () {
      E('import-dialog').style.display = '';
      return E('import').focus();
    };

    doImportCancel = function () {
      E('import-dialog').style.display = 'none';
      return E('import').value = '';
    };

    doImport = function () {
      var e;
      try {
        application.importData(E('import').value);
        updatePopulation();
        redraw();
        E('import-dialog').style.display = 'none';
        return E('import').value = '';
      } catch (error) {
        e = error;
        return alert(`Error parsing: ${e}`);
      }
    };

    doEditAsGeneric = function () {
      application.transitionFunc = application.transitionFunc.toGeneric();
      updateGenericRuleStatus('Compiled');
      application.paintStateSelector.update(application.transitionFunc);
      application.updateRuleEditor();
      return doOpenEditor();
    };

    doDisableGeneric = function () {
      return application.doSetRule();
    };

    doNavigateHome = function () {
      return application.observer.navigateTo(unity);
    };

    // ============ Bind Events =================
    E("btn-reset").addEventListener("click", function () {
      return application.doReset();
    });

    E("btn-step").addEventListener("click", function () {
      return application.doStep();
    });

    mouseMoveReceiver = E("canvas-container");

    mouseMoveReceiver.addEventListener("mousedown", function (e) {
      if (!ghostClickDetector.isGhost) {
        return doCanvasMouseDown(e);
      }
    });

    mouseMoveReceiver.addEventListener("mouseup", function (e) {
      if (!ghostClickDetector.isGhost) {
        return doCanvasMouseUp(e);
      }
    });

    mouseMoveReceiver.addEventListener("mousemove", doCanvasMouseMove);

    mouseMoveReceiver.addEventListener("mousedrag", doCanvasMouseMove);

    mouseMoveReceiver.addEventListener("touchstart", doCanvasTouchStart);

    mouseMoveReceiver.addEventListener("touchend", doCanvasTouchEnd);

    mouseMoveReceiver.addEventListener("touchmove", doCanvasTouchMove);

    mouseMoveReceiver.addEventListener("touchleave", doCanvasTouchLeave);

    ghostClickDetector.addListeners(canvas);

    E("btn-set-rule").addEventListener("click", function (e) {
      return application.doSetRule();
    });

    E("btn-set-rule-generic").addEventListener("click", function (e) {
      doSetRuleGeneric();
      return doCloseEditor();
    });

    E("btn-rule-generic-close-editor").addEventListener("click", doCloseEditor);

    E("btn-set-grid").addEventListener("click", doSetGrid);

    E("btn-export").addEventListener("click", doExport);

    E('btn-search').addEventListener('click', function () {
      return application.doSearch();
    });

    E('btn-random').addEventListener('click', function () {
      return application.doRandomFill();
    });

    E('btn-rule-make-generic').addEventListener('click', doEditAsGeneric);

    E('btn-edit-rule').addEventListener('click', doOpenEditor);

    E('btn-disable-generic-rule').addEventListener('click', doDisableGeneric);

    E('btn-export-close').addEventListener('click', doExportClose);

    E('btn-import').addEventListener('click', doShowImport);

    E('btn-import-cancel').addEventListener('click', doImportCancel);

    E('btn-import-run').addEventListener('click', doImport);

    //initialize
    E('btn-mem-set').addEventListener('click', doMemorize);

    E('btn-mem-get').addEventListener('click', doRemember);

    E('btn-mem-clear').addEventListener('click', doClearMemory);

    E('btn-exp-visible').addEventListener('click', doExportVisible);

    E('btn-nav-home').addEventListener('click', doNavigateHome);

    window.addEventListener('resize', updateCanvasSize);

    E('btn-nav-clear').addEventListener('click', function (e) {
      return application.navigator.clear();
    });

    E('btn-play-start').addEventListener('click', doTogglePlayer);

    E('btn-play-stop').addEventListener('click', doTogglePlayer);

    E('animate-set-start').addEventListener('click', function () {
      return application.animator.setStart(application.observer);
    });

    E('animate-set-end').addEventListener('click', function () {
      return application.animator.setEnd(application.observer);
    });

    E('animate-view-start').addEventListener('click', function () {
      return application.animator.viewStart(application.observer);
    });

    E('animate-view-end').addEventListener('click', function () {
      return application.animator.viewEnd(application.observer);
    });

    E('btn-animate-derotate').addEventListener('click', function () {
      return application.animator.derotate();
    });

    E('btn-upload-animation').addEventListener('click', function (e) {
      return application.animator.animate(application.observer, parseIntChecked(E('animate-frame-per-generation').value), parseIntChecked(E('animate-generations').value), (function () {
        return null;
      }));
    });

    E('btn-animate-cancel').addEventListener('click', function (e) {
      return application.animator.cancelWork();
    });

    E('view-straighten').addEventListener('click', function (e) {
      return application.observer.straightenView();
    });

    E('view-straighten').addEventListener('click', function (e) {
      return application.observer.straightenView();
    });

    E('image-fix-size').addEventListener('click', function (e) {
      return doSetFixedSize(E('image-fix-size').checked);
    });

    E('image-size').addEventListener('change', function (e) {
      E('image-fix-size').checked = true;
      return doSetFixedSize(true);
    });

    E('flag-origin-mark').addEventListener('change', function (e) {
      return application.setDrawingHomePtr(E('flag-origin-mark').checked);
    });

    E('flag-live-borders').addEventListener('change', function (e) {
      return application.setShowLiveBorders(E('flag-live-borders').checked);
    });

    E('btn-mode-edit').addEventListener('click', function (e) {
      return doSetPanMode(false);
    });

    E('btn-mode-pan').addEventListener('click', function (e) {
      return doSetPanMode(true);
    });

    E('btn-db-save').addEventListener('click', function (e) {
      return application.saveDialog.show();
    });

    E('btn-db-load').addEventListener('click', function (e) {
      return application.openDialog.show();
    });

    E('btn-export-svg').addEventListener('click', function (e) {
      return application.doExportSvg();
    });

    E('btn-svg-export-dialog-close').addEventListener('click', function (e) {
      return application.svgDialog.close();
    });

    E('btn-export-uri').addEventListener('click', function (e) {
      return application.doExportUrl();
    });

    shortcuts = {
      'N': function () {
        return application.doStep();
      },
      'C': function () {
        return application.doReset();
      },
      'S': function () {
        return application.doSearch();
      },
      'R': function () {
        return application.doRandomFill();
      },
      '1': function (e) {
        return application.paintStateSelector.setState(1);
      },
      '2': function (e) {
        return application.paintStateSelector.setState(2);
      },
      '3': function (e) {
        return application.paintStateSelector.setState(3);
      },
      '4': function (e) {
        return application.paintStateSelector.setState(4);
      },
      '5': function (e) {
        return application.paintStateSelector.setState(5);
      },
      'M': doMemorize,
      'U': doRemember,
      'UA': doClearMemory,
      'H': doNavigateHome,
      'G': doTogglePlayer,
      'SA': function (e) {
        return application.observer.straightenView();
      },
      '#32': doTogglePlayer,
      'P': function (e) {
        return doSetPanMode(true);
      },
      'E': function (e) {
        return doSetPanMode(false);
      },
      'SC': function (e) {
        return application.saveDialog.show();
      },
      'OC': function (e) {
        return application.openDialog.show();
      }
    };

    document.addEventListener("keydown", function (e) {
      var focused, handler, keyCode, ref;
      focused = document.activeElement;
      if (focused && ((ref = focused.tagName.toLowerCase()) === 'textarea' || ref === 'input')) {
        return;
      }
      keyCode = e.keyCode > 32 && e.keyCode < 128 ? String.fromCharCode(e.keyCode) : '#' + e.keyCode;
      if (e.ctrlKey) {
        keyCode += "C";
      }
      if (e.altKey) {
        keyCode += "A";
      }
      if (e.shiftKey) {
        keyCode += "S";
      }
      //console.log keyCode
      if ((handler = shortcuts[keyCode]) != null) {
        e.preventDefault();
        return handler(e);
      }
    });

    //#Application startup    
    application = new Application();

    application.initialize(new UriConfig());

    doSetPanMode(true);

    updatePopulation();

    updateGeneration();

    updateCanvasSize();

    updateMemoryButtons();

    updatePlayButtons();

    redrawLoop();

    //application.saveDialog.show()


  }, { "../core/acosh_polyfill.coffee": 1, "../core/cellular_automata.coffee": 2, "../core/chain_map.coffee": 3, "../core/field.coffee": 5, "../core/matrix3.coffee": 8, "../core/regular_tiling.coffee": 10, "../core/rule.coffee": 11, "../core/utils.coffee": 13, "../core/vondyck_chain.coffee": 15, "../ext/canvas2svg.js": 17, "../ext/polyfills.js": 18, "./animator.coffee": 19, "./canvas_util.coffee": 21, "./dom_builder.coffee": 22, "./ghost_click_detector.coffee": 23, "./htmlutil.coffee": 24, "./indexeddb.coffee": 25, "./mousetool.coffee": 26, "./navigator.coffee": 27, "./observer.coffee": 28, "./parseuri.coffee": 29 }], 21: [function (require, module, exports) {
    //taken from http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
    exports.getCanvasCursorPosition = function (e, canvas) {
      var rect;
      if (e.type === "touchmove" || e.type === "touchstart" || e.type === "touchend") {
        e = e.touches[0];
      }
      if (e.clientX != null) {
        rect = canvas.getBoundingClientRect();
        return [e.clientX - rect.left, e.clientY - rect.top];
      }
    };


  }, {}], 22: [function (require, module, exports) {
    //########
    // Let's make a bicycle!

    var DomBuilder;

    exports.DomBuilder = DomBuilder = class DomBuilder {
      constructor(tag = null) {
        var root;
        this.root = root = tag === null ? document.createDocumentFragment() : document.createElement(tag);
        this.current = this.root;
        this.vars = {};
      }

      tag(name) {
        var e;
        this.current.appendChild(e = document.createElement(name));
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



  }, {}], 23: [function (require, module, exports) {
    /*
     * In some mobile browsers, ghost clicks can not be prevented. So here easy solution: every mouse event,
     * coming after some interval after a touch event is ghost
     */
    var GhostClickDetector;

    exports.GhostClickDetector = GhostClickDetector = class GhostClickDetector {
      constructor() {
        this.isGhost = false;
        this.timerHandle = null;
        this.ghostInterval = 1000; //ms
        //Bound functions
        this._onTimer = () => {
          this.isGhost = false;
          return this.timerHandle = null;
        };
        this._onTouch = () => {
          return this.onTouch();
        };
      }

      onTouch() {
        this.stopTimer();
        this.isGhost = true;
        return this.timerHandle = window.setTimeout(this._onTimer, this.ghostInterval);
      }

      stopTimer() {
        var handle;
        if ((handle = this.timerHandle)) {
          window.clearTimeout(handle);
          return this.timerHandle = null;
        }
      }

      addListeners(element) {
        var evtName, i, len, ref, results;
        ref = ["touchstart", "touchend"];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          evtName = ref[i];
          results.push(element.addEventListener(evtName, this._onTouch, false));
        }
        return results;
      }

    };


  }, {}], 24: [function (require, module, exports) {
    //I am learning JS and want to implement this functionality by hand
    var ButtonGroup, Debouncer, E, ValidatingInput, addClass, idOrNull, removeClass;

    exports.flipSetTimeout = function (t, cb) {
      return setTimeout(cb, t);
    };

    exports.E = E = function (id) {
      return document.getElementById(id);
    };

    // Remove class from the element
    exports.removeClass = removeClass = function (e, c) {
      var ci;
      return e.className = ((function () {
        var j, len1, ref, results;
        ref = e.className.split(" ");
        results = [];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          ci = ref[j];
          if (c !== ci) {
            results.push(ci);
          }
        }
        return results;
      })()).join(" ");
    };

    exports.addClass = addClass = function (e, c) {
      var classes;
      return e.className = (classes = e.className) === "" ? c : classes + " " + c;
    };

    idOrNull = function (elem) {
      if (elem === null) {
        return null;
      } else {
        return elem.getAttribute("id");
      }
    };

    exports.ButtonGroup = ButtonGroup = class ButtonGroup {
      constructor(containerElem, tag, selectedId = null, selectedClass = "btn-selected") {
        var btn, j, len1, ref;
        this.selectedClass = selectedClass;
        if (selectedId !== null) {
          addClass((this.selected = E(selectedId)), this.selectedClass);
        } else {
          this.selected = null;
        }
        this.handlers = {
          change: []
        };
        ref = containerElem.getElementsByTagName(tag);
        for (j = 0, len1 = ref.length; j < len1; j++) {
          btn = ref[j];
          btn.addEventListener("click", this._btnClickListener(btn));
        }
        return;
      }

      _changeActiveButton(newBtn, e) {
        var handler, j, len1, newId, oldBtn, oldId, ref;
        newId = idOrNull(newBtn);
        oldBtn = this.selected;
        oldId = idOrNull(oldBtn);
        if (newId !== oldId) {
          if (oldBtn !== null) {
            removeClass(oldBtn, this.selectedClass);
          }
          if (newBtn !== null) {
            addClass(newBtn, this.selectedClass);
          }
          this.selected = newBtn;
          ref = this.handlers.change;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            handler = ref[j];
            handler(e, newId, oldId);
          }
        }
      }

      _btnClickListener(newBtn) {
        return (e) => {
          return this._changeActiveButton(newBtn, e);
        };
      }

      addEventListener(name, handler) {
        var handlers;
        if ((handlers = this.handlers[name]) == null) {
          throw new Error(`Hander ${name} is not supported`);
        }
        return handlers.push(handler);
      }

      setButton(newId) {
        if (newId === null) {
          return this._changeActiveButton(null, null);
        } else {
          return this._changeActiveButton(document.getElementById(newId), null);
        }
      }

    };

    exports.windowWidth = function () {
      //http://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
      return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    };

    exports.windowHeight = function () {
      return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    };

    exports.documentWidth = function () {
      return document.documentElement.scrollWidth || document.body.scrollWidth;
    };

    if (HTMLCanvasElement.prototype.toBlob == null) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
          var arr, binStr, i, j, len, ref;
          binStr = atob(this.toDataURL(type, quality).split(',')[1]);
          len = binStr.length;
          arr = new Uint8Array(len);
          for (i = j = 0, ref = len; j < ref; i = j += 1) {
            arr[i] = binStr.charCodeAt(i);
          }
          return callback(new Blob([arr], {
            type: type || 'image/png'
          }));
        }
      });
    }

    exports.Debouncer = Debouncer = class Debouncer {
      constructor(timeout, callback1) {
        this.timeout = timeout;
        this.callback = callback1;
        this.timer = null;
      }

      fire() {
        if (this.timer) {
          clearTimeout(this.timer);
        }
        return this.timer = setTimeout((() => {
          return this.onTimer();
        }), this.timeout);
      }

      onTimer() {
        this.timer = null;
        return this.callback();
      }

    };

    exports.getAjax = function () {
      if (window.XMLHttpRequest != null) {
        return new XMLHttpRequest();
      } else if (window.ActiveXObject != null) {
        return new ActiveXObject("Microsoft.XMLHTTP");
      }
    };

    exports.ValidatingInput = ValidatingInput = class ValidatingInput {
      constructor(element, parseValue, stringifyValue, value, stateStyleClasses = {
        ok: "input-ok",
        error: "input-bad",
        modified: "input-editing"
      }) {
        this.element = element;
        this.parseValue = parseValue;
        this.stringifyValue = stringifyValue;
        this.stateStyleClasses = stateStyleClasses;
        this.message = null;
        if (value != null) {
          this.setValue(value);
        } else {
          this._modified();
        }
        this.onparsed = null;
        this.element.addEventListener("reset", (e) => {
          console.log("reset");
          return this._reset();
        });
        this.element.addEventListener("keydown", (e) => {
          if (e.keyCode === 27) {
            console.log("Esc");
            e.preventDefault();
            return this._reset();
          }
        });
        this.element.addEventListener("change", (e) => {
          console.log("changed");
          return this._modified();
        });
        this.element.addEventListener("blur", (e) => {
          console.log("blur");
          return this._exit();
        });
        this.element.addEventListener("input", (e) => {
          console.log("input");
          return this._editing();
        });
      }

      setValue(val) {
        var newText;
        this.value = val;
        newText = this.stringifyValue(val);
        this.element.value = newText;
        return this._setClass(this.stateStyleClasses.ok);
      }

      revalidate() {
        return this._parse();
      }

      _reset() {
        return this.setValue(this.value);
      }

      _exit() {
        if (this.message != null) {
          return this._reset();
        }
      }

      _editing() {
        this._setMessage(null);
        return this._setClass(this.stateStyleClasses.modified);
      }

      _setMessage(msg) {
        if (msg != null) {
          console.log(msg);
        }
        return this.message = msg;
      }

      _setClass(cls) {
        removeClass(this.element, this.stateStyleClasses.ok);
        removeClass(this.element, this.stateStyleClasses.error);
        removeClass(this.element, this.stateStyleClasses.modified);
        return addClass(this.element, cls);
      }

      _parse() {
        var e, newVal;
        try {
          newVal = this.parseValue(this.element.value);
          if (newVal != null) {
            this.value = newVal;
          } else {
            throw new Error("parse function returned no value");
          }
          this._setMessage(null);
          this._setClass(this.stateStyleClasses.ok);
          return true;
        } catch (error) {
          e = error;
          this._setMessage(`Failed to parse value: ${e}`);
          this._setClass(this.stateStyleClasses.error);
          return false;
        }
      }

      _modified() {
        if (this._parse()) {
          return typeof this.onparsed === "function" ? this.onparsed(this.value) : void 0;
        }
      }

    };


  }, {}], 25: [function (require, module, exports) {
    //Storing and loading configuration in/from IndexedDB

    // DB structure:
    //  Table: catalog
    //{
    //    name: str
    //    gridN: int
    //    gridM: int
    //    fucntionType: str (binary / Day-Night binary / Custom) 
    //    functionId:str (code for binary, hash for custom)

    // Table: files
    //    key: id (autoincrement)
    //    value: fieldData (stringified)
    var DomBuilder, E, GenerateFileList, OpenDialog, SaveDialog, VERSION, addClass, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, removeClass, upgradeNeeded;

    ({ E, removeClass, addClass } = require("./htmlutil.coffee"));

    ({ DomBuilder } = require("./dom_builder.coffee"));

    //M = require "../core/matrix3.coffee"
    VERSION = 1;

    //Using info from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

    window.indexedDB = (ref = (ref1 = (ref2 = window.indexedDB) != null ? ref2 : window.mozIndexedDB) != null ? ref1 : window.webkitIndexedDB) != null ? ref : window.msIndexedDB;

    // This line should only be needed if it is needed to support the object's constants for older browsers
    window.IDBTransaction = (ref3 = (ref4 = (ref5 = window.IDBTransaction) != null ? ref5 : window.webkitIDBTransaction) != null ? ref4 : window.msIDBTransaction) != null ? ref3 : {
      READ_WRITE: "readwrite"
    };

    window.IDBKeyRange = (ref6 = (ref7 = window.IDBKeyRange) != null ? ref7 : window.webkitIDBKeyRange) != null ? ref6 : window.msIDBKeyRange;

    exports.hasDbSupport = function () {
      return window.indexedDB != null;
    };

    upgradeNeeded = function (e) {
      var catalogStore, db;
      console.log("Upgrade !");
      db = e.target.result;
      if (db.objectStoreNames.contains("files")) {
        console.log("Dropping files...");
        db.deleteObjectStore("files");
      }
      if (db.objectStoreNames.contains("catalog")) {
        console.log("Dropping catalog");
        db.deleteObjectStore("catalog");
      }
      console.log("Create files and database store");
      db.createObjectStore("files", {
        autoIncrement: true
      });
      catalogStore = db.createObjectStore("catalog", {
        autoIncrement: true
      });
      return catalogStore.createIndex("catalogByGrid", ['gridN', 'gridM', 'funcId', 'name', 'time'], {
        unique: false
      });
    };

    exports.OpenDialog = OpenDialog = class OpenDialog {
      constructor(application) {
        this.application = application;
        this.container = E('file-dialog-open');
        this.btnCancel = E('btn-files-cancel');
        this.filelistElement = E('file-dialog-files');
        this.btnAllGrids = E('toggle-all-grids');
        this.btnAllRules = E('toggle-all-rules');
        this.allGridsEnabled = false;
        this.allRuelsEnabled = false;
        this.fileList = null;
        //Bind events
        this.btnAllRules.addEventListener('click', (e) => {
          return this._toggleAllRules();
        });
        this.btnAllGrids.addEventListener('click', (e) => {
          return this._toggleAllGrids();
        });
        this.btnCancel.addEventListener('click', (e) => {
          return this.close();
        });
      }

      show() {
        this._updateUI();
        this.container.style.display = '';
        return this._generateFileList();
      }

      _generateFileList() {
        var grid, rule;
        this.filelistElement.innerHTML = '<img src="media/hrz-spinner.gif"/>';
        grid = this.allGridsEnabled ? null : [this.application.tiling.n, this.application.tiling.m];
        rule = this.allGridsEnabled || this.allRuelsEnabled ? null : "" + this.application.getTransitionFunc();
        return this.fileList = new GenerateFileList(grid, rule, this.filelistElement, (fileRecord, fileData) => {
          return this._loadFile(fileRecord, fileData);
        }, () => {
          return this._fileListReady();
        });
      }

      _loadFile(fileRecord, fileData) {
        this.application.loadData(fileRecord, fileData);
        return this.close();
      }

      _fileListReady() {
        return console.log("File list ready");
      }

      close() {
        return this.container.style.display = 'none';
      }

      //Update state of the used interface.
      _updateUI() {
        //WHen all grids are enabled, enable all ruels automaticelly.
        this.btnAllRules.disabled = this.allGridsEnabled;
        removeClass(this.btnAllGrids, 'button-active');
        removeClass(this.btnAllRules, 'button-active');
        if (this.allGridsEnabled) {
          addClass(this.btnAllGrids, 'button-active');
        }
        if (this.allRuelsEnabled || this.allGridsEnabled) {
          return addClass(this.btnAllRules, 'button-active');
        }
      }

      _toggleAllGrids() {
        this.allGridsEnabled = !this.allGridsEnabled;
        this._updateUI();
        return this._generateFileList();
      }

      _toggleAllRules() {
        this.allRuelsEnabled = !this.allRuelsEnabled;
        this._updateUI();
        return this._generateFileList();
      }

    };

    exports.SaveDialog = SaveDialog = class SaveDialog {
      constructor(application) {
        this.application = application;
        this.container = E('file-dialog-save');
        this.btnCancel = E('btn-files-save-cancel');
        this.btnSave = E('file-dialog-save-btn');
        this.fldName = E('file-dialog-save-as');
        this.filelistElement = E('file-dialog-save-files');
        this.allGridsEnabled = false;
        this.allRuelsEnabled = false;
        //Bind events
        this.btnCancel.addEventListener('click', (e) => {
          return this.close();
        });
        this.btnSave.addEventListener('click', (e) => {
          return this.save();
        });
        this.fldName.addEventListener('change', (e) => {
          return this.save();
        });
      }

      show() {
        this._updateUI();
        this.container.style.display = '';
        this._generateFileList();
        this.fldName.focus();
        return this.fldName.select();
      }

      _updateUI() { }

      _generateFileList() {
        var fileListGen, grid, rule;
        this.filelistElement.innerHTML = '<img src="media/hrz-spinner.gif"/>';
        grid = [this.application.tiling.n, this.application.tiling.m];
        rule = "" + this.application.getTransitionFunc();
        return fileListGen = new GenerateFileList(grid, rule, this.filelistElement, null, () => {
          return this._fileListReady();
        });
      }

      _fileListReady() {
        return console.log("list ready");
      }

      close() {
        return this.container.style.display = 'none';
      }

      save() {
        var catalogRecord, fieldData, fname, request;
        console.log("Saving!");
        fname = this.fldName.value;
        if (!fname) {
          alert("File name can not be empty");
          return;
        }
        [fieldData, catalogRecord] = this.application.getSaveData(fname);
        request = window.indexedDB.open("SavedFields", VERSION);
        request.onupgradeneeded = upgradeNeeded;
        request.onerror = (e) => {
          return console.log(`DB error: ${e.target.errorCode}`);
        };
        return request.onsuccess = (e) => {
          var db, rqStoreData, transaction;
          db = e.target.result;
          transaction = db.transaction(["files", "catalog"], "readwrite");
          rqStoreData = transaction.objectStore("files").add(fieldData);
          rqStoreData.onerror = (e) => {
            return console.log(`Error storing data ${e.target.error}`);
          };
          return rqStoreData.onsuccess = (e) => {
            var key, rqStoreCatalog;
            key = e.target.result;
            catalogRecord.field = key;
            rqStoreCatalog = transaction.objectStore("catalog").add(catalogRecord);
            rqStoreCatalog.onerror = (e) => {
              return console.log(`Error storing catalog record ${e.target.error}`);
            };
            return rqStoreCatalog.onsuccess = (e) => {
              return this.fileSaved();
            };
          };
        };
      }

      fileSaved() {
        console.log("File saved OK");
        return this.close();
      }

    };

    GenerateFileList = class GenerateFileList {
      constructor(grid1, rule1, container, fileCallback, readyCallback) {
        this.grid = grid1;
        this.rule = rule1;
        this.container = container;
        this.fileCallback = fileCallback;
        this.readyCallback = readyCallback;
        self.db = null;
        this.status = "working";
        this.recordId2Controls = {};
        this._generateFileList();
      }

      _generateFileList() {
        var request;
        request = window.indexedDB.open("SavedFields", VERSION);
        request.onupgradeneeded = upgradeNeeded;
        request.onerror = (e) => {
          console.log(`DB error: ${e.target.errorCode}`);
          return this.status = "error";
        };
        return request.onsuccess = (e) => {
          this.db = e.target.result;
          console.log("Success");
          if (this.grid === null) {
            console.log("Loading whole list");
            return this.loadData();
          } else {
            console.log(`Loading data: {${this.grid[0]};${this.grid[1]}}, rule='${this.rule}'`);
            return this.loadDataFor(this.grid[0], this.grid[1], this.rule);
          }
        };
      }

      selectAll(selected) {
        var _, controls, ref8, results;
        ref8 = this.recordId2Controls;
        results = [];
        for (_ in ref8) {
          controls = ref8[_];
          results.push(controls.check.checked = selected);
        }
        return results;
      }

      selectedIds() {
        var controls, id, ref8, results;
        ref8 = this.recordId2Controls;
        results = [];
        for (id in ref8) {
          controls = ref8[id];
          if (controls.check.checked) {
            results.push([id | 0, controls.record]);
          }
        }
        return results;
      }

      deleteSelected() {
        var ids;
        ids = this.selectedIds();
        if (ids.length === 0) {
          return;
        } else if (ids.length === 1) {
          if (!confirm(`Are you sure to delete \"${ids[0][1].name}\"?`)) {
            return;
          }
        } else {
          if (!confirm(`Are you sure to delete ${ids.length} files?`)) {
            return;
          }
        }
        return this._deleteIds(ids);
      }

      _deleteIds(ids) {
        return indexedDB.open("SavedFields", VERSION).onsuccess = (e) => {
          var catalog, db, doDelete, files, idx, request;
          db = e.target.result;
          request = db.transaction(["catalog", "files"], "readwrite");
          catalog = request.objectStore("catalog");
          files = request.objectStore("files");
          idx = 0;
          doDelete = () => {
            var catalogKey, record, rq;
            [catalogKey, record] = ids[idx];
            return rq = catalog.delete(catalogKey).onsuccess = (e) => {
              return files.delete(record.field).onsuccess = (e) => {
                idx += 1;
                if (idx >= ids.length) {
                  return console.log("Deleted selected fiels");
                } else {
                  return doDelete();
                }
              };
            };
          };
          request.oncomplete = (e) => {
            return this._generateFileList();
          };
          return doDelete();
        };
      }

      loadFromCursor(cursor, predicate) {
        var closeFuncGroup, closeGridGroup, dom, filesEnumerated, lastFunc, lastGrid, onRecord, startFuncGroup, startGridGroup;
        dom = new DomBuilder();
        dom.tag('div').CLASS('toolbar').tag('span').CLASS('button-group').text('Select:').rtag('btnSelectAll', 'button').CLASS('button-small').text('All').end().text("/").rtag('btnSelectNone', 'button').CLASS('button-small').text('None').end().end().tag('span').CLASS('button-group').rtag('btnDeleteAll', 'button').CLASS('dangerous button-small').a('title', 'Delete selected files').text('Delete').end().end().end();
        dom.vars.btnDeleteAll.addEventListener('click', (e) => {
          return this.deleteSelected();
        });
        dom.vars.btnSelectNone.addEventListener('click', (e) => {
          return this.selectAll(false);
        });
        dom.vars.btnSelectAll.addEventListener('click', (e) => {
          return this.selectAll(true);
        });
        dom.tag("table").CLASS("files-table").tag("thead").tag("tr").tag("th").end().tag("th").text("Name").end().tag("th").text("Time").end().end().end().tag("tbody");
        startGridGroup = function (gridName) {
          return dom.tag("tr").CLASS("files-grid-row").tag("td").a('colspan', '3').text(`Grid: ${gridName}`).end().end();
        };
        closeGridGroup = function () { };
        startFuncGroup = function (funcType, funcId) {
          var MAX_LEN, cutPos, funcName, idxNewLine;
          if (funcType === "binary") {
            funcName = funcId;
          } else if (funcType === "custom") {
            MAX_LEN = 20;
            idxNewLine = funcId.indexOf('\n');
            if (idxNewLine === -1) {
              cutPos = MAX_LEN;
            } else {
              cutPos = Math.min(idxNewLine, MAX_LEN);
            }
            funcName = `custom: ${funcId.substr(0, cutPos)}...`;
          } else {
            funcName = funcType;
          }
          return dom.tag("tr").CLASS("files-func-row").tag("td").a('colspan', '3').text(`Rule: ${funcName}`).end().end();
        };
        closeFuncGroup = function () { };
        lastGrid = null;
        lastFunc = null;
        filesEnumerated = 0;
        onRecord = (res, record) => {
          var grid;
          grid = `{${record.gridN};${record.gridM}}`;
          if (grid !== lastGrid) {
            if (lastFunc !== null) {
              //loading next group
              //close the previous group
              closeFuncGroup();
            }
            if (lastGrid !== null) {
              closeGridGroup();
            }
            startGridGroup(grid);
            lastGrid = grid;
            lastFunc = null;
          }
          if (record.funcId !== lastFunc) {
            if (lastFunc !== null) {
              closeFuncGroup();
            }
            startFuncGroup(record.funcType, record.funcId);
            lastFunc = record.funcId;
          }
          dom.tag('tr').CLASS('files-file-row').tag('td').rtag('filesel', 'input').a('type', 'checkbox').end().end();
          if (this.fileCallback != null) {
            dom.tag('td').rtag('alink', 'a').a('href', `#load${record.name}`).text(res.value.name).end().end();
          } else {
            dom.tag('td').text(res.value.name).end();
          }
          dom.tag('td').text((new Date(res.value.time)).toLocaleString()).end().end();

          //dom.tag('div').CLASS("file-list-file").text(res.value.name).end()
          if (dom.vars.alink != null) {
            dom.vars.alink.addEventListener("click", ((key) => {
              return (e) => {
                e.preventDefault();
                return this.clickedFile(key);
              };
            })(record));
          }
          return this.recordId2Controls[res.primaryKey] = {
            check: dom.vars.filesel,
            record: record
          };
        };
        return cursor.onsuccess = (e) => {
          var record, res;
          res = e.target.result;
          if (res) {
            filesEnumerated += 1;
            record = res.value;
            if (predicate(record)) {
              onRecord(res, record);
            }
            return res.continue();
          } else {
            if (lastFunc !== null) {
              closeFuncGroup();
            }
            if (lastGrid !== null) {
              closeGridGroup();
            }
            this.container.innerHTML = "";
            this.container.appendChild(dom.finalize());
            console.log(`Enumerated ${filesEnumerated} files`);
            return this.readyCallback();
          }
        };
      }

      clickedFile(catalogRecord) {
        var filesStore, request, transaction;
        console.log(`Load key ${JSON.stringify(catalogRecord)}`);
        transaction = this.db.transaction(["files"], "readonly");
        filesStore = transaction.objectStore("files");
        request = filesStore.get(catalogRecord.field);
        request.onerror = function (e) {
          return console.log(`Failed to load file ${catalogRecord.field}`);
        };
        return request.onsuccess = (e) => {
          var res;
          res = e.target.result;
          return this.fileCallback(catalogRecord, res);
        };
      }

      loadData() {
        var cursor, filesStore, transaction;
        console.log("Loaddata");
        transaction = this.db.transaction(["catalog"], "readonly");
        filesStore = transaction.objectStore("catalog");
        cursor = filesStore.index("catalogByGrid").openCursor();
        return this.loadFromCursor(cursor, function (rec) {
          return true;
        });
      }

      loadDataFor(gridN, gridM, funcId) {
        var catalog, catalogIndex, cursor, transaction;
        transaction = this.db.transaction(["catalog"], "readonly");
        catalog = transaction.objectStore("catalog");
        catalogIndex = catalog.index("catalogByGrid");
        cursor = catalogIndex.openCursor();
        return this.loadFromCursor(cursor, function (rec) {
          return (rec.gridN === gridN) && (rec.gridM === gridM) && ((funcId === null) || (rec.funcId === funcId));
        });
      }

    };


    // addSampleFiles:  (onFinish) ->
    //   # Add few random riles.
    //   # Transaction commits, when the last onsuccess does not schedules any more requests.
    //   #
    //   transaction = @db.transaction(["files", "catalog"],"readwrite");
    //   filesStore = transaction.objectStore "files"
    //   catalogStore = transaction.objectStore "catalog"
    //   i = 0
    //   doAdd = =>
    //     fieldData = "|1"
    //     rqStoreData = filesStore.add fieldData
    //     rqStoreData.onerror = (e)=>
    //       console.log "Error storing data #{e.target.error}"
    //     rqStoreData.onsuccess = (e)=>
    //       #console.log "Stored data OK, key is #{e.target.result}"
    //       #console.dir e.target
    //       key = e.target.result
    //       #console.log "Store catalog record"
    //       catalogRecord =
    //         gridN: ((Math.random()*5)|0)+3
    //         gridM: ((Math.random()*5)|0)+3
    //         name: "File #{i+1}"
    //         funcId: "B 3 S 2 3"
    //         funcType: "binary"
    //         base: 'e'
    //         size: fieldData.length
    //         time: Date.now()
    //         offset: M.eye()
    //         field: key

    //       rqStoreCatalog = catalogStore.add catalogRecord
    //       rqStoreCatalog.onerror = (e)=>
    //         console.log "Error storing catalog record #{e.target.error}"
    //       rqStoreCatalog.onsuccess = (e)=>
    //         #console.log "catalog record stored OK"

    //         if i < 300
    //           #console.log "Adding next file"
    //           i += 1
    //           doAdd()
    //         else
    //           console.log "End generatign #{i} files"
    //           onFinish()
    //   #if not @populated
    //   #  console.log "Generating sample data"
    //   #  doAdd()
    //   #else
    //   #  onFinish()


  }, { "./dom_builder.coffee": 22, "./htmlutil.coffee": 24 }], 26: [function (require, module, exports) {
    var Debouncer, M, MouseTool, MouseToolCombo, getCanvasCursorPosition;

    M = require("../core/matrix3.coffee");

    ({ getCanvasCursorPosition } = require("./canvas_util.coffee"));

    ({ Debouncer } = require("./htmlutil.coffee"));

    exports.MouseTool = MouseTool = class MouseTool {
      constructor(application1) {
        this.application = application1;
      }

      mouseMoved() { }

      mouseUp() { }

      mouseDown() { }

      moveView(dx, dy) {
        return this.application.getObserver().modifyView(M.translationMatrix(dx, dy));
      }

      rotateView(angle) {
        return this.application.getObserver().modifyView(M.rotationMatrix(angle));
      }

    };

    exports.MouseToolCombo = MouseToolCombo = class MouseToolCombo extends MouseTool {
      constructor(application, x0, y0) {
        super(application);
        [this.x0, this.y0] = this.application.canvas2relative(x0, y0);
        this.angle0 = Math.atan2(this.x0, this.y0);
      }

      mouseMoved(e) {
        var canvas, dAngle, dx, dy, mv, newAngle, q, r2, rt, x, y;
        canvas = this.application.getCanvas();
        [x, y] = this.application.canvas2relative(...getCanvasCursorPosition(e, canvas));
        dx = x - this.x0;
        dy = y - this.y0;
        this.x0 = x;
        this.y0 = y;
        newAngle = Math.atan2(x, y);
        dAngle = newAngle - this.angle0;
        //Wrap angle increment into -PI ... PI diapason.
        if (dAngle > Math.PI) {
          dAngle = dAngle - Math.PI * 2;
        } else if (dAngle < -Math.PI) {
          dAngle = dAngle + Math.PI * 2;
        }
        this.angle0 = newAngle;

        //determine mixing ratio
        r2 = x ** 2 + y ** 2;
        //pure rotation at the edge,
        //pure pan at the center
        q = Math.min(1.0, r2 ** 1.5);
        mv = M.translationMatrix(dx * (1 - q), dy * (1 - q));
        rt = M.rotationMatrix(dAngle * q);
        return this.application.getObserver().modifyView(M.mul(M.mul(mv, rt), mv));
      }

    };

    /*    
    exports.MouseToolPan = class MouseToolPan extends MouseTool
      constructor: (application, @x0, @y0) ->
        super application
        @panEventDebouncer = new Debouncer 1000, =>
          @application.getObserver.rebaseView()
    
      mouseMoved: (e)->
        canvas = @application.getCanvas()
        [x, y] = getCanvasCursorPosition e, canvas
        dx = x - @x0
        dy = y - @y0
    
        @x0 = x
        @y0 = y
        k = 2.0 / canvas.height
        xc = (x - canvas.width*0.5)*k
        yc = (y - canvas.height*0.5)*k
    
        r2 = xc*xc + yc*yc
        s = 2 / Math.max(0.3, 1-r2)
    
        @moveView dx*k*s , dy*k*s
        @panEventDebouncer.fire()
    
    exports.MouseToolRotate = class MouseToolRotate extends MouseTool
      constructor: (application, x, y) ->
        super application
        canvas = @application.getCanvas()
        @xc = canvas.width * 0.5
        @yc = canvas.width * 0.5
        @angle0 = @angle x, y 
    
      angle: (x,y) -> Math.atan2( x-@xc, y-@yc)
    
      mouseMoved: (e)->
        canvas = @application.getCanvas()
        [x, y] = getCanvasCursorPosition e, canvas
        newAngle = @angle x, y
        dAngle = newAngle - @angle0
        @angle0 = newAngle
        @rotateView dAngle
    
    */


  }, { "../core/matrix3.coffee": 8, "./canvas_util.coffee": 21, "./htmlutil.coffee": 24 }], 27: [function (require, module, exports) {
    //search for cell  clusters and navigate through them
    var DomBuilder, E, Navigator, allClusters;

    ({ allClusters } = require("../core/field.coffee"));

    ({ DomBuilder } = require("./dom_builder.coffee"));

    ({ E } = require("./htmlutil.coffee"));

    exports.Navigator = Navigator = class Navigator {
      constructor(application, navigatorElemId = "navigator-cluster-list", btnClearId = "btn-nav-clear") {
        this.application = application;
        this.clustersElem = E(navigatorElemId);
        this.btnClear = E(btnClearId);
        this.clusters = [];
        this.btnClear.style.display = 'none';
      }

      search(field) {
        //field is ChainMap
        this.clusters = allClusters(field, this.application.tiling);
        this.sortByDistance();
        this.updateClusterList();
        this.btnClear.style.display = this.clusters ? '' : 'none';
        return this.clusters.length;
      }

      sortByDistance() {
        return this.clusters.sort(function (a, b) {
          var d;
          d = b[0].len() - a[0].len();
          if (d !== 0) {
            return d;
          }
          d = b.length - a.length;
          return d;
        });
      }

      sortBySize() {
        return this.clusters.sort(function (a, b) {
          var d;
          d = b.length - a.length;
          if (d !== 0) {
            return d;
          }
          d = b[0].len() - a[0].len();
          return d;
        });
      }

      makeNavigateTo(chain) {
        return (e) => {
          var observer;
          e.preventDefault();
          //console.log JSON.stringify chain
          observer = this.application.getObserver();
          if (observer != null) {
            observer.navigateTo(chain);
          }
        };
      }

      navigateToResult(index) {
        var observer;
        observer = this.application.getObserver();
        if (observer != null) {
          return observer.navigateTo(this.clusters[index][0]);
        }
      }

      clear() {
        this.clusters = [];
        this.clustersElem.innerHTML = "";
        return this.btnClear.style.display = 'none';
      }

      updateClusterList() {
        var cluster, dist, dom, i, idx, len, listener, ref, size;
        dom = new DomBuilder();
        dom.tag("table").tag("thead").tag('tr').tag('th').rtag('ssort').a("href", "#sort-size").text('Cells').end().end().tag('th').rtag('dsort').a("href", "#sort-dist").text('Distance').end().end().end().end();
        dom.vars.ssort.addEventListener('click', (e) => {
          e.preventDefault();
          this.sortBySize();
          return this.updateClusterList();
        });
        dom.vars.dsort.addEventListener('click', (e) => {
          e.preventDefault();
          this.sortByDistance();
          return this.updateClusterList();
        });
        dom.tag("tbody");
        ref = this.clusters;
        for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
          cluster = ref[idx];
          size = cluster.length;
          dist = cluster[0].len();
          dom.tag("tr").tag("td").rtag("navtag", "a").a("href", `#nav-cluster${idx}`).text(`${size}`).end().end().tag('td').rtag("navtag1", "a").a("href", `#nav-cluster${idx}`).text(`${dist}`).end().end().end();
          listener = this.makeNavigateTo(cluster[0]);
          dom.vars.navtag.addEventListener("click", listener);
          dom.vars.navtag1.addEventListener("click", listener);
        }
        dom.end();
        this.clustersElem.innerHTML = "";
        return this.clustersElem.appendChild(dom.finalize());
      }

    };


  }, { "../core/field.coffee": 5, "./dom_builder.coffee": 22, "./htmlutil.coffee": 24 }], 28: [function (require, module, exports) {
    "use strict";
    var FieldObserver, M, hyperbolic2poincare, makeCellShapePoincare, makeXYT2path, poincare2hyperblic, unity, visibleNeighborhood;

    ({ unity } = require("../core/vondyck_chain.coffee"));

    ({ makeXYT2path, poincare2hyperblic, hyperbolic2poincare, visibleNeighborhood, makeCellShapePoincare } = require("../core/poincare_view.coffee"));

    //{eliminateFinalA} = require "../core/vondyck_rewriter.coffee"
    M = require("../core/matrix3.coffee");

    exports.FieldObserver = FieldObserver = class FieldObserver {
      constructor(tiling, minCellSize = 1.0 / 400.0, center = unity, tfm = M.eye()) {
        var c, cells;
        this.tiling = tiling;
        this.minCellSize = minCellSize;
        this.tfm = tfm;
        this.cells = null;
        this.center = null;
        cells = visibleNeighborhood(this.tiling, this.minCellSize);
        this.cellOffsets = (function () {
          var j, len, results;
          results = [];
          for (j = 0, len = cells.length; j < len; j++) {
            c = cells[j];
            results.push(c.asStack());
          }
          return results;
        })();
        this.isDrawingHomePtr = true;
        this.isDrawingLiveBorders = true;
        this.colorHomePtr = 'rgba(255,100,100,0.7)';
        this.colorEmptyBorder = 'rgb(128,128,128)';
        this.colorLiveBorder = 'rgb(192,192,192)';
        if (center !== unity) {
          this.rebuildAt(center);
        } else {
          this.cells = cells;
          this.center = center;
        }
        this.cellTransforms = (function () {
          var j, len, results;
          results = [];
          for (j = 0, len = cells.length; j < len; j++) {
            c = cells[j];
            results.push(this.tiling.repr(c));
          }
          return results;
        }).call(this);
        this.drawEmpty = true;
        this.jumpLimit = 1.5;
        this.viewUpdates = 0;
        //precision falls from 1e-16 to 1e-9 in 1000 steps.
        this.maxViewUpdatesBeforeCleanup = 50;
        this.xyt2path = makeXYT2path(this.tiling);
        this.pattern = ["red", "black", "green", "blue", "yellow", "cyan", "magenta", "gray", "orange"];
        this.onFinish = null;
      }

      getHomePtrPos() {
        var invT, j, letter, p, stack, xyt;
        xyt = [0.0, 0.0, 1.0];
        //@mtx = M.mul @t.repr(generatorMatrices), generatorMatrices.generatorPower(@letter, @p)
        // xyt = genPow(head.letter, -head.p) * ... * xyt0

        // reference formula.
        //     #xyt = M.mulv M.hyperbolicInv(@center.repr(@tiling)), xyt
        // it works, but matrix values can become too large.

        stack = this.center.asStack();
        //apply inverse transformations in reverse order
        for (j = stack.length - 1; j >= 0; j += -1) {
          [letter, p] = stack[j];
          xyt = M.mulv(this.tiling.representation.generatorPower(letter, -p), xyt);
          //Denormalize coordinates to avoid extremely large values.
          invT = 1.0 / xyt[2];
          xyt[0] *= invT;
          xyt[1] *= invT;
          xyt[2] = 1.0;
        }
        //Finally add view transform
        xyt = M.mulv(this.tfm, xyt);
        //(denormalizetion not required, view transform is not large)
        // And map to poincare circle
        return hyperbolic2poincare(xyt); //get distance too
      }

      getColorForState(state) {
        return this.pattern[(state % this.pattern.length + this.pattern.length) % this.pattern.length];
      }

      getViewCenter() {
        return this.center;
      }

      getViewOffsetMatrix() {
        return this.tfm;
      }

      setViewOffsetMatrix(m) {
        this.tfm = m;
        return this.renderGrid(this.tfm);
      }

      rebuildAt(newCenter) {
        var offset;
        this.center = newCenter;
        this.cells = (function () {
          var j, len, ref, results;
          ref = this.cellOffsets;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            offset = ref[j];
            //it is important to make copy since AR empties the array!
            results.push(this.tiling.toCell(this.tiling.appendRewrite(newCenter, offset.slice(0))));
          }
          return results;
        }).call(this);
        this._observedCellsChanged();
      }

      navigateTo(chain, offsetMatrix = M.eye()) {
        console.log(`navigated to ${chain}`);
        this.rebuildAt(chain);
        this.tfm = offsetMatrix;
        this.renderGrid(this.tfm);
      }

      _observedCellsChanged() { }

      translateBy(appendArray) {
        //console.log  "New center at #{ newCenter}"
        return this.rebuildAt(this.tiling.appendRewrite(this.center, appendArray));
      }

      canDraw() {
        return true;
      }

      draw(cells, context, scale) {
        var cell, cellIndex, cellIndices, cellTfm, i, j, k, len, len1, mtx, ref, ref1, state, state2cellIndexList, stateCells, strState;
        context.scale(scale, scale);
        context.lineWidth = 1.0 / scale;

        //first borders
        //cells grouped by state
        state2cellIndexList = {};
        ref = this.cells;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          cell = ref[i];
          state = (ref1 = cells.get(cell)) != null ? ref1 : 0;
          if ((state !== 0) || this.drawEmpty) {
            stateCells = state2cellIndexList[state];
            if (stateCells == null) {
              state2cellIndexList[state] = stateCells = [];
            }
            stateCells.push(i);
          }
        }
        for (strState in state2cellIndexList) {
          cellIndices = state2cellIndexList[strState];
          state = parseInt(strState, 10);
          //console.log "Group: #{state}, #{JSON.stringify cellIndices}"
          context.beginPath();
          for (k = 0, len1 = cellIndices.length; k < len1; k++) {
            cellIndex = cellIndices[k];
            cellTfm = this.cellTransforms[cellIndex];
            mtx = M.mul(this.tfm, cellTfm);
            makeCellShapePoincare(this.tiling, mtx, context);
          }
          if (state === 0) {
            context.strokeStyle = this.colorEmptyBorder;
            context.stroke();
          } else {
            context.fillStyle = this.getColorForState(state);
            context.fill();
            if (this.isDrawingLiveBorders) {
              context.strokeStyle = this.colorLiveBorder;
              context.stroke();
            }
          }
        }
        if (this.isDrawingHomePtr) {
          this.drawHomePointer(context);
        }
        //true because immediate-mode observer always finishes drawing.
        return true;
      }

      drawHomePointer(context, size) {
        var angle, d, x, y;
        size = 0.06;
        [x, y, d] = this.getHomePtrPos();
        angle = Math.PI - Math.atan2(x, y);
        context.save();
        context.translate(x, y);
        context.scale(size, size);
        context.rotate(angle);
        context.fillStyle = this.colorHomePtr;
        context.beginPath();
        context.moveTo(0, 0);
        context.bezierCurveTo(0.4, -0.8, 1, -1, 1, -2);
        context.bezierCurveTo(1, -2.6, 0.6, -3, 0, -3);
        context.bezierCurveTo(-0.6, -3, -1, -2.6, -1, -2);
        context.bezierCurveTo(-1, -1, -0.4, -0.8, 0, 0);
        context.closePath();
        context.fill();

        // context.translate 0, -1

        // context.rotate -angle    
        // context.translate 0, -1
        // context.font = "12px sans"

        // context.fillStyle = 'rgba(255,100,100,1.0)'
        // context.textAlign = "center"
        // context.scale 0.09, 0.09
        // context.fillText("#{Math.round(d*10)/10}", 0, 0);
        return context.restore();
      }

      visibleCells(cells) {
        var cell, j, len, ref, results, value;
        ref = this.cells;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          cell = ref[j];
          if ((value = cells.get(cell)) !== null) {
            results.push([cell, value]);
          }
        }
        return results;
      }

      checkViewMatrix() {
        //me = [-1,0,0,  0,-1,0, 0,0,-1]
        //d = M.add( me, M.mul(@tfm, M.hyperbolicInv @tfm))
        //ad = (Math.abs(x) for x in d)
        //maxDiff = Math.max( ad ... )
        //console.log "Step: #{@viewUpdates}, R: #{maxDiff}"
        if ((this.viewUpdates += 1) > this.maxViewUpdatesBeforeCleanup) {
          this.viewUpdates = 0;
          return this.tfm = M.cleanupHyperbolicMoveMatrix(this.tfm);
        }
      }

      //console.log "cleanup"
      modifyView(m) {
        var originDistance;
        this.tfm = M.mul(m, this.tfm);
        this.checkViewMatrix();
        originDistance = this.viewDistanceToOrigin();
        if (originDistance > this.jumpLimit) {
          return this.rebaseView();
        } else {
          return this.renderGrid(this.tfm);
        }
      }

      renderGrid(viewMatrix) {
        return typeof this.onFinish === "function" ? this.onFinish() : void 0;
      }

      viewDistanceToOrigin() {
        //viewCenter = M.mulv tfm, [0.0,0.0,1.0]
        //Math.acosh(viewCenter[2])
        return Math.acosh(this.tfm[8]);
      }


      //build new view around the cell which is currently at the center
      rebaseView() {
        var centerCoord, m, pathToCenterCell;
        centerCoord = M.mulv(M.hyperbolicInv(this.tfm), [0.0, 0.0, 1.0]);
        centerCoord[0] *= 1.9;
        centerCoord[1] *= 1.9;
        centerCoord[2] = Math.sqrt(1.0 + centerCoord[0] ** 2 + centerCoord[1] ** 2);
        pathToCenterCell = this.xyt2path(centerCoord);
        if (pathToCenterCell === unity) {
          return;
        }
        //console.log "Jump by #{pathToCenterCell}"
        m = pathToCenterCell.repr(this.tiling);
        //modifyView won't work, since it multiplies in different order.
        this.tfm = M.mul(this.tfm, m);
        this.checkViewMatrix();
        //console.log JSON.stringify @tfm
        //move observation point
        this.translateBy(pathToCenterCell.asStack());
        return this.renderGrid(this.tfm);
      }

      straightenView() {
        var additionalAngle, angle, angleOffsets, bestDifference, bestRotationMtx, dAngle, difference, distanceToEye, i, j, k, len, minusEye, originalTfm, ref, rotMtx;
        this.rebaseView();
        originalTfm = this.getViewOffsetMatrix();
        dAngle = Math.PI / this.tiling.n;
        minusEye = M.smul(-1, M.eye());
        distanceToEye = function (m) {
          var d, di;
          d = M.add(m, minusEye);
          return Math.max(...((function () {
            var j, len, results;
            results = [];
            for (j = 0, len = d.length; j < len; j++) {
              di = d[j];
              results.push(Math.abs(di));
            }
            return results;
          })()));
        };
        bestRotationMtx = null;
        bestDifference = null;
        angleOffsets = [0.0];
        if (this.tiling.n % 2 === 1) {
          angleOffsets.push(Math.PI / 2);
        }
        for (j = 0, len = angleOffsets.length; j < len; j++) {
          additionalAngle = angleOffsets[j];
          for (i = k = 0, ref = 2 * this.tiling.n; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
            angle = dAngle * i + additionalAngle;
            rotMtx = M.rotationMatrix(angle);
            difference = distanceToEye(M.mul(originalTfm, M.hyperbolicInv(rotMtx)));
            if ((bestDifference === null) || (bestDifference > difference)) {
              bestDifference = difference;
              bestRotationMtx = rotMtx;
            }
          }
        }
        return this.setViewOffsetMatrix(bestRotationMtx);
      }


      //xp, yp in range [-1..1]
      cellFromPoint(xp, yp) {
        var visibleCell, xyt;
        xyt = poincare2hyperblic(xp, yp);
        if (xyt === null) {
          throw new Error("point outside");
        }
        //inverse transform it...
        xyt = M.mulv(M.inv(this.tfm), xyt);
        visibleCell = this.xyt2path(xyt);
        return this.tiling.toCell(this.tiling.appendRewrite(this.center, visibleCell.asStack()));
      }

      shutdown() { } //nothing to do.

    };


  }, { "../core/matrix3.coffee": 8, "../core/poincare_view.coffee": 9, "../core/vondyck_chain.coffee": 15 }], 29: [function (require, module, exports) {
    // parseUri 1.2.2
    // (c) Steven Levithan <stevenlevithan.com>
    // MIT License
    var parseUri;

    exports.parseUri = parseUri = function (str) {
      var i, k, m, o, ref, uri, v;
      o = parseUri.options;
      m = o.parser[(o.strictMode ? "strict" : "loose")].exec(str);
      uri = {};
      i = 14;
      while (i--) {
        uri[o.key[i]] = m[i] || "";
      }
      uri[o.q.name] = {};
      uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) {
          return uri[o.q.name][$1] = $2;
        }
      });
      ref = uri.queryKey;
      for (k in ref) {
        v = ref[k];
        uri.queryKey[k] = decodeURIComponent(v);
      }
      return uri;
    };

    parseUri.options = {
      strictMode: false,
      key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
      q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
      },
      parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
      }
    };


  }, {}]
}, {}, [20]);