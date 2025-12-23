import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SLIDES } from './OnboardingTypes';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface OnboardingViewProps {
    pageIndex: number;
    setPageIndex: (index: number) => void;
    handleNext: () => void;
    // pagerRef is unused on web but kept for interface consistency if needed, though we use scrollRef locally
    pagerRef: any;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ pageIndex, setPageIndex, handleNext }) => {
    const scrollRef = useRef<ScrollView>(null);

    const onWebScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setPageIndex(roundIndex);
    };

    const handleNextLocal = () => {
        if (pageIndex < SLIDES.length - 1) {
            scrollRef.current?.scrollTo({ x: (pageIndex + 1) * width, animated: true });
            setPageIndex(pageIndex + 1);
        } else {
            handleNext(); // Calls complete
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onWebScroll}
                style={{ flex: 1 }}
            >
                {SLIDES.map((slide) => (
                    <View key={slide.id} style={[styles.page, { width: width }]}>
                        <View style={[styles.iconCircle, { backgroundColor: slide.color }]}>
                            <Ionicons name={slide.icon as any} size={64} color={Colors.white} />
                        </View>
                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.description}>{slide.description}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.dotsContainer}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                { backgroundColor: i === pageIndex ? Colors.primary : Colors.gray[300], width: i === pageIndex ? 20 : 8 }
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleNextLocal}>
                    <Text style={styles.buttonText}>
                        {pageIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <Ionicons
                        name={pageIndex === SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
                        size={20}
                        color={Colors.white}
                        style={{ marginLeft: 8 }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    page: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    iconCircle: {
        width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center',
        marginBottom: 40, shadowColor: Colors.black, shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: Colors.gray[900], marginBottom: 16, textAlign: 'center' },
    description: { fontSize: 16, color: Colors.gray[600], textAlign: 'center', lineHeight: 24 },
    footer: { padding: 20, paddingBottom: 40, justifyContent: 'space-between', alignItems: 'center' },
    dotsContainer: { flexDirection: 'row', marginBottom: 30 },
    dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
    button: {
        backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30,
        flexDirection: 'row', alignItems: 'center', shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    buttonText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
});
