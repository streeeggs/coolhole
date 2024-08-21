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
    initPointsForSelf(CLIENT.coolpoints);
  },
};
