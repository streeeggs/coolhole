/**
 * Checks to see if a user is a mod or higher. Has to be a function since the CLIENT rank is set after this file is loaded.
 * @returns {boolean}
 */
const isModOrHigher = () => CLIENT.rank >= 2;

/**
 * Updates the UI with the current points for the user that was updated
 * @param {Object} data Point Repsonse Data
 */
const updateCoolPoints = (data) => {
  const user = CHANNEL.usersCoolPoints.find((d) => d.user === data.user);
  user.points = data.currentPoints;

  if (CLIENT.name === data.user) {
    CLIENT.coolpoints = data.currentPoints;
  }
};

const CoolholeCallbacks = {
  channelCoolPointOpts: function (cpOpts) {
    CHANNEL.opts.cpOpts = cpOpts;
    handleCPOptionChanges();
  },
  coolpointsInitResponse: function (response) {
    // Set points for client and all other users
    // Ideally this would be in data.js if this wasn't a fork
    CLIENT.coolpoints = response.data.find(
      (d) => d.user === CLIENT.name
    ).points;
    CHANNEL.usersCoolPoints = response.data;

    // Update the UI
    // Check the users rank and fade in the counter/button
    initPointsForSelf(CLIENT.coolpoints);

    // Init CoolPoints User List
    if (CLIENT.rank >= 2) {
      setVisible("#cs-coolpoints-dd-toggle", isModOrHigher());
      setParentVisible("a[href='#cs-chancoolpoint-options']", isModOrHigher());
      setParentVisible(
        "a[href='#cs-chancoolpoint-user-table']",
        isModOrHigher()
      );
    }
    if (isModOrHigher) {
      window.USERCOOLPOINTSLIST.handleChange();
    }
  },
  updateCoolPointsResponse: function (response) {
    updateCoolPoints(response.data);

    if (CLIENT.name === response.data.user) {
      applyPointsToSelf(response.data.points);
    }
    if (isModOrHigher()) {
      applyPointsToTable(response.data);
    }
  },
  coolpointsFailure: function (response) {
    // TODO: Handle failures
    console.error(response);
  },
  coolpointsVoteskipFail: function (response) {
    $("#voteskip").attr("disabled", false);
  }
};
