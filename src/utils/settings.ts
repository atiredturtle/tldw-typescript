import { VideoControllerSettings, DEFAULT_SETTINGS } from "./videoController";

class SettingsConnector{
    _settings: VideoControllerSettings
    constructor(){
        this._settings = DEFAULT_SETTINGS;
        this._update();
        chrome.storage.onChanged.addListener(() => { this._update() });
    }
    get(){
        return this._settings;
    }
    _update(){
        chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS), (res)=>{
            this._settings = {
                regularSpeed: res.regularSpeed || DEFAULT_SETTINGS.regularSpeed,
                silenceSpeed: res.silenceSpeed || DEFAULT_SETTINGS.silenceSpeed,
                minimumSilenceLen: DEFAULT_SETTINGS.minimumSilenceLen,
            }
        })
        console.log('settings updated to: ', this._settings)
    }
}

export { SettingsConnector };