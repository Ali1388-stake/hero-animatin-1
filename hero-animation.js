/* Hero scroll-frame animation ā€” Novin Engineers (Ł†ŲØŲ¶ Ł…Ł‡Ł†ŲÆŲ³Ų§Ł† Ł†ŁŪŁ†) */
(function () {
  "use strict";

  var CONFIG = {
    basePath: "https://23.akhtaranhoma.ir/wp-content/uploads/2026/09/",
    fileNamePattern: "frame_{n}.jpg",
    padLength: 3,
    firstFrame: 1,
    lastFrame: 108,
    backgroundColor: "#ffffff",
    smoothing: 0.09 /* smaller = smoother/slower catch-up, larger = snappier */
  };

  function pad(num, len) {
    return String(num).padStart(len, "0");
  }
  function frameUrl(index) {
    return CONFIG.basePath + CONFIG.fileNamePattern.replace("{n}", pad(index, CONFIG.padLength));
  }

  var totalFrames = CONFIG.lastFrame - CONFIG.firstFrame + 1;

  function init() {
    var wrapper = document.getElementById("nbhero-wrap");
    var container = document.getElementById("nbhero-sticky");
    var canvas = document.getElementById("nbhero-canvas");
    if (!wrapper || !container || !canvas) return;
    var ctx = canvas.getContext("2d");

    var images = new Array(totalFrames);
    var broken = new Array(totalFrames);

    var targetProgress = 0;   // 0..1, updated from scroll
    var displayProgress = 0;  // 0..1, eased toward targetProgress every frame
    var lastDrawnLow = -1;
    var lastDrawnAlpha = -1;

    function resizeCanvas() {
      canvas.width = container.clientWidth * window.devicePixelRatio;
      canvas.height = container.clientHeight * window.devicePixelRatio;
      canvas.style.width = container.clientWidth + "px";
      canvas.style.height = container.clientHeight + "px";
    }

    function drawCover(img, alpha) {
      var canvasRatio = canvas.width / canvas.height;
      var imgRatio = img.naturalWidth / img.naturalHeight;
      var drawW, drawH, offsetX, offsetY;
      if (imgRatio > canvasRatio) {
        drawH = canvas.height; drawW = drawH * imgRatio;
        offsetX = (canvas.width - drawW) / 2; offsetY = 0;
      } else {
        drawW = canvas.width; drawH = drawW / imgRatio;
        offsetX = 0; offsetY = (canvas.height - drawH) / 2;
      }
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.globalAlpha = 1;
    }

    function nearestUsable(idx) {
      for (var d = 0; d < totalFrames; d++) {
        var a = idx - d, b = idx + d;
        if (a >= 0 && images[a] && images[a].complete && !broken[a]) return a;
        if (b < totalFrames && images[b] && images[b].complete && !broken[b]) return b;
      }
      return -1;
    }

    function render() {
      var floatIndex = displayProgress * (totalFrames - 1);
      var low = Math.floor(floatIndex);
      var alpha = floatIndex - low;

      var lowUsable = images[low] && images[low].complete && !broken[low] ? low : nearestUsable(low);
      var highIdx = Math.min(low + 1, totalFrames - 1);
      var highUsable = images[highIdx] && images[highIdx].complete && !broken[highIdx] ? highIdx : lowUsable;

      if (lowUsable === -1) return;

      ctx.fillStyle = CONFIG.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawCover(images[lowUsable], 1);
      if (highUsable !== -1 && highUsable !== lowUsable && alpha > 0.02) {
        drawCover(images[highUsable], alpha);
      }
    }

    function loadImage(idx) {
      if (images[idx]) return;
      var img = new Image();
      img.onload = function () { images[idx] = img; };
      img.onerror = function () { broken[idx] = true; };
      img.src = frameUrl(idx + CONFIG.firstFrame);
      images[idx] = img;
    }

    for (var k = 0; k < Math.min(6, totalFrames); k++) loadImage(k);
    (function loadRest() {
      var i = 6;
      function next() {
        if (i >= totalFrames) return;
        loadImage(i);
        i++;
        setTimeout(next, 5);
      }
      next();
    })();

    function computeTargetProgress() {
      var rect = wrapper.getBoundingClientRect();
      var scrollable = wrapper.offsetHeight - window.innerHeight;
      var p = scrollable > 0 ? -rect.top / scrollable : 0;
      return Math.max(0, Math.min(1, p));
    }

    window.addEventListener("scroll", function () {
      targetProgress = computeTargetProgress();
      var idx = Math.round(targetProgress * (totalFrames - 1));
      loadImage(idx);
    }, { passive: true });

    window.addEventListener("resize", function () {
      resizeCanvas();
    });

    function loop() {
      displayProgress += (targetProgress - displayProgress) * CONFIG.smoothing;
      if (Math.abs(targetProgress - displayProgress) < 0.0005) displayProgress = targetProgress;
      render();
      requestAnimationFrame(loop);
    }

    resizeCanvas();
    targetProgress = computeTargetProgress();
    displayProgress = targetProgress;
    requestAnimationFrame(loop);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
