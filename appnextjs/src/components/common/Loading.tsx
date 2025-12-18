export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <span className="material-icons animate-spin text-4xl text-primary">autorenew</span>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    </div>
  );
}
