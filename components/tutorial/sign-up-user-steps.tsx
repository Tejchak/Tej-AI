import Link from "next/link";
import { TutorialStep } from "./tutorial-step";
import { ArrowUpRight } from "lucide-react";

export default function SignUpUserSteps() {
  return (
    <ol className="flex flex-col gap-6">
      <TutorialStep title="Welcome">
        <p>Welcome to the AI Financial Assistant.</p>
        <p className="mt-4">
          This app is deployed at{" "}
          <span className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-medium text-secondary-foreground border">
            https://tej-fhyzq1x0p-tejs-projects-66cab2ec.vercel.app
          </span>
        </p>
        <p className="mt-4">
          Please{" "}
          <Link
            className="text-primary hover:text-foreground"
            href={"/sign-in"}
          >
            sign in
          </Link>{" "}
          to continue.
        </p>
      </TutorialStep>
      <TutorialStep title="Sign up your first user">
        <p>
          Head over to the{" "}
          <Link href="/sign-up" className="text-primary hover:text-foreground">
            Sign Up
          </Link>{" "}
          page to create your first user.
        </p>
      </TutorialStep>
    </ol>
  );
}
