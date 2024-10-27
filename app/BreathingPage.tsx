import React, { useState, useEffect, useRef } from 'react';
import { SizableText, YStack, Button, XStack } from 'tamagui';
import { View, Animated, Easing, TouchableWithoutFeedback, Image } from 'react-native';

const formatTime = timeInSeconds => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const BreathingPage = () => {
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [isBreathHold, setIsBreathHold] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [isRecovery, setIsRecovery] = useState(false);
  const [recoveryTime, setRecoveryTime] = useState(15);
  const [round, setRound] = useState(1);
  const [isFinished, setIsFinished] = useState(false);

  const breathAnim = useRef(new Animated.Value(1)).current;
  const holdInterval = useRef(null);
  const isMounted = useRef(true);
  const isAnimating = useRef(false); // New ref to track animation status

  // Function to animate each breath
  const animateBreath = currentBreathCount => {
    if (!isBreathing || currentBreathCount >= 30) {
      // Transition to breath-hold phase
      setIsBreathing(false);
      setIsBreathHold(true);
      isAnimating.current = false; // Stop further animations
      return;
    }

    isAnimating.current = true;

    const breathDuration = 3160; // 3.16 seconds per breath

    Animated.sequence([
      Animated.timing(breathAnim, {
        toValue: 1.5, // Inhale
        duration: breathDuration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(breathAnim, {
        toValue: 1, // Exhale
        duration: breathDuration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      })
    ]).start(() => {
      const newBreathCount = currentBreathCount + 1;
      setBreathCount(newBreathCount);
      if (isAnimating.current) {
        animateBreath(newBreathCount); // Recursively call with updated count
      }
    });
  };

  // Start the breathing animation when isBreathing is true
  useEffect(() => {
    isMounted.current = true;

    if (isBreathing && !isAnimating.current) {
      setBreathCount(0);
      animateBreath(0);
    }

    return () => {
      isMounted.current = false;
      isAnimating.current = false; // Cleanup animation flag
    };
  }, [isBreathing]);

  // Handle breath-hold phase
  useEffect(() => {
    if (isBreathHold) {
      holdInterval.current = setInterval(() => {
        setHoldTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(holdInterval.current);
    }

    return () => {
      clearInterval(holdInterval.current);
    };
  }, [isBreathHold]);

  // Recovery phase
  useEffect(() => {
    if (isRecovery) {
      setRecoveryTime(15);

      // Add a 2-second buffer before starting the 15-second countdown
      const recoveryStartTimeout = setTimeout(() => {
        const recoveryInterval = setInterval(() => {
          setRecoveryTime(prev => {
            if (prev > 0) {
              return prev - 1;
            } else {
              clearInterval(recoveryInterval);
              setIsRecovery(false);
              setRound(prev => prev + 1);
              setBreathCount(0);
              setHoldTime(0);
              setIsBreathing(true);
              return 0;
            }
          });
        }, 1000);

        return () => clearInterval(recoveryInterval);
      }, 1500); // 2-second buffer

      return () => clearTimeout(recoveryStartTimeout); // Clear timeout if recovery is stopped
    }
  }, [isRecovery]);

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathCount(0);
    setHoldTime(0);
    setIsFinished(false);
  };

  const [lastTap, setLastTap] = useState(null);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // Adjust this delay as needed (300ms is common for double-taps)

    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (isBreathHold) {
        setIsBreathHold(false);
        setHoldTime(0);
        setIsRecovery(true);
      }
    } else {
      // Single tap, start the timer for double-tap detection
      setLastTap(now);
    }
  };

  const finishBreathing = () => {
    setIsBreathing(false);
    setIsBreathHold(false);
    setIsRecovery(false);
    setBreathCount(0);
    setHoldTime(0);
    setRound(1);
    setIsFinished(true);
    isAnimating.current = false; // Stop the animation
  };

  const restartBreathing = () => {
    setIsFinished(false);
    startBreathing();
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <YStack
        flex={1}
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        gap="$5"
        padding="$5"
      >
        {/* When all phases are inactive, show only the Start button */}
        {!isBreathing && !isBreathHold && !isRecovery && !isFinished && (
          <YStack gap="$7" justifyContent="center" alignItems="center">
            <YStack gap='$3' justifyContent='center' alignItems='center'>
            <XStack gap="$2" alignItems="center">
              <SizableText size="$10" fontWeight="bold">
                Welcome to
              </SizableText>
              <SizableText
                size="$10"
                backgroundColor="azure"
                color="darkslategray"
                fontWeight="bold"
              >
                breathx
              </SizableText>
              <SizableText
                size="$10"
                fontWeight="bold"
              >
                🧊
              </SizableText>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <SizableText size="$6" fontWeight="bold">
                programmed by
              </SizableText>
              <SizableText
                size="$6"
                backgroundColor="lavender"
                color="mediumorchid"
                fontWeight="bold"
              >
                jerkgrub
              </SizableText>
              
            </XStack>
            </YStack>
            {/* Add the Image in between the text */}
            <Image
              source={require('../assets/images/lungs.webp')} // Adjust the path to your image
              style={{ width: 100, height: 100 }} // Set the desired size for the image
            />

            <Button onPress={startBreathing}>START BREATHING</Button>
          </YStack>
        )}

        {isFinished && (
          <YStack alignItems="center" gap="$3">
            <SizableText size="$7" fontWeight="bold">
              Good Job!
            </SizableText>
            {/* <SizableText size="$6">Total of {round - 1} rounds</SizableText>
            <SizableText size="$6">Breath held for: {formatTime(holdTime)}</SizableText> */}
            <Button onPress={restartBreathing}>Restart</Button>
          </YStack>
        )}

        {(isBreathing || isBreathHold || isRecovery) && (
          <>
            <XStack gap="$5" justifyContent="center" alignItems="center">
              <SizableText size="$7" fontWeight="bold">
                ROUND {round}
              </SizableText>

              <Button onPress={finishBreathing} theme="red">
                FINISH
              </Button>
            </XStack>

            <SizableText size="$8" fontWeight="600" marginTop="$5">
              {isBreathing
                ? 'TAKE 30 DEEP BREATHS'
                : isBreathHold
                ? 'LET GO AND HOLD'
                : isRecovery
                ? 'TAKE A DEEP BREATH AND HOLD'
                : 'TAKE A DEEP BREATH IN AND HOLD'}
            </SizableText>

            {isBreathing && (
              <Animated.View
                style={{
                  margin: 50,
                  width: 200,
                  height: 200,
                  borderRadius: 20,
                  backgroundColor: 'lightblue',
                  transform: [{ scale: breathAnim }],
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <SizableText style={{ color: 'black' }} size="$9">
                  {breathCount}
                </SizableText>
              </Animated.View>
            )}

            {isBreathHold && (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <View
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 20,
                    backgroundColor: 'whitesmoke',
                    transform: [{ scale: breathAnim }],
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <SizableText style={{ color: 'darkslategray' }} size="$10" fontWeight="600">
                    {formatTime(holdTime)}
                  </SizableText>
                </View>
                <SizableText mt="$5">Tap twice to go into recovery breath</SizableText>
              </View>
            )}

            {isRecovery && (
              <View
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 20,
                  backgroundColor: 'whitesmoke',
                  transform: [{ scale: breathAnim }],
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <SizableText style={{ color: 'darkslategray' }} size="$10" fontWeight="600">
                  {formatTime(recoveryTime)}
                </SizableText>
              </View>
            )}
          </>
        )}
      </YStack>
    </TouchableWithoutFeedback>
  );
};

export default BreathingPage;
