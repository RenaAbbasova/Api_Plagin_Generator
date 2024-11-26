'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'

export default function PluginGeneratorForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    platform: 'wordpress',
    pluginName: '',
    description: '',
    apiUrl: '',
    apiMethod: 'GET',
    apiKey: '',
    visualizeData: false,
  })
  const [generationHistory, setGenerationHistory] = useState([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('generationHistory')
    if (savedHistory) {
      setGenerationHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const saveGenerationHistory = (data: typeof formData) => {
    const updatedHistory = [...generationHistory, data]
    setGenerationHistory(updatedHistory)
    localStorage.setItem('generationHistory', JSON.stringify(updatedHistory))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/generate-plugin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${formData.pluginName}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        saveGenerationHistory(formData)
        toast({
          title: 'Success',
          description: 'Plugin generated and downloaded successfully!',
        })
      } else {
        throw new Error('Failed to generate plugin')
      }
    } catch (error) {
      console.error('Error generating plugin:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate plugin. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Plugin</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              name="platform"
              value={formData.platform}
              onValueChange={(value) => handleSelectChange('platform', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wordpress">WordPress</SelectItem>
                <SelectItem value="chrome">Chrome Extension</SelectItem>
                <SelectItem value="firefox">Firefox Extension</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pluginName">Plugin Name</Label>
            <Input
              id="pluginName"
              name="pluginName"
              value={formData.pluginName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input
              id="apiUrl"
              name="apiUrl"
              value={formData.apiUrl}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>API Method</Label>
            <RadioGroup
              name="apiMethod"
              value={formData.apiMethod}
              onValueChange={(value) => handleSelectChange('apiMethod', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="GET" id="get" />
                <Label htmlFor="get">GET</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="POST" id="post" />
                <Label htmlFor="post">POST</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="visualizeData"
              checked={formData.visualizeData}
              onCheckedChange={(checked) => handleSelectChange('visualizeData', checked)}
            />
            <Label htmlFor="visualizeData">Visualize API Data</Label>
          </div>
          <div className="space-y-2">
            <Label>Previous Generations</Label>
            <Select
              onValueChange={(value) => {
                const selectedHistory = generationHistory.find((h) => h.pluginName === value)
                if (selectedHistory) {
                  setFormData(selectedHistory)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select previous generation" />
              </SelectTrigger>
              <SelectContent>
                {generationHistory.map((history, index) => (
                  <SelectItem key={index} value={history.pluginName}>
                    {history.pluginName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Plugin'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

