// Generated by CoffeeScript 2.7.0
(function () {
  var ChainMap, evaluateTotalisticAutomaton, neighborsSum;

  ({ ChainMap } = require("./chain_map.js"));

  exports.neighborsSum = neighborsSum = function (
    cells,
    tiling,
    plus = function (x, y) {
      if (y > 0) {
        return x + y / y;
      } else {
        return x + y;
      }
    },
    plusInitial = 0
  ) {
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

  exports.evaluateTotalisticAutomaton = evaluateTotalisticAutomaton = function (
    cells,
    tiling,
    nextStateFunc,
    plus,
    plusInitial
  ) {
    var newCells, sums;
    newCells = new ChainMap();
    sums = neighborsSum(cells, tiling, plus, plusInitial);
    sums.forItems(function (cell, neighSum) {
      console.log(`cell ${cell}  neighSum ${neighSum}`);
      var cellState, nextState, ref;
      cellState = (ref = cells.get(cell)) != null ? ref : 0;
      console.log(`cellState: ${cellState}`);
      if (cellState >= 1) {
        // Note that each state is represented by a number.
        // Thus the computation for the next state can be affected.
        // So we also make it equivalent to 1.
        // Doing it inside the plus function does not work for some reason
        cellState = cellState / cellState;
      }
      nextState = nextStateFunc(cellState, neighSum);
      if (nextState !== 0) {
        return newCells.put(cell, nextState);
      }
    });
    return newCells;
  };
}).call(this);
