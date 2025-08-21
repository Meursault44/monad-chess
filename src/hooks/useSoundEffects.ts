import useSound from 'use-sound';
import moveSelfSfx from '../sounds/move-self.mp3';
import moveOpponentSfx from '../sounds/move-opponent.mp3';
import captureSfx from '../sounds/capture.mp3';
import illegalSfx from '../sounds/illegal.mp3';
import castleSfx from '../sounds/castle.mp3';
import promoteSfx from '../sounds/promote.mp3';
import moveCheckSfx from '../sounds/move-check.mp3';
import puzzleCorrectSfx from '../sounds/puzzle-correct-2.mp3';
import { type Move } from 'chess.js';

export const useSoundEffects = () => {
  const [playMoveSelfSfx] = useSound(moveSelfSfx, { volume: 0.3 });
  const [playMoveOpponentSfx] = useSound(moveOpponentSfx, { volume: 0.3 });
  const [playCaptureSfx] = useSound(captureSfx, { volume: 0.3 });
  const [playIllegalSfx] = useSound(illegalSfx, { volume: 0.3 });
  const [playCastleSfx] = useSound(castleSfx, { volume: 0.3 });
  const [playPromoteSfx] = useSound(promoteSfx, { volume: 0.3 });
  const [playMoveCheckSfx] = useSound(moveCheckSfx, { volume: 0.3 });
  const [playPuzzleCorrectSfx] = useSound(puzzleCorrectSfx, { volume: 0.3 });

  const playMoveSound = ({ moveInfo, isCheck }: { moveInfo: Move; isCheck: boolean }) => {
    if (moveInfo.promotion) {
      playPromoteSfx();
    } else if (moveInfo.captured) {
      playCaptureSfx();
    } else if (moveInfo.san === 'O-O' || moveInfo.san === 'O-O-O') {
      playCastleSfx();
    } else if (isCheck) {
      playMoveCheckSfx();
    } else {
      playMoveSelfSfx();
    }
  };

  return {
    playMoveSound,
    playMoveOpponentSfx,
    playIllegalSfx,
    playPuzzleCorrectSfx,
  };
};
