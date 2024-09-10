
/**
 * This file is additional functions/logic to make coolhole features work.
 * In general, we need to keep coolhole features out of cytube files as much as possible so the future merge conflicts are kept to a minimum.
 */

/**
 * ============================================================
 * Globals
 * ============================================================
 */
const SEC_MSG_INPUT = $("#secretaryOption-message");
const SEC_PITCH_INPUT = $("#secretaryOption-pitch");
const SEC_RATE_INPUT = $("#secretaryOption-rate");
const SEC_VOICE_INPUT = $("#secretaryOption-voice");

const synth = window.speechSynthesis;
let voices = [];
function populateVoiceList() {
 voices = synth.getVoices();
 // If we ever wanna give users a UI for what voices are available, they can select it here
 // Probably won't translate between different browsers but w/e
 
 // Clear out the secretary voices select
 SEC_VOICE_INPUT.empty();
 // Add the voices to the secretary voices select
 voices.forEach((voice) => {
   $("<option/>").val(voice.name).text(voice.name).appendTo(SEC_VOICE_INPUT);
 });
}

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

//populate voices array initially.
populateVoiceList();

/**
 * Additional logic after the chat message div is created, but before its appended to the #messagebuffer, such as additional css classes.
 * @param {Object} data chat message object
 * @param {Object} last LASTCHAT object
 * @param {Jquery div} div jquery div object of the entire message
 * @param {Jquery span} time jquery span timestamp (if user preferences = do not show timestamp, this will be undefined)
 * @param {Jquery span} name jquery span name
 * @param {Jquery span} message jquery span message
 */
function coolholePostFormatMessage(data, last, div, time, name, message) {
    try {
        let timeText = time !== undefined ? time?.text()?.toLowerCase() : "";
        let chatText = message?.text()?.toLowerCase();
        let allText = timeText + name?.text()?.toLowerCase() + chatText;

        // Add all text to title. This is so if the message dissappears (debt, shrink, etc), the user can still hover over the message to read it.
        div.prop("title", allText);

        // Add only the message text to main div and chat div. This is to make some css classes easier to write (ie, european)
        div.attr("data-text", chatText);
        message.attr("data-text", chatText);

        // Add other classes to the chat message
        data.meta.coolholeMeta?.otherClasses?.forEach(c => message.addClass(c));

        // Play emote sounds if there are any.
        // Avoid stacking and playing emote sounds when a user joins
        if (!isMessageTooOld(data.time)) {
            let safeUsername = data.username.replace(/[^\w-]/g, '\\$');
            emoteSound(message, safeUsername);
        }
    }
    catch(ex) {
        console.error(ex);
    }
}

/**
 * Additional logic after the chat message is appended to the message buffer, such as returnfire, emote overlaps.
 * @param {Object} data chat message object
 * @param {Object} div jquery div object of the entire message
 * @param {string} safeUsername username
 */
function coolholePostAddChatMessage(data, div, safeUsername) {
    try {
        // Jquery object; the span that contains the chat message only
        let jqueryChatSpan = div.children("span").last();

        checkReturnFire(div, jqueryChatSpan, safeUsername);
        checkOverlapEmotes(jqueryChatSpan);
    }
    catch(ex) {
        console.error(ex);
    }
}

/**
 * Determines if the chat message is older than a certain period of time.
 * The results are used to prevent spamming of danmus, secretaries, etc.
 * @param {int} msgTime chat message time
 * @returns {bool} true = message is old. False = message is new.
 */
function isMessageTooOld(msgTime) {
    let messageTime = new Date(msgTime);
    // Buffer for client -> server -> all clients
    messageTime.setSeconds(messageTime.getSeconds() + 5);
    return new Date() >= messageTime;
}

/**
 * Determines if the chat message should be displayed out of the usual buffer.
 * Avoids formatting to place message in buffer
 * @param {Object} data message data
 * @returns {Boolean} if the message should be displayed out of the buffer
 */
function coolholeShouldShowMessageOutOfBuffer(data) {
  if (data.meta.addClass === "secretary" || data.meta.addClass === "danmu") {
    return true;
  }
  return false;
}

/**
 * Handle message outside of buffer
 * @param {Object} data message data
 */
function coolholeHandleMessageOutOfBuffer(data) {
  if (data.meta.addClass === "secretary") {
    secretaryMessageCallback(data);
  } else if (data.meta.addClass === "danmu") {
    danmuMessageCallback(data);
  }
}

//-----------------------------------------------------------
// [START] Special Chat Messages
//-----------------------------------------------------------

/**
 * Certain commands require overriding the default message send behavior (ie: showing a modal first to accept parameters for a command)
 * @param {String} msg
 * @returns {Boolean} true = override message send. false = do not override message send.
 */
function coolholeShouldOverrideMessageSend(msg) {
  const msgLower = msg.toLowerCase();
  const commands = ["/secretary"];
  if (commands.some((command) => msgLower.startsWith(command))) {
    return true;
  }
  return false;
}

/**
 * Expects a "secretary" command with options in the message and returns the message and its options.
 * EG: /secretary {-r 1.2 -p 3.4 -v "Microsoft Zira - English (United States)"} this is my message.
 * @param {String} msg message to parse
 * @returns {Object} obj  Return object eg: { msg: "this is my message", options: { rate: 1.2, pitch: 3.4, voice: "Microsoft Zira - English (United States)" } } 
 * @returns {String} obj.msg the message to say
 * @returns {Object} obj.options the options for the message
 */
function parseSecretaryMessage(msg) {
  const commandRegex = /(\/\w+)?\s*(\{.*\})?\s+(.*$)?/i;
  const match = msg.match(commandRegex);
  if (!match) return { msg: "", options: {} };

  const [_fullMatch, _command, flags, messageToSay] = msg.match(commandRegex);
  if (!flags) return { msg: messageToSay, options: {} };

  const flagRegex = /-(\w)\s+((\".+\")|[^\s]+)/gi;
  let options = {};
  [...flags.matchAll(flagRegex)].forEach((match) => {
    const [_fullMatchFlag, flag, value] = match;
    options[flag] = value.replaceAll('"', "");
  });
  return { msg: messageToSay, options };
}

/**
 * Parses a special chat message and returns the message and its options.
 * @param {String} msg Message to parse
 * @returns {Object} obj Return object eg: { msg: "this is my message", options: { rate: 1.2, pitch: 3.4, voice: "Microsoft Zira - English (United States)" } } 
 * @returns {String} obj.msg the message to use
 * @returns {Object} obj.options the options for the message
 */
function parseSpecialChatMessage(msg) {
  const msgLower = msg.toLowerCase();
  if (msgLower.startsWith("/secretary")) {
    return parseSecretaryMessage(msg);
  }
  return { msg, options: {} };
}

// ============================================================
// Secretary
// ============================================================


/**
 * Overrides the default message send behavior (ie: showing a modal first to accept parameters for a command)
 * @param {String} msg Message to send
 * @param {Object} meta Metadata of the message
 */
function coolholeMessageOverride(msg, meta) {
  const msgLower = msg.toLowerCase();
  if (msgLower.startsWith("/secretary")) {
    // Prepopulate the message with the commands if provided in the message; otherwise use defaults
    const { msg: parsedMessage, options } = parseSecretaryMessage(msg);
    if (parsedMessage) SEC_MSG_INPUT.val(parsedMessage);
    if (options["p"]) SEC_PITCH_INPUT.val(options["p"]);
    if (options["r"]) SEC_RATE_INPUT.val(options["r"]);
    if (options["v"]) {
      const voiceFound = voices.some((voice) => voice.name === options["v"]);
      if (voiceFound)
        $(`#secretaryOption-voice option[value="${options["v"]}"]`).prop(
          "selected",
          true
        );
    }

    // Unbind and rebind the click event to prevent multiple event bindings
    $("#secretaryOption-send-btn")
      .off("click")
      .on("click", function () {
        const msg = SEC_MSG_INPUT.val();
        const pitch = SEC_PITCH_INPUT.val();
        const rate = SEC_RATE_INPUT.val();
        const voice = SEC_VOICE_INPUT.val();

        let msgWithOptions = "/secretary";
        if (pitch || rate || voice) {
          msgWithOptions += " {";
          if (pitch) {
            msgWithOptions += `-p ${pitch} `;
          }
          if (rate) {
            msgWithOptions += `-r ${rate} `;
          }
          if (voice) {
            msgWithOptions += `-v "${voice}"`;
          }
          msgWithOptions += "}";
        }
        msgWithOptions += ` ${msg}`;
        socket.emit("chatMsg", {
          msg: msgWithOptions,
          meta: meta,
        });
      });

    $("#ch-secretary-modal").modal();
  }
  CHATHIST.push($("#chatline").val());
  CHATHISTIDX = CHATHIST.length;
  $("#chatline").val("");
}

/**
 *
 * @param {*} data
 * @returns
 */
function secretaryMessageCallback(data) {
  // TODO: Would be cool if we could stop the user from spending money if a secretary was currently active. oh well
  if ($(".secretary").length > 0) {
    $(".secretary").remove();
  }
  if (isMessageTooOld(data.time)) return; // Don't show the message if it's too old

  // Elements to put things in
  let div = $("<div/>");
  let name = $("<span/>");

  // Create user name
  $("<strong/>")
    .addClass("username")
    .text(data.username + ": ")
    .appendTo(name);
  name.appendTo(div);

  // Build message
  let messageSpan = $("<span/>")
    .addClass("secretary-message") // To prevent word wrap
    .attr("data-text", data.msg) // To handle european
    .appendTo(div);
  let chatMessage = data.msg;

  // Allows for emotes
  chatMessage = stripImages(chatMessage);
  chatMessage = execEmotes(chatMessage);
  chatMessage = chatMessage.replace(/(\{.*\}\s+)*/, ""); // Remove options from displayed message
  messageSpan[0].innerHTML = chatMessage;

  /*
    TODO: Pretty janky...
    Apply function specific classes to wrapping div
    Apply text-lottery or anything else to the message itself   
    */
  // position/font class + blur in animation
  div.addClass("secretary focus-in-blur-out-expand");
  // Any other class
  messageSpan.addClass(data.meta.coolholeMeta.otherClasses.join(" "));

  // Pulled from formatMessage; this controls just about all of the custom js like golds and soy
  var safeUsername = data.username.replace(/[^\w-]/g, "\\$");
  div.addClass("chat-msg-" + safeUsername);
  div.appendTo("#main");

  // Play special emote sounds and filter out any falsey values (ie: undef)
  const sounds = emoteSound(div, safeUsername, "secretary").filter(Boolean);

  // If we can do TTS and the text isn't empty...
  if ("speechSynthesis" in window && data.msg.trim() !== "") {
    // Create speechObj's rate/pitch/voice/message if there is any option in the message.
    // TODO: Embed these option in some object on the callback rather than rely on string parsing
    const speechObj = processSpeechMessage(data.msg);

    // Create the utterance object for the message with modified rate/pitch/voice/message
    const utterThis = new SpeechSynthesisUtterance(speechObj.message);

    if (speechObj.voiceObj) 
      utterThis.voice = speechObj.voiceObj;
    if (speechObj.rate)
      utterThis.rate = speechObj.rate;
    if (speechObj.pitch)
      utterThis.pitch = speechObj.pitch;

    // If there any sounds in the array...
    if (sounds && sounds.length > 0) {
      // Wait for all sounds to end; prepare for over-engineering
      // Since we don't know when they start, we can't rely on the duration

      // Setup a count to prevent a runaway interval
      let intervalCount = 0;
      // Interval function that either bails if all sounds have ended or we've called it too many times
      function checkIfAllSoundHaveEnded(sounds) {
        // We hit our threshold; stop waiting
        if (intervalCount > 50) {
          console.error(
            "formatSecretaryMessage: sound interval never ended; hit interval count threshold",
            sounds
          );
          window.speechSynthesis.speak(utterThis);
          clearInterval(interval);
        }
        // Some sound is still going; keep waiting
        if (sounds.some((sound) => !sound.ended)) {
          intervalCount++;
          return;
        }
        // All sounds have ended
        console.log("All sounds ended; let's bail");
        window.speechSynthesis.speak(utterThis);
        clearInterval(interval);
      }

      // Begin interval with a check every 100ms
      const interval = setInterval(function () {
        checkIfAllSoundHaveEnded(sounds);
      }, 100);
    }
    // If there are no sounds, ignore all the complicated shit above
    else {
      window.speechSynthesis.speak(utterThis);
    }
  }
  // Delete when animation is finished
  setTimeout(() => div.remove(), 7000);
}

/* 
This function reads the chatMessage and modifies the speechObj based on flags in the chatMessage.
It expects the flags to be between curly brackets {}.
-r = rate of the speech. The units expected are decimal/integer. If it can't be parsed, default is 1.2.
-p = pitch of the speech. The units expected are decimal/integer. If it can't be parsed, decault is 1.
-v = voice. A string is expected. If it can't be found, Microsoft Zira - English (United States) is the default.

It also strips out the {}'s out of the chatMessage and puts the results in speechObj.message.

Example:
	chatMessage:
	/secretary {-r 1.2 -p 3.4 -v "Microsoft Zira - English (United States)"} this is my message.

	speechObj.rate = 1.2
	speechObj.pitch = 3.4
	speechObj.voiceObj = (voice object from voices array)
	speechObj.message = "this is my message."
*/
function processSpeechMessage(chatMessage) {
  const defaultSpeechObj = {
    rate: 1.2,
    pitch: 1,
    voiceObj: voiceObj: voices.find((voice) => voice.default) ?? voices[0],
    message: chatMessage,
  };

  if (!/\{.*\}/.test(chatMessage)) return defaultSpeechObj;

  const { msg: speechMessage, options } = parseSecretaryMessage(chatMessage);

  const speechObj = {
    rate: options["r"] ? Number(options["r"]) : defaultSpeechObj.rate,
    pitch: options["p"] ? Number(options["p"]) : defaultSpeechObj.pitch,
    voiceObj: voices.find(
      (voice) =>
        voice.name.toLowerCase().includes(options["v"].toLowerCase()) ||
        voice.name === options["v"]
    ),
    message: speechMessage,
  };

  return speechObj;
}

// ============================================================
// Danmu
// ============================================================

function danmuMessageCallback(data) {
  // TODO
}

//-----------------------------------------------------------
// [END] Special Chat Messages
//-----------------------------------------------------------

//-----------------------------------------------------------
// [START] CHAT OPTIONS MODAL
//-----------------------------------------------------------

var CHATOPTIONSMODAL = $("#ch-chatoptions");
$("#chatoptsbtn").on('click', function () {
    CHATOPTIONSMODAL.modal();
});

//-----------------------------------------------------------
// [END] CHAT OPTIONS MODAL
//-----------------------------------------------------------


//-----------------------------------------------------------
// [START] SOUND EFFECTS
//-----------------------------------------------------------
// Define options object
const SFX = {
    global: {
      checkboxId: 'chatOptions-sfx-global-cb',
      localStorageTag: 'sfxGlobalEnabled',
      getState: {},
      setState: {}
    },
    mod: {
      checkboxId: 'chatOptions-sfx-mod-cb',
      localStorageTag: 'sfxModEnabled',
      getState: {},
      setState: {}
    },
    stack: {
      checkboxId: 'chatOptions-sfx-stack-cb',
      localStorageTag: 'sfxStackEnabled',
      getState: {},
      setState: {}
    },
    secretary: {} // empty object since no ui tied to it
};


//06-29-2024 Miles - temporarily commented this out until we have coolhole options built.
//Initialize
[ 'global', 'mod', 'stack' ].forEach( type => {

    // Bind Element
    SFX[ type ].checkbox = document.getElementById( SFX[ type ].checkboxId );

    // Get Checkbox State Function
    SFX[ type ].getState.cb = () => SFX[ type ].checkbox.checked;
    // Get LocalStorage State Function
    SFX[ type ].getState.ls = () => window.localStorage[ SFX[ type ].localStorageTag ];

    // Set Checkbox State Function
    SFX[ type ].setState.cb = ( s ) => SFX[ type ].checkbox.checked = s;
    // Set LocalStorage State Function
    SFX[ type ].setState.ls = ( s ) => window.localStorage.setItem( SFX[ type ].localStorageTag, s );

    // Check if this has been set by user before
    SFX[ type ].isEnabled = SFX[ type ].getState.ls() === 'true';

    // If not, we disable by default (and set it in localStorage)
    if ( SFX[ type ].getState.ls() === undefined ) {
      SFX[ type ].isEnabled = false;
      SFX[ type ].setState.ls( false );
    }

    // Reflect state on the checkbox itself
    SFX[ type ].setState.cb( SFX[ type ].isEnabled );

    // Attach listener
    $( document ).on( 'change', `#${ SFX[ type ].checkboxId }[type=checkbox]`, function () {
      let state = SFX[ type ].getState.cb();
      // Updates LocalStorage item to match checkbox state
       SFX[ type ].setState.ls( state );
       SFX[ type ].isEnabled = state;
    });
});
// SFX Library
/**
* Can build this out to be something configurable
* in the channel settings.
*/
SFX.mod.sounds = {
    eugh: {
        src: "https://static.dontcodethis.com/sounds/CH_Emote_SFX-eugh.wav",
        emote: "/eugh"
    },
    gunshot: {
        src: "https://dontcodethis.com/images/Shotgun_Blast.wav",
        emote: "/maths",
    },
    boogie: {
        src: "https://dontcodethis.com/images/Boogie%20warning%20shot.wav",
        emote: "bigiron",
    },
    fbi: {
        src: "https://www.myinstants.com/media/sounds/fbi-open-up-sfx.mp3",
        emote: "/agent"
    },
    polis: {
        src: "https://www.myinstants.com/media/sounds/11900601.mp3",
        emote: "/polis"
    },
    caw: {
        src: "https://static.dontcodethis.com/sounds/caw.wav",
        emote: "/Kaiattack"
    },
    horn: {
        src: "https://static.dontcodethis.com/sounds/short-airhorn.mp3",
        emote: "/airhorn"
    },
    oh: {
        src: "https://freesound.org/data/previews/179/179334_2888453-lq.mp3",
        emote: "/ayytone"
    },
    allah: {
        src: "https://media1.vocaroo.com/mp3/1nD49ViBCBfj",
        emote: "JinnWick"
    },
    reload: {
        src: "https://static.dontcodethis.com/sounds/RELOAD.mp3",
        emote: "/reload"
    },
    chirp: {
        src: "https://static.dontcodethis.com/sounds/smoke-alarm-chirp.mp3",
        emote: "/beep",
        condition: () => $(
            "#messagebuffer>div:not('.shotKilled') .channel-emote[title='/battery']"
        ).length == 0
    }
}
SFX.global.sounds = {
    eugh: {
        src: "https://ark.augint.net/CH_Emote_SFX-eugh/CH_Emote_SFX-eugh.wav",
        emote: "/eugh"
    },
    chirp: {
        src: "https://static.dontcodethis.com/sounds/smoke-alarm-chirp.mp3",
        emote: "/beep",
        condition: () => $(
            "#messagebuffer>div:not('.shotKilled') .channel-emote[title='/battery']"
        ).length == 0
    }
}
SFX.secretary.sounds = {
    skelen: {
        src: "https://ark.augint.net/bonearmor2/bonearmor2.wav",
        emote: "/skelen"
    },
    "the dark lord": {
        src: "https://ark.augint.net/laugh1/laugh1.wav",
        emote: "the dark lord"
    },
    eugh: {
        src: "https://ark.augint.net/CH_Emote_SFX-eugh/CH_Emote_SFX-eugh.wav",
        emote: "/eugh"
    },
    "and then the door creaked open on its own": {
        src: "https://ark.augint.net/ch_sfx-door_creek_spooky_knock_ahh/ch_sfx-door_creek_spooky_knock_ahh.mp3",
        emote: "and then the door creaked open on its own"
    },
    eugh: {
        src: "https://ark.augint.net/CH_Emote_SFX-eugh/CH_Emote_SFX-eugh.wav",
        emote: "/eugh"
    },
    chirp: {
        src: "https://static.dontcodethis.com/sounds/smoke-alarm-chirp.mp3",
        // Painful chrip. Uncomment at own risk. May break with stacking
        //src: "https://dl.sndup.net/xv2q/smoke-alarm-chirp.mp3",
        emote: "/beep",
        condition: () => $(
            "#messagebuffer>div:not('.shotKilled') .channel-emote[title='/battery']"
        ).length == 0
    }
}

function isModOrUp(userName) {
    let user = findUserlistItem(userName);
    if(user === null) {
        return false;
    }
    return user.data().rank >= 2;
}

// The magic
// + a hack added... customSFXType servers to allow us to use special emotes given a specific chat situation
function emoteSound( jqueryChatSpan, userName, customSFXType = null) {
    function emoteSoundNest( type ) {
        // Search for emote images
        var emotesFound = jqueryChatSpan.find( 'img' );
        // Init SFXPlaylist
        var sfxToPlay = [];
        // Loop through emotes in message
        for ( var i = 0; i < emotesFound.length; i++ ) {
            // Get emote title
            var emoteTitle = emotesFound[ i ].getAttribute( 'title' );
            // Check against SFX Lib Emote Titles
            for ( sfx in SFX[ type ].sounds ) {
                // If match...
                if ( emoteTitle == SFX[ type ].sounds[ sfx ].emote ) {
                    // Add to SFX to play
                    if ( (sfxToPlay.length && ( SFX.stack.isEnabled || !sfxToPlay.find( item => item.emote === emoteTitle )) || !sfxToPlay.length ) )
                    sfxToPlay.push( SFX[ type ].sounds[ sfx ] );
                }
            }
        }
        // Loop through queued sounds and play them
        if ( sfxToPlay.length ) return sfxToPlay.map( ( sfx ) => playSound( sfx ) );
        
        return []; // No sounds played; return an empty array
    }  
    // Custom SFX type is considered global; if provided check that first
    if ( SFX.global.isEnabled && customSFXType && Object.hasOwn(SFX, customSFXType) )
        return emoteSoundNest( customSFXType )
    // Moderator-Only
    else if ( SFX.mod.isEnabled && isModOrUp(userName) )
        return emoteSoundNest( 'mod' )
    // Globally-enabled
    else if ( SFX.global.isEnabled )
        return emoteSoundNest( 'global' )
    
    return []; // User has sounds disabled;
}
  
function playSound( sfxLibItem ) {
    // Only Play if the item has a source (can be tighter)
    if ( sfxLibItem.hasOwnProperty( 'src' ) ) {
        // Only play if item doesn't have custom condition..
        if( !sfxLibItem.hasOwnProperty( 'condition' )
        // OR it DOES have condition and it PASSES
        || ( sfxLibItem.hasOwnProperty( 'condition' ) && sfxLibItem.condition() ) ) {
            // Init Audio item
            var audio = new Audio( sfxLibItem.src );
    
            // Set to WAV
            audio.type = 'audio/wav';
    
            // If a volume is set and it's a number, set it.
            if ( sfxLibItem.hasOwnProperty( 'volume' ) && typeof sfxLibItem.volume === 'number' )
                audio.volume = sfxLibItem.volume;
            
            // If a playbackRate is set and it's a number, set it.
            if ( sfxLibItem.hasOwnProperty( 'playbackRate' ) && typeof sfxLibItem.playbackRate === 'number' )
                audio.playbackRate = sfxLibItem.playbackRate;
            
            // Play the sound
            audio.play();
            return audio
        }
    }
}
//-----------------------------------------------------------
// [END] SOUND EFFECTS
//-----------------------------------------------------------




//-----------------------------------------------------------
// [START] EMOTE EFFECTS
//-----------------------------------------------------------
/**
 * Applies effects for "returnFire" emote. If the returnFire emote is in the chat message, it shoots the previous chat message.
 *   If the previous chat message is normal, the previous chat message gets "destroyed".
 *   If the previous chat message is gold and the current is normal, the current chat message is destroyed, and play a "tink" sound effect.
 *   If the previous chat message is gold and the current is gold, neither message is destroyed, and play a "tink" sound effect.
 * @param {Object} div jquery div object of the entire chat message (timestamp, name, message)
 * @param {Object} jqueryChatSpan jquery span object of only the chat message
 * @param {string} safeUsername username
 */
function checkReturnFire(div, jqueryChatSpan, safeUsername) {
    if (jqueryChatSpan.find("img[title='returnfire']").length > 0) {
        // This prevents shadowmuted people from returnFire on non-shadowmuted people (only really applies to people who can actually SEE shadowmutes, like mods/admins viewing the chat)
        let user = findUserlistItem(safeUsername);
        if (user?.data("meta")?.smuted === true)
            return;
        
        // Only allow shooting to chat messasges
        let prevChat = div.prev("div[class*=chat-msg]");

        if(prevChat.length > 0) {
            let shooterIsGold = false;
            let victimIsGold = false;
            let playSound = false;
    
            shooterIsGold = div.find("span.text-lottery").length > 0;
            victimIsGold = prevChat.find("span.text-lottery").length > 0;

            if(shooterIsGold && victimIsGold) {
                playSound = true;
            }
            else if (!shooterIsGold && victimIsGold) {
                playSound = true;
                div.addClass("shotKilled");
            }
            else {
                prevChat.addClass("shotKilled");
            }

            if(SFX.global.isEnabled && playSound) {
                var audio = new Audio("https://static.dontcodethis.com/sounds/tink.mp3");
                audio.type = "audio/wav";
                audio.play();
            }
        }
    }
}

/* List of overlapping emotes and their anchor points. */
const OVERLAP_EMOTES = [
    {
        name: "/soooy",
        anchor: "center"
    },
    {
        name: "/heart",
        anchor: "center"
    },
    {
        name: "/gunPointLeft",
        anchor: "left"
    },
    {
        name: "/gunPointRight",
        anchor: "right"
    }
]

/** Overlaps certain emotes on the nearest previous normal emote. (normal = a "non-overlapping" emote)
 * If there are multiple overlapping emotes in a row, stack them on the nearest previous normal emote with a slight x,y offset. 
 * @param {*} jqueryChatSpan jquery span object of only the chat message
 */
function checkOverlapEmotes(jqueryChatSpan) {
    let emotesFound = jqueryChatSpan.find("img");
    if(emotesFound.length > 0) {

        // Add a class to all overlapping emotes and then hide them. 
        // This is to allow the normal emotes to rearrange on the screen, so that the normal emotes have a solid x,y coordinate    
        // The "visibility" must be used instead of "display:none", otherwise the overlapping emote will have a width of 0, and won't be alligned properly
        OVERLAP_EMOTES.forEach(emote => jqueryChatSpan.find(`img[title='${emote.name}']`).addClass("emote-overlap").css("visibility", "hidden"));
        jqueryChatSpan.css("position", "relative");

        // A special case is if the very first emote is an "overlapping emote". 
        // Change the overlapping emote into normal.
        if(emotesFound[0].classList.contains("emote-overlap")) {
            emotesFound[0].classList.remove("emote-overlap");
            emotesFound[0].style.visibility = "";
        }
            
        // Wait a little bit for the normal emotes to render on screen
        window.setTimeout(() => {
            // Now, loop through emotes, see if they're an overlap, and reposition them on top of their corresponding normal emote
            let chatTextRect = jqueryChatSpan[0].getBoundingClientRect();   // used for placement of overlapping emote
            let prevNormalRect = null;                                      // used for placement of overlapping emote
            let prevOverlapEmoteTitle = "";                                 // used to detect repeating overlapping emotes
            let emoteCombo = 0;                                             // used to offset repeating overlapping emotes a bit each time

            for(var i = 0; i < emotesFound.length; i++) {

                // If its an overlapping emote, proceed to reposition it.
                if(emotesFound[i].classList.contains("emote-overlap")) {
                    let emoteTitle = emotesFound[i].getAttribute("title");
                    let overlapEmoteRect = emotesFound[i].getBoundingClientRect();
                    let anchor = OVERLAP_EMOTES.find(x => x.name === emoteTitle)?.anchor ?? "center";

                    // Make the overlapping emote visible again
                    emotesFound[i].style.visibility = "";

                    // If the overlapping emote repeats, increase the combo
                    if(prevOverlapEmoteTitle === emoteTitle)
                        emoteCombo+=2;
                    else
                        emoteCombo = 0;

                    // Just a sanity check
                    if(prevNormalRect !== null) {
                        // Adjust the overlap depending on the anchor
                        switch(anchor) {
                            case "left": {
                                let leftPrevEmote = prevNormalRect.left - chatTextRect.left;
                                emotesFound[i].style.left = leftPrevEmote - Math.round(overlapEmoteRect.width/4) - emoteCombo + "px";
                                emotesFound[i].style.bottom = -Math.round(overlapEmoteRect.height/2) - emoteCombo + "px";
                                break;
                            }
                            case "right": {
                                let rightPrevEmote = prevNormalRect.right - chatTextRect.left;
                                emotesFound[i].style.left = rightPrevEmote - Math.round(overlapEmoteRect.width*3/4) + emoteCombo + "px";
                                emotesFound[i].style.bottom = -Math.round(overlapEmoteRect.height/2) - emoteCombo + "px";
                                break;
                            }
                            case "center":
                            default: {
                                let leftPrevEmote = prevNormalRect.left - chatTextRect.left;
                                let topPrevEmote = prevNormalRect.top - chatTextRect.top;
                                emotesFound[i].style.left = leftPrevEmote - Math.round((overlapEmoteRect.width - prevNormalRect.width) / 2) + emoteCombo + "px";
                                emotesFound[i].style.top = topPrevEmote - Math.round((overlapEmoteRect.height - prevNormalRect.height) / 2) + emoteCombo + "px";
                                break;
                            }
                        }
                    }

                    prevOverlapEmoteTitle = emoteTitle;
                } 
                // If its not an overlapping emote, save the emote's rectangular positioning for the next emote
                else {
                    prevNormalRect = emotesFound[i].getBoundingClientRect();
                    emoteCombo = 0;
                }
            }
        }, 500)
    }
}

//-----------------------------------------------------------
// [END] EMOTE EFFECTS
//-----------------------------------------------------------


//-----------------------------------------------------------
// [START] CLIENT PREFERENCES
//-----------------------------------------------------------
/**
 * Constants for autoresizing
 */
const AUTO_RESIZE_MAX = 9;                                  // 2024-07-12 - hardcoded to be 9 based on cytube's changeVideoWidth() function 
const AUTO_RESIZE_MIN = 3;                                  // 2024-07-12 - hardcoded to be 3 based on cytube's changeVideoWidth() function 
const AUTO_RESIZE_STORAGE_NAME = "autoResizeVideoWidth";    // auto resize key for local storage
const AUTO_HIDE_USERLIST_STORAGE_NAME = "autoHideUserlist";    // hide userlist key for local storage

/**
 * Sets up auto resizing functionality.
 * AutoResizing is when coolhole remembers what size the video was set at (via +/- button) and resize it accordingly when the user refreshes the browser.
 */
function setupAutoResizing() {
    try {
        $("#resize-video-smaller").click(() => saveAutoResizing());
        $("#resize-video-larger").click(() => saveAutoResizing());
    } catch (e) {
        console.error(e);
    }
}

/**
 * Saves the current video width in local storage.
 */
function saveAutoResizing() {
    try {
        const videoWidth = getVideoWrapSize();
        if(videoWidth < AUTO_RESIZE_MIN || videoWidth > AUTO_RESIZE_MAX) {
            return
        }
    
        window.localStorage.setItem(AUTO_RESIZE_STORAGE_NAME, videoWidth);
    } catch (e) {
        console.error(e);
    }
}


/**
 * Auto resizes the video when the user refreshes the browser
 */
function applyAutoResizing() {
    try {
        // Video cannot be resized when its in HD layout (based on cytube code as of 2024-07-12)
        if(isHdLayout())
            return;

        let videoWidth = getVideoWrapSize();
        const storageVideoWidth = parseInt(window.localStorage.getItem(AUTO_RESIZE_STORAGE_NAME), 10);
        
        if(videoWidth < AUTO_RESIZE_MIN || videoWidth > AUTO_RESIZE_MAX)
            return;
        if (isNaN(storageVideoWidth) || storageVideoWidth < AUTO_RESIZE_MIN || storageVideoWidth > AUTO_RESIZE_MAX)
            return;
    
        let counter = 0;
        const safetyCounter = AUTO_RESIZE_MAX - AUTO_RESIZE_MIN + 1;
        // Repeatedly click on the +/- button to resize the video
        while(videoWidth !== storageVideoWidth && counter < safetyCounter) {
            if(videoWidth < storageVideoWidth) {
                document.getElementById("resize-video-larger").click();
                videoWidth++;
            }
            else if (videoWidth > storageVideoWidth) {
                document.getElementById("resize-video-smaller").click();
                videoWidth--;
            }
            else
                break;
            counter++;
        }
    } catch (e) {
        console.error(e);
    }
}


/**
 * Sets up auto hiding the userlist when the user first sees the screen.
 */
function setupAutoHideUserlist() {
    try {
        $("#usercount").click(() => saveHideUserlist());
        $("#userlisttoggle").click(() => saveHideUserlist());
    } catch (e) {
        console.error(e);
    }
}

/**
 * Saves whether or not to hide the userlist in local storage
 */
function saveHideUserlist() {
    try {
        window.localStorage.setItem(AUTO_HIDE_USERLIST_STORAGE_NAME, isUserlistHidden());
    } catch (e) {
        console.error(e);
    }
}

/**
 * Auto hides the userlist when the user refreshes the browser.
 */
function applyAutoHideUserlist() {
    try {
        if(window.localStorage.getItem(AUTO_HIDE_USERLIST_STORAGE_NAME) === 'true')
            $("#usercount").click();
    } catch (e) {
        console.error(e);
    }
}

/**
 * Helper functions for client side preferences.
 */
function getVideoWrapSize() {
    let videoWrap = document.getElementById("videowrap");
    let match = videoWrap.className.match(/col-md-(\d+)/);
    if (!match) {
        throw new Error("ui::changeVideoWidth: videowrap is missing bootstrap class!");
    }
    return parseInt(match[1], 10);
}

function isHdLayout() {
    return /hd/.test(document.body.className);
}

function isUserlistHidden() {
    return $("#userlist")[0].style.display === "none";
}

setupAutoResizing();
applyAutoResizing();
setupAutoHideUserlist();
applyAutoHideUserlist();

//-----------------------------------------------------------
// [END] CLIENT PREFERENCES
//-----------------------------------------------------------

