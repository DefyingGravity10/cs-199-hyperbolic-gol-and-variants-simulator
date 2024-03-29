// Generated by CoffeeScript 2.7.0
(function () {
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
        return (this.timerHandle = null);
      };
      this._onTouch = () => {
        return this.onTouch();
      };
    }

    onTouch() {
      this.stopTimer();
      this.isGhost = true;
      return (this.timerHandle = window.setTimeout(this._onTimer, this.ghostInterval));
    }

    stopTimer() {
      var handle;
      if ((handle = this.timerHandle)) {
        window.clearTimeout(handle);
        return (this.timerHandle = null);
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
}).call(this);
