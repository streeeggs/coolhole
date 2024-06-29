
/**
 * This file is additional functions/logic to make coolhole features work.
 * In general, we need to keep coolhole features out of cytube files as much as possible so the future merge conflicts are kept to a minimum.
 */

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

  
// 06-29-2024 Miles - temporarily commented this out until we have coolhole options built.
// Initialize
// [ 'global', 'mod', 'stack' ].forEach( type => {
  
//     // Bind Element
//     SFX[ type ].checkbox = document.getElementById( SFX[ type ].checkboxId );
  
//     // Get Checkbox State Function
//     SFX[ type ].getState.cb = () => SFX[ type ].checkbox.checked;
//     // Get LocalStorage State Function
//     SFX[ type ].getState.ls = () => window.localStorage[ SFX[ type ].localStorageTag ];
  
//     // Set Checkbox State Function
//     SFX[ type ].setState.cb = ( s ) => SFX[ type ].checkbox.checked = s;
//     // Set LocalStorage State Function
//     SFX[ type ].setState.ls = ( s ) => window.localStorage.setItem( SFX[ type ].localStorageTag, s );
  
//     // Check if this has been set by user before
//     SFX[ type ].isEnabled = SFX[ type ].getState.ls() === 'true';
  
//     // If not, we disable by default (and set it in localStorage)
//     if ( SFX[ type ].getState.ls() === undefined ) {
//       SFX[ type ].isEnabled = false;
//       SFX[ type ].setState.ls( false );
//     }
  
//     // Reflect state on the checkbox itself
//     SFX[ type ].setState.cb( SFX[ type ].isEnabled );
  
//     // Attach listener
//     $( document ).on( 'change', `#${ SFX[ type ].checkboxId }[type=checkbox]`, function () {
//       let state = SFX[ type ].getState.cb();
//       // Updates LocalStorage item to match checkbox state
//        SFX[ type ].setState.ls( state );
//        SFX[ type ].isEnabled = state;
//     });
// });

// 2024-06-24 Miles - temporarily manually setting sfx options for testing.
SFX.global.isEnabled = true;
SFX.mod.isEnabled = true;
SFX.stack.isEnabled = true;

// SFX Library
/**
* Can build this out to be something configurable
* in the channel settings.
*/
SFX.mod.sounds = {
    eugh: {
        src: "https://ark.augint.net/CH_Emote_SFX-eugh/CH_Emote_SFX-eugh.wav",
        emote: "/eugh"
    },
    gunshot: {
        src: "https://dontcodethis.com/images/Shotgun_Blast.wav",
        emote: "/maths",
    },
    boogie: {
        src: "https://dontcodethis.com/images/Boogie warning shot.wav",
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
            console.log( audio );
    
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
