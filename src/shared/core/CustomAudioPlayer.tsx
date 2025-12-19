"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { BsFillVolumeMuteFill } from "react-icons/bs";
import { FaPause, FaPlay } from "react-icons/fa6";
import {
  HiMiniArrowUturnLeft,
  HiMiniArrowUturnRight,
  HiSpeakerWave
} from "react-icons/hi2";
import { CircularProgress } from "@mui/material";

interface AudioPlayerProps {
  src: string;
  muteBtn: boolean;
  speedBtn: boolean;
}

const CustomAudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  muteBtn,
  speedBtn
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [buffered, setBuffered] = useState<TimeRanges | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isBuffering) {
      return;
    }

    if (currentTime >= duration && !isPlaying) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Handle error
            setIsPlaying(false);
          });
      }
    }
  }, [isPlaying, isBuffering, currentTime, duration]);

  const skipTime = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio || isBuffering) {
        return;
      }

      const newTime = Math.min(
        Math.max(audio.currentTime + seconds, 0),
        duration
      );
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [isBuffering, duration]
  );

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !isDragging) {
      setCurrentTime(audio.currentTime);
      setBuffered(audio.buffered);

      if (audio.currentTime >= duration) {
        setIsPlaying(false);
      }
    }
  }, [isDragging, duration]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
      setIsLoading(false);
    }
  }, []);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      const newTime = Number(e.target.value);

      if (newTime >= duration) {
        setCurrentTime(duration);
        setIsPlaying(false);
        if (audio) {
          audio.currentTime = duration;
        }
        return;
      }

      setCurrentTime(newTime);

      if (!isDragging && audio) {
        audio.currentTime = newTime;
        setIsBuffering(true);
      }
    },
    [isDragging, duration]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.min(currentTime, duration);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      setIsBuffering(true);
    }
    setIsDragging(false);
  }, [currentTime, duration]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressContainerRef.current || isBuffering) {
        return;
      }

      const rect = progressContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.min(Math.max(x / width, 0), 1);
      const time = percentage * duration;

      setHoverPosition({ x, y: rect.top });
      setHoverTime(time);
    },
    [duration, isBuffering]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
    setHoverPosition(null);
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  const handlePlaybackSpeed = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isBuffering) {
      return;
    }

    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length] ?? 1;

    setPlaybackSpeed(nextSpeed);
    audio.playbackRate = nextSpeed;
  }, [playbackSpeed, isBuffering]);

  const getBufferedWidth = useMemo(() => {
    if (!buffered || !duration) {
      return 0;
    }

    let width = 0;
    for (let i = 0; i < buffered.length; i++) {
      if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
        width = (buffered.end(i) / duration) * 100;
        break;
      }
    }
    return width;
  }, [buffered, duration, currentTime]);

  const progressPercentage = useMemo(
    () => (duration > 0 ? (currentTime / duration) * 100 : 0),
    [currentTime, duration]
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isBuffering) {
      return;
    }

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted, isBuffering]);

  return (
    <div className="shadow-1 flex h-fit w-full flex-col rounded-lg bg-white py-2 drop-shadow-1 dark:bg-gray-800 md:flex-row md:items-center md:gap-2 md:py-0">
      <div className="flex items-center justify-center gap-1 border-r border-gray-200 py-3 dark:border-gray-700 md:w-[30%] lg:w-[25%] xl:w-[20%] 2xl:w-[14%]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => skipTime(-10)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              skipTime(-10);
            }
          }}
          className={`group relative ${
            isBuffering ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          <HiMiniArrowUturnLeft className="text-2xl text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-300 dark:group-hover:text-gray-100" />
          <span className="absolute left-0 top-2.5 text-[0.6rem] font-semibold tracking-wider text-gray-600 dark:text-gray-400">
            10
          </span>
        </div>
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="dark:bg-primary-dark relative mx-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition-colors disabled:bg-gray-300"
        >
          {isLoading || isBuffering ? (
            <CircularProgress size={20} className="text-xl text-primary" />
          ) : isPlaying ? (
            <FaPause className="text-xl" />
          ) : (
            <FaPlay className="pl-0.5 text-xl" />
          )}
        </button>
        <div
          role="button"
          tabIndex={0}
          onClick={() => skipTime(10)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              skipTime(10);
            }
          }}
          className={`group relative ${
            isBuffering ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          <HiMiniArrowUturnRight className="text-2xl text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-300 dark:group-hover:text-gray-100" />
          <span className="absolute right-0 top-2.5 text-[0.6rem] font-semibold tracking-wider text-gray-600 dark:text-gray-400">
            10
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 items-center gap-3 px-3">
        <span className="min-w-12 text-center font-medium text-gray-500 dark:text-gray-300">
          {formatTime(currentTime)}
        </span>

        <div ref={progressContainerRef} className="relative flex-1">
          {/* Hover Time Tooltip */}
          {hoverTime !== null && hoverPosition !== null && (
            <div
              className="absolute z-20 flex -translate-x-1/2 flex-col items-center"
              style={{
                left: `${hoverPosition.x}px`,
                bottom: "20px"
              }}
            >
              <div className="rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg dark:bg-gray-700">
                {formatTime(hoverTime)}
              </div>
              <div className="-mb-2 -mt-1.5 h-2 w-2 rotate-45 bg-gray-800 dark:bg-gray-700" />
            </div>
          )}

          {/* Progress Bar */}
          <div
            ref={progressBarRef}
            className="group relative h-2 w-full cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Buffered Progress */}
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gray-300 transition-all duration-300 ease-in-out dark:bg-gray-600"
              style={{ width: `${getBufferedWidth}%` }}
            />

            {/* Played Progress */}
            <div
              className="dark:bg-primary-dark absolute left-0 top-0 h-full rounded-full bg-[#3c50e0] transition-all duration-300 ease-in-out"
              style={{
                width: `${progressPercentage}%`,
                opacity: isBuffering ? 0.5 : 1
              }}
            />

            {/* Loading Animation */}
            {(isLoading || isBuffering) && (
              <div
                className="animate-progress-loading absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-transparent via-white to-transparent dark:via-gray-500"
                style={{ width: `${getBufferedWidth}%` }}
              />
            )}

            {/* Progress Handle */}
            <div
              className={`dark:bg-primary-dark absolute top-1/2 h-5 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#3c50e0] shadow-lg transition-opacity group-hover:scale-110 dark:border-gray-800 ${
                isBuffering ? "opacity-50" : "opacity-100"
              }`}
              style={{
                left: `${progressPercentage}%`
              }}
            />

            {/* Range Input */}
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              onMouseDown={handleDragStart}
              onMouseUp={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchEnd={handleDragEnd}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              disabled={isBuffering}
            />
          </div>
        </div>

        <span className="min-w-[48px] text-center font-medium text-gray-500 dark:text-gray-300">
          {formatTime(duration)}
        </span>

        {speedBtn && (
          <button
            onClick={handlePlaybackSpeed}
            disabled={isBuffering}
            className={`ml-2 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 ${
              isBuffering ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            {playbackSpeed}x
          </button>
        )}

        {muteBtn && (
          <button
            onClick={toggleMute}
            disabled={isBuffering}
            className={`ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 ${
              isBuffering ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {isMuted ? (
              <BsFillVolumeMuteFill className="text-2xl" />
            ) : (
              <HiSpeakerWave className="text-xl" />
            )}
          </button>
        )}
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleTimeUpdate}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsLoading(false);
        }}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onStalled={() => setIsBuffering(true)}
        onSeeked={() => setIsBuffering(false)}
        onEnded={handleEnded}
      >
        <track kind="captions" />
      </audio>
    </div>
  );
};

export default CustomAudioPlayer;
