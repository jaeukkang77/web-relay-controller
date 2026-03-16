/**
 * 릴레이 ON/OFF 시 소리 + 진동 피드백
 *
 * 소리:
 *   ON  → /sound-on.mp3
 *   OFF → /sound-off.mp3
 *
 * 진동 (navigator.vibrate):
 *   ON  → [50, 50, 100]  짧게-쉬고-길게 (이중 탭 느낌)
 *   OFF → [100]          길게 한 번 (전원 종료 느낌)
 */

export function playRelaySound(action: 'on' | 'off'): void {
  try {
    const audio = new Audio(action === 'on' ? '/sound-on.mp3' : '/sound-off.mp3');
    audio.play().catch(() => { /* 자동재생 차단 등 무시 */ });
  } catch {
    // Audio 미지원 환경 무시
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
