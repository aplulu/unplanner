export type Tile = {
    x: number;
    z: number;
    type: number;
    level: number;
    getPoint: () => number;
    getOutput: () => number;
};

export class UnTile implements Tile {
    level: number = 1;
    type: number = 0;
    x: number = 0;
    z: number = 0;
    tiles: Map<string, Tile>;

    constructor(x: number, z: number, type: number, level: number, tiles: Map<string, Tile>) {
        this.level = level;
        this.type = type;
        this.x = x;
        this.z = z;
        this.tiles = tiles;
    }

    getOutput(): number {
        switch (this.type) {
            case 14: { // 伐採所
                let forestCount = 0;
                const adjacnetTiles = this.getAdjacentTiles(this.x, this.z);
                for (let t of adjacnetTiles) {
                    if (t.type === 1) { // 森
                        forestCount++;
                    }
                }
                return forestCount;
            }
        }
        return 0;
    }

    getPoint(): number {
        switch (this.type) {
            case 3: { // 畑
                const adjacnetTiles = this.getAdjacentTiles(this.x, this.z);
                for (let t of adjacnetTiles) {
                    if (t.type === 4) {
                        return 0;
                    }
                }
                return 5;
            }
            case 4: { // 穀物庫
                let total = 0;
                const adjacnetTiles = this.getAdjacentTiles(this.x, this.z);
                for (let t of adjacnetTiles) {
                    if (t.type === 3) {
                        total += 5;
                    }
                }
                return total;
            }
            case 6: { // 市場
                let stationLevel = 0;
                const adjacnetTiles = this.getAdjacentTiles(this.x, this.z);
                for (let t of adjacnetTiles) {
                    if (t.type === 5 && t.level > stationLevel) {
                        stationLevel = t.level;
                    }
                }
                return 2 + (2 * stationLevel);
            }
            case 15: { // 工場
                let wood = 0;
                let hasPower = false;
                const adjacnetTiles = this.getAdjacentTiles(this.x, this.z);
                for (let t of adjacnetTiles) {
                    if (t.type === 14) {
                        wood += t.getOutput();
                    } else if (t.type === 16) { // 風車
                        hasPower = true;
                    }
                }
                return wood * 5 * (hasPower ? 2 : 1);
            }
            default:
                return 0;
        }
    }

    getAdjacentTiles(x: number, z: number): Tile[] {
        const keys = [
            (x - 1) + '_' + (z - 1),
            x + '_' + (z - 1),
            (x + 1) + '_' + (z - 1),

            (x - 1) + '_' + z,
            (x + 1) + '_' + z,

            (x - 1) + '_' + (z + 1),
            x + '_' + (z + 1),
            (x + 1) + '_' + (z + 1),
        ];

        const tiles:Tile[] = [];
        for (let key of keys) {
            const tile = this.tiles.get(key);
            if (tile) {
                tiles.push(tile);
            }
        }

        return tiles;
    }
}