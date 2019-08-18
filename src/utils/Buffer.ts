class Buffer {
    buffer: number[]
    constructor(size){
        this.buffer = new Array(size).fill(0);
    }
    
    push(element: number){
        this.buffer.shift();
        this.buffer.push(element);
    }
}

export { Buffer };