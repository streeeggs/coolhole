const CoolholeCallbacks = {
    channelCoolPointOpts: function (cpOpts) {
        CHANNEL.opts.cpOpts = cpOpts;
        handleCPOptionChanges();
    }
};