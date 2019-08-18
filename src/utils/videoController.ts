import { Buffer } from './buffer';

type Maybe<T> = T | void;

const SAMPLE_SIZE = 1024;


export default class VideoController {
    analyser: any
    video: HTMLMediaElement
    speedBuffer: Buffer
    volumeBuffer: Buffer
    constructor(video){
        this.video = video;
        this.analyser = undefined;
        this.video.onplay = () => { 
            this.analyser = this.initAnalyser();
        }
        this.speedBuffer = new Buffer(SAMPLE_SIZE);
        this.volumeBuffer = new Buffer(SAMPLE_SIZE);
        
        console.log('received video is: ', this.video);
    }

    initAnalyser(){
        if (this.analyser != undefined) {
            return this.analyser;
        }
        const context = new AudioContext();
        const videoMedia = context.createMediaElementSource(this.video);

        const analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.9; // TODO: see what this is
        analyser.fftSize = 512; // the total samples are half the fft size

        videoMedia.connect(analyser);
        analyser.connect(context.destination)

        return analyser
    }

    setSpeed(speed: number){
        this.video.playbackRate = speed;
    }

    recordTick(){
        // adds info to our buffers
        // this.volumeBuffer.push(this.getVolume());
        // this.speedBuffer.push(0);
    }

    getVolume():Maybe<number>{
        if (!this.analyser) return undefined;

        let soundData = new Uint8Array(this.analyser.fftSize);
        this.analyser.getByteTimeDomainData(soundData);

        let average = 0;
        for (let i = 0; i < soundData.length; i++) {
            const a = Math.abs(soundData[i] - 128);
            average += a;
        }
        return average/50
    }
}