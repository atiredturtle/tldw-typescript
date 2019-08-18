import { Buffer } from './buffer';
import { weightedMedian, arrayAvg, zip, unzip } from './util';

type Maybe<T> = T | void;

const SAMPLE_SIZE = 1024;
const TICK_DURATION = 500; // in ms

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
        const [cleanVolumes, cleanSpeed]:[number[], number[]] = 
            unzip(zip(this.volumeBuffer.get(), this.speedBuffer.get())
            .filter(t => t[0]<avgVolume && t[0]));

        if (cleanVolumes.length === 0) return 0; // if no items in buffer, return 0
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

export default class VideoController {
    video: HTMLMediaElement
    audioController: Maybe<AudioController>
    loopInterval: any
    constructor(video){
        this.video = video;
        this.video.onplay = () => { this.onPlay() };
        this.video.onpause = () => { this.onPause() }; 
        console.log('received video is: ', this.video);
    }

    setSpeed(speed: number){
        this.video.playbackRate = speed;
    }
    getSpeed():number{
        return this.video.playbackRate
    }

    onPlay(){
        this.audioController = 
            this.audioController || new AudioController(this.video, SAMPLE_SIZE);
        console.log('audioController set: ', this.audioController);
        
        // start loop interval
        this.loopInterval = setInterval(()=>{ this.loop() }, TICK_DURATION);
    }

    onPause(){
        console.log('onPause called');
        // stops loop running
        clearInterval(this.loopInterval);
    }

    loop(){
        if (this.audioController){
            this.audioController.update(this.getSpeed());
            const ac = this.audioController;

            const isSilent = ac.isSilent();
            const silenceRatio = ac.getSilenceRatio();

            if (isSilent){
                // increment silence len (for padding)
                // if silence length > time threshold
                // const dynamicSpeed = settings.regularSpeed + (settings.silenceSpeed - settings.regularSpeed)*silenceRatio; 
                // this.setSpeed(dynamicSpeed);
            } else{
                // silence length = 0
                // this.setSpeed(regularSpeed)
            }

        } else {
            console.log('no audio controller set');
        }
    }
}