// Generated by CoffeeScript 2.7.0
(function () {
  "use strict";
  var ChainMap, M, RegularTiling, VonDyck, eliminateFinalA, reverseShortlexLess, takeLastA, unity;

  ({ VonDyck } = require("./vondyck.js"));

  ({ ChainMap } = require("./chain_map.js"));

  ({ unity, reverseShortlexLess } = require("./vondyck_chain.js"));

  M = require("./matrix3.js");

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
          nStep = powerA
            ? [
                ["b", powerB],
                ["a", powerA]
              ]
            : [["b", powerB]];
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
      var cell,
        cells,
        j,
        k,
        l,
        len,
        len1,
        len2,
        neighCell,
        newLayer,
        prevLayer,
        radius,
        ref,
        thisLayer;
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
        for (i = j = 0, ref = this.n; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          results.push(M.mulv(this.representation.aPower(i), this.representation.centerB));
        }
        return results;
      } else {
        //dead code actually, but interesting for experiments
        results1 = [];
        for (
          i2 = k = 0, ref1 = this.n * 2;
          0 <= ref1 ? k < ref1 : k > ref1;
          i2 = 0 <= ref1 ? ++k : --k
        ) {
          i = (i2 / 2) | 0;
          if (i2 % 2 === 0) {
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
    if (chain === unity || chain.letter !== "a") {
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
    for (i = j = 1, ref = orderA; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
      chain_i = appendRewrite(chain, [["a", i]]);
      if (reverseShortlexLess(chain_i, bestChain)) {
        bestChain = chain_i;
      }
    }
    //console.log "EliminateA: got #{chain}, produced #{bestChain}"
    return bestChain;
  };
}).call(this);
