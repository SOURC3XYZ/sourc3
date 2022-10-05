import Step2 from "@components/shared/git-auth/onboarding/step2/step2";
import Step3 from "@components/shared/git-auth/onboarding/step3/step3";
import Step1 from "@components/shared/git-auth/onboarding/step1/step1";

function OnboardingStep() {
    return (
        <div>
            <Step1 />
            <Step2 />
            <Step3 />
        </div>
    );
}

export default OnboardingStep;
