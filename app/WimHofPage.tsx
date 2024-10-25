import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TouchableWithoutFeedback, Animated } from 'react-native';
import { SizableText, YStack } from 'tamagui';

const WimHofPage = () => {
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [isBreathHold, setIsBreathHold] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [isRecovery, setIsRecovery] = useState(false);
  const [round, setRound] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const breathAnim = useRef(new Animated.Value(0)).current;
  const breathInterval = useRef(null);
  const holdInterval = useRef(null);

  // Breathing animation (inhale-exhale)
  useEffect(() => {
    if (isBreathing && breathCount < 30) {
      const breathDuration = 5000; // 5 seconds per breath (1 inhale, 1 exhale)

      breathInterval.current = setInterval(() => {
        setBreathCount(prev => prev + 1);
        Animated.sequence([
          Animated.timing(breathAnim, {
            toValue: 1, // Inhale
            duration: breathDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(breathAnim, {
            toValue: 0, // Exhale
            duration: breathDuration / 2,
            useNativeDriver: true,
          }),
        ]).start();
      }, breathDuration);

    } else if (breathCount >= 30) {
      clearInterval(breathInterval.current);
      setIsBreathing(false);
      setIsBreathHold(true); // Transition to breath-hold phase
    }

    return () => clearInterval(breathInterval.current);
  }, [isBreathing, breathCount]);

  // Handle breath-hold phase
  useEffect(() => {
    if (isBreathHold) {
      holdInterval.current = setInterval(() => {
        setHoldTime(prev => prev + 1); // Increment hold time every second
      }, 1000);
    }

    return () => clearInterval(holdInterval.current);
  }, [isBreathHold]);

  // Double-tap detection to stop the breath-hold
  const handleDoubleTap = () => {
    if (isBreathHold) {
      setIsBreathHold(false);
      setHoldTime(0); // Reset hold time
      setIsRecovery(true); // Transition to recovery phase
    }
  };

  // Recovery phase: 15 seconds
  useEffect(() => {
    if (isRecovery) {
      const recoveryTimer = setTimeout(() => {
        setIsRecovery(false);
        setRound(prev => prev + 1); // Start new round
        setBreathCount(0);
        setIsBreathing(true); // Automatically restart breathing phase
      }, 15000); // 15-second recovery

      return () => clearTimeout(recoveryTimer);
    }
  }, [isRecovery]);

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathCount(0);
    setHoldTime(0);
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setIsBreathHold(false);
    setIsRecovery(false);
    setBreathCount(0);
    setHoldTime(0);
    setRound(1);
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <YStack padding='$5' justifyContent='center' alignItems='center' gap='$5'>
        <SizableText size="$9">Let's breathe.</SizableText>

        <Animated.View style={{
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: 'blue',
          transform: [{ scale: breathAnim }],
        }} />

        {isBreathing && <Text>Breath: {breathCount}/30</Text>}
        {isBreathHold && <Text>Hold Time: {holdTime}s</Text>}
        {isRecovery && <Text>Recovery Time: 15s</Text>}
        <Text>Round: {round}</Text>

        <Button title="Start" onPress={startBreathing} />
        <Button title="Stop" onPress={stopBreathing} color="red" />
      </YStack>
    </TouchableWithoutFeedback>
  );
};

export default WimHofPage;
