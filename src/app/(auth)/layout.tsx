export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#111110' }}>
      <div className="w-full max-w-[360px]">
        {children}
      </div>
    </div>
  )
}
