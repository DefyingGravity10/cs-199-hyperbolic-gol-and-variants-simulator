// Generated by CoffeeScript 2.7.0
(function () {
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
  var DomBuilder,
    E,
    GenerateFileList,
    OpenDialog,
    SaveDialog,
    VERSION,
    addClass,
    ref,
    ref1,
    ref2,
    ref3,
    ref4,
    ref5,
    ref6,
    ref7,
    removeClass,
    upgradeNeeded;

  ({ E, removeClass, addClass } = require("./htmlutil.js"));

  ({ DomBuilder } = require("./dom_builder.js"));

  M = require("../core/matrix3.js");

  VERSION = 1;

  //Using info from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

  window.indexedDB =
    (ref =
      (ref1 = (ref2 = window.indexedDB) != null ? ref2 : window.mozIndexedDB) != null
        ? ref1
        : window.webkitIndexedDB) != null
      ? ref
      : window.msIndexedDB;

  // This line should only be needed if it is needed to support the object's constants for older browsers
  window.IDBTransaction =
    (ref3 =
      (ref4 = (ref5 = window.IDBTransaction) != null ? ref5 : window.webkitIDBTransaction) != null
        ? ref4
        : window.msIDBTransaction) != null
      ? ref3
      : {
          READ_WRITE: "readwrite"
        };

  window.IDBKeyRange =
    (ref6 = (ref7 = window.IDBKeyRange) != null ? ref7 : window.webkitIDBKeyRange) != null
      ? ref6
      : window.msIDBKeyRange;

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
    catalogStore.createIndex(
      "catalogByGrid",
      [
        "gridN",
        "gridM",
        "funcId",
        "name",
        "time",
        "coloredVariant",
        "updatePolicy",
        "ruleSelectionVariant"
      ],
      {
        unique: false
      }
    );

    // Add all the presets into the database
    let request;
    request = window.indexedDB.open("SavedFields", VERSION);
    request.onupgradeneeded = upgradeNeeded;
    request.onerror = (e) => {
      return console.log(`DB error: ${e.target.errorCode}`);
    };
    // Create a data structure with all the field data and the record catalog
    // Then go through the entire thing

    return (request.onsuccess = function (e) {
      let db, rqStoreData, transaction;
      db = e.target.result;
      transaction = db.transaction(["files", "catalog"], "readwrite");

      // Preset data
      let fieldData = [
        "|1(A2(B2|1))(B2|1)(a(B|1))(A(B2|1))",
        "|1(A2(B2|1))(A3(B2|1))(a(B|1))(A(B2|1))",
        "|1(A2(B2|1))(A3(B2|1))(a2(B|1))(A(B2|1))",
        "|1(A2(B|1))(b|1)(a2(B|1))(a(B|1))(B|1)",
        "|1(A2(B|1))(b|1)(A3(B|1))(a2(B|1))(a(B|1))(B|1)",
        "|1(A2(B|1))(b|1)(A3(B|1))(a3(B|1))(a2(B|1))(a(B|1))(B|1)",
        "(A2(B2|1)(b2|1)(B(a(B|1))))(B(A2(B|1))(a(B|1)))(b2|1)(A(b2|1)(B2|1))(b(A(b|1)))(a(B(a(B|1)))(B2|1))(B2|1)",
        "(A2(B2|1)(b2|1)(B(a(B|1))))(B(A2(B|1))(a(B|1)))(b2|1)(A(b2|1)(B2|1))(b(A(b|1)))(a(B(a(B|1)))(B2|1))(B2|1)",
        "(A2(B2|1)(b2|1)(B(a(B|1))))(B(A2(B|1))(a(B|1)))(b2|1)(A(b2|1)(B2|1))(b(A(b|1)))(a(B(a(B|1)))(B2|1))(B2|1)",
        "(A2(B2|1)(b2|1)(B(a(B|1))))(B(A2(B|1))(a(B|1)))(b2|1)(A(b2|1)(B2|1))(b(A(b|1)))(a(B(a(B|1)))(B2|1))(B2|1)",
        "(A2(B2|1))(B(A2(B|1)))(B2|1)(A(B2|1))(a(B(A2(B|1))))",
        "(A2(B2|1))(B(A2(B|1)))(A3(B2|1))(B2|1)(A(B2|1))(a(B(A2(B|1))))",
        "(A2(B2|1))(B(A2(B|1)))(A3(B2|1))(B2|1)(a2(B(A2(B|1))))(A(B2|1))(a(B(A2(B|1))))",
        "(A2(B|1))(b|1)(a2(B|1))(B|1)",
        "(A2(B|1))(b|1)(A3(B|1))(a2(B|1))(B|1)",
        "(A2(B|1))(b|1)(A3(B|1))(a3(B|1))(a2(B|1))(B|1)",
        "(B(A2(B|1)))(A2(B|1))(b|1)(A3(B|1))(a3(B|1))(a(B(A2(B|1))))",
        "(B(A2(B|1)))(A2(B|1))(b|1)(A3(B|1))(A4(B|1))(a4(B|1))(a3(B|1))(a(B(A2(B|1))))",
        "(A2(B|1))(b|1)(A3(B|1))(A4(B|1))(A5(B|1))(a5(B|1))(a4(B|1))(a2(B(A2(B|1))))(B|1)(a(B(A2(B|1))))",
        "|1(A2(B2|1))(B(A2(B|1)))(B2|1)(A(B2|1))(a(B(A2(B|1))))",
        "|1(A2(B2|1))(B(A2(B|1)))(A3(B2|1))(B2|1)(A(B2|1))(a(B(A2(B|1))))",
        "|1(A2(B2|1))(B(A2(B|1)))(A3(B2|1))(B2|1)(a2(B(A2(B|1))))(A(B2|1))(a(B(A2(B|1))))",
        "|1(A2(B|1))(A4(B|1))(a2(B|1))(B|1)",
        "|1(b|1)(A3(B|1))(A5(B|1))(a3(B|1))(a(B|1))",
        "|1(A2(B|1))(A4(B|1))(A6(B|1))(a4(B|1))(a2(B|1))(B|1)"
      ];
      // Preset record
      let catalogRecord = [
        {
          gridN: 5,
          gridM: 4,
          name: "Light bulb {5, 4}",
          funcId: "B 4 S 1 4",
          ruleEntry0: "B 4 S 1 4"
        },
        {
          gridN: 7,
          gridM: 4,
          name: "Light bulb {7, 4}",
          funcId: "B 4 S 1 4",
          funcType: "binary",
          ruleEntry0: "B 4 S 1 4"
        },
        {
          gridN: 9,
          gridM: 4,
          name: "Light bulb {9, 4}",
          funcId: "B 4 S 1 4",
          ruleEntry0: "B 4 S 1 4"
        },
        {
          gridN: 5,
          gridM: 4,
          name: "Flower {5,4}",
          funcId: "B 4 S 3 5",
          funcType: "binary",
          ruleEntry0: "B 4 S 3 5"
        },
        {
          gridN: 6,
          gridM: 4,
          name: "Flower {6, 4}",
          funcId: "B 4 S 3 6",
          ruleEntry0: "B 4 S 3 6"
        },
        {
          gridN: 7,
          gridM: 4,
          name: "Flower {7, 4}",
          funcId: "B 4 S 3 7",
          ruleEntry0: "B 4 S 3 7"
        },
        {
          gridN: 4,
          gridM: 5,
          name: "Lace {4, 5}",
          funcId: "B 3 S 2",
          ruleEntry0: "B 3 S 2"
        },
        {
          gridN: 4,
          gridM: 6,
          name: "Lace {4, 6}",
          funcId: "B 3 S 2",
          ruleEntry0: "B 3 S 2"
        },
        {
          gridN: 4,
          gridM: 7,
          name: "Lace {4, 7}",
          funcId: "B 3 S 2",
          ruleEntry0: "B 3 S 2"
        },
        {
          gridN: 4,
          gridM: 8,
          name: "Lace {4, 8}",
          funcId: "B 3 S 2",
          ruleEntry0: "B 3 S 2"
        },
        {
          gridN: 5,
          gridM: 4,
          name: "Pinwheel {5, 4}",
          funcId: "B 2 S 3",
          ruleEntry0: "B 2 S 3"
        },
        {
          gridN: 6,
          gridM: 4,
          name: "Pinwheel {6, 4}",
          funcId: "B 2 S 3",
          ruleEntry0: "B 2 S 3"
        },
        {
          gridN: 7,
          gridM: 4,
          name: "Pinwheel {7, 4}",
          funcId: "B 2 S 3",
          ruleEntry0: "B 2 S 3"
        },
        {
          gridN: 5,
          gridM: 4,
          name: "Tree {5, 4}",
          funcId: "B 2 S 3",
          ruleEntry0: "B 2 S 3"
        },
        {
          gridN: 6,
          gridM: 4,
          name: "Tree {6, 4}",
          funcId: "B 2 S 3",
          ruleEntry0: "B 2 S 3"
        },
        {
          gridN: 7,
          gridM: 4,
          name: "Tree {7, 4}",
          funcId: "B 2 S 3",
          ruleEntry0: "B 2 S 3"
        },
        {
          gridN: 7,
          gridM: 4,
          name: "Loading Spinner {7, 4}",
          funcId: "B 2 S 3",
          ruleEntry0: "B 2 S 3"
        },
        {
          gridN: 9,
          gridM: 4,
          name: "Loading Spinner {9, 4}",
          funcId: "B 2 S 3",
          ruleEntry0: "B 2 S 3"
        },
        {
          gridN: 11,
          gridM: 4,
          name: "Loading Spinner {11, 4}",
          funcId: "B 2 S 3",
          ruleEntry0: "B 2 S 3"
        },
        {
          gridN: 5,
          gridM: 4,
          name: "Firework-flower {5, 4}",
          funcId: "B 3 S 5",
          ruleEntry0: "B 3 S 5"
        },
        {
          gridN: 6,
          gridM: 4,
          name: "Firework-flower {6, 4}",
          funcId: "B 3 S 6",
          ruleEntry0: "B 3 S 6"
        },
        {
          gridN: 7,
          gridM: 4,
          name: "Firework-flower {7, 4}",
          funcId: "B 3 S 7",
          ruleEntry0: "B 3 S 7"
        },
        {
          gridN: 8,
          gridM: 3,
          name: "Star {8, 3}",
          funcId: "B 2 S 1 4",
          ruleEntry0: "B 2 S 1 4"
        },
        {
          gridN: 10,
          gridM: 3,
          name: "Star {10, 3}",
          funcId: "B 2 S 1 5",
          ruleEntry0: "B 2 S 1 5"
        },
        {
          gridN: 12,
          gridM: 3,
          name: "Star {12, 3}",
          funcId: "B 2 S 1 6",
          ruleEntry0: "B 2 S 1 6"
        }
      ];
      const numberOfPresets = fieldData.length;

      for (let i = 0; i < numberOfPresets; i++) {
        rqStoreData = transaction.objectStore("files").add(fieldData[i]);
        rqStoreData.onerror = (e) => {
          return console.log(`Error storing data ${e.target.error}`);
        };
        rqStoreData.onsuccess = (e) => {
          var key, rqStoreCatalog;

          // Add other indices of catalogRecord that occur in all presets
          key = e.target.result;
          catalogRecord[i].field = key;
          catalogRecord[i].funcType = "binary";
          catalogRecord[i].base = "e";
          catalogRecord[i].size = fieldData.length;
          catalogRecord[i].time = Date.now();
          catalogRecord[i].coloredVariant = "default";
          catalogRecord[i].updatePolicy = "synchronous";
          catalogRecord[i].ruleSelectionVariant = "static";
          catalogRecord[i].ruleEntry1 = "N/A";
          catalogRecord[i].ruleEntry2 = "N/A";
          catalogRecord[i].offset = M.eye();
          catalogRecord[i].generation = 0;
          catalogRecord[i].entryType = "preset";

          rqStoreCatalog = transaction.objectStore("catalog").add(catalogRecord[i]);
          rqStoreCatalog.onerror = (e) => {
            return console.log(`Error storing catalog record ${e.target.error}`);
          };
        };
      }
    });
  };

  exports.OpenDialog = OpenDialog = class OpenDialog {
    constructor(application) {
      this.application = application;
      this.container = E("file-dialog-open");
      this.btnCancel = E("btn-files-cancel");
      this.filelistElement = E("file-dialog-files");
      this.btnAllGrids = E("toggle-all-grids");
      this.btnAllRules = E("toggle-all-rules");
      this.btnPresetsEnabled = E("toggle-presets");
      this.allGridsEnabled = false;
      this.allRulesEnabled = false;
      this.presetsEnabled = false;
      this.fileList = null;
      //Bind events
      this.btnAllRules.addEventListener("click", (e) => {
        return this._toggleAllRules();
      });
      this.btnAllGrids.addEventListener("click", (e) => {
        return this._toggleAllGrids();
      });
      this.btnPresetsEnabled.addEventListener("click", (e) => {
        return this._togglePresets();
      });
      this.btnCancel.addEventListener("click", (e) => {
        return this.close();
      });
    }

    show() {
      this._updateUI();
      this.container.style.display = "";
      return this._generateFileList();
    }

    _generateFileList() {
      var grid, rule, presetStatus;
      this.filelistElement.innerHTML = '<img src="media/hrz-spinner.gif"/>';
      grid = this.allGridsEnabled ? null : [this.application.tiling.n, this.application.tiling.m];
      rule =
        this.allGridsEnabled || this.allRulesEnabled
          ? null
          : "" + this.application.getTransitionFunc();
      presetStatus = this.presetsEnabled ? "preset" : "entry";
      return (this.fileList = new GenerateFileList(
        grid,
        rule,
        presetStatus,
        this.filelistElement,
        (fileRecord, fileData) => {
          return this._loadFile(fileRecord, fileData);
        },
        () => {
          return this._fileListReady();
        }
      ));
    }

    _loadFile(fileRecord, fileData) {
      this.application.loadData(fileRecord, fileData);
      return this.close();
    }

    _fileListReady() {
      return console.log("File list ready");
    }

    close() {
      return (this.container.style.display = "none");
    }

    //Update state of the used interface.
    _updateUI() {
      //WHen all grids are enabled, enable all ruels automaticelly.
      this.btnAllRules.disabled = this.allGridsEnabled;
      removeClass(this.btnAllGrids, "button-active");
      removeClass(this.btnAllRules, "button-active");
      if (this.allGridsEnabled) {
        addClass(this.btnAllGrids, "button-active");
      }
      if (this.allRulesEnabled || this.allGridsEnabled) {
        return addClass(this.btnAllRules, "button-active");
      }
    }

    _toggleAllGrids() {
      this.allGridsEnabled = !this.allGridsEnabled;
      this._updateUI();
      return this._generateFileList();
    }

    _toggleAllRules() {
      this.allRulesEnabled = !this.allRulesEnabled;
      this._updateUI();
      return this._generateFileList();
    }

    _togglePresets() {
      this.presetsEnabled = !this.presetsEnabled;
      this._updateUI();
      return this._generateFileList();
    }
  };

  exports.SaveDialog = SaveDialog = class SaveDialog {
    constructor(application) {
      this.application = application;
      this.container = E("file-dialog-save");
      this.btnCancel = E("btn-files-save-cancel");
      this.btnSave = E("file-dialog-save-btn");
      this.fldName = E("file-dialog-save-as");
      this.filelistElement = E("file-dialog-save-files");
      this.allGridsEnabled = false;
      this.allRulesEnabled = false;
      //Bind events
      this.btnCancel.addEventListener("click", (e) => {
        return this.close();
      });
      this.btnSave.addEventListener("click", (e) => {
        return this.save();
      });
      this.fldName.addEventListener("change", (e) => {
        return this.save();
      });
    }

    show() {
      this._updateUI();
      this.container.style.display = "";
      this._generateFileList();
      this.fldName.focus();
      return this.fldName.select();
    }

    _updateUI() {}

    _generateFileList() {
      var fileListGen, grid, rule, presetStatus;
      this.filelistElement.innerHTML = '<img src="media/hrz-spinner.gif"/>';
      grid = [this.application.tiling.n, this.application.tiling.m];
      rule = "" + this.application.getTransitionFunc();
      presetStatus = "entry";
      return (fileListGen = new GenerateFileList(
        grid,
        rule,
        presetStatus,
        this.filelistElement,
        null,
        () => {
          return this._fileListReady();
        }
      ));
    }

    _fileListReady() {
      return console.log("list ready");
    }

    close() {
      return (this.container.style.display = "none");
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
      return (request.onsuccess = (e) => {
        var db, rqStoreData, transaction;
        db = e.target.result;
        transaction = db.transaction(["files", "catalog"], "readwrite");
        rqStoreData = transaction.objectStore("files").add(fieldData);
        rqStoreData.onerror = (e) => {
          return console.log(`Error storing data ${e.target.error}`);
        };
        return (rqStoreData.onsuccess = (e) => {
          var key, rqStoreCatalog;
          key = e.target.result;
          catalogRecord.field = key;
          rqStoreCatalog = transaction.objectStore("catalog").add(catalogRecord);
          rqStoreCatalog.onerror = (e) => {
            return console.log(`Error storing catalog record ${e.target.error}`);
          };
          return (rqStoreCatalog.onsuccess = (e) => {
            return this.fileSaved();
          });
        });
      });
    }

    fileSaved() {
      console.log("File saved OK");
      return this.close();
    }
  };

  GenerateFileList = class GenerateFileList {
    // fileCallback = load
    constructor(grid1, rule1, presetStatus, container, fileCallback, readyCallback) {
      this.grid = grid1;
      this.rule = rule1;
      this.presetStatus = presetStatus;
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
        return (this.status = "error");
      };
      return (request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log("Success");
        if (this.grid === null) {
          console.log("Loading whole list");
          return this.loadData(this.presetStatus);
        } else {
          console.log(`Loading data: {${this.grid[0]};${this.grid[1]}}, rule='${this.rule}'`);
          return this.loadDataFor(this.grid[0], this.grid[1], this.rule, this.presetStatus);
        }
      });
    }

    selectAll(selected) {
      var _, controls, ref8, results;
      ref8 = this.recordId2Controls;
      results = [];
      for (_ in ref8) {
        controls = ref8[_];
        results.push((controls.check.checked = selected));
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
      return (indexedDB.open("SavedFields", VERSION).onsuccess = (e) => {
        var catalog, db, doDelete, files, idx, request;
        db = e.target.result;
        request = db.transaction(["catalog", "files"], "readwrite");
        catalog = request.objectStore("catalog");
        files = request.objectStore("files");
        idx = 0;
        doDelete = () => {
          var catalogKey, record, rq;
          [catalogKey, record] = ids[idx];
          return (rq = catalog.delete(catalogKey).onsuccess =
            (e) => {
              return (files.delete(record.field).onsuccess = (e) => {
                idx += 1;
                if (idx >= ids.length) {
                  return console.log("Deleted selected fiels");
                } else {
                  return doDelete();
                }
              });
            });
        };
        request.oncomplete = (e) => {
          return this._generateFileList();
        };
        return doDelete();
      });
    }

    loadFromCursor(cursor, predicate) {
      var closeFuncGroup,
        closeGridGroup,
        dom,
        filesEnumerated,
        lastFunc,
        lastGrid,
        onRecord,
        startFuncGroup,
        startGridGroup;
      dom = new DomBuilder();
      dom
        .tag("div")
        .CLASS("toolbar")
        .tag("span")
        .CLASS("button-group")
        .text("Select:")
        .rtag("btnSelectAll", "button")
        .CLASS("button-small")
        .text("All")
        .end()
        .text("/")
        .rtag("btnSelectNone", "button")
        .CLASS("button-small")
        .text("None")
        .end()
        .end()
        .tag("span")
        .CLASS("button-group")
        .rtag("btnDeleteAll", "button")
        .CLASS("dangerous button-small")
        .a("title", "Delete selected files")
        .text("Delete")
        .end()
        .end()
        .end();
      dom.vars.btnDeleteAll.addEventListener("click", (e) => {
        return this.deleteSelected();
      });
      dom.vars.btnSelectNone.addEventListener("click", (e) => {
        return this.selectAll(false);
      });
      dom.vars.btnSelectAll.addEventListener("click", (e) => {
        return this.selectAll(true);
      });
      dom
        .tag("table")
        .CLASS("files-table")
        .tag("thead")
        .tag("tr")
        .tag("th")
        .end()
        .tag("th")
        .text("Name")
        .end()
        .tag("th")
        .text("Time")
        .end()
        .tag("th")
        .text("Grid")
        .end()
        .tag("th")
        .text("Rule Selection")
        .end()
        .tag("th")
        .text("RS0")
        .end()
        .tag("th")
        .text("RS1")
        .end()
        .tag("th")
        .text("RS2")
        .end()
        .tag("th")
        .text("Colored Variant")
        .end()
        .tag("th")
        .text("Update Policy")
        .end()
        .end()
        .end()
        .tag("tbody");
      startGridGroup = function (gridName) {
        return dom
          .tag("tr")
          .CLASS("files-grid-row")
          .tag("td")
          .a("colspan", "10")
          .text(`Grid: ${gridName}`)
          .end()
          .end();
      };
      closeGridGroup = function () {};
      startFuncGroup = function (funcType, funcId) {
        var MAX_LEN, cutPos, funcName, idxNewLine;
        if (funcType === "binary") {
          funcName = funcId;
        } else if (funcType === "custom") {
          MAX_LEN = 20;
          idxNewLine = funcId.indexOf("\n");
          if (idxNewLine === -1) {
            cutPos = MAX_LEN;
          } else {
            cutPos = Math.min(idxNewLine, MAX_LEN);
          }
          funcName = `custom: ${funcId.substr(0, cutPos)}...`;
        } else {
          funcName = funcType;
        }
        return dom
          .tag("tr")
          .CLASS("files-func-row")
          .tag("td")
          .a("colspan", "10")
          .text(`Rule: ${funcName}`)
          .end()
          .end();
      };
      closeFuncGroup = function () {};
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
        dom
          .tag("tr")
          .CLASS("files-file-row")
          .tag("td")
          .rtag("filesel", "input")
          .a("type", "checkbox")
          .end()
          .end();
        if (this.fileCallback != null) {
          dom
            .tag("td")
            .rtag("alink", "a")
            .a("href", `#load${record.name}`)
            .text(res.value.name)
            .end()
            .end();
        } else {
          dom.tag("td").text(res.value.name).end();
        }
        dom.tag("td").text(new Date(res.value.time).toLocaleString()).end();
        dom.tag("td").text(`{${res.value.gridN}, ${res.value.gridM}}`).end();
        dom
          .tag("td")
          .text(
            res.value.ruleSelectionVariant.charAt(0).toUpperCase() +
              res.value.ruleSelectionVariant.slice(1)
          )
          .end();
        dom.tag("td").text(res.value.ruleEntry0).end();
        dom.tag("td").text(res.value.ruleEntry1).end();
        dom.tag("td").text(res.value.ruleEntry2).end();
        dom
          .tag("td")
          .text(
            res.value.coloredVariant.charAt(0).toUpperCase() + res.value.coloredVariant.slice(1)
          )
          .end();
        dom
          .tag("td")
          .text(res.value.updatePolicy.charAt(0).toUpperCase() + res.value.updatePolicy.slice(1))
          .end()
          .end();

        //dom.tag('div').CLASS("file-list-file").text(res.value.name).end()
        if (dom.vars.alink != null) {
          dom.vars.alink.addEventListener(
            "click",
            ((key) => {
              return (e) => {
                e.preventDefault();
                return this.clickedFile(key);
              };
            })(record)
          );
        }
        return (this.recordId2Controls[res.primaryKey] = {
          check: dom.vars.filesel,
          record: record
        });
      };
      return (cursor.onsuccess = (e) => {
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
      });
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
      return (request.onsuccess = (e) => {
        var res;
        res = e.target.result;
        return this.fileCallback(catalogRecord, res);
      });
    }

    loadData(presetStatus) {
      var cursor, filesStore, transaction;
      console.log("Loaddata");
      transaction = this.db.transaction(["catalog"], "readonly");
      filesStore = transaction.objectStore("catalog");
      cursor = filesStore.index("catalogByGrid").openCursor();
      return this.loadFromCursor(cursor, function (rec) {
        return rec.entryType === presetStatus;
      });
    }

    loadDataFor(gridN, gridM, funcId, presetStatus) {
      var catalog, catalogIndex, cursor, transaction;
      transaction = this.db.transaction(["catalog"], "readonly");
      catalog = transaction.objectStore("catalog");
      catalogIndex = catalog.index("catalogByGrid");
      cursor = catalogIndex.openCursor();
      return this.loadFromCursor(cursor, function (rec) {
        return (
          rec.gridN === gridN &&
          rec.gridM === gridM &&
          (funcId === null || rec.funcId === funcId) &&
          rec.entryType === presetStatus
        );
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
}).call(this);
