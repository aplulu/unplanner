import classes from './Planner.module.scss';
import PlannerTile from "./PlannerTile";
import React, {useCallback, useEffect, useState} from "react";
import {Tile, UnTile} from "../tile/tile";
import {Button, Container, Grid} from "@mui/material";

const WIDTH = 12;
const HEIGHT = 12;

const Planner = () => {
    const [tiles, setTiles] = useState<Map<string, Tile>>(new Map<string, Tile>());
    const [counter, setCounter] = useState<number>(0);
    const [tpm, setTpm] = useState<number>(0);
    const [usedTileCount, setUsedTileCount] = useState<number>(0);

    const handleClickClear = () => {
        const map = new Map<string, Tile>();
        for (let z = HEIGHT - 1; z >= 0; z--) {
            for (let x = 0; x < WIDTH; x++) {
                const k = x + '_' + z;
                const t = new UnTile(x, z, 1, 1, map);
                map.set(k, t);
            }
        }
        setTiles(map);
        setTpm(0);
        setUsedTileCount(0);
        setCounter(0);
    };

    const rows = () => {
        const results:JSX.Element[] = [];
        for (let z = HEIGHT - 1; z >= 0; z--) {
            const cols:JSX.Element[] = [];
            for (let x = 0; x < WIDTH; x++) {
                const k = x + '_' + z;
                const tile = tiles.get(k);
                if (tile) cols.push(<PlannerTile counter={counter} key={x} tile={tile} setTileTypeHandler={setTileType}/>);
            }
            results.push(<div key={z} className={classes.row}>{cols}</div>);
        }
        return results;
    }

    const setTileType = (x: number, z: number, type: number, level: number) => {
        const k = x + '_' + z;
        const tile = tiles.get(k);
        if (tile) {
            tile.type = type;
            tile.level = level;
            setCounter(counter + 1);

            let used = 0;
            let value = 0;
            for (let tile of Array.from(tiles.values())) {
                value += tile.getPoint();
                if (tile.type > 1) {
                    used++;
                }
            }
            setTpm(value);
            setUsedTileCount(used);

            const ary = new Uint8Array(WIDTH * HEIGHT * 2);
            let idx = 0;
            for (let z = HEIGHT - 1; z >= 0; z--) {
                for (let x = 0; x < WIDTH; x++) {
                    const k = x + '_' + z;
                    const tile = tiles.get(k);
                    if (tile) {
                        ary[idx] = tile.type;
                        ary[idx + 1] = tile.level;
                    }
                    idx += 2;
                }
            }

            window.history.replaceState(null, '', '#1,' + btoa(String.fromCharCode(...ary)));
        }
    };

    const applyLocation = useCallback(() => {
        if (window.location.hash.length && window.location.hash.indexOf('#1,') === 0) {
            const raw = atob(window.location.hash.substr(3));
            const ary = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) {
                ary[i] = raw.charCodeAt(i);
            }

            let used = 0;
            const map = new Map<string, Tile>();
            let idx = 0;
            for (let z = HEIGHT - 1; z >= 0; z--) {
                for (let x = 0; x < WIDTH; x++) {
                    const k = x + '_' + z;
                    const t = new UnTile(x, z, ary[idx], ary[idx + 1], map);
                    if (ary[idx] > 1) {
                        used++;
                    }
                    map.set(k, t);
                    idx += 2;
                }
            }
            setTiles(map);
            setUsedTileCount(used);

            let value = 0;
            for (let tile of Array.from(map.values())) {
                value += tile.getPoint();
            }
            setTpm(value);
        }
    }, []);

    useEffect(() => {
        const map = new Map<string, Tile>();
        for (let z = HEIGHT; z >= 0; z--) {
            for (let x = 0; x < WIDTH; x++) {
                const k = x + '_' + z;
                const t = new UnTile(x, z, 1, 1, map);
                map.set(k, t);
            }
        }
        setTiles(map);
    }, []);

    useEffect(() => {
        applyLocation();
        window.addEventListener('popstate', applyLocation);
        return () => {
            window.removeEventListener('popstate', applyLocation);
        };
    }, [applyLocation]);

    return (
        <Container>
            <Grid container>
                <Grid item xs={12} style={{textAlign: 'right', marginTop: '20px'}}>
                    <Button variant="outlined" onClick={handleClickClear}>クリア</Button>
                </Grid>
                <Grid item xs={12} md={8}>
                    <div className={classes.container}>
                        {rows()}
                    </div>
                </Grid>
                <Grid item xs={12} md={4}>
                    <div className={classes.statsItem}>
                        <span className={classes.value}>{tpm.toLocaleString()}</span>
                        <span className={classes.label}>徳/分</span>
                    </div>
                    <div className={classes.statsItem}>
                        <span className={classes.value}>{(tpm * 1440).toLocaleString()}</span>
                        <span className={classes.label}>徳/日</span>
                    </div>
                    <div className={classes.statsItem}>
                        <span className={classes.value}>{(usedTileCount > 0 ? tpm / usedTileCount : 0).toLocaleString()}</span>
                        <span className={classes.label}>徳/分/土地</span>
                    </div>
                    <div className={classes.statsItem}>
                        <span className={classes.value}>{(usedTileCount).toLocaleString()}</span>
                        <span className={classes.label}>土地</span>
                    </div>

                    <div className={classes.note}>
                        <p>タイル名をクリックするとタイルの種類を変更する事が出来ます。</p>
                        <p>駅などのレベルの増減はレベルをクリックで変更する事が出来ます。</p>
                        <p>URLを他の人と共有するとタイルの状態も共有されます。</p>
                    </div>
                </Grid>
            </Grid>
        </Container>

    );
};
export default Planner;