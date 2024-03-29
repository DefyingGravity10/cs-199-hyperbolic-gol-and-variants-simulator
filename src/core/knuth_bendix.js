// Generated by CoffeeScript 2.7.0
(function () {
  //Based on http://www.math.rwth-aachen.de/~Gerhard.Hiss/Students/DiplomarbeitPfeiffer.pdf
  //algorithm 3, 4
  //import itertools

  //values are encoded as simple strings.
  // User is responsible
  var RewriteRuleset,
    findOverlap,
    knuthBendixCompletion,
    le2cmp,
    overlap,
    print,
    shortLex,
    simplifyRules,
    sortPairReverse,
    splitBy;

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
      return (this.rules[v] = w);
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
    for (
      i = j = ref = istart, ref1 = s1.length;
      ref <= ref1 ? j < ref1 : j > ref1;
      i = ref <= ref1 ? ++j : --j
    ) {
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
    for (
      i = j = 0, ref = s1.length - s2.length + 1;
      0 <= ref ? j < ref : j > ref;
      i = 0 <= ref ? ++j : --j
    ) {
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
    if (y) {
      //if there is nonempty overlap
      return [true, x + w2, w1 + z];
    }
    [hasSplit, x, z] = splitBy(v1, v2);
    if (hasSplit) {
      // and x.length>0 and z.length>0
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

  exports.knuthBendix = function (
    S0,
    lessOrEqual = shortLex,
    maxIters = 1000,
    maxRulesetSize = 1000,
    onIteration = null
  ) {
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
    for (i = j = 0, ref = maxIters; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
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
}).call(this);
