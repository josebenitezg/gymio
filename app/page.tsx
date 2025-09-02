import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

export const revalidate = 3600;

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-5xl items-center justify-center px-4">
      <div className="w-full text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Entrená simple
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70 sm:text-base">
          Tu rutina semanal, sin ruido. Enfocada en lo importante.
        </p>
        <SignedOut>
          <div className="mt-6 flex justify-center gap-2">
            <SignInButton mode="modal">
              <Button size="lg">Iniciar sesión</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="lg" variant="outline">Crear cuenta</Button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg">
              <Link href="/app/progress">Ir a tu estado</Link>
            </Button>
          </div>
        </SignedIn>
      </div>
    </main>
  );
}
