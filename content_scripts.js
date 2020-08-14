/*
* all-video-progress-bar v2020.0.0.1
*
* */

var doc = document.documentElement,
    barHeight = 4,
    tag = 'all-video-progress-bar';

function offset(element) {
    var rect = element.getBoundingClientRect();
    rect.offsetX = rect.left + window.pageXOffset - doc.clientLeft;
    rect.offsetY = rect.top + window.pageYOffset - doc.clientTop + rect.height;
    rect.duration = element.duration;
    rect.currentTime = element.currentTime;
    rect.secondpx = rect.width / element.duration;
    return rect;
}

const observer = new MutationObserver( list => {
    const found = [];

    for (const { addedNodes } of list) {
        for (const node of addedNodes) {
            if (node.tagName && node.tagName === 'VIDEO') {
                found.push(node);
            }
        }
    }

    if (found.length) {
        addBar();
    }

});

observer.observe(document.querySelector('body'), {
    childList: true,
    subtree: true
});

function addBar() {

    var video = document.querySelectorAll('video');

    for (let i = 0, ic = video.length; i < ic; i++) {

        if (video[i].getAttribute(tag)) {
            continue;
        }

        video[i].setAttribute(tag, true);

        ['progress', 'play', 'loadeddata', 'canplay', 'load'].forEach(event => video[i].addEventListener(event, function () {

            if (video[i].getAttribute(tag + '-load')) {
                return;
            }

            let rect = offset(video[i]);
            if (isNaN(rect.duration)) {
                return;
            }

            video[i].setAttribute(tag + '-load', true);

            let interval;

            var bar = document.createElement(tag);
            bar.setAttribute('style', 'position: absolute; display: block; height: ' + barHeight + 'px; border: 0; background: #FF0000; z-index: 10000;');
            document.body.append(bar);

            let timer = function (time) {

                if (!document.body.contains(video[i])) {
                    if (interval) clearInterval(interval);
                    bar.style.width = '0px';
                    return;
                }

                rect = offset(video[i]);
                bar.style.width = time * rect.secondpx + 'px';
                bar.style.top = (rect.offsetY - barHeight) + 'px';
                bar.style.left = rect.offsetX + 'px';
                bar.style.maxWidth = rect.width + 'px';
            };

            this.addEventListener("abort", function () {
                if (interval) clearInterval(interval);
                bar.style.width = '0px';
            });

            this.addEventListener("mouseover", function () {
                bar.style.display = 'none';
            });

            this.addEventListener("mouseout", function () {
                if (!video[i].paused) {
                    bar.style.display = 'block';
                }
            });

            this.addEventListener("play", function (e) {
                bar.style.display = 'block';
                if (interval) clearInterval(interval);

                let delay = parseInt(rect.duration);
                if (delay < 10) delay = 10;

                interval = setInterval(function () {
                    timer(video[i].currentTime);
                }, delay);
            });

            this.addEventListener("pause", function () {
                if (interval) clearInterval(interval);
                bar.style.display = 'none';
            });

            this.addEventListener("seeking", function () {
                bar.style.width = video[i].currentTime * rect.secondpx + 'px';
            });

            this.dispatchEvent(new Event("play"));

        }, {once: true}));

        video[i].dispatchEvent(new Event('load'));
    }
}

addBar();

