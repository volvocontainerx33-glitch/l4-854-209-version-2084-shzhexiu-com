(function () {
    function setupPlayer(container) {
        var video = container.querySelector('video');
        var button = container.querySelector('.player-start');
        var state = container.querySelector('.player-state');
        var stream = container.getAttribute('data-stream');
        var hls = null;
        var ready = false;
        var loading = false;

        if (!video || !stream) {
            return;
        }

        function setState(text) {
            if (state) {
                state.textContent = text || '';
            }
        }

        function playVideo() {
            container.classList.add('is-playing');
            setState('正在加载');

            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    setState('点击播放');
                    container.classList.remove('is-playing');
                });
            }
        }

        function start() {
            if (loading) {
                return;
            }

            if (ready) {
                playVideo();
                return;
            }

            loading = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    startLevel: -1,
                    capLevelToPlayerSize: true
                });

                hls.loadSource(stream);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    ready = true;
                    loading = false;
                    playVideo();
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        setState('重新连接中');
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        setState('恢复播放中');
                    } else {
                        setState('播放遇到波动');
                        loading = false;
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.addEventListener('loadedmetadata', function () {
                    ready = true;
                    loading = false;
                    playVideo();
                }, { once: true });
                video.load();
            } else {
                video.src = stream;
                ready = true;
                loading = false;
                playVideo();
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        }

        container.addEventListener('click', function (event) {
            if (event.target === video && ready) {
                return;
            }

            start();
        });

        video.addEventListener('playing', function () {
            container.classList.add('is-playing');
            setState('');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                setState('已暂停');
            }
        });

        video.addEventListener('ended', function () {
            setState('播放结束');
            container.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('.js-video-player').forEach(setupPlayer);
})();
