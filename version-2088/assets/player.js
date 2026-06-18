(function () {
  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var message = player.querySelector("[data-player-message]");
    var stream = player.getAttribute("data-stream");
    var hls = null;
    var started = false;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function start() {
      if (started || !video || !stream) {
        return;
      }
      started = true;
      player.classList.add("is-ready");
      video.setAttribute("controls", "controls");
      video.setAttribute("playsinline", "playsinline");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.play().catch(function () {
          showMessage("点击视频画面继续播放。");
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            showMessage("点击视频画面继续播放。");
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (hls) {
              hls.destroy();
              hls = null;
            }
            showMessage("播放暂时不可用，请稍后重试。");
          }
        });
        return;
      }

      showMessage("浏览器暂不支持在线播放，请更换现代浏览器。");
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    player.addEventListener("click", function () {
      start();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
