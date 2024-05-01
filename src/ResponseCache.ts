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
            if (aCache.position.line != msg.position.line) continue;

            let currentLines = msg.prev.split('\n');
            let aCacheLines = aCache.prev.split('\n');
            if (aCacheLines.length != currentLines.length) continue;

            let currentPrevLines = currentLines.slice(0, -1);
            let aCachePrevLines = aCacheLines.slice(0, -1);
            for (let i = 0; i < currentPrevLines.length; i++) {
                if (currentPrevLines[i] != aCachePrevLines[i]) continue;
            }
            console.log('prev lines are same');

            let currentLineLast = currentLines[currentLines.length - 1];
            let aCacheLineLast = aCacheLines[aCacheLines.length - 1];
            let currentLineLastTrim = currentLineLast.trim();
            let aCacheLineLastTrim = aCacheLineLast.trim();
            if (aCacheLineLastTrim.startsWith(currentLineLastTrim)) {
                for (let expectedPrev of aCache.expectedPrev) {
                    console.log('expectedPrev:', expectedPrev);
                    let exptectedPrevTrim = expectedPrev.trim();
                    if (exptectedPrevTrim.startsWith(currentLineLastTrim)) {
                        result.push(exptectedPrevTrim.substring(currentLineLastTrim.length));
                    }
                }
            }
            if (result. length !=0) return result;
        }
        return result;
    }
}