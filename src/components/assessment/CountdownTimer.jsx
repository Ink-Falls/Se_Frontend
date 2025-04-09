import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import Countdown from 'react-countdown';

const CountdownTimer = ({ timeRemaining, setTimeRemaining, onTimeUp, submissionId }) => {
  const [date, setDate] = useState(Date.now() + timeRemaining * 1000);

  useEffect(() => {
    // Get stored end time or calculate new one
    const storedEndTime = localStorage.getItem(`assessment_end_${submissionId}`);
    const endTime = storedEndTime ? parseInt(storedEndTime) : Date.now() + timeRemaining * 1000;
    
    // Store end time if not already stored
    if (!storedEndTime) {
      localStorage.setItem(`assessment_end_${submissionId}`, endTime.toString());
    }
    
    setDate(endTime);
  }, [submissionId, timeRemaining]);

  const renderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      onTimeUp();
      return <span>Time's up!</span>;
    }

    const isLowTime = minutes === 0 && seconds <= 300;

    return (
      <div
        className={`text-right p-4 rounded-xl backdrop-blur-sm ${
          isLowTime
            ? "bg-red-500/20 border-2 border-red-500/50 animate-pulse"
            : "bg-black/30 border border-white/10"
        }`}
      >
        <div className="flex items-center gap-2 justify-center">
          <Clock className={`w-5 h-5 ${isLowTime ? "text-red-300" : "text-yellow-400"}`} />
          <div className="font-mono text-2xl font-bold tracking-wider">
            <span className={isLowTime ? "text-red-300" : "text-yellow-400"}>
              {String(minutes).padStart(2, '0')}
            </span>
            <span className={`animate-pulse ${isLowTime ? "text-red-300" : "text-yellow-400"}`}>
              :
            </span>
            <span className={isLowTime ? "text-red-300" : "text-yellow-400"}>
              {String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className={`text-sm mt-1 ${isLowTime ? "text-red-200" : "text-gray-300"}`}>
          {isLowTime ? "Time running out!" : "Time remaining"}
        </div>
      </div>
    );
  };

  return (
    <Countdown
      date={date}
      renderer={renderer}
      onComplete={onTimeUp}
      onTick={({ total }) => setTimeRemaining(Math.floor(total / 1000))}
    />
  );
};

export default CountdownTimer;
