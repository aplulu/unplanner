import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import classes from './PlannerTile.module.scss';
import {TileType, TileTypes} from '../tile/tile_type';
import {Tile} from "../tile/tile";
import {useState} from "react";

type SetTileTypeHandler = (x: number, z: number, type: number, level: number) => void;

type Props = {
    tile: Tile;
    counter: number;
    setTileTypeHandler: SetTileTypeHandler;
};

const PlannerTile = (props: Props) => {
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const open = Boolean(anchorEl);

    const [levelAnchorEl, setLevelAnchorEl] = useState<Element | null>(null);
    const levelOpen = Boolean(levelAnchorEl);

    const tileType:TileType = TileTypes[props.tile.type];

    const handleClick = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLevelClick = (event: React.MouseEvent) => {
        console.log('handleLevelClick', event.currentTarget);
        setLevelAnchorEl(event.currentTarget);
    };
    const handleLevelClose = () => {
        setLevelAnchorEl(null);
    };

    const handleMenuItemClick = (value: number) => (event: React.MouseEvent) => {
        props.setTileTypeHandler(props.tile.x, props.tile.z, value, props.tile.level);
        handleClose();
    };

    const handleChangeLevel = (event: React.ChangeEvent<HTMLInputElement>) => {
        const level = parseInt(event.target.value);
        if (level > 0) {
            props.setTileTypeHandler(props.tile.x, props.tile.z, props.tile.type, level);
        }
    };

    return (
        <React.Fragment>
            <div className={classes.tile} style={{backgroundColor: tileType.color}}>
                <span className={classes.title} onClick={handleClick}>{tileType.name}</span>
                { tileType.type === 5 && <span className={classes.level} onClick={handleLevelClick}>Lv.{props.tile.level}</span> }
                { tileType.hasPoint && <span className={classes.point}>{props.tile.getPoint()}t</span> }
                { tileType.hasOutput && <span className={classes.output}>{props.tile.getOutput()}w</span> }
            </div>
            <Menu
                id="type-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'type-button',
                }}
            >
                { TileTypes.map((type: TileType, index: number) => type.selectable && <MenuItem key={type.type} selected={type.type === props.tile.type} onClick={handleMenuItemClick(type.type)}>{type.name}</MenuItem>)}
            </Menu>
            <Popover open={levelOpen} onClose={handleLevelClose} anchorEl={levelAnchorEl} anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}>
                <Paper>
                    <TextField
                        label="Lv"
                        type="number"
                        value={props.tile.level}
                        onChange={handleChangeLevel}
                        margin="normal"
                        style={{width: '100px'}}
                    />
                </Paper>
            </Popover>
        </React.Fragment>

    )
};
export default PlannerTile;