// Generated by CoffeeScript 2.7.0
(function() {
  var ChainMap, RegularTiling, allClusters, assert, evaluateTotalisticAutomaton, exportField, importField, neighborsSum, parseFieldData, randomStateGenerator, stringifyFieldData;

  assert = require("assert");

  ({allClusters, exportField, importField, parseFieldData, randomStateGenerator, stringifyFieldData} = require("../src/core/field.coffee"));

  ({ChainMap} = require("../src/core/chain_map.coffee"));

  ({RegularTiling} = require("../src/core/regular_tiling.coffee"));

  ({neighborsSum, evaluateTotalisticAutomaton} = require("../src/core/cellular_automata.coffee"));

  describe("evaluateTotalisticAutomaton", function() {
    it("must persist single cell in rule B 3 S 0 2 3", function() {
      var M, N, field, field1, ruleNext, tiling, unity;
      ruleNext = function(x, s) {
        if (x === 0) {
          if (s === 3) {
            return 1;
          } else {
            return 0;
          }
        } else if (x === 1) {
          if (s === 0 || s === 2 || s === 3) {
            return 1;
          } else {
            return 0;
          }
        }
      };
      [N, M] = [7, 3];
      tiling = new RegularTiling(N, M);
      unity = tiling.unity;
      
      //prepare field with only one cell
      field = new ChainMap();
      field.put(unity, 1);
      field1 = evaluateTotalisticAutomaton(field, tiling, ruleNext);
      //now check the field
      assert.equal(field1.count, 1);
      return assert.equal(field1.get(unity), 1);
    });
    return it("must NOT persist single cell in rule B 3 S 2 3", function() {
      var M, N, field, field1, ruleNext, tiling;
      ruleNext = function(x, s) {
        if (x === 0) {
          if (s === 3) {
            return 1;
          } else {
            return 0;
          }
        } else if (x === 1) {
          if (s === 2 || s === 3) {
            return 1;
          } else {
            return 0;
          }
        } else {
          throw new Error(`bad state ${x}`);
        }
      };
      [N, M] = [7, 3];
      tiling = new RegularTiling(N, M);
      
      //prepare field with only one cell
      field = new ChainMap();
      field.put(tiling.unity, 1);
      field1 = evaluateTotalisticAutomaton(field, tiling, ruleNext);
      //now check the field
      assert.equal(field1.count, 0);
      return assert.equal(field1.get(tiling.unity), null);
    });
  });

}).call(this);
