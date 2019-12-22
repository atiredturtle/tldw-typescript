import { Buffer } from './buffer';
import { weightedMedian, arrayAvg, zip, unzip } from './util';
import { SettingsConnector } from './settings';
import * as _ from 'lodash';

type Maybe<T> = T | void;

interface VideoControllerSettings {
    regularSpeed: number;
    silenceSpeed: number;
    minimumSilenceLen: number; // how many mm is an acceptable silence
}
const DEFAULT_SETTINGS : VideoControllerSettings = {
    regularSpeed: 1,
    silenceSpeed: 1,
    minimumSilenceLen: 5,
}

const SAMPLE_SIZE = 1024;
const TICK_DURATION = 10; // in ms

class AudioController {
    analyser: any
    speedBuffer: Buffer
    volumeBuffer: Buffer
    _threshold: number
    _volume: number
    constructor(video, sampleSize: number){
        this.analyser = this._initAnalyser(video);
        this.speedBuffer = new Buffer(sampleSize);
        this.volumeBuffer = new Buffer(sampleSize); 
        this._threshold = 0;
        this._volume = 0;
    }

    _initAnalyser(video){
        const context = new AudioContext();
        const videoMedia = context.createMediaElementSource(video);

        const analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.9; // TODO: see what this is
        analyser.fftSize = 512; // the total samples are half the fft size

        videoMedia.connect(analyser);
        analyser.connect(context.destination)
        return analyser;
    }

    _getVolume():number{
        let soundData = new Uint8Array(this.analyser.fftSize);
        this.analyser.getByteTimeDomainData(soundData);

        let average = 0;
        for (let i = 0; i < soundData.length; i++) {
            const a = Math.abs(soundData[i] - 128);
            average += a;
        }
        return average/50
    }

    _getSilenceThreshold():number{
        const avgVolume = arrayAvg(this.volumeBuffer.get());
        // Volumes and Speeds for all below average volume
        const [cleanVolumes, cleanSpeed]: [number[], number[]] = 
            unzip(
                zip(this.volumeBuffer.get(), this.speedBuffer.get())
                    .filter((t:[number, number]) => t[0] && t[0]<avgVolume)
            );
        if (cleanVolumes === undefined || cleanVolumes.length === 0) return 0; // if no items in buffer, return 0
        return weightedMedian(cleanVolumes, cleanSpeed)
    }

    // run this on each tick
    update(speed: number){
        this._volume = this._getVolume();

        // update buffers (needs to get speed from the VideoController)
        this.speedBuffer.push(speed);
        this.volumeBuffer.push(this._volume);

        this._threshold = this._getSilenceThreshold();
    }

    isSilent():boolean{
        return this._volume < this._threshold;
    }

    getSilenceRatio():number{
        // how far off the silence ratio we are
        const silenceDiff = this._threshold - this._volume;
        return this._threshold === 0 ? 0 : silenceDiff / this._threshold;
    }
}

class VideoController {
    video: HTMLMediaElement
    audioController: Maybe<AudioController>
    settings: VideoControllerSettings
    settingsConnector: SettingsConnector
    _loopInterval: any
    _silenceLen: number
    constructor(video){
        this.video = video;
        this.video.onplay = () => { this.onPlay() };
        this.video.onpause = () => { this.onPause() }; 
        console.log('received video is: ', this.video);
        this.audioController = undefined;
        this._silenceLen = 0;
        this.settingsConnector = new SettingsConnector();
        this.settings = this.settingsConnector.get();
    }

    setSpeed(speed: number){
        // a speed value of exactly 1 causes clicks
        this.video.playbackRate = speed === 1 ? speed+0.1 : speed;
    }
    getSpeed():number{
        return this.video.playbackRate
    }

    onPlay(){
        this.audioController = 
            this.audioController || new AudioController(this.video, SAMPLE_SIZE);
        console.log('audioController set: ', this.audioController);
        
        // start loop interval
        this._loopInterval = setInterval(()=>{ this.loop() }, TICK_DURATION);
    }

    onPause(){
        console.log('onPause called');
        // stops loop running
        clearInterval(this._loopInterval);
    }

    loop(){
        // updates settings
        this.settings = this.settingsConnector.get();
        if (this.audioController){
            this.audioController.update(this.getSpeed());
            const ac = this.audioController;

            const isSilent = ac.isSilent();
            const silenceRatio = ac.getSilenceRatio();

            if (isSilent){
                // increment silence len (for padding)
                this._silenceLen += TICK_DURATION;
                if (this._silenceLen > this.settings.minimumSilenceLen){
                    // interpolate speed
                    const dynamicSpeed = this.settings.regularSpeed + (this.settings.silenceSpeed - this.settings.regularSpeed) * silenceRatio; 
                    this.setSpeed(dynamicSpeed);
                }
            } else{
                this._silenceLen = 0;
                this.setSpeed(this.settings.regularSpeed);
            }
        } else {
            console.log('no audio controller set');
        }
    }
}

export { VideoController, VideoControllerSettings, DEFAULT_SETTINGS }