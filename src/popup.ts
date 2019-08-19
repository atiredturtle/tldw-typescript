import * as moment from 'moment';
import * as $ from 'jquery';
import { SettingsConnector } from './utils/settings';

let count = 0;

// $(function() {
//   const queryInfo = {
//     active: true,
//     currentWindow: true
//   };

//   chrome.tabs.query(queryInfo, function(tabs) {
//     $('#url').text(tabs[0].url);
//     $('#time').text(moment().format('YYYY-MM-DD HH:mm:ss'));
//   });

//   chrome.browserAction.setBadgeText({text: count.toString()});
//   $('#countUp').click(()=>{
//     chrome.browserAction.setBadgeText({text: (++count).toString()});
//   });

//   $('#changeBackground').click(()=>{
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, {
//         color: '#555555'
//       },
//       function(msg) {
//         console.log("result message:", msg);
//       });
//     });
//   });

// });

const settingsConnector = new SettingsConnector();
$(()=>{
    const settings = settingsConnector.get();
    // set the popup text to settings
    $('#silenceSpeed').val(settings.silenceSpeed);
    $('#regularSpeed').val(settings.regularSpeed);
})

function saveSettings(){
  const silenceSpeed = $('#silenceSpeed').val()
  const regularSpeed = $('#regularSpeed').val()

  console.log('silenceSpeed: ', silenceSpeed, ' regularSpeed ',  regularSpeed);
  chrome.storage.sync.set({
        silenceSpeed: parseFloat(silenceSpeed as string),
        regularSpeed: parseFloat(regularSpeed as string),
  });
}
 

$('#saveSettings').click(saveSettings);
