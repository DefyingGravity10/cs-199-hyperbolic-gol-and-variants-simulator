// Generated by CoffeeScript 2.7.0
(function () {
  // Generates JS code that effectively rewrites
  var RewriteRuleset, groupPowersVd, main, makeAppendRewrite, testRewriter, unity;

  ({ RewriteRuleset } = require("./knuth_bendix.js"));

  ({ unity } = require("./vondyck_chain.js"));

  ({ makeAppendRewrite, groupPowersVd } = require("./vondyck_rewriter.js"));

  testRewriter = function (appendRewrite, sSource, sExpected) {
    var expected, gExpected, gSource, result, reversed;
    gSource = groupPowersVd(sSource);
    gExpected = groupPowersVd(sExpected);
    reversed = function (s) {
      var rs;
      rs = s.slice(0);
      rs.reverse();
      return rs;
    };
    result = appendRewrite(unity, reversed(gSource));
    expected = unity.appendStack(reversed(gExpected));
    if (result.equals(expected)) {
      return console.log(`Test ${sSource}->${sExpected} passed`);
    } else {
      console.log(`Test ${sSource}->${sExpected} failed`);
      console.log("   expected result:" + expected);
      return console.log("   received result:" + result);
    }
  };

  main = function () {
    var appendRewrite, i, len, ref, s, t, table;
    table = {
      ba: "AB",
      bB: "",
      BAB: "a",
      BBB: "b",
      Bb: "",
      aBB: "BAb",
      ABA: "b",
      AAA: "a",
      Aa: "",
      bAA: "ABa",
      ab: "BA",
      aBA: "AAb",
      bAB: "BBa",
      bb: "BB",
      aA: "",
      aa: "AA"
    };
    s = new RewriteRuleset(table);
    appendRewrite = makeAppendRewrite(s);
    ref = s.items();
    for (i = 0, len = ref.length; i < len; i++) {
      [s, t] = ref[i];
      testRewriter(appendRewrite, s, t);
    }
  };

  main();
}).call(this);
