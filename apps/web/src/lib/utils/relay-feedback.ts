/**
 * 릴레이 ON/OFF 시 소리 + 진동 피드백
 *
 * 소리 (Web Audio API — 외부 파일 없음):
 *   ON  → 상승음 (440 Hz → 880 Hz)  "켜짐" 느낌
 *   OFF → 하강음 (880 Hz → 440 Hz)  "꺼짐" 느낌
 *
 * 진동 (navigator.vibrate):
 *   ON  → [50, 50, 100]  짧게-쉬고-길게 (이중 탭 느낌)
 *   OFF → [100]          길게 한 번 (전원 종료 느낌)
 */

export function playRelaySound(action: 'on' | 'off'): void {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    if (action === 'on') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.18);
    } else {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.18);
    }

    osc.start(now);
    osc.stop(now + 0.35);
    osc.onended = () => ctx.close();
  } catch {
    // AudioContext 미지원 환경 무시
  }
}

export function vibrateRelay(action: 'on' | 'off'): void {
  if (!navigator.vibrate) return;
  if (action === 'on') {
    navigator.vibrate([50, 50, 100]);
  } else {
    navigator.vibrate([100]);
  }
}
