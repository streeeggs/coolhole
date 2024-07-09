/**
 * This file is additional functions/logic to make coolhole point features work.
 */
// Globals
const coolPointItemsPerPage = 16;

// Common Functions
const namesOfPlayersVisibleOnTable = () => $(".cp-table-user-name").map(function () { return $(this).text() }).toArray();
const capFirstLetter = (str) => str.at(0).toUpperCase() + str.slice(1);
const actionIsEnabled = ({ type, action }) => CHANNEL.opts.cpOpts[type][action]["enable"];
const userHaveEnoughPoints = ({ type, action }) => {
  if (isEmpty(CLIENT_USER.user)) return false;
  const cost = CHANNEL.opts.cpOpts[type][action]["pts"];
  const currPoints = CHANNEL.users.find(u => CLIENT_USER.user.name === u.name).player.iCoolPoints;

  return currPoints >= cost;
};

// Bindings
$("#cp-greatreset").on("click", greatResetOnClick);

// FIXME: Jank global var to store filtered results for pagination without updating NewPaginator
let coolPointFilteredResults = null;

/**
 * 
 * @param {*} ptEl 
 * @param {*} msgEl 
 * @param {*} diff 
 */
function animatePointUpdate(ptEl, msgEl, diff) {
  const isPositive = diff > 0;
  const bounceAnimationName = isPositive ? "cpBounce" : "cpShake"
  const fadeAnimationName = isPositive ? "cpFadeGreen" : "cpFadeRed"
  const msgText = isPositive ? `+${diff}` : `${diff}`;

  msgEl.text(msgText);
  updateAnimation(ptEl.attr("id"), bounceAnimationName);
  updateAnimation(msgEl.attr("id"), fadeAnimationName);
}

function updateAnimation(id, animationName) {
  const el = document.getElementById(id);
  el.classList.add(animationName);
  Promise.all(
    el.getAnimations({ subtree: true }).map((animation) => animation.finished)
  )
    .then(() => el.classList.remove(animationName))
    .catch((err) => console.error(err));
}

function updateSelfCoolPointsUI(coolPoints) {
  CLIENT_USER.user.player.iCoolPoints = coolPoints;
  CHANNEL.users.find((u) => CLIENT_USER.user.name === u.name).player.iCoolPoints = coolPoints;

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
  const visiblePlayers = namesOfPlayersVisibleOnTable().map(vp => ({ name: vp, iCoolPoints: $(`#${vp}-points`).text() }))

  for (const player of incomingPlayerData) {
    const user = visiblePlayers.find(vp => vp.name === player.name);

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
  const playersUIToUpdate = affectedPlayers.filter((ap) => visiblePlayers.find((vp) => ap.name === vp));

  if (!playersUIToUpdate) return;

  playersUIToUpdate.forEach((player) => {
    const pointEl = $(`#${player.name}-points`);
    const messageEl = $(`#${player.name}-points-msg`);
    pointEl.text(player.iCoolPoints);

    animatePointUpdate(pointEl, messageEl, player.coolPointsDifference)
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

  if (!namesOfPlayersVisibleOnTable().some(vp => vp === pointData.user)) return;

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
 * @param {*} page 
 * @param {*} sorted 
 */
function updateTableCoolPointsUI(page, sorted = true) {
  const entries = coolPointFilteredResults ?? CHANNEL.users;
  const start = coolPointItemsPerPage * page;

  // HACK: Need to prevent sorting when updating to avoid users "jumping" the list
  if (sorted) {
    entries.sort(
      (a, b) => b.player.iCoolPoints - a.player.iCoolPoints || a.name.localeCompare(b.name)
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

/**
 * Function to rerender the prompt each time it's opened
 * Was done to try and make it eaiser to add new options without updating pug templates with the same, confusing attributes
 * TODO: Rebuild this form with this function in mind... Lotta straightup HTML becase I'm too lazy to rebuild it atm
 */
function updateCoolPointActionsAdminPrompt() {
  const formRoot = $("#cs-chancoolpoint-options .form-group");
  

  // Clear
  // root.html("");

  // const toppleEconomyHTMLTemplate = `
  // <div class="row" style="justify-content: center;">
  //   <div class="form-group row mb-3 mb-sm-2 px-4">
  //     <div class="icon-container display-inline mt-1 ml-3 pl-2" style="align-self: center;">
  //       <svg class="ch-icon form-icon info" style="width: 30px; height: 30px;">
  //         <use xlink:href="#ch-icon-sign-info"></use>
  //       </svg>
  //     </div>
  //     <div class="col ml-n2">
  //       <a class="form-text text-info" style="margin-top: 5px; font-size: 25px;" target="_blank" href="https://docs.google.com/spreadsheets/d/1JDf3Dymhk1MzM_hXiMwR_tzch5QoiA3X15bWqfFpPQc/edit?usp=sharing">
  //         Careful now, don't topple this economy
  //       </a>
  //     </div>
  //   </div>
  // </div>
  // `;

  // root.append(toppleEconomyHTMLTemplate);

  // const actionsCopy = {
  //   active: {
  //     title: "Being Active",
  //     pts: "Points per Tick",
  //     enable: "Enable",
  //     interval: "Tick Interval"
  //   },
  //   addingVid: {
  //     title: "Adding a video",
  //     pts: "Points per Video",
  //     enable: "Enable"
  //   },
  //   skipped: {
  //     title: "Having your video skipped",
  //     enable: "Enable",
  //     pts: "Points lost"
  //   },
  //   highlight: {
  //     title: "Highlight",
  //     enable: "Enable",
  //     pts: "Cost"
  //   },
  //   skip: {
  //     title: "Skipping a video",
  //     enable: "Enable",
  //     pts: "Cost"
  //   },
  //   danmu: {
  //     title: "Danmaku ('On Screen' Comments)",
  //     enable: "Enable",
  //     pts: "Cost"
  //   },
  //   secretary: {
  //     title: "Super Invasive Chat",
  //     enable: "Enable",
  //     pts: "Cost"
  //   },
  //   debtlvl0: {
  //     title: "Debt Level 0 - Stutter filter",
  //     enable: "Enable",
  //     pts: "Points below"
  //   },
  //   debtlvl1: {
  //     title: "Debt Level 1 - Lisp filter",
  //     enable: "Enable",
  //     pts: "Points below"
  //   },
  //   debtlvl2: {
  //     title: "Debt Level 2 - Random Ad",
  //     enable: "Enable",
  //     pts: "Points below"
  //   },
  //   debtlvl3: {
  //     title: "Debt Level 3 - 'Coolhole1' Text",
  //     enable: "Enable",
  //     pts: "Points below"
  //   },
  //   debtlvl4: {
  //     title: "Debt Level 4 - Letters Missing",
  //     enable: "Enable",
  //     pts: "Points below"
  //   },
  //   debtlvl5: {
  //     title: "Debt Level 5 - 'Criticality Accident Animation",
  //     enable: "Enable",
  //     pts: "Points below"
  //   },
  // };

  // for (let action of Object.entries(CHANNEL.opts.cpOpts)) {
  //   const typeTitleTemplate = `
  //     <div class="row">
  //       <div class="col">
  //           <h5 class="mb-0">CoolPoint ${capFirstLetter(action)}</h5>
  //         </div>
  //       </div>
  //       <div class="row">
  //         <div class="col">
  //           <hr class="mt-1 mb-2">
  //       </div>
  //     </div>
  //   `;

  //   root.append(typeTitleTemplate);

  //   for (let [ruleKey, ruleTypes] of Object.entries(options)) {
  //     const formRoot = $("<div />").addClass("cp-option-form");
  //     root.append(formRoot);

  //     if (!(ruleKey in actionsCopy)) break;

  //     const copyOptionObject = actionsCopy[ruleKey];

  //     const optionLabel = $("<label />")
  //       .addClass("control-label ml-1 ml-sm-0 pt-sm-2 cp-option-subheader")
  //       .text(copyOptionObject?.title ?? "Unknown");
  //     formRoot.append(optionLabel);

  //     const formWrapper = $("<div />").addClass("cp-option-form-wrapper");
  //     const form = $("<form />").attr("action", "javascript:void(0)");
  //     formRoot.append(formWrapper);
  //     formWrapper.append(form);

  //     for (let [optionKey, optionValue] of Object.entries(ruleTypes)) {
  //       const id = `cp-${ruleKey}-${optionKey}`;

  //       if (!(optionKey in copyOptionObject)) break;

  //       const checkboxInputTemplate = `
  //         <div class="form-group pl-2 cp-option-form-group">
  //           <input id="${id}" class="cp-checkbox" type="checkbox" data-type="${type}" rule="${ruleKey}" option="${optionKey}">
  //           <label for="${id}" class="form-check-label text-sm-left">${copyOptionObject[optionKey]}</label>
  //         </div>
  //       `;

  //       const numberInputTemplate = `
  //         <div class="form-group cp-option-form-group">
  //           <label for="${id}" class="pl-2 form-text text-info cp-option-label">${copyOptionObject[optionKey]}</label>
  //           <div class="col">
  //             <input id="${id}" class="form-control cp-option-input" type="text" placeholder="6" data-type="${type}" rule="${ruleKey}" option="${optionKey}">
  //           </div>
  //         </div>
  //       `;

  //       const timeInputTemplate = `
  //         <div class="form-group cp-option-form-group">
  //           <label for="${id}" class="pl-2 form-text text-info cp-option-label">${copyOptionObject[optionKey]}</label>
  //           <div class="col">
  //             <input id="${id}" class="form-control px-3 cp-option-timeinput" type="text" placeholder="HH:MM:SS" data-type="${type}" rule="${ruleKey}" option="${optionKey}">
  //           </div>
  //         </div>
  //       `;

  //       switch (optionKey) {
  //         case "pts":
  //           form.append(numberInputTemplate);
  //           $(`#${id}`).val(optionValue);
  //           break;
  //         case "interval":
  //           form.append(timeInputTemplate);
  //           $(`#${id}`).val(formatTime(optionValue));
  //           break;
  //         case "enable":
  //           form.append(checkboxInputTemplate);
  //           $(`#${id}`).prop("checked", !!optionValue);
  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //   }
  // }
  // // Bind event listeners
  // bindCpOptions();
  // // Really just to ensure everything that's suppose to be disabled is
  // handleCPOptionChanges();
}

function updateCoolPointActionsUserPrompt() {
  const rootId = "cp-status-of-actions-accordion";
  const root = $(`#${rootId}`);
  const cpOpts = CHANNEL.opts.cpOpts;
  const actionsCopy = {
    active: {
      title: "Active",
      description: "Participation is key. A reward to those that are present"
    },
    addingVid: {
      title: "Submitting Media",
      description: "Providing media is the foundation of the application and is the catalyst for valuable data"
    },
    skipped: {
      title: "Unsatisfactory Media",
      description: "Not all media is created equal and it's important to ensure you're providing the highest quality content. Please do better in the future. Don't fucking post family guy. Or anime."
    },
    highlight: {
      title: "Highlight",
      description: "Individuality provides a sense of self-expression and personal fulfillment. While modest, this chat message will help you standout",
      usage: "/highlight"
    },
    skip: {
      title: `"Sister"ing Content`,
      description: "As a publically accountable organization, we are compelled to express our sincerest apprehension regarding the participation of incest.",
      usage: "Skip Button"
    },
    danmu: {
      title: "Danmu",
      description: `AKA: Danmaku or barrage or niconico video is usually described as は、ニコニコ動画で流れる文字コメントのことで、動画をより楽しい \ (•◡•) /コメントが彩ります`,
      usage: "/danmu"
    },
    secretary: {
      title: "Invasive Chat Message",
      description: "Children who are often deprived of attention resort to frequent disruptions through auditory and visual harassment. To be noticed, to be seen, is to be reminded that you're alive; that you matter. User her wisely.",
      usage: "/secretary"
    },
    debtlvl0: {
      title: "Debt Level 0 - Repeating Interruptions of Typical Speech",
      description: "Our bio-integrated cryptocurrency may cause speech repetition due to additional Proof of Work requirements for users below a certain threshold."
    },
    debtlvl1: {
      title: "Debt Level 1 - Further Degredation of Speech",
      description: "It's unsure if this effect is the result of impaired faculties or if it's a best estimation of what the fiscally irresponsible sound like."
    },
    debtlvl2: {
      title: "Debt Level 2 - Occasional Content Insertion to Recoup Cost",
      description: "To avoid the ability to provide you with more opportunities to contribute, we require external sources to keep operating costs nominal."
    },
    debtlvl3: {
      title: "Debt Level 3 - Lower Physical Footprint",
      description: "As your brain and body begins to degrade, it becomes necessary to reduce swelling by reducing the text size reducing necessary throughput to continue minimal cognative development."
    },
    debtlvl4: {
      title: "Debt Level 4 - Reduced bandwidth",
      description: "It's at this point that your brainwaves have become unstable and we cannot gaurentee total transmission of your messages."
    },
    debtlvl5: {
      title: "Debt Level 5 - Volatile transmission",
      description: "Criticality accident likely. May God have mercy on your soul."
    }
  }

  // Clear the content of the root element
  root.html("");

  Object.entries(cpOpts).forEach(([type, options], index) => {
    const headerId = `cpActionsCardHeader-${type}`;
    const collapseId = `cpActionsCardContent-${type}`;

    // Create Type Card
    const typeCard = $("<div />").addClass("card").attr("id", `cpActionsCard-${type}`);
    root.append(typeCard);

    // Create Type Card's Header
    const typeHeader = $("<div />")
      .addClass("h3 btn-primary card-header")
      .attr({
        "id": headerId,
        "type": "button",
        "data-toggle": "collapse",
        "data-target": `#${collapseId}`,
        "aria-expanded": index === 0 ? "true" : "false", // Expand first by default
        "aria-controls": collapseId
      })
      .text(capFirstLetter(type))
    typeCard.append(typeHeader);

    // Create Type Card's Collapsible Area
    const typeCardBodyContainer = $("<div />")
      .addClass(`collapse${index === 0 ? " show" : ""}`) // Expand first by default
      .attr({
        "id": collapseId,
        "aria-labelledby": headerId,
        "data-target": `#${typeCard.attr("id")}`
      });
    typeCard.append(typeCardBodyContainer);

    const typeCardBody = $("<div />").addClass("card-body");
    typeCardBodyContainer.append(typeCardBody);

    // Loop through options
    for (const [optionName, optionTypes] of Object.entries(options)) {
      if (!(optionName in actionsCopy)) continue;

      const copyObj = actionsCopy[optionName];
      const row = $("<div/>")
        .attr("id", `cp-userprompt-${optionName}`)
        .addClass(`cpActionRow${!optionTypes.enable ? " cpActionDisabled" : ""}`);
      typeCardBody.append(row);

      const descriptionWrapper = $("<div/>").addClass("cpActionDescription");
      row.append(descriptionWrapper);

      // Populate Description Title
      descriptionWrapper.append($("<div/>").text(copyObj.title));

      // Populate Description Text
      descriptionWrapper.append(
        $("<div/>").addClass("text-info").text(copyObj.description)
      );

      // If Expenditure Type & has chat command, describe usage
      if (type === "expenditures" && copyObj.hasOwnProperty("usage")) {
        descriptionWrapper.append($("<code/>").text(copyObj.usage));
      }

      // Create Cost Wrapper
      const costWrapperId = `cpActionCostWrap-${type}-${optionName}`;
      const costWrapper = $("<div/>")
        .attr("id", costWrapperId)
        .addClass(`cpActionCost cp-${type}`);
      row.append(costWrapper);

      const coinSvg = useSVG("#ch-icon-ui-coin", "ch-icon alert-icon", document.getElementById(costWrapperId));
      costWrapper.append(coinSvg);

      costWrapper.append(
        $("<span/>")
          .text(`${optionTypes.pts} CP`)
          .attr("id", `cp-userprompt-${optionName}-pts`)
          .addClass("cpActionCostValue")
      );
    }
  });
}

function greatResetOnClick() {
  if (CLIENT.rank < 3) {
    alert("I will kill you");
    return;
  }

  if (confirm("All points for all users will be set to 0. Are you sure about this?")) {
    socket.emit("greatReset", {});
  };
}

/**
 * Updates each of the CP prices for all of the UI options
 * @returns 
 */
function handleCPOptionChanges() {
  if (!CHANNEL.opts.cpOpts) return

  /**
   *  user
   */
  for (const [actionType, options] of Object.entries(CHANNEL.opts.cpOpts)) {
    for (const [optionName, optionTypes] of Object.entries(options)) {
      
      if (CLIENT.rank >= 3) {
            $(`#cp-${optionName}-enable`).prop("checked", optionTypes.enable);
            $(`#cp-${optionName}-pts`).val(optionTypes.pts);
            if (optionTypes.hasOwnProperty("interval") && $(`#cp-${optionName}-interval`)) {
              $(`#cp-${optionName}-interval`).val(formatTime(optionTypes.interval));
            }
            toggleDisabledOptions(`cp-${optionName}-enable`, actionType, optionName, !optionTypes.enable);
      }
      
      if (!optionTypes.enable) {
        $(`#cp-userprompt-${optionName}`).addClass("cpActionDisabled");
      } else {
        $(`#cp-userprompt-${optionName}`).removeClass("cpActionDisabled");
      }

      $(`#cp-userprompt-${optionName}-pts`).text(`${optionTypes.pts} CP`);
    }
  }
}

/**
 * CoolPoint options 
 * TODO: Potential for reuse here; just update existing functions to allow for a little more inversion of control
 * Also, again, over engineered but at least uses attributes instead of specific id format
 */
const toggleDisabledOptions = (enableId, dataType, rule, value) => {
  $(`[data-type="${dataType}"][rule="${rule}"]`)
    .filter(function () { return $(this).attr("id") !== enableId })
    .prop('disabled', value);
}


// Need to bind everything on command since we dont render the elements until requested
const bindCpOptions = () => {
  $(".cp-checkbox").change(function () {
    const el = $(this);

    const dataType = el.attr("data-type");
    const rule = el.attr("rule");
    const option = el.attr("option");
    const value = el.prop("checked");

    const data = {
      [dataType]: {
        [rule]: {
          [option]: value
        }
      }
    }

    if (option === "enable") {
      toggleDisabledOptions(el.attr("id"), dataType, rule, !value);
    }

    socket.emit("setCpOptions", data);
  });

  $(".cp-option-timeinput").on("keyup keypress", function (event) {
    const curInput = String.fromCharCode(event.which) || event.key;

    const el = $(this);
    const key = `${el.attr("data-type")}-${el.attr("rule")}-${el.attr("option")}`
    const value = el.val();
    const lastkey = Date.now();
    el.data("lastkey", lastkey);

    setTimeout(function () {
      if (el.data("lastkey") !== lastkey || el.val() !== value) {
        return;
      }

      $("#cs-textbox-timeinput-validation-error-" + key).remove();
      $(event.target).parent().removeClass("has-error");

      try {
        const data = {
          [el.attr("data-type")]: {
            [el.attr("rule")]: {
              [el.attr("option")]: parseTimeout(value)
            }
          }
        }
        socket.emit("setCpOptions", data);
      } catch (error) {
        const msg = "Invalid timespan value '" + value + "'.  Please use the format " +
          "HH:MM:SS or enter a single number for the number of seconds.";
        const validationError = $("<p/>").addClass("form-text text-danger font-italic ml-2 mb-1").text(msg)
          .attr("id", "cs-textbox-timeinput-validation-error-" + key);
        validationError.insertAfter(event.target);
        $(event.target).parent().addClass("has-error");
        return;
      }
    }, 1000);
  });

  $(".cp-option-input").on("keyup keypress", function (e) {
    const curInput = String.fromCharCode(e.which) || e.key;

    const el = $(this);
    const key = `${el.attr("data-type")}-${el.attr("rule")}-${el.attr("option")}`
    const value = el.val();
    const lastkey = Date.now();
    el.data("lastkey", lastkey);

    setTimeout(function () {
      if (el.data("lastkey") !== lastkey || el.val() !== value) {
        return;
      }

      const data = {
        [el.attr("data-type")]: {
          [el.attr("rule")]: {
            [el.attr("option")]: value
          }
        }
      }

      socket.emit("setCpOptions", data);
    }, 1000);
  });
}
//-----------------------------------------------------------
// [END] COOL POINTS
//-----------------------------------------------------------