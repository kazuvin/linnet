import { act, renderHook } from "@testing-library/react";
import { _resetChordPlaybackForTesting, useChordPlaybackStore } from "./chord-playback-store";

describe("chord-playback-store", () => {
  beforeEach(() => {
    _resetChordPlaybackForTesting();
  });

  it("初期状態は isMuted: false, isPlaying: false", () => {
    const { result } = renderHook(() => useChordPlaybackStore());
    expect(result.current.isMuted).toBe(false);
    expect(result.current.isPlaying).toBe(false);
  });

  it("toggleMute でミュート状態をトグルできる", async () => {
    const { result } = renderHook(() => useChordPlaybackStore());

    await act(async () => {
      useChordPlaybackStore.getState().toggleMute();
    });
    expect(result.current.isMuted).toBe(true);

    await act(async () => {
      useChordPlaybackStore.getState().toggleMute();
    });
    expect(result.current.isMuted).toBe(false);
  });

  it("setMuted でミュート状態を直接設定できる", async () => {
    const { result } = renderHook(() => useChordPlaybackStore());

    await act(async () => {
      useChordPlaybackStore.getState().setMuted(true);
    });
    expect(result.current.isMuted).toBe(true);

    await act(async () => {
      useChordPlaybackStore.getState().setMuted(false);
    });
    expect(result.current.isMuted).toBe(false);
  });

  it("setPlaying で再生状態を設定できる", async () => {
    const { result } = renderHook(() => useChordPlaybackStore());

    await act(async () => {
      useChordPlaybackStore.getState().setPlaying(true);
    });
    expect(result.current.isPlaying).toBe(true);

    await act(async () => {
      useChordPlaybackStore.getState().setPlaying(false);
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it("_resetChordPlaybackForTesting で初期状態に戻る", async () => {
    const { result } = renderHook(() => useChordPlaybackStore());

    await act(async () => {
      useChordPlaybackStore.getState().setMuted(true);
      useChordPlaybackStore.getState().setPlaying(true);
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
