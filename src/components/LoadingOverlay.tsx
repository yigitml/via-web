
export default function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-20 bg-black/90 flex justify-center items-center">
      <p className="text-4xl text-center">{message}</p>
    </div>
  );
}
