// Generated by CoffeeScript 2.7.0
(function() {
  var CenteredVonDyck, M, mod;

  M = require("./matrix3.js");

  ({mod} = require("./utils.js"));

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
      ({cos, sin, sqrt, PI} = Math);
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

}).call(this);
