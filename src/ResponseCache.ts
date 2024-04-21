import { Message } from "./Message";

export class ResponseCache {
    cache: Message[];
    static readonly MAX_CACHE = 5;
    constructor() {
        this.cache = [];
    }
    add(msg: Message) {
        this.cache.push(msg);
        if (this.cache.length > ResponseCache.MAX_CACHE) {
            this.cache.shift();
        }
    }
    get(msg: Message): string[] {
        let result: string[] = [];
        // recent first loop
        for (let aCache of this.cache.reverse()) {
            if (msg.prev > aCache.prev && msg.prev.startsWith(aCache.prev)) {
                for (let expectedPrev of aCache.expectedPrev) {
                    if (expectedPrev.startsWith(msg.prev)) {
                        result.push(expectedPrev.substring(msg.prev.length));
                    }
                }
            } else if (aCache.prev.startsWith(msg.prev)) {
                for (let expectedPrev of aCache.expectedPrev) {
                    result.push(expectedPrev.substring(msg.prev.length));
                }
            }
            if (result.length !=0) return result;
        }
        return result;
    }
}