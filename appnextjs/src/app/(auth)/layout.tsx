export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-900">
       <div className="w-full max-w-md space-y-8">
         <div className="flex flex-col items-center justify-center">
            {/* Logo can be added here if needed */}
            <div className="h-12 w-12 rounded bg-primary flex items-center justify-center text-white font-bold text-xl">
               F
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
               Flexcoz
            </h2>
         </div>
         {children}
       </div>
    </div>
  );
}
