import { Chessboard, type SquareHandlerArgs, type PieceDropHandlerArgs } from 'react-chessboard';
import { useState, useEffect, useRef, useMemo } from 'react';
import { type Square } from 'chess.js';
import { useChessStore } from '../store/chess.ts';
import { useDialogsStore } from '@/store/dialogs.ts';
import { useSoundEffects, useCustomPieces } from '@/hooks';
import { AnalyseTool, PlayerRow } from '@/components';
import { HStack } from '@chakra-ui/react';
import PromotionOverlay from '@/components/PromotionOverlay';

type SquaresStylesType = Partial<Record<Square, React.CSSProperties>>;

const lichessRing = (
    color = '#ff0000',
    stroke = 6,
    sizePct = 95
): React.CSSProperties => {
    const r = 50 - stroke / 2;
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
    // === вытаскиваем только то, что нужно ===
    const position      = useChessStore(s => s.position);
    const turn          = useChessStore(s => s.turn);
    const isCheck       = useChessStore(s => s.isCheck);
    const moves         = useChessStore(s => s.moves);
    const applyMove     = useChessStore(s => s.applyMove);
    const updateData    = useChessStore(s => s.updateData);
    const getGameStatus = useChessStore(s => s.getGameStatus);
    const checkPremove  = useChessStore(s => s.checkPremove);
    const findPiece     = useChessStore(s => s.findPiece);
    const getLastMoveSquares = useChessStore(s => s.getLastMoveSquares);

    const { setDialogWinGame } = useDialogsStore();
    const { playMoveSound, playMoveOpponentSfx, playIllegalSfx } = useSoundEffects();
    const customPieces = useCustomPieces();
    const [animMs, setAnimMs] = useState(300);

    const [moveFrom, setMoveFrom] = useState('');
    const [possibleMovesSquares, setPossibleMovesSquares] = useState<SquaresStylesType>({});
    const [premoveSquares, setPremoveSquares] = useState<SquaresStylesType>({});
    const [premove, setPremove] = useState<{ from: string; to: string } | null>(null);
    const lastMove = getLastMoveSquares(); // { from, to } | null
    const [blinkSquares, setBlinkSquares] = useState<SquaresStylesType>({});

    const lastMoveStyles = useMemo<SquaresStylesType>(() => {
        if (!lastMove) return {};
        return {
            [lastMove.from]: { background: 'rgba(250, 231, 49, 0.8)' },
            [lastMove.to]: { background: 'rgba(250, 231, 49, 0.8)' },
        };
    }, [lastMove?.from, lastMove?.to]);

    // ПКМ кружки
    const [rcSquares, setRcSquares] = useState<SquaresStylesType>({});
    const rightRef = useRef<{ down: boolean; moved: boolean; last: Square | null }>({
        down: false,
        moved: false,
        last: null,
    });

    // ЛКМ замок
    const leftRef = useRef<{ down: boolean; lock: Square | null; selectedOnce: boolean }>({
        down: false,
        lock: null,
        selectedOnce: false,
    });

    // PROMO overlay
    const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square; color: 'w' | 'b' } | null>(null);

    // CPU random
    function makeRandomMove() {
        if (getGameStatus() !== 'playing') return;
        const possible = moves({ verbose: true }) as any[];
        const rnd = possible[Math.floor(Math.random() * possible.length)];
        applyMove({ from: rnd.from, to: rnd.to, promotion: 'q' });
        updateData();
        playMoveOpponentSfx();
    }

    // опции хода
    function getMoveOptions(square: Square) {
        const ms = moves({ square, verbose: true }) as any[];
        if (ms.length === 0) {
            setPossibleMovesSquares({});
            return false;
        }
        const ns: Record<string, React.CSSProperties> = {};
        for (const m of ms) {
            ns[m.to] = {
                backgroundImage: `url(/MonadLogoBlack.svg)`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: m.captured ? '100%' : '50%',
            };
        }
        ns[square] = { background: 'rgba(220, 255, 163, 0.8)' };
        setPossibleMovesSquares(ns);
        return true;
    }

    // promo helpers
    function findLegalMove(from: Square, to: Square) {
        const legal = moves({ square: from as Square, verbose: true }) as any[];
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
    const boardOrientation: 'white' | 'black' = 'white';

    // размеры для overlay
    const squareWidth =
        document.querySelector(`[data-column="a"][data-row="1"]`)
            ?.getBoundingClientRect()?.width ?? 0;

    const promotionSquareLeft = promotionMove?.to
        ? squareWidth * fileToIndex((promotionMove.to as string).match(/^[a-h]/)?.[0] ?? 'a', boardOrientation)
        : 0;

    // выбор фигуры в промо
    function onPromotionPieceSelect(piece: 'q' | 'r' | 'b' | 'n') {
        if (!promotionMove) return;
        try {
            const moveInfo = applyMove({
                from: promotionMove.from,
                to: promotionMove.to,
                promotion: piece,
            });
            updateData();

            setPossibleMovesSquares({});
            setRcSquares({});

            playMoveSound({ moveInfo, isCheck });
            if (getGameStatus() === 'white') setDialogWinGame(true);

            setTimeout(makeRandomMove, 3000);
        } catch {
            // noop
        } finally {
            setPromotionMove(null);
            setMoveFrom('');
        }
    }

    function onSquareClick({ square, piece }: SquareHandlerArgs) {
        setRcSquares({});

        if (!moveFrom && piece) {
            const has = getMoveOptions(square as Square);
            if (has) setMoveFrom(square);
            return;
        }

        const ms = moves({ square: moveFrom as Square, verbose: true }) as any[];
        const ok = ms.find(m => m.from === moveFrom && m.to === square);

        if (!ok) {
            const has = getMoveOptions(square as Square);
            setMoveFrom(has ? square : '');
            return;
        }

        if (isPromotionMove(moveFrom as Square, square as Square)) {
            setPromotionMove({ from: moveFrom as Square, to: square as Square, color: turn });
            return;
        }

        try {
            const moveInfo = applyMove({ from: moveFrom, to: square, promotion: 'q' });
            updateData();

            playMoveSound({ moveInfo, isCheck });
            setPossibleMovesSquares({});

            if (getGameStatus() === 'white') {
                setDialogWinGame(true);
            }
        } catch {
            const has = getMoveOptions(square as Square);
            if (has) setMoveFrom(square);
            return;
        }

        setTimeout(makeRandomMove, 3000);
        setMoveFrom('');
    }

    // DnD
    function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
        if (!targetSquare) return false;

        if (isPromotionMove(sourceSquare as Square, targetSquare as Square)) {
            setPromotionMove({ from: sourceSquare as Square, to: targetSquare as Square, color: turn });
            return true;
        }

        if (turn === 'b') {
            if (checkPremove({ from: sourceSquare, to: targetSquare })) {
                setPremove({ from: sourceSquare, to: targetSquare });
                setPremoveSquares({
                    [sourceSquare]: { background: 'rgba(57, 84, 151, 0.8)' },
                    [targetSquare]: { background: 'rgba(57, 84, 151, 0.8)' },
                });
                return false;
            }
        }

        try {
            const moveInfo = applyMove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
            if (!moveInfo) throw new Error('Invalid move');

            updateData();

            setMoveFrom('');
            setPossibleMovesSquares({});

            playMoveSound({ moveInfo, isCheck });
            setTimeout(makeRandomMove, 3000);

            if (getGameStatus() === 'white') {
                setDialogWinGame(true);
            }
            return true;
        } catch {
            if (targetSquare === sourceSquare) return;
            playIllegalSfx();
            if (isCheck) {
                const sq = findPiece({ color: turn, type: 'k' });
                if (sq) {
                    let count = 0;
                    const id = setInterval(() => {
                        setBlinkSquares(prev =>
                            count % 2 === 0
                                ? { ...prev, [sq]: { background: 'rgba(235, 97, 80, .8)' } }
                                : (() => {
                                    const { [sq]: _, ...rest } = prev;
                                    return rest;
                                })()
                        );
                        count++;
                        if (count > 6) clearInterval(id);
                    }, 250);
                }
            }
            return false;
        }
    }

    const chessboardOptions = {
        onPieceDrop,
        onSquareClick,
        position,
        squareStyles: {
            ...lastMoveStyles,
            ...possibleMovesSquares,
            ...premoveSquares,
            ...rcSquares,
            ...blinkSquares,
        },
        onSquareRightClick: (data: any) => {
            const sq = data?.square as Square | undefined;
            if (!sq) return;
            if (rightRef.current.moved) {
                rightRef.current.moved = false;
                rightRef.current.last = null;
                return;
            }
            setRcSquares(prev => {
                if (prev[sq]) {
                    const { [sq]: _, ...rest } = prev;
                    return rest;
                }
                return {
                    ...prev,
                    [sq]: lichessRing('rgba(235, 97, 80, .8)'),
                };
            });
        },
        onMouseOverSquare: (p: SquareHandlerArgs) => {
            const sq = p.square as Square;

            // ЛКМ: реагируем только на стартовую фигуру
            if (leftRef.current.down) {
                if (leftRef.current.lock == null && p.piece) {
                    leftRef.current.lock = sq;
                    if (!leftRef.current.selectedOnce) {
                        onSquareClick(p);
                        leftRef.current.selectedOnce = true;
                    }
                }
                if (leftRef.current.lock && sq !== leftRef.current.lock) return;
            }

            // ПКМ: детект «стрелки»
            if (rightRef.current.down) {
                if (rightRef.current.last && rightRef.current.last !== sq) {
                    rightRef.current.moved = true;
                }
                rightRef.current.last = sq;
            }
        },
        pieces: customPieces,
        animationDuration: animMs,
        onPieceDragBegin: (e: any) => console.log('drag begin', e),
        darkSquareStyle: { backgroundColor: '#9778B4' },
        lightSquareStyle: { backgroundColor: '#E7DBF0' },
        id: 'click-or-drag-to-move',
    } as const;

    // Премув белых — завязываем ТОЛЬКО на turn и premove (без функций в deps!)
    useEffect(() => {
        if (turn === 'w' && premove) {
            const ms = moves({ square: premove.from as Square, verbose: true }) as any[];
            const ok = ms.find(m => m.from === premove.from && m.to === premove.to);
            if (!ok) {
                setPremove(null);
                setPremoveSquares({});
                return;
            }

            if (isPromotionMove(premove.from as Square, premove.to as Square)) {
                setPromotionMove({ from: premove.from as Square, to: premove.to as Square, color: turn });
                return;
            }

            applyMove({ from: premove.from, to: premove.to, promotion: 'q' });
            setPremove(null);
            setPremoveSquares({});
            updateData();
            if (getGameStatus() === 'white') setDialogWinGame(true);
            setTimeout(makeRandomMove, 3000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [turn, premove]); // ← только эти зависимости

    useEffect(() => {
        setAnimMs(promotionMove ? 0 : 300);
    }, [promotionMove]);

    return (
        <HStack w="1150px" justify={'center'} gap={10}>
            <div className={'my-auto flex flex-col'}>
                <PlayerRow />
                <div
                    onContextMenu={(e) => e.preventDefault()}
                    onPointerDown={(e) => {
                        if (e.button === 2) {
                            rightRef.current = { down: true, moved: false, last: null };
                        }
                        if (e.button === 0) {
                            leftRef.current.down = true;
                            leftRef.current.lock = null;
                            leftRef.current.selectedOnce = false;
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
        </HStack>
    );
};
