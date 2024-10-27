import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TouchableWithoutFeedback, Animated } from 'react-native';
import { SizableText, YStack } from 'tamagui';

const BreathingPage = () => {
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [isBreathHold, setIsBreathHold] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [isRecovery, setIsRecovery] = useState(false);
  const [round, setRound] = useState(1);
  const breathAnim = useRef(new Animated.Value(0)).current;
  const breathInterval = useRef(null);
  const holdInterval = useRef(null);

  // Breathing animation (inhale-exhale)
  useEffect(() => {
    if (isBreathing && breathCount < 30) {
      const breathDuration = 3160; // 5 seconds per breath

      breathInterval.current = setInterval(() => {
        setBreathCount((prev) => prev + 1);
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
      setIsBreathHold(true);
    }

    return () => clearInterval(breathInterval.current);
  }, [isBreathing, breathCount]);

  // Handle breath-hold phase
  useEffect(() => {
    if (isBreathHold) {
      holdInterval.current = setInterval(() => {
        setHoldTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(holdInterval.current);
  }, [isBreathHold]);

  // Recovery phase (after breath-hold)
  useEffect(() => {
    if (isRecovery) {
      const recoveryTimer = setTimeout(() => {
        setIsRecovery(false);
        setRound((prev) => prev + 1);
        setBreathCount(0);
        setIsBreathing(true); // Start new round
      }, 15000); // 15-second recovery

      return () => clearTimeout(recoveryTimer);
    }
  }, [isRecovery]);

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathCount(0);
    setHoldTime(0);
  };

  const handleDoubleTap = () => {
    if (isBreathHold) {
      setIsBreathHold(false);
      setHoldTime(0);
      setIsRecovery(true);
    }
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
      <YStack justifyContent="center" alignItems="center" gap="$5" padding="$5">
        <SizableText size="$7" fontWeight="bold">ROUND {round}</SizableText>

        <SizableText size="$8" fontWeight="600" marginTop="$5">
          {isBreathing ? "TAKE 30 DEEP BREATHS" : isBreathHold ? "LET GO AND HOLD" : "TAKE A DEEP BREATH IN AND HOLD"}
        </SizableText>

        <Animated.View
          style={{
            width: 200,
            height: 200,
            borderRadius: 20,
            backgroundColor: 'lightblue',
            transform: [{ scale: breathAnim }],
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 48 }}>
            {isBreathing ? breathCount : isBreathHold ? holdTime : "0"}
          </Text>
        </Animated.View>

        <Button title="Start" onPress={startBreathing} />
        <Button title="Stop" onPress={stopBreathing} color="red" />
      </YStack>
    </TouchableWithoutFeedback>
  );
};

export default BreathingPage;