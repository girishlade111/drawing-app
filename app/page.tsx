import DrawingCanvas from "@/components/drawing-canvas"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <h1 className="mb-6 text-center text-3xl font-bold">Drawing App</h1>
        <DrawingCanvas />
      </div>
    </main>
  )
}
