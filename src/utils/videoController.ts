import { Buffer } from './buffer';

type Maybe<T> = T | void;

const SAMPLE_SIZE = 1024;

class AudioController {
    analyser: any
    speedBuffer: Buffer
    volumeBuffer: Buffer
    constructor(video){
        this.analyser = this.initAnalyser(video);
        this.speedBuffer = new Buffer(SAMPLE_SIZE);
        this.volumeBuffer = new Buffer(SAMPLE_SIZE); 
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

export default class VideoController {
    video: HTMLMediaElement
    audioController: Maybe<AudioController>
    constructor(video){
        this.video = video;
        this.video.onplay = () => { 
            this.audioController = 
                this.audioController || new AudioController(this.video);
            console.log('audioController set: ', this.audioController);
            
            this.start(); // start loop when audio controller created
        }
        
        console.log('received video is: ', this.video);
    }

    setSpeed(speed: number){
        this.video.playbackRate = speed;
    }

    loop(){
        if (this.audioController){
            console.log(this.audioController.getVolume())
        } else {
            console.log('no audio controller set');
        }
    }

    start(){
        setInterval(()=>{ this.loop() }, 500)
    }
}