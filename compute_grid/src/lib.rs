extern crate wasm_bindgen;
// extern crate console_error_panic_hook;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use js_sys::Array;

fn count_neighbors(grid: &[Vec<u8>], row: usize, col: usize) -> usize {
    let mut count = 0;

    for i in -1..=1 {
        for j in -1..=1 {
            if i == 0 && j == 0 {
                continue; // Skip the cell itself
            }

            let new_row = (row as i32 + i + grid.len() as i32) as usize % grid.len();
            let new_col = (col as i32 + j + grid[0].len() as i32) as usize % grid[0].len();

            count += grid[new_row][new_col] as usize;
        }
    }

    count
}


#[wasm_bindgen]
pub fn compute_next(grid: &Array) -> Array {
    // console_error_panic_hook::set_once();
    // Convert JsValue to Vec<Vec<u8>>
    let grid: Vec<Vec<u8>> = grid.iter()
        .map(|arr| Array::from(&arr).to_vec().iter().map(|val| val.as_f64().unwrap() as u8).collect())
        .collect();

    let mut next_grid = grid.clone(); // Create a copy to modify in place

    for i in 0..grid.len() {
        for j in 0..grid[0].len() {
            let state = grid[i][j] != 0; // Convert u8 to bool
            let neighbors = count_neighbors(&grid, i, j);

            // Apply Conway's Game of Life rules
            next_grid[i][j] = if state {
                (neighbors == 2 || neighbors == 3) as u8
            } else {
                (neighbors == 3) as u8
            };
        }
    }

    // Convert Vec<Vec<u8>> back to JsValue
    let result: Array = next_grid.into_iter()
    .map(|row| {
        let row_array: Array = row.into_iter().map(JsValue::from).collect();
        JsValue::from(row_array)
    })
    .collect();

    result
}