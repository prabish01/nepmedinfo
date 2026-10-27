import Logo from "@/components/brand/Logo";

export default function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 ring-1 ring-line md:p-10">
        <Logo />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        <div className="mt-4 space-y-4 text-[0.95rem] leading-relaxed text-muted [&_code]:rounded-md [&_code]:bg-ground [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-ink [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-navy [&_pre]:p-4 [&_pre]:text-[0.82rem] [&_pre]:text-white">
          {children}
        </div>
      </div>
    </div>
  );
}
