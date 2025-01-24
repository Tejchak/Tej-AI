export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/20 p-8 rounded-2xl backdrop-blur-lg">
        {children}
      </div>
    </div>
  )
}
