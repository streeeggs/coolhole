$(function () {
  $("#cp-slots-spin-btn").on("click", handleSpinButtonClick);
});

const TEMP_SLOT_SYMBOL_TO_EMOTE_MAPPING = [
  "/NATAYOOOOO",
  "/maths",
  "/audi",
  "/ayytone",
  "/hellacool",
  "/sheputsout",
  "the dark lord",
  "/nullify",
  "/shark",
  "yarnball",
];

const SYMBOL_HEIGHT = $(".cp-slots-symbol").first().height();

function symbolToUrl(symbolIndex) {
  const emoteName = TEMP_SLOT_SYMBOL_TO_EMOTE_MAPPING[symbolIndex];
  return (
    CHANNEL.emoteMap[emoteName]?.image ||
    CHANNEL.emotes.filter((e) => e.name === emoteName)[0]?.image ||
    CHANNEL.emotes[symbolIndex]?.image ||
    ""
  );
}

function handleSpinButtonClick() {
  const bet = parseInt($("#cp-slots-bet-input").val());
  if (isNaN(bet) || bet <= 0) {
    alert("Please enter a valid bet amount.");
    return;
  }

  const data = { bet };
  $("#cp-slots-spin-btn").prop("disabled", true);

  socket.emit("coolholeSpinSlot", data);
}

function arrayOfRowsToArrayOfColumns(grid) {
  // convert grid from array of rows to array of columns
  const columns = [];
  for (let col = 0; col < grid[0].length; col++) {
    const column = [];
    for (let row = 0; row < grid.length; row++) {
      column.push(grid[row][col]);
    }
    columns.push(column);
  }
  return columns;
}

// DOM Structure from server-side Pug template:
// #cp-slots-reels
//   .cp-slots-reel-group (x5)
//     .cp-slots-reel (x3)  <-- animated 2 random and 1 result reel
//       .cp-slots-symbol (xN) <-- animated symbols with background images (N = 3 for results and 10 for random)

// Plan of attack:
// 1. On load, build 3 sets of symbols. One set is the result and above and below it will be two sets of the same random symbols.
// 2. When spin button is clicked, server sends back the new grid and begin the animation against the reels
// 3. Trigger the first stage of the animation which is to "spin" the reels. Since GSAP doesn't support infinite looping animations, we will animate the reels down by the height of 3 symbols (the visible area) and then snap back to the original position.
//    At the end of the repeated animation, the symbols visible in the reel should be the same symbols that will be visible when GSAP "snaps" the symbols back to the original position
// 4. The second stage of the animation is to "settle" the reels which will slowly ease the symbols into the result position. During this stage, we will also trigger a points animation for any winning patterns.

function buildReels(grid) {
  const root = $("#cp-slots-reels");
  const columns = arrayOfRowsToArrayOfColumns(grid);
  const randomReelHeight =
    $(".cp-slots-reel.random").first().children().length * SYMBOL_HEIGHT;
  for (const [colIndex, column] of columns.entries()) {
    const reelGroupEl = root.children().eq(colIndex);
    updateGroupReel(reelGroupEl, column);

    // set each reel group to result position initially
    gsap.set(reelGroupEl, { y: randomReelHeight });
  }
}

function updateGroupReel($reelGroup, resultColumn) {
  const $resultReel = $reelGroup.children(".cp-slots-reel.result").first();
  const $randomReels = $reelGroup.children(".cp-slots-reel.random");

  updateReelSymbols($resultReel, resultColumn);
  const randomSymbols = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * TEMP_SLOT_SYMBOL_TO_EMOTE_MAPPING.length)
  );
  $randomReels.each((_, el) => {
    updateReelSymbols($(el), randomSymbols);
  });
}

function updateReelSymbols($reel, symbolIds) {
  const symbolEls = $reel.children(".cp-slots-symbol");
  for (const [i, symbolIndex] of symbolIds.entries()) {
    const symbolEl = symbolEls.eq(i);
    const imageUrl = symbolToUrl(symbolIndex);
    symbolEl.css("background-image", `url(${imageUrl})`);
  }
}

function spinReels(grid, onComplete) {
  const columns = arrayOfRowsToArrayOfColumns(grid);

  const randomReelHeight = $(".cp-slots-reel.random").first().height();
  const resultReelHeight = $(".cp-slots-reel.result").first().height();

  const totalReelHeight = randomReelHeight * 2 + resultReelHeight;

  const reels = $(".cp-slots-reel-group").toArray();
  const globalTl = gsap.timeline({ onComplete });

  for (const [index, reel] of reels.entries()) {
    const tl = gsap.timeline();
    tl.to(reel, {
      y: totalReelHeight,
      duration: 0.4,
      ease: "linear",
      repeat: 5,
      delay: index * 0.4,
      onComplete: () => {
        gsap.set(reel, { y: 0 });
        updateGroupReel($(reel), columns[index]);
      },
    }).to(reel, {
      y: randomReelHeight, // move down by the height of the random reel so that the result reel is in the visible area
      duration: 1,
      ease: "power2.out",
    });
    globalTl.add(tl, 0); // start all reel animations at the same time
  }

  return globalTl;
}

function handleSlotSpinResponse(response) {
  const { grid, totalPayout, hits } = response;
  spinReels(grid, () => {
    // Animation complete: update results and trigger points animation
    const resultGrid = $(".cp-slots-result-grid");
    const resultGridPre = $("<pre>").text(`${JSON.stringify(hits, null, 2)}`);
    resultGrid.prepend(resultGridPre);

    const resultMessagePre = $("<pre>").text(
      `Won ${totalPayout} from ${hits
        .map((h) => h.pattern)
        .join(", ")} with symbols: ${hits
        .map((h) => TEMP_SLOT_SYMBOL_TO_EMOTE_MAPPING[h.symbolId])
        .join(", ")}`
    );
    resultGrid.prepend(resultMessagePre);

    if (totalPayout > 0 && typeof applyPointsToSelf === "function") {
      applyPointsToSelf(response.totalPayout);
    }
    $("#cp-slots-spin-btn").prop("disabled", false);
  });
}
