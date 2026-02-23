import { act, renderHook } from "@testing-library/react";
import {
  _resetChordPlaybackForTesting,
  setMuted,
  setPlaying,
  toggleMute,
  useChordPlaybackSnapshot,
} from "./chord-playback-store";

describe("chord-playback-store", () => {
  beforeEach(() => {
    _resetChordPlaybackForTesting();
  });

  it("初期状態は isMuted: false, isPlaying: false", () => {
    const { result } = renderHook(() => useChordPlaybackSnapshot());
    expect(result.current.isMuted).toBe(false);
    expect(result.current.isPlaying).toBe(false);
  });

  it("toggleMute でミュート状態をトグルできる", async () => {
    const { result } = renderHook(() => useChordPlaybackSnapshot());

    await act(async () => {
      toggleMute();
    });
    expect(result.current.isMuted).toBe(true);

    await act(async () => {
      toggleMute();
    });
    expect(result.current.isMuted).toBe(false);
  });

  it("setMuted でミュート状態を直接設定できる", async () => {
    const { result } = renderHook(() => useChordPlaybackSnapshot());

    await act(async () => {
      setMuted(true);
    });
    expect(result.current.isMuted).toBe(true);

    await act(async () => {
      setMuted(false);
    });
    expect(result.current.isMuted).toBe(false);
  });

  it("setPlaying で再生状態を設定できる", async () => {
    const { result } = renderHook(() => useChordPlaybackSnapshot());

    await act(async () => {
      setPlaying(true);
    });
    expect(result.current.isPlaying).toBe(true);

    await act(async () => {
      setPlaying(false);
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it("_resetChordPlaybackForTesting で初期状態に戻る", async () => {
    const { result } = renderHook(() => useChordPlaybackSnapshot());

    await act(async () => {
      setMuted(true);
      setPlaying(true);
    });

    expect(result.current.isMuted).toBe(true);
    expect(result.current.isPlaying).toBe(true);

    await act(async () => {
      _resetChordPlaybackForTesting();
    });

    expect(result.current.isMuted).toBe(false);
    expect(result.current.isPlaying).toBe(false);
  });
});
