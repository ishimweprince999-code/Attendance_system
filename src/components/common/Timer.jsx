import React, { useState, useEffect } from 'react';

const Timer = ({ duration, onTimeUp, sessionId }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp(sessionId);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onTimeUp, sessionId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`text-lg font-bold ${
      timeLeft <= 30 ? 'text-red-600' : 'text-green-600'
    }`}>
      Time Left: {formatTime(timeLeft)}
    </div>
  );
};

export default Timer;