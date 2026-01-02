import { z } from "zod";
import { prisma } from "@/lib/db";
import { sessionManager } from "@/lib/session";
import { getSearchParams } from "@/lib/context";
import { parseFormData, htmxRedirect, type FormState } from "@/lib/form";
import { Button } from "@/components/mwm-ui/button";
import { Input } from "@/components/mwm-ui/input";
import { Label } from "@/components/mwm-ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/mwm-ui/card";
import { FieldError } from "@/components/field-error";
import { GlobalError } from "@/components/global-error";

// Zod schema for sign-in form validation
const signInSchema = z.object({
  email: z.email({ error: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  returnUrl: z.string().optional().default("/"),
});

type SignInData = z.infer<typeof signInSchema>;
type SignInFormState = FormState<SignInData> & { returnUrl?: string };

export async function POST(req: Request) {
  const formData = await req.formData();
  const returnUrl = (formData.get("returnUrl") as string) || "/";

  // Validate with Zod
  const result = parseFormData(signInSchema, formData);

  if (!result.success) {
    return (
      <SignInForm
        values={{ email: formData.get("email") as string }}
        fieldErrors={result.fieldErrors}
        returnUrl={returnUrl}
      />
    );
  }

  const { email, password } = result.data;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: { credentials: true },
  });

  if (!user || !user.credentials) {
    return (
      <SignInForm
        values={{ email }}
        globalError="Invalid email or password"
        returnUrl={returnUrl}
      />
    );
  }

  // Verify password using Bun.password.verify
  const isValidPassword = await Bun.password.verify(
    password,
    user.credentials.hashedPassword
  );

  if (!isValidPassword) {
    return (
      <SignInForm
        values={{ email }}
        globalError="Invalid email or password"
        returnUrl={returnUrl}
      />
    );
  }

  // Check if user is active
  if (!user.isActive) {
    return (
      <SignInForm
        values={{ email }}
        globalError="Your account has been deactivated"
        returnUrl={returnUrl}
      />
    );
  }

  // Update last login time
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Create session and get cookie
  const cookie = await sessionManager.createSession(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    req
  );

  return htmxRedirect(returnUrl, cookie);
}

function SignInForm({
  values,
  fieldErrors,
  globalError,
  returnUrl = "/",
}: SignInFormState) {
  return (
    <div
      id="sign-in-form"
      className="min-h-screen flex items-center justify-center bg-background p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            hx-post="/identity/sign-in"
            hx-target="#sign-in-form"
            hx-swap="outerHTML"
            className="flex flex-col gap-4"
          >
            <input type="hidden" name="returnUrl" value={returnUrl} />

            <GlobalError error={globalError} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                defaultValue={values?.email}
                autoComplete="email"
                autoFocus
                aria-invalid={!!fieldErrors?.email}
              />
              <FieldError errors={fieldErrors?.email} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={!!fieldErrors?.password}
              />
              <FieldError errors={fieldErrors?.password} />
            </div>

            <Button type="submit" className="w-full mt-2">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="/identity/sign-up"
            className="text-primary hover:underline ml-1"
          >
            Sign up
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  const searchParams = getSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  return <SignInForm returnUrl={returnUrl} />;
}
