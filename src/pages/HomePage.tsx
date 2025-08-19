import { Chessboard, type SquareHandlerArgs, type PieceDropHandlerArgs } from 'react-chessboard';
import { useState, useEffect, useRef } from 'react';
import { type Square } from 'chess.js'
import { useChessStore } from "../store/chess.ts";
import { useDialogsStore } from "@/store/dialogs.ts";
import { useSoundEffects, useCustomPieces } from '@/hooks'
import { AnalyseTool, PlayerRow } from "@/components";
import { HStack } from "@chakra-ui/react";
import PromotionOverlay from '@/components/PromotionOverlay';

type SquaresStylesType = Partial<Record<Square, React.CSSProperties>>;

const lichessRing = (
    color = '#ff0000',  // цвет обводки
    stroke = 6,         // толщина обводки в px
    sizePct = 95        // диаметр круга относительно клетки (в %)
): React.CSSProperties => {
    const r = 50 - (stroke / 2); // радиус с учётом stroke, чтобы круг не «срезало»
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" shape-rendering="geometricPrecision">
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" />
  </svg>`;
    return {
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: `${sizePct}% ${sizePct}%`,
    };
};

export const HomePage = () => {
    const chessGame = useChessStore();
    const { setDialogWinGame } = useDialogsStore();
    const { playMoveSound, playMoveOpponentSfx, playIllegalSfx } = useSoundEffects();
    const customPieces = useCustomPieces();

    const [moveFrom, setMoveFrom] = useState('');
    const [possibleMovesSquares, setPossibleMovesSquares] = useState<SquaresStylesType>({});
    const [optionSquares, setOptionSquares] = useState<SquaresStylesType>({});
    const [premoveSquares, setPremoveSquares] = useState<SquaresStylesType>({});
    const [premove, setPremove] = useState<{ from: string, to: string } | null>(null);

    // ✅ клетки, покрашенные правым кликом
    const [rcSquares, setRcSquares] = useState<SquaresStylesType>({});

    // ✅ трекинг правой кнопки (для отсева стрелок)
    const rightRef = useRef<{ down: boolean; moved: boolean; last: Square | null }>({
        down: false,
        moved: false,
        last: null,
    });

    // ✅ трекинг левой кнопки (взамен прежнего isDown)
    const leftRef = useRef<{ down: boolean; lock: Square | null; selectedOnce: boolean }>({
        down: false,
        lock: null,          // квадрат, по которому первоначально зажали ЛКМ
        selectedOnce: false, // чтобы onSquareClick вызвался один раз
    });

    // === PROMOTION overlay (как в примере react-chessboard) ===
    const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square; color: 'w'|'b' } | null>(null);

    // make a random "CPU" move
    function makeRandomMove() {
        if (chessGame.getGameStatus() !== 'playing') {
            return;
        }
        const possibleMoves = chessGame.moves({ verbose: true });
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        chessGame.move({ from: randomMove.from, to: randomMove.to, promotion: 'q' });
        chessGame.updateData();

        playMoveOpponentSfx();
        setOptionSquares({
            [randomMove.from]: { background: 'rgba(250, 231, 49, 0.8)' },
            [randomMove.to]: { background: 'rgba(250, 231, 49, 0.8)' },
        });
    }

    // get the move options for a square to show valid moves
    function getMoveOptions(square: Square) {
        const moves = chessGame.moves({ square, verbose: true });

        if (moves.length === 0) {
            setPossibleMovesSquares({});
            return false;
        }

        const newSquares: Record<string, React.CSSProperties> = {};
        for (const move of moves) {
            newSquares[move.to] = {
                backgroundImage: `url(/MonadLogoBlack.svg)`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: move.captured ? '100%' : '50%',
            };
        }

        newSquares[square] = { background: 'rgba(220, 255, 163, 0.8)' };
        setPossibleMovesSquares(newSquares);
        return true;
    }

    // ===== Helpers для промо =====
    function findLegalMove(from: Square, to: Square) {
        const legal = chessGame.moves({ square: from as Square, verbose: true }) as any[];
        return legal.find(m => m.from === from && m.to === to);
    }
    function isPromotionMove(from: Square, to: Square) {
        const found = findLegalMove(from, to);
        return Boolean(found && typeof found.flags === 'string' && found.flags.includes('p'));
    }
    function fileToIndex(file: string, orientation: 'white' | 'black' = 'white') {
        const idx = Math.max(0, Math.min(7, file.charCodeAt(0) - 'a'.charCodeAt(0)));
        return orientation === 'white' ? idx : 7 - idx;
    }
    const boardOrientation: 'white' | 'black' = 'white'; // если появится ориентация — подставь реальную

    // ширина клетки + смещение для столбца целевой клетки (как в примере)
    const squareWidth =
        document.querySelector(`[data-column="a"][data-row="1"]`)
            ?.getBoundingClientRect()?.width ?? 0;

    const promotionSquareLeft = promotionMove?.to
        ? squareWidth * fileToIndex((promotionMove.to as string).match(/^[a-h]/)?.[0] ?? 'a', boardOrientation)
        : 0;

    // выбрать фигуру для промо
    function onPromotionPieceSelect(piece: 'q'|'r'|'b'|'n') {
        if (!promotionMove) return;
        try {
            const moveInfo = chessGame.move({
                from: promotionMove.from,
                to: promotionMove.to,
                promotion: piece
            });
            chessGame.updateData();

            // очистка подсказок/кружков и подсветка последнего хода
            setPossibleMovesSquares({});
            setRcSquares({});
            setOptionSquares({
                [promotionMove.from]: { background: 'rgba(250, 231, 49, 0.8)' },
                [promotionMove.to]:   { background: 'rgba(250, 231, 49, 0.8)' },
            });

            playMoveSound({ moveInfo, isCheck: chessGame.isCheck });
            if (chessGame.getGameStatus() === 'white') setDialogWinGame(true);

            setTimeout(makeRandomMove, 3000);
        } catch (e) {
            // noop
        } finally {
            setPromotionMove(null);
            setMoveFrom('');
        }
    }

    function onSquareClick({ square, piece }: SquareHandlerArgs) {
        setRcSquares({});

        if (!moveFrom && piece) {
            const hasMoveOptions = getMoveOptions(square as Square);
            if (hasMoveOptions) setMoveFrom(square);
            return;
        }

        const moves = chessGame.moves({ square: moveFrom as Square, verbose: true });
        const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

        if (!foundMove) {
            const hasMoveOptions = getMoveOptions(square as Square);
            setMoveFrom(hasMoveOptions ? square : '');
            return;
        }

        // перехват промо-хода: откроем оверлей и выходим
        if (isPromotionMove(moveFrom as Square, square as Square)) {
            setPromotionMove({ from: moveFrom as Square, to: square as Square, color: chessGame.turn });
            return;
        }

        try {
            const moveInfo = chessGame.move({ from: moveFrom, to: square, promotion: 'q' });
            chessGame.updateData();

            playMoveSound({ moveInfo, isCheck: chessGame.isCheck });

            const newSquares: Record<string, React.CSSProperties> = {};
            newSquares[moveFrom] = { background: 'rgba(250, 231, 49, 0.8)' };
            newSquares[square] = { background: 'rgba(250, 231, 49, 0.8)' };
            setPossibleMovesSquares({});
            setOptionSquares(newSquares);

            if (chessGame.getGameStatus() === 'white') {
                setDialogWinGame(true);
            }
        } catch {
            const hasMoveOptions = getMoveOptions(square as Square);
            if (hasMoveOptions) setMoveFrom(square);
            return;
        }

        setTimeout(makeRandomMove, 3000);
        setMoveFrom('');
    }

    // handle piece drop
    function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
        if (!targetSquare) return false;

        // промо при dnd: показываем оверлей и не двигаем сразу (как в примере)
        if (isPromotionMove(sourceSquare as Square, targetSquare as Square)) {
            setPromotionMove({ from: sourceSquare as Square, to: targetSquare as Square, color: chessGame.turn });
            return true; // чтобы не было лишней анимации snapback
        }

        if (chessGame.turn === 'b') {
            if (chessGame.checkPremove({ from: sourceSquare, to: targetSquare })) {
                setPremove({ from: sourceSquare, to: targetSquare });
                setPremoveSquares({
                    [sourceSquare]: { background: 'rgba(57, 84, 151, 0.8)' },
                    [targetSquare]: { background: 'rgba(57, 84, 151, 0.8)' },
                });
                return false;
            }
        }

        try {
            const moveInfo = chessGame.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
            chessGame.updateData();

            setMoveFrom('');
            setPossibleMovesSquares({});

            const newSquares: Record<string, React.CSSProperties> = {};
            newSquares[sourceSquare] = { background: 'rgba(250, 231, 49, 0.8)' };
            newSquares[targetSquare] = { background: 'rgba(250, 231, 49, 0.8)' };
            setOptionSquares(newSquares);

            playMoveSound({ moveInfo, isCheck: chessGame.isCheck });
            setTimeout(makeRandomMove, 3000);

            if (chessGame.getGameStatus() === 'white') {
                setDialogWinGame(true);
            }
            return true;
        } catch {
            playIllegalSfx()
            if (chessGame.isCheck) {
                const sq = chessGame.findPiece({
                    color: chessGame.turn,
                    type: 'k'
                }); // король того, кто сейчас под шахом
                if (sq) {
                    // мигать 3 раза
                    let count = 0;
                    const interval = setInterval(() => {
                        setOptionSquares(prev => {
                            const active = count % 2 === 0;
                            return {
                                ...prev,
                                [sq]: active ? { background: 'rgba(235, 97, 80, .8)' } : {}
                            };
                        });
                        count++;
                        if (count > 6) clearInterval(interval); // 3 мигания
                    }, 250);
                }
            }
            return false;
        }
    }
    console.log(rcSquares)

    const chessboardOptions = {
        onPieceDrop,
        onSquareClick,
        position: chessGame.position,
        // 👇 добавили rcSquares
        squareStyles: { ...optionSquares, ...possibleMovesSquares, ...premoveSquares, ...rcSquares },

        // Правый клик: красим только при «чистом» клике (не при рисовании стрелки)
        onSquareRightClick: (data) => {
            const sq = data?.square;
            if (rightRef.current.moved) {
                // был драг для стрелки — игнорим
                rightRef.current.moved = false;
                rightRef.current.last = null;
                return;
            }
            setRcSquares(prev => {
                if (prev[sq]) {
                    const { [sq]: _, ...rest } = prev;
                    return rest; // повторный клик снимает подсветку
                }
                return {
                    ...prev,
                    [sq]: lichessRing('rgba(235, 97, 80, .8)'),
                };
            });
        },

        // Логика ховера: если зажата левая — проксируем твой onSquareClick (drag-to-move)
        onMouseOverSquare: (p: SquareHandlerArgs) => {
            const sq = p.square as Square;

            // --- ЛЕВАЯ КНОПКА: реагируем только на «стартовую» фигуру ---
            if (leftRef.current.down) {
                // если «старт» ещё не зафиксирован и тут есть фигура — закрепим квадрат
                if (leftRef.current.lock == null && p.piece) {
                    leftRef.current.lock = sq;

                    // вызовем onSquareClick ровно один раз — чтобы выбрать эту фигуру
                    if (!leftRef.current.selectedOnce) {
                        onSquareClick(p);
                        leftRef.current.selectedOnce = true;
                    }
                }

                // если уже закрепили старт, игнорируем ховеры по другим клеткам
                if (leftRef.current.lock && sq !== leftRef.current.lock) {
                    return;
                }

                // остаёмся над тем же квадратом — ничего больше не делаем
                // (само перемещение выполнится через onPieceDrop)
            }

            // --- ПРАВАЯ КНОПКА: детект «стрелки» ---
            if (rightRef.current.down) {
                if (rightRef.current.last && rightRef.current.last !== sq) {
                    rightRef.current.moved = true;
                }
                rightRef.current.last = sq;
            }
        },
        pieces: customPieces,
        onPieceDragBegin: (e) => console.log('drag begin', e),
        darkSquareStyle: { backgroundColor: '#9778B4' },
        lightSquareStyle: { backgroundColor: '#E7DBF0' },
        id: 'click-or-drag-to-move',
    };

    useEffect(() => {
        if (chessGame.turn === 'w' && premove) {
            const moves = chessGame.moves({ square: premove.from as Square, verbose: true });
            const foundMove = moves.find(m => m.from === premove.from && m.to === premove.to);
            if (!foundMove) {
                setPremove(null);
                setPremoveSquares({});
                return;
            }

            if (isPromotionMove(premove.from as Square, premove.to as Square)) {
                setPromotionMove({ from: premove.from as Square, to: premove.to as Square, color: chessGame.turn });
                return;
            }

            chessGame.move({ from: premove.from, to: premove.to, promotion: 'q' });
            setOptionSquares({
                [premove.from]: { background: 'rgba(250, 231, 49, 0.8)' },
                [premove.to]: { background: 'rgba(250, 231, 49, 0.8)' },
            });
            setPremove(null);
            setPremoveSquares({});
            chessGame.updateData();
            if (chessGame.getGameStatus() === 'white') {
                setDialogWinGame(true);
            }
            setTimeout(makeRandomMove, 3000);
        }
    }, [chessGame.turn, premove, setPremove, chessGame.move, chessGame.updateData]);

    return (
        <HStack w="1150px" justify={'center'} gap={10}>
            <div className={'my-auto flex flex-col'}>
                <PlayerRow />

                {/* ➕ Обёртка: выключаем контекст-меню и тречим состояние кнопок мыши */}
                <div
                    onContextMenu={(e) => e.preventDefault()}
                    onPointerDown={(e) => {
                        if (e.button === 2) {
                            rightRef.current = { down: true, moved: false, last: null };
                        }
                        if (e.button === 0) {
                            leftRef.current.down = true;
                            leftRef.current.lock = null;         // сброс «закреплённого» квадрата
                            leftRef.current.selectedOnce = false;// и флага одиночного select
                        }
                    }}
                    onPointerUp={(e) => {
                        if (e.button === 2) {
                            rightRef.current.down = false;
                            rightRef.current.last = null;
                        }
                        if (e.button === 0) {
                            leftRef.current.down = false;
                            leftRef.current.lock = null;
                            leftRef.current.selectedOnce = false;
                        }
                    }}
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        position: 'relative',
                        margin: '10px auto',
                    }}
                >
                    <Chessboard options={chessboardOptions} />
                    <PromotionOverlay
                        move={promotionMove}
                        left={promotionSquareLeft}
                        squareWidth={squareWidth}
                        pieces={customPieces as any}
                        onSelect={onPromotionPieceSelect}
                        onClose={() => {
                            // логика «отмены» как у тебя в CloseButton
                            setPremove(null);
                            setPremoveSquares({});
                            setPossibleMovesSquares({});
                            setPromotionMove(null);
                        }}
                    />
                </div>

                <PlayerRow />
            </div>
            <AnalyseTool />

            {/* === PROMOTION OVERLAY (Tailwind, как в примере react-chessboard) === */}
        </HStack>
    );
}
