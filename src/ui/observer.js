// Generated by CoffeeScript 2.7.0
(function () {
  "use strict";
  var FieldObserver,
    M,
    hyperbolic2poincare,
    makeCellShapePoincare,
    makeXYT2path,
    poincare2hyperblic,
    unity,
    visibleNeighborhood;

  ({ unity } = require("../core/vondyck_chain.js"));

  ({
    makeXYT2path,
    poincare2hyperblic,
    hyperbolic2poincare,
    visibleNeighborhood,
    makeCellShapePoincare
  } = require("../core/poincare_view.js"));

  //{eliminateFinalA} = require "../core/vondyck_rewriter.js"
  M = require("../core/matrix3.js");

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
      this.colorHomePtr = "rgba(255,100,100,0.7)";
      this.colorEmptyBorder = "rgb(128,128,128)";
      this.colorLiveBorder = "rgb(192,192,192)";
      if (center !== unity) {
        this.rebuildAt(center);
      } else {
        this.cells = cells;
        this.center = center;
      }
      this.cellTransforms = function () {
        var j, len, results;
        results = [];
        for (j = 0, len = cells.length; j < len; j++) {
          c = cells[j];
          results.push(this.tiling.repr(c));
        }
        return results;
      }.call(this);
      this.drawEmpty = true;
      this.jumpLimit = 1.5;
      this.viewUpdates = 0;
      //precision falls from 1e-16 to 1e-9 in 1000 steps.
      this.maxViewUpdatesBeforeCleanup = 50;
      this.xyt2path = makeXYT2path(this.tiling);
      this.pattern = [
        "red",
        "black",
        "green",
        "blue",
        "yellow",
        "cyan",
        "magenta",
        "gray",
        "orange",
        "purple"
      ];
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
      return this.pattern[
        ((state % this.pattern.length) + this.pattern.length) % this.pattern.length
      ];
    }

    revertToOriginalStates() {
      return (this.pattern = [
        "red",
        "black",
        "green",
        "blue",
        "yellow",
        "cyan",
        "magenta",
        "gray",
        "orange",
        "purple"
      ]);
    }
    changeToImmigration() {
      // a function used to change to immigrant. will be renamed in the future
      return (this.pattern = ["red", "blue"]);
    }

    changeToRainbow() {
      return (this.pattern = [
        "#000000",
        "#ffffff",
        "#eef2f0",
        "#dcdcdc",
        "#afafaf",
        "#898989",
        "#636363",
        "#49484c",
        "#383838",
        "#242424"
      ]);
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
      this.cells = function () {
        var j, len, ref, results;
        ref = this.cellOffsets;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          offset = ref[j];
          //it is important to make copy since AR empties the array!
          results.push(this.tiling.toCell(this.tiling.appendRewrite(newCenter, offset.slice(0))));
        }
        return results;
      }.call(this);
      this._observedCellsChanged();
    }

    navigateTo(chain, offsetMatrix = M.eye()) {
      console.log(`navigated to ${chain}`);
      this.rebuildAt(chain);
      this.tfm = offsetMatrix;
      this.renderGrid(this.tfm);
    }

    _observedCellsChanged() {}

    translateBy(appendArray) {
      //console.log  "New center at #{ newCenter}"
      return this.rebuildAt(this.tiling.appendRewrite(this.center, appendArray));
    }

    canDraw() {
      return true;
    }

    draw(cells, context, scale) {
      var cell,
        cellIndex,
        cellIndices,
        cellTfm,
        i,
        j,
        k,
        len,
        len1,
        mtx,
        ref,
        ref1,
        state,
        state2cellIndexList,
        stateCells,
        strState;
      context.scale(scale, scale);
      context.lineWidth = 1.0 / scale;

      //first borders
      //cells grouped by state
      state2cellIndexList = {};
      ref = this.cells;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        cell = ref[i];
        state = (ref1 = cells.get(cell)) != null ? ref1 : 0;
        if (state !== 0 || this.drawEmpty) {
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
          // This can be used to obtain the colors of the cells
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
        return (this.tfm = M.cleanupHyperbolicMoveMatrix(this.tfm));
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
      var additionalAngle,
        angle,
        angleOffsets,
        bestDifference,
        bestRotationMtx,
        dAngle,
        difference,
        distanceToEye,
        i,
        j,
        k,
        len,
        minusEye,
        originalTfm,
        ref,
        rotMtx;
      this.rebaseView();
      originalTfm = this.getViewOffsetMatrix();
      dAngle = Math.PI / this.tiling.n;
      minusEye = M.smul(-1, M.eye());
      distanceToEye = function (m) {
        var d, di;
        d = M.add(m, minusEye);
        return Math.max(
          ...(function () {
            var j, len, results;
            results = [];
            for (j = 0, len = d.length; j < len; j++) {
              di = d[j];
              results.push(Math.abs(di));
            }
            return results;
          })()
        );
      };
      bestRotationMtx = null;
      bestDifference = null;
      angleOffsets = [0.0];
      if (this.tiling.n % 2 === 1) {
        angleOffsets.push(Math.PI / 2);
      }
      for (j = 0, len = angleOffsets.length; j < len; j++) {
        additionalAngle = angleOffsets[j];
        for (
          i = k = 0, ref = 2 * this.tiling.n;
          0 <= ref ? k < ref : k > ref;
          i = 0 <= ref ? ++k : --k
        ) {
          angle = dAngle * i + additionalAngle;
          rotMtx = M.rotationMatrix(angle);
          difference = distanceToEye(M.mul(originalTfm, M.hyperbolicInv(rotMtx)));
          if (bestDifference === null || bestDifference > difference) {
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

    shutdown() {} //nothing to do.
  };
}).call(this);
