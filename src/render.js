// ### DOCUMENTATION
// read text file: https://www.geeksforgeeks.org/file-upload-in-electronjs/
// generate the table: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces
// save and load user data: https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
// watch for file changes: https://thisdavej.com/how-to-watch-for-files-changes-in-node-js/#using-fs.watchfile
// theme: https://www.geeksforgeeks.org/managing-themes-in-electronjs/
// multi language:
      // https://github.com/i18next/i18next-fs-backend
      // https://www.i18next.com/overview/getting-started
      // https://phrase.com/blog/posts/building-an-electron-app-with-internationalization-i18n/
// ########################################################################################################################
// DECLARATIONS
// ########################################################################################################################
const md5 = require('md5');
const electron = require("electron");
const theme = electron.remote.nativeTheme;
const path = require("path");
const dialog = electron.remote.dialog;
const app = electron.remote.app;
const fs = require("fs");
const Store = require("./store.js");
const store = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 768 },
    showCompleted: true,
    selectedFilters: new Array,
    categoriesFiltered: new Array,
    pathToFile: "",
    theme: ""
  }
});
const i18next = require('./configs/i18next.config');
const body = document.getElementById("body");
const head = document.getElementsByTagName("head")[0];
const a = document.querySelectorAll("a");
const navBtnAddTodo = document.getElementById("navBtnAddTodo");
const navBtnFilter = document.getElementById("navBtnFilter");
const navBtnTheme = document.getElementById("navBtnTheme");
const btnAddTodo = document.querySelectorAll(".btnAddTodo");
const btnOpenTodoFile = document.querySelectorAll(".btnOpenTodoFile");
const btnSave = document.getElementById("btnSave");
const btnItemStatus = document.getElementById("btnItemStatus");
const btnApplyFilter = document.getElementsByClassName("btnApplyFilter");
const btnCreateTodoFile = document.getElementById("btnCreateTodoFile");
const btnModalCancel = document.querySelectorAll(".btnModalCancel");
const btnResetFilters = document.querySelectorAll(".btnResetFilters");
const toggleShowCompleted = document.getElementById("toggleShowCompleted");
const onboardingContainer = document.getElementById("onboardingContainer");
const onboardingContainerHeadline = document.getElementById("onboardingContainerHeadline");
const onboardingContainerSubtitle = document.getElementById("onboardingContainerSubtitle");
const onboardingContainerBtnOpen = document.getElementById("onboardingContainerBtnOpen");
const onboardingContainerBtnCreate = document.getElementById("onboardingContainerBtnCreate");
const addTodoContainer = document.getElementById("addTodoContainer");
const addTodoContainerHeadline = document.getElementById("addTodoContainerHeadline");
const addTodoContainerSubtitle = document.getElementById("addTodoContainerSubtitle");
const addTodoContainerButton = document.getElementById("addTodoContainerButton");
const noResultContainer = document.getElementById("noResultContainer");
const noResultContainerHeadline = document.getElementById("noResultContainerHeadline");
const noResultContainerSubtitle = document.getElementById("noResultContainerSubtitle");
const todoTable = document.getElementById("todoTable");
const todoTableSelectionInformation = document.getElementById("selectionInformation");
const todoTableItemMore = document.querySelectorAll(".todoTableItemMore");
const todoTableSearch = document.getElementById("todoTableSearch");
const categories = ["contexts", "projects"];
const filterContainer = document.getElementById("todoFilters");
const filterDropdown = document.getElementById("filterDropdown");
const filterColumnClose = document.getElementById("filterColumnClose");
const filterToggleShowCompleted = document.getElementById("filterToggleShowCompleted");
const filterBtnResetFilters = document.getElementById("filterBtnResetFilters");
const selectionBtnResetFilters = document.getElementById("selectionBtnResetFilters");
const modalForm = document.getElementById('modalForm');
const modalFormInput = document.getElementById("modalFormInput");
const modalFormAlert = document.getElementById("modalFormAlert");
const modalFormHowTo = document.getElementById("modalFormHowTo");
const modalTitle = document.getElementById("modalTitle");
const modalBackground = document.querySelectorAll('.modal-background');
const modalFile = document.getElementById("modalFile");
const modalFileChoose = document.getElementById("modalFileChoose");
const modalFileOverwrite = document.getElementById("modalFileOverwrite");
// datepicker declaration and configuation
const dueDatePickerInput = document.getElementById("dueDatePickerInput");
const dueDatePicker = new Datepicker(dueDatePickerInput, {
  autohide: true,
  format: 'yyyy-mm-dd',
  clearBtn: true
});
// defining a file path Variable to store user-selected file
let pathToFile = store.get("pathToFile");
// empty variable
let pathToNewFile;
// check store file if filters (come as JSON) have been saved. If so convert the JSON to arrays and them to the main array. If not the array stays empty
let selectedFilters = store.get("selectedFilters");
if (selectedFilters.length > 0) selectedFilters = JSON.parse(selectedFilters);
// get default "show completed? value (false)
let showCompleted = store.get("showCompleted");
// create  an empty variable for the data item
let dataItem;
// create  an empty variable for the data id used to find position in array later on
let itemId;
// create  global variable for parsedData
let parsedData = [];
//
let modalFormStatus;
// variable for an array to configure if a whole category is being shown or hidden
let categoriesFiltered = store.get("categoriesFiltered");
// empty hull for the file watcher
let fileWatcher;
// TODO:
let itemsFiltered = [];
// ########################################################################################################################
// INITIAL DOM CONFIGURATION
// ########################################################################################################################
// prevent manual input in datepicker
dueDatePickerInput.readOnly = true;
// set the checked attribute according to the persisted value
toggleShowCompleted.checked = showCompleted;
//
todoTableSearch.placeholder = i18next.t("search");
// ########################################################################################################################
// TRANSLATIONS
// ########################################################################################################################
//navBtnAddTodo.setAttribute("title", i18next.t("addTodo"));
navBtnFilter.setAttribute("title", i18next.t("toggleFilter"));
//openFile.setAttribute("title", i18next.t("openFile"));
navBtnTheme.setAttribute("title", i18next.t("toggleDarkMode"));
filterToggleShowCompleted.innerHTML = i18next.t("completedTodos");
filterBtnResetFilters.innerHTML = i18next.t("resetFilters");
selectionBtnResetFilters.innerHTML = i18next.t("resetFilters");
modalFormHowTo.innerHTML = i18next.t("modalFormHowTo");
dueDatePickerInput.placeholder = i18next.t("formSelectDueDate");
btnSave.innerHTML = i18next.t("save");
modalFormInput.placeholder = i18next.t("formTodoInputPlaceholder");
addTodoContainerHeadline.innerHTML = i18next.t("addTodoContainerHeadline");
addTodoContainerSubtitle.innerHTML = i18next.t("addTodoContainerSubtitle");
addTodoContainerButton.innerHTML = i18next.t("addTodo");
welcomeToSleek.innerHTML = i18next.t("welcomeToSleek");
onboardingContainerSubtitle.innerHTML = i18next.t("onboardingContainerSubtitle");
onboardingContainerBtnOpen.innerHTML = i18next.t("onboardingContainerBtnOpen");
onboardingContainerBtnCreate.innerHTML = i18next.t("onboardingContainerBtnCreate");
modalFileOverwrite.innerHTML = i18next.t("modalFileOverwrite");
modalFileChoose.innerHTML = i18next.t("modalFileChoose");
modalFileHeadline.innerHTML = i18next.t("modalFileHeadline");
modalFileContent.innerHTML = i18next.t("modalFileContent");
noResultContainerHeadline.innerHTML = i18next.t("noResults");
noResultContainerSubtitle.innerHTML = i18next.t("noResultContainerSubtitle");
// ########################################################################################################################
// THEME
// ########################################################################################################################
navBtnTheme.addEventListener("click", () => {
  switchTheme(true);
});
let themeLink = null;
let selectedTheme = store.get("theme");
function switchTheme(toggle) {
  if(selectedTheme && !toggle) {
    theme.themeSource = selectedTheme;
  } else if (toggle) {
    if(theme.themeSource=="dark") {
      theme.themeSource = "light";
    } else {
      theme.themeSource = "dark";
    }
    selectedTheme=theme.themeSource;
  }
  if(themeLink!=null) {
    head.removeChild(document.getElementById("theme"));
    themeLink = null;
  }
  themeLink = document.createElement("link");
  themeLink.id = "theme";
  themeLink.rel = "stylesheet";
  themeLink.type = "text/css";
  themeLink.href = path.join(__dirname, "css/" + selectedTheme + ".css");
  head.appendChild(themeLink);
  store.set("theme", selectedTheme);
}
// ########################################################################################################################
// ONCLICK DEFINITIONS, FILE AND EVENT LISTENERS
// ########################################################################################################################
// persist the highlighting of the button and the dropdown menu
navBtnFilter.onclick = function() { showFilters("toggle") }

filterColumnClose.onclick = function() { showFilters(false) }

btnAddTodo.forEach(function(el) {
  el.setAttribute("title", i18next.t("addTodo"));
  el.onclick = showForm;
});

// flush all filters and items by emptying the array and reloading the data
btnResetFilters.forEach(el => el.onclick = resetFilters);

// click on the todo table will close more dropdown and remove active state for the dotted button
todoTable.onclick = function() { if(event.target.classList.contains("flex-table")) showMore(false) }

// reread the data but sort it asc
toggleShowCompleted.onclick = showCompletedTodos;

// persist window bounds after resize
window.addEventListener("resize", function(e) {
  let width = this.outerWidth;
  let height = this.outerHeight;
  store.set('windowBounds', { width, height });
});

// submit in the form
modalForm.addEventListener("submit", function(e) {
  // intercept submit
  if (e.preventDefault) e.preventDefault();

  submitForm().then(response => {
    // if form returns success we clear the modal
    clearModal();
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
});

// complete the item using the footer button in modal
btnItemStatus.onclick = function() {
  completeTodo(dataItem).then(response => {
    modalForm.classList.remove("is-active");
    clearModal();
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
}

// prevent empty hyperlinks from jumping to top after clicking
a.forEach(el => el.addEventListener("click", function(el) {
  if(el.target.href && el.target.href == "#") el.preventDefault();
}));

// put a click event on all "open file" buttons
btnOpenTodoFile.forEach(function(el) {
  el.setAttribute("title", i18next.t("openFile"));
  el.onclick = openFile;
});

// onboarding: click will call createFile() function
btnCreateTodoFile.onclick = function () { createFile(true, false) }
modalFileChoose.onclick = function() { createFile(true, false) }
modalFileOverwrite.onclick = function() { createFile(false, true) }

// put a listeners on all modal backgrounds
modalBackground.forEach(el => el.onclick = clearModal);

// click on the cancel button in the footer of the add/edit modal
btnModalCancel.forEach(function(el) {
  el.innerHTML = i18next.t("cancel");
  el.onclick = clearModal;
});

// event intercepted when datepicker changes the date
dueDatePickerInput.addEventListener('changeDate', function (e, details) {
  // we only update the object if there is a date selected. In case of a refresh it would throw an error otherwise
  if(e.detail.date) {
    // generate the object on what is written into input, so we don't overwrite previous inputs of user
    dataItemTemp = new TodoTxtItem(modalFormInput.value, [ new DueExtension() ]);
    dataItemTemp.due = new Date(e.detail.date);
    dataItemTemp.dueString = new Date(e.detail.date.getTime() - (e.detail.date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    modalFormInput.value = dataItemTemp.toString();
    // clean up as we don#t need it anymore
    dataItemTemp = null;
  }
});

todoTableSearch.addEventListener("input", function () {
  generateTodoData(this.value);
});

// ########################################################################################################################
// KEYBOARD SHORTCUTS
// ########################################################################################################################
// toggle filter dropdown when escape key is pressed
filterDropdown.addEventListener ("keydown", function () {
  if(event.key == 'Escape') showFilters(false);
});
// put a listeners on all modal backgrounds
modalForm.addEventListener ("keydown", function () {
  if(event.key == 'Escape') clearModal();
});
// ########################################################################################################################
// FUNCTIONS
// ########################################################################################################################

function startFileWatcher() {
  try {

    if(fileWatcher) fileWatcher.close();
    if (fs.existsSync(pathToFile)) {
      let md5Previous = null;
      let fsWait = false;
      fileWatcher = fs.watch(pathToFile, (event, filename) => {
        if (fsWait) return;
        fsWait = setTimeout(() => {
          fsWait = false;
        }, 100);
        if (fs.existsSync(pathToFile)) {
          const md5Current = md5(fs.readFileSync(pathToFile));
          if (md5Current === md5Previous) {
            return;
          }
          md5Previous = md5Current;
        }
        parseDataFromFile(pathToFile).then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      });
      return Promise.resolve("Success: File watcher is watching: " + pathToFile);
    } else {
      return Promise.reject("Info: File watcher did not start as file was not found at: " + pathToFile);
    }
  } catch (error) {
    return Promise.reject("Error in startFileWatcher(): " + error);
  }
}

function showCompletedTodos() {

  if(showCompleted==false) {
    showCompleted = true;
  } else {
    showCompleted = false;
  }
  toggleShowCompleted.checked = showCompleted;
  // persist the sorting
  store.set("showCompleted", showCompleted);
  t0 = performance.now();
  generateTodoData().then(response => {
    console.log(response);
    t1 = performance.now();
    console.log("Table rendered in:", t1 - t0, "ms");
  }).catch(error => {
    console.log(error);
  });
  // parsed data will be passed to generate filter data and build the filter buttons
  t0 = performance.now();
  generateFilterData().then(response => {
    console.log(response);
    t1 = performance.now();
    console.log("Filters rendered:", t1 - t0, "ms");
  }).catch(error => {
    console.log(error);
  });
}

function resetFilters() {
  selectedFilters = [];
  categoriesFiltered = new Array;
  // also clear the persisted filers, by setting it to undefined the object entry will be removed fully
  store.set("selectedFilters", new Array);
  // clear filtered categories
  store.set("categoriesFiltered", new Array);
  // clear search input
  todoTableSearch.value = null;
  t0 = performance.now();
  generateTodoData().then(response => {
    console.log(response);
    t1 = performance.now();
    console.log("Table rendered in:", t1 - t0, "ms");
  }).catch(error => {
    console.log(error);
  });
  // parsed data will be passed to generate filter data and build the filter buttons
  t0 = performance.now();
  generateFilterData().then(response => {
    console.log(response);
    t1 = performance.now();
    console.log("Filters rendered:", t1 - t0, "ms");
  }).catch(error => {
    console.log(error);
  });
}

function showMore(variable) {
  if(variable) {
    document.querySelectorAll(".todoTableItemMore").forEach(function(item) {
      item.classList.add("is-active")
    });
  } else {
    document.querySelectorAll(".todoTableItemMore").forEach(function(item) {
      item.classList.remove("is-active")
    });
  }
};

function showForm(variable) {
  try {
    if(variable) {
      // in case the more toggle menu is open we close it
      showMore(false);
      // set global variable if the modal is opening
      modalFormStatus = true;
      // clear the input value in case there was an old one
      modalFormInput.value = null;
      modalForm.classList.toggle("is-active");
      // clean up the alert box first
      modalFormAlert.innerHTML = null;
      modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
      // here we configure the headline and the footer buttons
      if(dataItem) {
        // we need to check if there already is a due date in the object
        dataItem = new TodoTxtItem(dataItem, [ new DueExtension() ]);

        modalFormInput.value = dataItem.toString();
        modalTitle.innerHTML = i18next.t("editTodo");
        btnItemStatus.classList.add("is-active");
        // only show the complete button on open items
        if(dataItem.complete == false) {
          btnItemStatus.innerHTML = i18next.t("done");
        } else {
          btnItemStatus.innerHTML = i18next.t("inProgress");
        }

        // if so we paste it into the input field
        if(dataItem.dueString) {
          dueDatePickerInput.value = dataItem.dueString;
        } else {
        // if not we clean it up
          dueDatePicker.setDate({
            clear: true
          });
          dueDatePickerInput.value = null;
        }
        // in any case the dataItem needs to be a string again to find the array position later on
        dataItem = dataItem.toString();

      } else {
        // if not we clean it up
        dueDatePicker.setDate({
          clear: true
        });
        dueDatePickerInput.value = null;
        modalTitle.innerHTML = i18next.t("addTodo");
        btnItemStatus.classList.remove("is-active");
      }
      // in any case put focus into the input field
      modalFormInput.focus();
    }
  } catch (error) {
    console.log(error);
  }
}

function showOnboarding(variable) {
  if(variable) {
    console.log("Info: Starting onboarding");
    onboardingContainer.classList.add("is-active");
    btnAddTodo.forEach(item => item.classList.remove("is-active"));
    navBtnFilter.classList.remove("is-active");
    todoTable.classList.remove("is-active");
  } else {
    console.log("Info: Ending onboarding");
    onboardingContainer.classList.remove("is-active");
    btnAddTodo.forEach(item => item.classList.add("is-active"));
    navBtnFilter.classList.add("is-active");
    todoTable.classList.add("is-active");
  }
}

function showFilters(variable) {
  switch(variable) {
    case true:
      navBtnFilter.classList.add("is-highlighted");
      filterDropdown.classList.add("is-active");
      filterDropdown.focus();
      filterColumnClose.classList.add("is-active");
    break;
    case false:
      navBtnFilter.classList.remove("is-highlighted");
      filterDropdown.classList.remove("is-active");
      filterColumnClose.classList.remove("is-active");
    break;
    case "toggle":
      navBtnFilter.classList.toggle("is-highlighted");
      filterDropdown.classList.toggle("is-active");
      filterDropdown.focus();
      filterColumnClose.classList.toggle("is-active");
    break;
  }
  // if more toggle is open we close it as user doesn't need it anymore
  showMore(false);
}

function clearModal() {
  modalForm.classList.remove("is-active");
  modalFile.classList.remove("is-active");
  // empty the data item as we don't need it anymore
  dataItem = null;
  // clean up the modal
  modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
  // set global variable if the modal is opening
  modalFormStatus = false;
  // clear the content in the input field as it's not needed anymore
  modalFormInput.value = null;
}

function showAlert(variable) {
  if(variable) {
    modalFile.classList.add("is-active", "is-danger");
  } else {
    modalFile.classList.remove("is-active", "is-danger");
  }
};

// TODO: error handling
function openFile() {
  // Resolves to a Promise<Object>
  dialog.showOpenDialog({
    title: i18next.t("windowTitleOpenFile"),
    defaultPath: path.join(app.getPath("home")),
    buttonLabel: i18next.t("windowButtonOpenFile"),
    // Restricting the user to only Text Files.
    filters: [
        {
            name: i18next.t("windowFileformat"),
            extensions: ["txt"]
        },
    ],
    properties: ['openFile']
  }).then(file => {
    // Stating whether dialog operation was cancelled or not.
    if (!file.canceled) {
      // Updating the filepath variable to user-selected file.
      pathToFile = file.filePaths[0].toString();
      // write new path and file name into storage file
      store.set("pathToFile", pathToFile);
      console.log("Success: Storage file updated by new path and filename: " + pathToFile);
      // reset the (persisted) filters as they won't make any sense when switching to a different todo.txt file for instance
      selectedFilters = new Array;
      store.set("selectedFilters", new Array);
      // pass path and filename on, to extract and parse the raw data to objects
      parseDataFromFile(pathToFile).then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
    }
  }).catch(err => {
      console.log("Error: " + err)
  });
}

// TODO: error handling
function createFile(showDialog, overwriteFile) {
  // Resolves to a Promise<Object>
  if(showDialog && !overwriteFile) {
    dialog.showOpenDialog({
      title: i18next.t("windowTitleCreateFile"),
      defaultPath: path.join(app.getPath('home')),
      buttonLabel: i18next.t("windowButtonCreateFile"),
      properties: ["openDirectory", "createDirectory"]
    }).then(file => {
      // Stating whether dialog operation was cancelled or not.
      if (!file.canceled) {
        pathToNewFile = file.filePaths[0].toString();
        if(fs.stat(pathToNewFile + "/todo.txt", function(err, stats) {
          // file exists
          if(!err) {
            // so we ask user to overwrite or choose a different location
            showAlert(true);
            return false;
          // file does not exist at given location, so we write a new file with content of sample.txt
          } else {
            fs.writeFile(pathToNewFile + "/todo.txt", "", function (err) {
              if (err) throw err;
              if (!err) {
                console.log("Success: New todo.txt file created: " + pathToNewFile + "/todo.txt");
                // Updating the GLOBAL filepath variable to user-selected file.
                pathToFile = pathToNewFile + "/todo.txt";
                // write new path and file name into storage file
                store.set("pathToFile", pathToFile);
                // pass path and filename on, to extract and parse the raw data to objects
                parseDataFromFile(pathToFile).then(response => {
                  console.log(response);
                }).catch(error => {
                  console.log(error);
                });
              }
            });
          }
        }));
      }
    }).catch(err => {
        console.log("Error: " + err)
    });
  // existing file will be overwritten
  } else if (!showDialog && overwriteFile) {
    fs.writeFile(pathToNewFile + "/todo.txt", "", function (err) {
      if (err) throw err;
      if (!err) {
        showAlert(false);
        console.log("Success: New todo.txt file created: " + pathToNewFile + "/todo.txt");
        // Updating the GLOBAL filepath variable to user-selected file.
        pathToFile = pathToNewFile + "/todo.txt";
        // write new path and file name into storage file
        store.set("pathToFile", pathToFile);
        // pass path and filename on, to extract and parse the raw data to objects
        parseDataFromFile(pathToFile).then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      }
    });
  }
}

function parseDataFromFile(pathToFile) {
  // we only start if file exists
  if (fs.existsSync(pathToFile)) {
    try {
      // start the file watcher
      startFileWatcher().then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
      // we clear the old data array
      parsedData = new Array;
      // each line is one string-entry in an array
      let parsedDataTemp = fs.readFileSync(pathToFile, {encoding: 'utf-8'}, function(err,data) { return data; }).toString().split("\n");
      // for each array item we generate a todotxt object and assign an id to it
      for(let i = 0; i < parsedDataTemp.length;i++) {
        if(!parsedDataTemp[i]) continue;
        let item = new TodoTxtItem(parsedDataTemp[i], [ new DueExtension() ]);
        item.id = i;
        // if due is missing we can't sort the array, so we set it to null if it's empty
        if(!item.due) item.due = null;
        parsedData.push(item);
      }
      // clean it up as we don't need this anymore
      parsedDataTemp = null;
      if(parsedData.length>0) {
        t0 = performance.now();
        generateTodoData().then(response => {
          console.log(response);
          t1 = performance.now();
          console.log("Table rendered in", t1 - t0, "ms");
        }).catch(error => {
          console.log(error);
        });
        // parsed data will be passed to generate filter data and build the filter buttons
        t0 = performance.now();
        generateFilterData().then(response => {
          console.log(response);
          t1 = performance.now();
          console.log("Filters rendered in", t1 - t0, "ms");
        }).catch(error => {
          console.log(error);
        });
        // if there is a file onboarding is hidden
        showOnboarding(false);
        return Promise.resolve("Success: Data has been extracted from file and parsed to todo.txt items");
      } else {
        // if there is a file onboarding is hidden
        showOnboarding(false);
        // hide/show the addTodoContainer
        addTodoContainer.classList.add("is-active");
        todoTable.classList.remove("is-active");
        // if file is actually empty we don't need the filter drawer
        navBtnFilter.classList.remove("is-active");
        return Promise.resolve("Info: File is empty, nothing will be built");
      }
    } catch(error) {
      showOnboarding(true);
      return Promise.reject("Error in parseDataFromFile(): " + error);
    }
  } else {
    showOnboarding(true);
    return Promise.resolve("Info: File does not exist or has not been defined yet");
  }
}

function generateFilterData() {
  try {
    // empty the container to prevent duplicates
    filterContainer.innerHTML = "";
    // parse through above defined categories, most likely contexts and projects
    categories.forEach((category) => {
      // array to collect all the available filters in the data
      let filters = new Array();
      // run the array and collect all possible filters, duplicates included
      parsedData.forEach((item) => {
        // check if the object has values in either the project or contexts field
        if(item[category]) {
          // push all filters found so far into an array
          for (let filter in item[category]) {
            // if user has not opted for showComplete we skip the filter of this particular item
            if(showCompleted==false && item.complete==true) {
              continue;
            } else {
              filters.push([item[category][filter]]);
            }
          }
        }
      });
      // delete duplicates and count filters
      filtersCounted = filters.join(',').split(',').reduce(function (filters, filter) {
        if (filter in filters) {
          filters[filter]++;
        } else {
          filters[filter] = 1;
        }
        if(filters!=null) {
          return filters;
        }
      }, {});
      // sort filters by amount (https://stackoverflow.com/a/1069840)
      filtersCounted = Object.fromEntries(
        Object.entries(filtersCounted).sort(([,a],[,b]) => b-a)
      );
      // build the filter buttons
      if(filters.length > 0) {
        buildFilterButtons(category).then(response => {
          console.log(response);
        }).catch (error => {
          console.log(error);
        });
      } else {
        console.log("Info: No filters for category " + category + " found in todo.txt data, no filter buttons will be generated");
      }
    });
    return Promise.resolve("Success: All filters have been generated and built");
  } catch (error) {
    return Promise.reject("Error in generateFilterData(): " + error);
  }
}

function buildFilterButtons(category) {
  try {
    // translate headline
    if(category=="contexts") {
      headline = i18next.t("contexts");
    } else if(category=="projects"){
      headline = i18next.t("projects");
    }
    let filterContainer = document.getElementById("todoFilters");
    // creates a div for the specific filter section
    let filterContainerSub = document.createElement("div");
    filterContainerSub.setAttribute("class", "dropdown-item " + category);
    filterContainerSub.setAttribute("tabindex", -1);
    // create a sub headline element
    let todoFilterHeadline = document.createElement("h4");
    todoFilterHeadline.setAttribute("class", "title is-4 " + category);
    todoFilterHeadline.setAttribute("tabindex", -1);
    todoFilterHeadline.setAttribute("data-headline", headline);
    todoFilterHeadline.innerHTML = "<a href=\"#\"><i class=\"far fa-eye-slash\"></i></a>&nbsp;" + headline;
    // TODO clean up the mess
    todoFilterHeadline.addEventListener("click", () => {
      // TODO clean up. this is a duplicate, see above
      if(categoriesFiltered.includes(category)) {
        // we remove the category from the array
        categoriesFiltered.splice(categoriesFiltered.indexOf(category), 1);
        //persist the category filters
        store.set("categoriesFiltered", categoriesFiltered);
        // we remove the greyed out look from the container
        filterContainerSub.classList.remove("is-greyed-out");
        // change the eye icon
        todoFilterHeadline.innerHTML = "<a href=\"#\"><i class=\"far fa-eye-slash\"></i></a>&nbsp;" + todoFilterHeadline.getAttribute("data-headline");
      } else {
        // we push the category to the filter array
        categoriesFiltered.push(category);
        // make sure there are no duplicates
        // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
        categoriesFiltered.filter(function(item) {
          let seen = {};
          let k = JSON.stringify(item);
          return seen.hasOwnProperty(k) ? false : (seen[k] = true);
        })
        //persist the category filters
        store.set("categoriesFiltered", categoriesFiltered);
        // we add the greyed out look to the container
        filterContainerSub.classList.add("is-greyed-out");
        // change the eye icon
        todoFilterHeadline.innerHTML = "<a href=\"#\"><i class=\"far fa-eye\"></i></a>&nbsp;" + todoFilterHeadline.getAttribute("data-headline");
      }
      t0 = performance.now();
      generateTodoData().then(response => {
        console.log(response);
        t1 = performance.now();
        console.log("Table rendered in:", t1 - t0, "ms");
      }).catch(error => {
        console.log(error);
      });
    });
    // TODO clean up. this is a duplicate, see above
    if(categoriesFiltered.includes(category)) {
      filterContainerSub.classList.add("is-greyed-out");
      todoFilterHeadline.innerHTML = "<a href=\"#\"><i class=\"far fa-eye\"></i></a>&nbsp;" + headline;
    } else {
      filterContainerSub.classList.remove("is-greyed-out");
      todoFilterHeadline.innerHTML = "<a href=\"#\"><i class=\"far fa-eye-slash\"></i></a>&nbsp;" + headline;
    }
    // add the headline before category container
    filterContainerSub.appendChild(todoFilterHeadline);
    // build one button each
    for (let filter in filtersCounted) {
      let todoFiltersItem = document.createElement("button");
      todoFiltersItem.setAttribute("class", "btnApplyFilter button");
      todoFiltersItem.setAttribute("data-filter", filter);
      todoFiltersItem.setAttribute("data-category", category);
      todoFiltersItem.setAttribute("tabindex", 415);
      todoFiltersItem.innerHTML = filter + " <span class=\"tag is-rounded\">" + filtersCounted[filter] + "</span>";
      // create the event listener for filter selection by user
      todoFiltersItem.addEventListener("click", () => {
        // set highlighting
        todoFiltersItem.classList.toggle("is-dark");
        // if no filters are selected, add a first one
        if (selectedFilters.length > 0) {
          // get the index of the item that matches the data values the button clic provided
          let index = selectedFilters.findIndex(item => JSON.stringify(item) === JSON.stringify([todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category')]));
          if(index != -1) {
            // remove the item at the index where it matched
            selectedFilters.splice(index, 1);
          } else {
            // if the item is not already in the array, push it into
            selectedFilters.push([todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category')]);
          }
        } else {
          // this is the first push
          selectedFilters.push([todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category')]);
        }
        //convert the collected filters to JSON and save it to store.js
        store.set("selectedFilters", JSON.stringify(selectedFilters));
        if(categoriesFiltered) {
          // remove any setting that hides the category of the selected filters
          if(categoriesFiltered.indexOf(category)>=0) categoriesFiltered.splice(categoriesFiltered.indexOf(category), 1);
          //persist the category filters
          store.set("categoriesFiltered", categoriesFiltered);
          // reload the filter section for the visual change
          // parsed data will be passed to generate filter data and build the filter buttons
          t0 = performance.now();
          generateFilterData().then(response => {
            console.log(response);
            t1 = performance.now();
            console.log("Filters rendered:", t1 - t0, "ms");
          }).catch(error => {
            console.log(error);
          });
        }
        t0 = performance.now();
        generateTodoData().then(response => {
          console.log(response);
          t1 = performance.now();
          console.log("Table rendered in:", t1 - t0, "ms");
        }).catch(error => {
          console.log(error);
        });
      });
      // after building the buttons we check if they appear in the saved filters, if so we add the highlighting
      selectedFilters.forEach(function(item) {
        if(JSON.stringify(item) == '["'+filter+'","'+category+'"]') todoFiltersItem.classList.toggle("is-dark")
      });
      filterContainerSub.appendChild(todoFiltersItem);
    }
    // add filters to the specific filter container
    filterContainer.appendChild(filterContainerSub);
    return Promise.resolve("Success: Filter buttons for category " + category + " have been build");
  } catch (error) {
    return Promise.reject("Error in buildFilterButtons(): " + error);
  }
}

function generateTodoData(searchString) {
  try {
    //
    if(!searchString && !todoTableSearch.value) {
      // new variable for items with or without priority
      let items = [];
      // we build a new array according to the showComplete setting
      if(showCompleted==false) {
        for(let item in parsedData) {
          if(parsedData[item].complete==true) continue;
          items.push(parsedData[item]);
        }
      } else {
        items = parsedData;
      }
      // new variable for items, filtered or not filtered
      itemsFiltered = [];
      // check if a filter has been passed or a whole category is suppose to be hidden
      if(selectedFilters.length > 0) {
        // if there are selected filters build the items according to those filters
        for (let i = 0; i < selectedFilters.length; i++) {
          for(var j = 0; j < items.length; j++) {
            if(items[j][selectedFilters[i][1]]) {
              // check if the selected filter is in one of the array values of the category field
              // only push into array if it hasn't already been part of the array
              if(items[j][selectedFilters[i][1]].includes(selectedFilters[i][0]) && !itemsFiltered.includes(items[j])) {
                itemsFiltered.push(items[j]);
              }
            }
          }
        }
      // if no filter has been passed, select all items
      } else {
        // we remove filter info, if none have been selected
        todoTableSelectionInformation.classList.remove("is-active");
        itemsFiltered = items;
      }
      // if there is at least 1 category to hide
      if(categoriesFiltered.length > 0) {
        let temp = itemsFiltered;
        categoriesFiltered.forEach(category => {
          // we create a new array where the items attrbite has no values
          temp = temp.filter(function(item) {
            return item[category] == null;
          });
        });
        itemsFiltered = temp;
      }
    // if a search input is detected
    } else {
      if(!searchString && todoTableSearch.value) searchString = todoTableSearch.value;
      // convert everything to lowercase for better search results
      itemsFiltered = parsedData.filter(function (el) { return el.toString().toLowerCase().includes(searchString.toLowerCase()); });
    }
    // we show some information on filters if any are set
    if(itemsFiltered.length!=parsedData.length) {
      todoTableSelectionInformation.classList.add("is-active");
      todoTableSelectionInformation.firstElementChild.innerHTML = i18next.t("visibleTodos") + "&nbsp;<strong>" + itemsFiltered.length + " </strong> " + i18next.t("of") + " <strong>" + parsedData.length + "</strong>";
    }
    // hide/show the addTodoContainer or noResultTodoContainer
    if(itemsFiltered.length > 0) {
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.remove("is-active");
    } else if(itemsFiltered.length == 0) {
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.add("is-active");
    }
    // produce an object where priority a to z + null is key
    itemsFiltered = itemsFiltered.reduce((r, a) => {
     r[a.priority] = [...r[a.priority] || [], a];
     return r;
    }, {});
    todoTable.classList.add("is-active");
    // get the reference for the table container
    let todoTableContainer = document.getElementById("todoTableContainer");
    // empty the table before reading fresh data
    todoTableContainer.innerHTML = "";
    // fragment is created to append the nodes
    let tableContainerContent = document.createDocumentFragment();
    // object is converted to an array
    itemsFiltered = Object.entries(itemsFiltered).sort();
    // each priority group -> A to Z plus null for all todos with no priority
    for (let priority in itemsFiltered) {
      let itemsDue = new Array;
      let items = new Array;
      let itemsDueComplete = new Array;
      let itemsComplete = new Array;
      // nodes need to be created to add them to the outer fragment
      // this creates a divider row for the priorities
      if(itemsFiltered[priority][0]!="null") {
        let divider = document.createRange().createContextualFragment("<div class=\"flex-table priority\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\">" + itemsFiltered[priority][0] + "</div></div>");
        tableContainerContent.appendChild(divider);
      }
      for (let item in itemsFiltered[priority][1]) {
        let todo = itemsFiltered[priority][1][item];
        // for each sorted group within a priority group an array is created
        // incompleted todos with due date
        if (todo.due && !todo.complete) {
          itemsDue.push(todo);
        // incompleted todos with no due date
        } else if(!todo.due && !todo.complete) {
          items.push(todo);
        // completed todos with due date
        } else if(todo.due && todo.complete) {
          itemsDueComplete.push(todo);
        // completed todos with no due date
        } else if(!todo.due && todo.complete) {
          itemsComplete.push(todo);
        }
      }
      // array is sorted so the due date is desc
      itemsDue.sort((a, b) => a.due - b.due);
      // all rows for the items with due date within the priority group are being build
      itemsDue.forEach(item => {
        tableContainerContent.appendChild(createTableRow(item));
      });
      // all rows for the items with no due date within the priority group are being build
      items.forEach(item => {
        tableContainerContent.appendChild(createTableRow(item));
      });
      // array is sorted so the due date is desc
      itemsDueComplete.sort((a, b) => a.due - b.due);
      // all rows for the items with due date within the priority group are being build
      itemsDueComplete.forEach(item => {
        tableContainerContent.appendChild(createTableRow(item));
      });
      // all rows for the items with no due date within the priority group are being build
      itemsComplete.forEach(item => {
        tableContainerContent.appendChild(createTableRow(item));
      });
    }
    todoTableContainer.appendChild(tableContainerContent);
    return Promise.resolve("Success: Todo data generated and table built");
  } catch(error) {
    return Promise.reject("Error in generateTodoData: " + error);
  }
}

function createTableRow(item) {
  try {
    // build the items for one row
    let todoTableBodyRow = document.createElement("div");
    todoTableBodyRow.setAttribute("role", "rowgroup");
    todoTableBodyRow.setAttribute("class", "flex-table");
    let todoTableBodyCellCheckbox = document.createElement("div");
    todoTableBodyCellCheckbox.setAttribute("class", "flex-row checkbox");
    todoTableBodyCellCheckbox.setAttribute("role", "cell");
    let todoTableBodyCellText = document.createElement("div");
    todoTableBodyCellText.setAttribute("class", "flex-row text");
    todoTableBodyCellText.setAttribute("role", "cell");
    todoTableBodyCellText.setAttribute("title", i18next.t("editTodo"));
    todoTableBodyCellText.setAttribute("tabindex", 300);
    let tableContainerCategories = document.createElement("span");
    tableContainerCategories.setAttribute("class", "categories");
    let todoTableBodyCellMore = document.createElement("div");
    let todoTableBodyCellPriority = document.createElement("div");
    todoTableBodyCellPriority.setAttribute("role", "cell");
    let todoTableBodyCellSpacer = document.createElement("div");
    todoTableBodyCellSpacer.setAttribute("role", "cell");
    let todoTableBodyCellDueDate = document.createElement("span");
    todoTableBodyCellDueDate.setAttribute("class", "flex-row itemDueDate");
    todoTableBodyCellDueDate.setAttribute("role", "cell");
    // start with the individual config of the items
    if(item.complete==true) {
      todoTableBodyRow.setAttribute("class", "flex-table completed");
    }
    todoTableBodyRow.setAttribute("data-item", item.toString());
    // add the priority marker or a white spacer
    if(item.priority) {
      todoTableBodyCellPriority.setAttribute("class", "flex-row priority " + item.priority);
      todoTableBodyRow.appendChild(todoTableBodyCellPriority);
    } else {
      todoTableBodyCellSpacer.setAttribute("class", "flex-row spacer");
      todoTableBodyRow.appendChild(todoTableBodyCellSpacer);
    }
    // add the checkbox
    if(item.complete==true) {
      i18next.t("resetFilters")
      todoTableBodyCellCheckbox.setAttribute("title", i18next.t("inProgress"));
      todoTableBodyCellCheckbox.innerHTML = "<a tabindex=\"300\"><i class=\"fas fa-check-circle\"></i></a>";
    } else {
      todoTableBodyCellCheckbox.setAttribute("title", i18next.t("done"));
      todoTableBodyCellCheckbox.innerHTML = "<a tabindex=\"300\"><i class=\"far fa-circle\"></i></a>";
    }
    // add a listener on the checkbox to call the completeItem function
    todoTableBodyCellCheckbox.onclick = function() {
      // passing the data-item attribute of the parent tag to complete function
        completeTodo(this.parentElement.getAttribute('data-item'), false).then(response => {
        modalForm.classList.remove("is-active");
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
    }
    todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);
    // creates cell for the text
    if(item.text) {
      // use the autoLink lib to attach an icon to every link and put a link on it
      todoTableBodyCellText.innerHTML =  item.text.autoLink({
        callback: function(url) {
          return url + " <a href=" + url + " target=\"_blank\" tabindex=\"300\"><i class=\"fas fa-external-link-alt\"></i></a>";
        }
      });
    }
    // event listener for the click on the text
    todoTableBodyCellText.onclick = function() {
      // if the clicked item is not the external link icon, showForm(true) will be called
      if(!event.target.classList.contains('fa-external-link-alt')) {
        // declaring the item-data value global so other functions can access it
        dataItem = this.parentElement.getAttribute('data-item');
        showForm(dataItem);
      }
    }
    // cell for the categories
    categories.forEach(category => {
      if(item[category]) {
        item[category].forEach(el => {
          let todoTableBodyCellCategory = document.createElement("span");
          todoTableBodyCellCategory.setAttribute("class", "tag " + category);
          todoTableBodyCellCategory.innerHTML = el;
          tableContainerCategories.appendChild(todoTableBodyCellCategory);
        });
      }
    });
    // add the text cell to the row
    todoTableBodyCellText.appendChild(tableContainerCategories);
    // check for and add a given due date
    if(item.due) {
      todoTableBodyCellDueDate.innerHTML = "<i class=\"far fa-clock\"></i><div class=\"tags has-addons\"><span class=\"tag\">" + i18next.t("dueAt") + "</span><span class=\"tag is-dark\">" + item.due.toISOString().slice(0, 10) + "</span></div><i class=\"fas fa-sort-down\"></i>";
      if(item.due < new Date()) {
        todoTableBodyCellDueDate.classList.add("due");
      }
      todoTableBodyCellText.appendChild(todoTableBodyCellDueDate);
    }
    // add the text cell to the row
    todoTableBodyRow.appendChild(todoTableBodyCellText);
    // add the more dots
    todoTableBodyCellMore.setAttribute("class", "flex-row todoTableItemMore");
    todoTableBodyCellMore.setAttribute("role", "cell");
    todoTableBodyCellMore.innerHTML = "<div class=\"dropdown is-right\"><div class=\"dropdown-trigger\"><a tabindex=\"200\"><i class=\"fas fa-ellipsis-v\"></i></a></div><div class=\"dropdown-menu\" role=\"menu\"><div class=\"dropdown-content\"><a class=\"dropdown-item\">" + i18next.t("edit") + "</a><a class=\"dropdown-item\">" + i18next.t("delete") + "</a></div></div></div>";
    // click on three-dots-icon to open more menu
    todoTableBodyCellMore.firstElementChild.firstElementChild.onclick = function() {
      // only if this element was highlighted before, we will hide instead of show the dropdown
      if(this.parentElement.parentElement.classList.contains("is-active")) {
        this.parentElement.parentElement.classList.remove("is-active");
      } else {
        // on click we close all other active more buttons and dropdowns
        document.querySelectorAll(".todoTableItemMore.is-active").forEach(function(item) {
          item.classList.remove("is-active");
        });
        // if this element was hidden before, we will show it now
        this.parentElement.parentElement.classList.add("is-active");
        // click on edit
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.firstElementChild.onclick = function() {
          dataItem = todoTableBodyCellText.parentElement.getAttribute('data-item');
          showForm(dataItem);
        }
        // click on delete
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.lastElementChild.onclick = function() {
          // passing the data-item attribute of the parent tag to complete function
          completeTodo(todoTableBodyRow.getAttribute('data-item'), true).then(response => {
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
        }
      }
    }
    // add more container to row
    todoTableBodyRow.appendChild(todoTableBodyCellMore);
    // return the fully built row
    return todoTableBodyRow;
  } catch(error) {
    return Promise.reject("Error in createTableRow(): " + error);
  }
}

function submitForm() {
  try {
    // check if there is an input in the text field, otherwise indicate it to the user
    if(modalForm.elements[0].value) {
      // input value and data item are the same, nothing has changed, nothing will be written
      if (dataItem==modalForm.elements[0].value) {
        //console.log("Info: Nothing has changed, won't write anything.");
        return Promise.resolve("Info: Nothing has changed, won't write anything.");
        //return true;
      // Edit todo
      } else if(dataItem) {
        // convert array of objects to array of strings to find the index
        parsedData = parsedData.map(item => item.toString());
        // get the position of that item in the array
        itemId = parsedData.indexOf(dataItem);
        // get the index using the itemId, remove 1 item there and add the value from the input at that position
        parsedData.splice(itemId, 1, modalForm.elements[0].value);
        // convert all the strings to proper todotxt items again
        parsedData = parsedData.map(item => new TodoTxtItem(item, [ new DueExtension() ]));
      // Add todo
      } else {
        // in case there hasn't been a passed data item, we just push the input value as a new item into the array
        dataItem = new TodoTxtItem(modalForm.elements[0].value, [ new DueExtension() ]);
        // we add the current date to the start date attribute of the todo.txt object
        dataItem.date = new Date();
        // we build the array
        parsedData.push(dataItem);
      }
      return writeDataToFile(parsedData).then(response => {
        clearModal();
        return Promise.resolve(response);
      }).catch(error => {
        // if writing into file is denied throw alert
        modalFormAlert.innerHTML = i18next.t("formErrorWritingFile") + pathToFile;
        modalFormAlert.parentElement.classList.add("is-active", 'is-danger');
        return Promise.reject(error);
      });
    // if the input field is empty, let users know
    } else {
      modalFormAlert.innerHTML = i18next.t("formInfoNoInput");
      modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
      modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
      return Promise.reject("Info: Will not write empty todo");
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

function completeTodo(dataItem, deleteItem) {
  try {
    // convert array of objects to array of strings
    let parsedDataString = parsedData.map(item => item.toString());
    // get the position of that item in the array using the string
    let itemId = parsedDataString.indexOf(dataItem);
    // in case edit form is open, text has changed and complete button is pressed, we do not fall back to the initial value of dataItem
    if(modalForm.elements[0].value) dataItem = modalForm.elements[0].value;
    // first convert the string to a todo.txt object
    dataItem = new TodoTxtItem(dataItem, [ new DueExtension() ]);
    // mark item as in progress
    if(dataItem.complete && !deleteItem) {
      // if item was already completed we set complete to false and the date to null
      dataItem.complete = false;
      dataItem.completed = null;
      // delete old dataItem from array and add the new one at it's position
      parsedData.splice(itemId, 1, dataItem);
    // Mark item as complete
    } else if(!dataItem.complete && !deleteItem) {
      // if deleteItem has been sent as true, we delete the entry from the parsedData
      dataItem.complete = true;
      dataItem.completed = new Date();
      // delete old dataItem from array and add the new one at it's position
      parsedData.splice(itemId, 1, dataItem);
    } else if(deleteItem) {
      // Delete item
      parsedData.splice(itemId, 1);
    }
    // we need to return the promise like this otherwise it cannot be passed up
    return writeDataToFile(parsedData).then(response => {
      return Promise.resolve(response);
      // if completion has been done in modal, close and clear it
      //clearModal();
    }).catch(error => {
      return Promise.reject("Error in writeDataToFile(): " + error);
    });
  } catch(error) {
    return Promise.reject("Error in completeTodo(): " + error);
  }
}

function writeDataToFile() {
  // empty the data item as we don't need it anymore
  dataItem = null;
  try {
    //write the data to the file
    fs.writeFileSync(pathToFile, TodoTxt.render(parsedData), {encoding: 'utf-8'});
    return Promise.resolve("Success: Changes written to file: " + pathToFile);
  } catch(error) {
    return Promise.reject("Error in writeDataToFile(): " + error);
  }
}

// ########################################################################################################################
// START
// ########################################################################################################################
window.onload = function () {
  // set theme
  if(selectedTheme) switchTheme(false)
  // only start if a file has been selected
  if(pathToFile) {
    console.log("Info: Path to file: " + pathToFile);
    // start parsing data
    parseDataFromFile(pathToFile).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
  } else {
    console.log("Info: File does not exist or has not been defined yet");
    // show onboarding if no file has been selected
    showOnboarding(true);
  }
}
