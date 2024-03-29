// Generated by CoffeeScript 2.7.0
(function () {
  //Hash map that uses chain as key
  var ChainMap;

  exports.ChainMap = ChainMap = class ChainMap {
    constructor(initialSize = 16) {
      var i;
      //table size MUST be power of 2! Or else write your own implementation of % that works with negative hashes.
      if (initialSize & (initialSize - 1 !== 0)) {
        //this trick works!
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
      // Value is equivalent to the state (number)
      var cell, j, key_value, len;
      cell = this.table[this._index(chain)];
      for (j = 0, len = cell.length; j < len; j++) {
        key_value = cell[j];
        if (key_value[0].equals(chain)) {
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
      copied.table = function () {
        var j, len, ref, results;
        ref = this.table;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          cell = ref[j];
          results.push(
            (function () {
              var k, len1, results1;
              results1 = [];
              for (k = 0, len1 = cell.length; k < len1; k++) {
                key_value = cell[k];
                results1.push(key_value.slice(0));
              }
              return results1;
            })()
          );
        }
        return results;
      }.call(this);
      return copied;
    }
  };
}).call(this);
