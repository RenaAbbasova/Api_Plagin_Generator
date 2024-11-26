import PluginGeneratorForm from '@/components/PluginGeneratorForm'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">API Plugin Generator</h1>
      <PluginGeneratorForm />
    </main>
  )
}

