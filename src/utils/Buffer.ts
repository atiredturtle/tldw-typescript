class Buffer {
    buffer: number[]
    capacity: number
    constructor(capacity: number){
        this.buffer = new Array();
        this.capacity = capacity;
    }
    
    get():number[]{
        return this.buffer;
    }

    push(element: number){
        // ensure we never have more than capacity length
        if (this.buffer.length < this.capacity){
            this.buffer.push(element);
        } else {
            this.buffer.shift();
            this.buffer.push(element);
        }
        
    }
}

export { Buffer };