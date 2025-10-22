import React, { useState, useEffect } from 'react';

const SessionTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes, seconds] = endTime.split(':').map(Number);
      const end = new Date();
      end.setHours(hours, minutes, seconds, 0);

      if (now > end) {
        return '00:00';
      }

      const diff = end - now;
      const minutesLeft = Math.floor(diff / 60000);
      const secondsLeft = Math.floor((diff % 60000) / 1000);

      return `${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const isWarning = () => {
    const [minutes, seconds] = timeLeft.split(':').map(Number);
    return minutes === 0 && seconds <= 30;
  };

  const isCritical = () => {
    const [minutes, seconds] = timeLeft.split(':').map(Number);
    return minutes === 0 && seconds <= 10;
  };

  return (
    <div className={`text-lg font-bold ${
      isCritical() ? 'text-red-600' :
      isWarning() ? 'text-yellow-600' :
      'text-green-600'
    }`}>
      Time Left: {timeLeft}
    </div>
  );
};

export default SessionTimer;