/**
 * This file handles slot machine options management for admin users.
 * Mirrors the pattern from coolpoints-util.js for consistency.
 */

/**
 * ============================
 * Global Variables
 * ============================
 */

// Cache for current slot options
let currentSlotOptions = {
  minBet: 10,
  symbolPayouts: {},
  symbolOdds: {},
};

/**
 * ============================
 * Initialization
 * ============================
 */

/**
 * Initializes the slot options UI with data from the server
 * @param {Object} slotOptions Object containing minBet, symbolPayouts, and symbolOdds
 */
function initSlotOptions(slotOptions) {
  currentSlotOptions = slotOptions || currentSlotOptions;

  // Show slot options section for admins
  setVisible("#cs-chancoolholeslot-options", isModOrHigher());

  // Update minBet field from server
  $("#slot-minBet").val(currentSlotOptions.minBet);

  // Update symbol odds inputs from server
  for (let symbol in currentSlotOptions.symbolOdds) {
    $(`.slot-odds-input[data-symbol="${symbol}"]`).val(
      currentSlotOptions.symbolOdds[symbol],
    );
  }

  // Update symbol payouts inputs from server
  for (let symbol in currentSlotOptions.symbolPayouts) {
    $(`.slot-payouts-input[data-symbol="${symbol}"]`).val(
      currentSlotOptions.symbolPayouts[symbol],
    );
  }

  // Bind event listeners
  bindSlotOptionListeners();
}

/**
 * ============================
 * Event Handlers
 * ============================
 */

/**
 * Bind event listeners for slot option inputs
 */
function bindSlotOptionListeners() {
  // Unbind existing listeners to prevent double-binding
  $("#slot-minBet").off("change");
  $(document).off("change", ".slot-odds-input");
  $(document).off("change", ".slot-payouts-input");

  // Min bet input
  $("#slot-minBet").on("change", debounce(500, handleMinBetChange));

  // Symbol odds inputs
  $(document).on(
    "change",
    ".slot-odds-input",
    debounce(500, handleSymbolOddsChange),
  );

  // Symbol payouts inputs
  $(document).on(
    "change",
    ".slot-payouts-input",
    debounce(500, handleSymbolPayoutsChange),
  );
}

/**
 * Handle minimum bet value changes
 * @param {Event} event Input change event
 */
function handleMinBetChange(event) {
  const value = parseInt($(event.target).val());

  if (isNaN(value) || value < 1) {
    console.warn("Invalid minBet value");
    return;
  }

  currentSlotOptions.minBet = value;

  emitSlotOptionUpdate({ minBet: value });
}

/**
 * Handle symbol odds value changes
 * @param {Event} event Input change event
 */
function handleSymbolOddsChange(event) {
  const $input = $(event.target);
  const symbol = parseInt($input.data("symbol"));
  const value = parseInt($input.val());

  if (isNaN(value) || value < 1) {
    console.warn("Invalid odds value for symbol " + symbol);
    return;
  }

  currentSlotOptions.symbolOdds[symbol] = value;

  emitSlotOptionUpdate({ symbolOdds: { [symbol]: value } });
}

/**
 * Handle symbol payouts value changes
 * @param {Event} event Input change event
 */
function handleSymbolPayoutsChange(event) {
  const $input = $(event.target);
  const symbol = parseInt($input.data("symbol"));
  const value = parseInt($input.val());

  if (isNaN(value) || value < 1) {
    console.warn("Invalid payout value for symbol " + symbol);
    return;
  }

  currentSlotOptions.symbolPayouts[symbol] = value;

  emitSlotOptionUpdate({ symbolPayouts: { [symbol]: value } });
}

/**
 * Emit slot option update to server via socket
 * @param {Object} data Complete options object to send
 */
function emitSlotOptionUpdate(data) {
  if (!socket) {
    console.error("Socket not initialized");
    return;
  }

  socket.emit("setCoolholeSlotOption", data);
}

/**
 * Handle slot options update from server
 * @param {Object} slotOptions Updated options from server
 */
function handleSlotOptionsUpdate(slotOptions) {
  initSlotOptions(slotOptions);
  console.log("Slot options updated:", slotOptions);
}
