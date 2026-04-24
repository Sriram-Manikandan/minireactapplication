import { useState, useEffect } from "react";

export default function FocusWidget({ tasks }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          setIsBreak((b) => !b);
          return isBreak ? 25 * 60 : 5 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isBreak]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  return (
    <div className="focus-widget">
      {/* Progress Tracker */}
      <div className="progress-section">
        <h3>Today's Progress</h3>
        <p className="progress-count">
          {completed} / {total} tasks completed
        </p>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Focus Timer */}
      <div className="timer-section">
        <h3>{isBreak ? "☕ Break Time" : "🎯 Focus Timer"}</h3>
        <div className="timer-display">{formatTime(timeLeft)}</div>
        <div className="timer-controls">
          <button onClick={() => setIsRunning((r) => !r)}>
            {isRunning ? "Pause" : "Start"}
          </button>
          <button onClick={reset}>Reset</button>
        </div>
        <p className="timer-hint">
          {isBreak ? "Rest for 5 minutes" : "Stay focused for 25 minutes"}
        </p>
      </div>
    </div>
  );
}