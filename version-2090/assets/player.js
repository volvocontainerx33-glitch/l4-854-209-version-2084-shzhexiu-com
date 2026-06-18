(function () {
  var shell = document.querySelector("[data-player]");

  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var overlay = shell.querySelector(".play-overlay");
  var source = shell.getAttribute("data-stream");
  var hls = null;

  function attachSource() {
    if (!video || !source || video.getAttribute("data-ready") === "1") {
      return;
    }

    video.setAttribute("data-ready", "1");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function startPlayback() {
    attachSource();

    if (overlay) {
      overlay.hidden = true;
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.hidden = false;
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });

    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.hidden = false;
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
})();
