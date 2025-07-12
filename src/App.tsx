import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';

export default () => {
  const [message, setMessage] = useState("Hello From Chrome Extension!!");

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Vibe Extension</CardTitle>
          <CardDescription>Spreading good vibes, one click at a time!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">{message}</p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => setMessage('Spreading good vibes!')}
          >
            Activate Good Vibes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}