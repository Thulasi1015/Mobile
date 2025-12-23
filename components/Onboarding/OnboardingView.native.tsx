import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import { SLIDES } from './OnboardingTypes';
import { Colors } from '../../constants/Colors';

interface OnboardingViewProps {
    pageIndex: number;
    setPageIndex: (index: number) => void;
    handleNext: () => void;
    pagerRef: React.RefObject<PagerView>;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ pageIndex, setPageIndex, handleNext, pagerRef }) => {
    return (
        <View style={styles.container}>
            <PagerView
                style={styles.pagerView}
                initialPage={0}
                ref={pagerRef}
                onPageSelected={(e) => setPageIndex(e.nativeEvent.position)}
            >
                {SLIDES.map((slide) => (
                    <View key={slide.id} style={styles.page}>
                        <View style={[styles.iconCircle, { backgroundColor: slide.color }]}>
                            <Ionicons name={slide.icon as any} size={64} color={Colors.white} />
                        </View>
                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.description}>{slide.description}</Text>
                    </View>
                ))}
            </PagerView>

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

                <TouchableOpacity style={styles.button} onPress={handleNext}>
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
    pagerView: { flex: 1 },
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
