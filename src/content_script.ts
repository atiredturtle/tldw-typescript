import VideoController from "./utils/videoController";

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.color) {
        console.log('Receive color = ' + msg.color);
        document.body.style.backgroundColor = msg.color;
        sendResponse('Change color to ' + msg.color);
    } else {
        sendResponse('Color message is none.');
    }
});

const video = document.getElementsByTagName('video')[0];

const vc = new VideoController(video);