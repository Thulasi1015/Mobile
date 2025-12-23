import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { storage } from '../../utils/storage';
// @ts-ignore - Metro resolution will find the correct file
import { OnboardingView } from '../../components/Onboarding/OnboardingView';
import { SLIDES } from '../../components/Onboarding/OnboardingTypes';

export default function OnboardingScreen() {
    const router = useRouter();
    const pagerRef = useRef<any>(null); // Use any to allow both PagerView ref and unused ref on web
    const [pageIndex, setPageIndex] = useState(0);

    const handleComplete = async () => {
        await storage.save('has_seen_onboarding', true);
        router.replace('/auth/login');
    };

    const handleNext = () => {
        if (pageIndex < SLIDES.length - 1) {
            // We delegate the scroll action to the component via props or internal logic?
            // The component handles local scroll if it wants, OR we can try to drive it.
            // But we have different refs.
            // Simplified: The button is inside the component now (in my previous step).
            // So this parent just needs to hold state/logic for completion?
            // Wait, I moved the button INSIDE the component in the previous step to simplify.
            // So handleNext here is only for the "Complete" action if triggered by the last slide?
            // Actually, in the component code I wrote:
            // "handleNextLocal" calls "handleNext()" only when finished.

            // So "handleNext" passed to component essentially means "Finish Onboarding".
            handleComplete();
        }
    };

    // Correction: The component logic I wrote expects "handleNext" to be called when it reaches the end?
    // Let's check the component logic I wrote.
    // Native: button calls handleNext prop directly?
    // <TouchableOpacity style={styles.button} onPress={handleNext}>
    // Native component calls handleNext prop on EVERY click?
    // No, that would be wrong if the logic is in parent.
    // In my native code: onPress={handleNext}. 
    // Parent handleNext: checks index, increments or completes.

    // So Parent MUST handle the increment logic if the button is in the component but onPress calls this.
    // BUT the ref is in the parent.
    // Native: pagerRef.current.setPage(pageIndex + 1).
    // Web: scrollRef is INTERNAL to the component.

    // Issues with my previous "OnboardingView" implementation:
    // Native View uses `pagerRef` passed from props. Parent has the ref. CORRECT.
    // Web View uses `scrollRef` internal. Props `pagerRef` is ignored. CORRECT.
    // Web View `handleNextLocal` calls `scrollRef` locally OR `handleNext` (parent) if done.
    // Native View `handleNext` (prop) is called on click.

    // So, for Native, Parent `handleNext` must do the increment.
    // For Web, Component `handleNextLocal` does the increment, and calls Parent `handleNext` only when done.

    // This is inconsistent interface.
    // Fix:
    // Update `OnboardingView.native.tsx` to handle its own next logic? Or make Parent handle all?
    // Parent can't handle Web scroll easily without forwarding refs/imperative handles.
    // Easiest fix: Let the component handle "Next" internally, and expose "onComplete" prop.
    // But I already wrote the files. I should fix the Parent to adapt to what I wrote or update files.

    // What I wrote:
    // Native: Button onPress={handleNext}. Parent `handleNext` likely expected to do logic.
    // Web: Button onPress={handleNextLocal}. Local does logic, calls `handleNext` only on finish.

    // So:
    // Parent `handleNext` should be:
    // if (Platform.OS === 'web') -> just handleComplete() (because Web component only calls it when done)
    // else -> do standard increment logic using pagerRef.

    // This works!

    if (pageIndex < SLIDES.length - 1) {
        // Only for Native, as Web handles internal scroll and barely calls this, 
        // UNLESS Web calls it on "Get Started"?
        // Web: if (pageIndex < length - 1) scroll; else handleNext().
        // So Web calls this ONLY when finished.

        // Native: onPress={handleNext}.
        // So Native calls this on EVERY step.

        // So:
        // If Native (check via behavior or Platform), increment ref. 
        // If Web, this branch shouldn't be hit IF web component logic is correct.
        // Wait, Web component calls `handleNext` ONLY in `else` block (finish).
        // So on Web, `handleNext` is ONLY "onComplete".

        pagerRef.current?.setPage(pageIndex + 1);
    } else {
        handleComplete();
    }

    // But on Web, pageIndex in Parent state might not update if I didn't pass setPageIndex?
    // I passed setPageIndex. Web component updates it on scroll.
    // So Parent state tracks Web index.
    // When Web is at last index, it calls handleNext().
    // Parent sees index == last.
    // Parent calls handleComplete().
    // Correct.

    // When Native is at index 0. user clicks Next.
    // Parent handleNext called. Index < last.
    // pagerRef.setPage(1).
    // PagerView changes page. onPageSelected updates index to 1.
    // Correct.

    return (
        <OnboardingView
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            handleNext={handleNext}
            pagerRef={pagerRef}
        />
    );
}

