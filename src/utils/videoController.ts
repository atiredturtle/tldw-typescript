import { Buffer } from './buffer';
import { weightedMedian, arrayAvg, zip, unzip } from './util';

type Maybe<T> = T | void;

const SAMPLE_SIZE = 1024;
const TICK_DURATION = 500; // in ms

class AudioController {
    analyser: any
    speedBuffer: Buffer
    volumeBuffer: Buffer
    constructor(video, sampleSize: number){
        this.analyser = this.initAnalyser(video);
        this.speedBuffer = new Buffer(sampleSize);
        this.volumeBuffer = new Buffer(sampleSize); 
    }

    initAnalyser(video){
        const context = new AudioContext();
        const videoMedia = context.createMediaElementSource(video);

        const analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.9; // TODO: see what this is
        analyser.fftSize = 512; // the total samples are half the fft size

        videoMedia.connect(analyser);
        analyser.connect(context.destination)
        return analyser;
    }

    getVolume():number{
        let soundData = new Uint8Array(this.analyser.fftSize);
        this.analyser.getByteTimeDomainData(soundData);

        let average = 0;
        for (let i = 0; i < soundData.length; i++) {
            const a = Math.abs(soundData[i] - 128);
            average += a;
        }
        return average/50
    }

    getSilenceThreshold():number{
        const avgVolume = arrayAvg(this.volumeBuffer.get());
        console.log('average volume: ', avgVolume)
        // Volumes and Speeds for all below average volume
        const [cleanVolumes, cleanSpeed]:[number[], number[]] = 
            unzip(zip(this.volumeBuffer.get(), this.speedBuffer.get())
            .filter(t => t[0]<avgVolume && t[0]));
        
        return weightedMedian(cleanVolumes, cleanSpeed)
    }

    update(speed: number){
        // update buffers (needs to get speed from the VideoController)
        this.speedBuffer.push(speed);
        this.volumeBuffer.push(this.getVolume());
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

            console.log(ac.getVolume(), ac.getSilenceThreshold())
        } else {
            console.log('no audio controller set');
        }
    }
}