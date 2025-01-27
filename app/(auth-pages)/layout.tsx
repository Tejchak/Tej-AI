export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black -z-10"></div>
      <div className="w-full max-w-md bg-black/20 p-8 rounded-2xl backdrop-blur-lg border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.2)] relative z-10">
        {children}
      </div>
    </div>
  )
}
