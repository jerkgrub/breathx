import React from 'react';
import { View, Text } from 'react-native';
import { Button, SizableText, YStack } from 'tamagui';

const WimHofPage = () => {
    return (
        <YStack padding='$5'  justifyContent='center' alignItems='center' gap='$5'>
            <SizableText size="$9">Let's breathe.</SizableText>
            <Button>Start</Button>
        </YStack>
    );
};

export default WimHofPage;
