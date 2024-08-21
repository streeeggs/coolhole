/**
 * This file is additional functions/logic to make coolhole point features work.
 * It's grown big enough to deserve multiple files to make organization easier
 * but this is a fork and one file keeps required imports minimal.
 */

/**
 *
 * Global Variables
 *
 */

/**
 *
 * Global functions
 *
 */

function updateAnimation(id, animationName) {
  const el = document.getElementById(id);
  el.classList.add(animationName);
  Promise.all(
    el.getAnimations({ subtree: true }).map((animation) => animation.finished)
  )
    .then(() => el.classList.remove(animationName))
    .catch((err) => console.error(err));
}

/**
 * Updates UI with latest values for each action
 * @returns void
 */
function handleCPOptionChanges() {
  if (!CHANNEL.opts.cpOpts) return;

  CHANNEL.opts.cpOpts.forEach((action) => {
    const { name: actionName } = action;
    action.options.forEach((option) => {
      const { optionName, optionType, optionValue } = option;
      if (CLIENT.rank >= 3) {
        // Update option inputs
        switch (optionType) {
          case "time":
            $(`#cp-${actionName}-${optionName}`).val(formatTime(optionValue));
            break;
          case "bool":
            $(`#cp-${actionName}-${optionName}`).prop("checked", optionValue);
            setDisableOnRelatedOptions(
              `cp-${actionName}-${optionName}`,
              actionName,
              !optionValue
            );
            break;
          case "int":
          default:
            $(`#cp-${actionName}-${optionName}`).val(optionValue);
            break;
        }
      }
      // Update user prompt/status of actions
      if (optionType === "bool" && optionName === "enabled") {
        if (optionValue) {
          $(`#cp-userprompt-${actionName}`).removeClass("cpActionDisabled");
        } else {
          $(`#cp-userprompt-${actionName}`).addClass("cpActionDisabled");
        }
      }
      if (optionType === "int" && optionName === "points") {
        $(`#cp-userprompt-${actionName}-pts`).text(`${optionValue} CP`);
      }
    });
  });
}

/**
 * Applies a function after a given delay and restarts if called again before the delay is up
 * @param {*} delay number of milliseconds to wait before calling the function
 * @param {*} fn function to call
 * @returns function
 */
const debounce = (delay, fn) => {
  let timer;

  return (...arg) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, arg);
    }, delay);
  };
};

/**
 *
 * Bindings
 *
 */

// Bind event listeners
$(".cp-option-form-group input").each(function () {
  const classNames = $(this).attr("class").split(" ");
  if (classNames.includes("cs-checkbox")) {
    $(this).change(cpCheckboxChange);
  } else if (classNames.includes("cp-option-input")) {
    $(this).on("keyup keypress", debounce(1000, cpNumericInputChange));
  } else if (classNames.includes("cp-option-timeinput")) {
    $(this).on("keyup keypress", debounce(1000, cpTimeInputChange));
  }
});

/**
 *
 * Coolpoints Admin Table
 *
 */
function initCoolPointsTable() {
  updatePaginator();
  initSearchCoolPointsTable();
}

function initSearchCoolPointsTable() {
  const searchBar = $("#cs-coolpoints-search");

  // Clear search and global var after each initialization
  searchBar.val("");
  coolPointFilteredResults = null;

  searchBar.keyup(function () {
    const val = this.value.trim().toLowerCase();
    if (val) {
      coolPointFilteredResults = CHANNEL.users.filter((user) =>
        user.name.trim().toLowerCase().startsWith(val)
      );
    } else {
      coolPointFilteredResults = null;
    }
    updateTableCoolPointsUI(0);
    updatePaginator();
  });
}

function updatePaginator() {
  const data = coolPointFilteredResults ?? CHANNEL.users;
  const paginator = new NewPaginator(
    data.length,
    coolPointItemsPerPage,
    updateTableCoolPointsUI
  );
  // Clear paginator each initalization
  $(".coolpoints-paginator-container").html("");
  $(".coolpoints-paginator-container").append(paginator.elem);

  paginator.loadPage(0);
}

/**
 *
 * Coolpoints Admin Options
 *
 */
function showCoolPointsUserPrompt() {
  //updateCoolPointActionsUserPrompt();
  $("#coolPointsPrompt").modal();
}

/**
 * Sends the updated option to the server
 * @param {*} event event object
 * @returns void
 */
function cpNumericInputChange(event) {
  const el = $(event.target);

  const actionName = el.attr("data-actionName");
  const optionName = el.attr("data-optionName");
  const optionValue = el.val();

  const data = {
    actionName,
    optionName,
    optionValue,
  };
  socket.emit("setCpOptions", data);
}

/**
 * Disable all options related to an action not including the id provided
 * @param {String} id id that toggles these elements
 * @param {String} actionName action name of the elements we want disabled
 * @param {Bool} value should be disabled or not
 */
const setDisableOnRelatedOptions = (id, actionName, value) => {
  $(`[data-actionname='${actionName}']`).not(`#${id}`).prop("disabled", value);
};

/**
 * Sends the updated option to the server and disables related options
 * @param {*} event event object
 * @returns void
 */
function cpCheckboxChange(event) {
  const el = $(event.target);

  const actionName = el.attr("data-actionName");
  const optionName = el.attr("data-optionName");
  const optionValue = el.prop("checked");

  const data = {
    actionName,
    optionName,
    optionValue,
  };

  if (optionName === "enabled") {
    setDisableOnRelatedOptions(el.attr("id"), actionName, !optionValue);
  }

  socket.emit("setCpOptions", data);
}

/**
 * Sends the updated option to the server and validates time input
 * @param {*} event event object
 * @returns void
 */
function cpTimeInputChange(event) {
  const el = $(event.target);

  const key = el.attr("id");
  const actionName = el.attr("data-actionName");
  const optionName = el.attr("data-optionName");
  let optionValue = el.val();

  $("#cs-textbox-timeinput-validation-error-" + key).remove();
  el.parent().removeClass("has-error");

  try {
    optionValue = parseTimeout(el.val());
  } catch (error) {
    const msg = `Invalid timespan value '${optionValue}'. Please use the format HH:MM:SS or enter a single number for the number of seconds.`;
    const validationError = $("<p/>")
      .addClass("text-danger")
      .text(msg)
      .attr("id", "cs-textbox-timeinput-validation-error-" + key);
    validationError.insertAfter(event.target);
    el.parent().addClass("has-error");
    return;
  }

  const data = {
    actionName,
    optionName,
    optionValue,
  };
  socket.emit("setCpOptions", data);
}

// Globals
const coolPointItemsPerPage = 16;

// Common Functions
const namesOfPlayersVisibleOnTable = () =>
  $(".cp-table-user-name")
    .map(function () {
      return $(this).text();
    })
    .toArray();
const capFirstLetter = (str) => str.at(0).toUpperCase() + str.slice(1);
const actionIsEnabled = ({ type, action }) =>
  CHANNEL.opts.cpOpts[type][action]["enable"];
const userHaveEnoughPoints = ({ type, action }) => {
  if (isEmpty(CLIENT_USER.user)) return false;
  const cost = CHANNEL.opts.cpOpts[type][action]["pts"];
  const currPoints = CHANNEL.users.find((u) => CLIENT_USER.user.name === u.name)
    .player.iCoolPoints;

  return currPoints >= cost;
};

// Bindings
$("#cp-greatreset").on("click", greatResetOnClick);

// FIXME: Jank global var to store filtered results for pagination without updating NewPaginator
let coolPointFilteredResults = null;

function animatePointUpdate(ptEl, msgEl, diff) {
  const isPositive = diff > 0;
  const bounceAnimationName = isPositive ? "cpBounce" : "cpShake";
  const fadeAnimationName = isPositive ? "cpFadeGreen" : "cpFadeRed";
  const msgText = isPositive ? `+${diff}` : `${diff}`;

  msgEl.text(msgText);
  updateAnimation(ptEl.attr("id"), bounceAnimationName);
  updateAnimation(msgEl.attr("id"), fadeAnimationName);
}

function updateSelfCoolPointsUI(coolPoints) {
  CLIENT_USER.user.player.iCoolPoints = coolPoints;
  CHANNEL.users.find(
    (u) => CLIENT_USER.user.name === u.name
  ).player.iCoolPoints = coolPoints;

  const pointsEl = $("#coinAmt");
  const messageEl = $("#coinMsg");
  const currPoints = isNaN(pointsEl.text()) ? 0 : parseInt(pointsEl.text());

  const diff = coolPoints - currPoints;

  if (diff === 0) return;

  // TODO: Counter animation UI
  pointsEl.text(coolPoints);

  animatePointUpdate(pointsEl, messageEl, diff);
}

/**
 * Find all affected players O(n^2) (have to compare all players against themselves if all are visible)
 * Could be made faster if we used a hashmap of uuid to user but would need to be built when a users joins
 * @param {Array} incomingPlayerData Array of players
 * @returns {Array} Array of players with differences as coolPointsDifference
 */
function getPlayersWithChangeInPoints(incomingPlayerData) {
  const result = [];
  const visiblePlayers = namesOfPlayersVisibleOnTable().map((vp) => ({
    name: vp,
    iCoolPoints: $(`#${vp}-points`).text(),
  }));

  for (const player of incomingPlayerData) {
    const user = visiblePlayers.find((vp) => vp.name === player.name);

    if (user && parseInt(user.iCoolPoints) !== player.iCoolPoints) {
      // No absolute value since postive and negative change the animation shown
      const coolPointsDifference = player.iCoolPoints - user.iCoolPoints;
      const playerWithDifference = { ...player, coolPointsDifference };
      result.push(playerWithDifference);
    }
  }

  return result;
}

/**
 * Update Point UI elements with animations on table based on provided object
 * @param {Object} affectedPlayers players with "coolPointsDifference" attribute
 * @returns void
 */
function updateVisibleUsersOnTable(affectedPlayers) {
  const visiblePlayers = namesOfPlayersVisibleOnTable();
  const playersUIToUpdate = affectedPlayers.filter((ap) =>
    visiblePlayers.find((vp) => ap.name === vp)
  );

  if (!playersUIToUpdate) return;

  playersUIToUpdate.forEach((player) => {
    const pointEl = $(`#${player.name}-points`);
    const messageEl = $(`#${player.name}-points-msg`);
    pointEl.text(player.iCoolPoints);

    animatePointUpdate(pointEl, messageEl, player.coolPointsDifference);
  });
}

function updateTagetUserOnTable({ user: name, coolPoints }) {
  const pointEl = $(`#${name}-points`);
  const messageEl = $(`#${name}-points-msg`);
  const currPoints = parseInt(pointEl.text());

  if (pointEl && messageEl && coolPoints !== currPoints) {
    pointEl.text(coolPoints);
    animatePointUpdate(pointEl, messageEl, coolPoints - currPoints);
  }
}

/**
 * Updates CoolPoints mod table for all visible users
 * @param {Array} playerData Players updated
 */
function playerUpdateCoolPointsTable(playerData) {
  if (!$("#cs-chancoolpoints").is(":visible")) return;

  // Gather players with their new difference in points shown vs what playerData has
  const affectedPlayers = getPlayersWithChangeInPoints(playerData);

  // Update Table UI
  updateVisibleUsersOnTable(affectedPlayers);
}

function targetUpdateCoolPointsTable(pointData) {
  if (CLIENT.rank < 3) return;

  if (!namesOfPlayersVisibleOnTable().some((vp) => vp === pointData.user))
    return;

  updateTagetUserOnTable(pointData);
}

function addUserCoolPointsTable(userData) {
  //TODO: Upon addUser firing, update table with new user
  //How to handle paged or filtered data?
}

function initPointsForSelf(pts) {
  const pointsEl = $("#coinAmt");
  pointsEl.text(`${pts}`);

  $("#coinWrapper").addClass("cpFadeIn");
}

/**
 *
 * @param {*} page
 * @param {*} sorted
 */
function updateTableCoolPointsUI(page, sorted = true) {
  const entries = coolPointFilteredResults ?? CHANNEL.users;
  const start = coolPointItemsPerPage * page;

  // HACK: Need to prevent sorting when updating to avoid users "jumping" the list
  if (sorted) {
    entries.sort(
      (a, b) =>
        b.player.iCoolPoints - a.player.iCoolPoints ||
        a.name.localeCompare(b.name)
    );
  }

  const pagedEntries = entries.slice(start, start + coolPointItemsPerPage);

  // Declarations
  var tbl, tbody;

  // Get Table
  tbl = $("#cs-chancoolpoints table");

  // Remove Body
  tbody = tbl.find("tbody").remove();

  // Add Body
  tbody = $("<tbody/>").appendTo(tbl);

  // Append Data
  pagedEntries.forEach(function (entry) {
    // Declarations
    var tr, name, td, pointwrap, pointValueWrap, btnGroup;
    const userRank = entry.rank;

    // Append Row to Body
    tr = $("<tr/>")
      .addClass("cs-chancoolpoints-tr-" + entry.name)
      .appendTo(tbody);

    // Append Name to Row
    name = $("<th/>")
      .attr({ scope: "row", class: "pt-3" })
      .addClass("cp-table-user-name")
      .addClass(getNameColor(userRank))
      .text(entry.name)
      .appendTo(tr);

    // Create Point Column
    td = $("<td/>");

    // Wrapper to properly align buttons and text
    pointwrap = $("<div/>")
      .attr({
        style:
          "display: flex; justify-content:space-between; align-items: center; gap: 5px; width: 100%;",
      })
      .appendTo(td);

    // Append points value wrapper for points and point message
    pointValueWrap = $("<div/>")
      .attr({ style: "display: flex; gap: 7px;" })
      .appendTo(pointwrap);

    // Points
    points = $("<span/>")
      .attr({
        id: entry.name + "-points",
      })
      .text(entry.player.iCoolPoints)
      .appendTo(pointValueWrap);

    // Points message (for add and subtract animation)
    points = $("<span/>")
      .attr({
        id: entry.name + "-points-msg",
        style: "opacity: 0%;",
      })
      .appendTo(pointValueWrap);

    // Buttons wrapper
    btnGroup = $("<div/>")
      .attr({
        class: "btn-group-sm",
        role: "group",
        style: "display: flex; gap: 5px;",
      })
      .appendTo(pointwrap);

    // Take points
    takePoints = $("<button/>")
      .attr({
        id: entry.name + "-decrease-points",
        class: "btn btn-xs btn-secondary",
        type: "button",
      })
      .text("Take 10 Points")
      .appendTo(btnGroup)
      .click(function () {
        socket.emit("spendPointsByMod", {
          targetUser: entry.name,
          points: 10,
        });
      });

    // Give points
    givePoints = $("<button/>")
      .attr({
        id: entry.user + "-increase-points",
        class: "btn btn-xs btn-secondary",
        type: "button",
      })
      .text("Give 10 Points")
      .appendTo(btnGroup)
      .click(function () {
        socket.emit("addPointsByMod", {
          targetUser: entry.name,
          points: 10,
        });
      });

    td.appendTo(tr);
  });
}

function greatResetOnClick() {
  if (CLIENT.rank < 3) {
    alert("I will kill you");
    return;
  }

  if (
    confirm(
      "All points for all users will be set to 0. Are you sure about this?"
    )
  ) {
    socket.emit("greatReset", {});
  }
}
