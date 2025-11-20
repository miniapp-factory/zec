"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 4;
const INITIAL_TILES = 2;

function createEmptyBoard(): number[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function addRandomTile(board: number[][]): number[][] {
  const emptyCells: [number, number][] = [];
  board.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell === 0) emptyCells.push([r, c]);
    })
  );
  if (emptyCells.length === 0) return board;
  const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = value;
  return newBoard;
}

function transpose(board: number[][]): number[][] {
  return board[0].map((_, i) => board.map(row => row[i]));
}

function reverseRows(board: number[][]): number[][] {
  return board.map(row => [...row].reverse());
}

function slideAndMerge(row: number[]): { newRow: number[]; scoreDelta: number } {
  const nonZero = row.filter(v => v !== 0);
  const merged: number[] = [];
  let scoreDelta = 0;
  for (let i = 0; i < nonZero.length; i++) {
    if (nonZero[i] === nonZero[i + 1]) {
      const mergedVal = nonZero[i] * 2;
      merged.push(mergedVal);
      scoreDelta += mergedVal;
      i++; // skip next
    } else {
      merged.push(nonZero[i]);
    }
  }
  while (merged.length < GRID_SIZE) merged.push(0);
  return { newRow: merged, scoreDelta };
}

function move(board: number[][], direction: "up" | "down" | "left" | "right"): { board: number[][]; scoreDelta: number } {
  let rotated = board;
  if (direction === "up") rotated = transpose(board);
  if (direction === "down") rotated = reverseRows(transpose(board));
  if (direction === "right") rotated = reverseRows(board);

  let scoreDelta = 0;
  const newBoard = rotated.map(row => {
    const { newRow, scoreDelta: delta } = slideAndMerge(row);
    scoreDelta += delta;
    return newRow;
  });

  if (direction === "up") return { board: transpose(newBoard), scoreDelta };
  if (direction === "down") return { board: transpose(reverseRows(newBoard)), scoreDelta };
  if (direction === "right") return { board: reverseRows(newBoard), scoreDelta };
  return { board: newBoard, scoreDelta };
}

export default function Game2048() {
  const [board, setBoard] = useState<number[][]>(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let newBoard = board;
    for (let i = 0; i < INITIAL_TILES; i++) {
      newBoard = addRandomTile(newBoard);
    }
    setBoard(newBoard);
  }, []);

  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    const { board: newBoard, scoreDelta } = move(board, direction);
    if (JSON.stringify(newBoard) === JSON.stringify(board)) return; // no change
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(prev => prev + scoreDelta);
    if (!hasMoves(newBoard)) setGameOver(true);
  };

  const hasMoves = (b: number[][]): boolean => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (b[r][c] === 0) return true;
        if (c < GRID_SIZE - 1 && b[r][c] === b[r][c + 1]) return true;
        if (r < GRID_SIZE - 1 && b[r][c] === b[r + 1][c]) return true;
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {board.flat().map((val, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center h-16 w-16 rounded-md text-2xl font-bold ${
              val === 0
                ? "bg-gray-200 text-gray-500"
                : val <= 4
                ? "bg-orange-200 text-orange-800"
                : val <= 8
                ? "bg-orange-300 text-orange-900"
                : val <= 16
                ? "bg-orange-400 text-orange-900"
                : val <= 32
                ? "bg-orange-500 text-orange-900"
                : val <= 64
                ? "bg-orange-600 text-orange-900"
                : val <= 128
                ? "bg-orange-700 text-orange-900"
                : val <= 256
                ? "bg-orange-800 text-orange-900"
                : val <= 512
                ? "bg-orange-900 text-orange-100"
                : "bg-orange-950 text-orange-100"
            }`}
          >
            {val !== 0 ? val : null}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-semibold">Score: {score}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => handleMove("up")}>
            <ArrowUp />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleMove("left")}>
            <ArrowLeft />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleMove("right")}>
            <ArrowRight />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleMove("down")}>
            <ArrowDown />
          </Button>
        </div>
        {gameOver && (
          <div className="flex flex-col items-center gap-2 mt-4">
            <span className="text-lg font-semibold">Game Over!</span>
            <Share text={`I scored ${score} in 2048! ${url}`} />
          </div>
        )}
      </div>
    </div>
  );
}
