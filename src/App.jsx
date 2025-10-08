import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { CheckCircle2, XCircle, RefreshCw, Eraser, BookOpen, ChevronRight } from 'lucide-react'
import { generateEquation, Fraction } from './equationGenerator.js'
import { generateSolution } from './solutionGenerator.js'

function App() {
  const [level, setLevel] = useState(1)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [numerator, setNumerator] = useState('')
  const [denominator, setDenominator] = useState('1')
  const [answers, setAnswers] = useState([null, null, null])
  const [solutions, setSolutions] = useState([[], [], []])
  const [showFeedback, setShowFeedback] = useState([false, false, false])
  
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [context, setContext] = useState(null)

  const levelDescriptions = {
    1: '基礎一階 - 單步加減方程式',
    2: '基礎二階 - 單步乘除方程式',
    3: '進階二步驟 - 加減＋乘除',
    4: '左右變量 - 變量同時出現在等號兩邊',
    5: '括號與分配律'
  }

  useEffect(() => {
    generateNewQuestions()
  }, [level])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      setContext(ctx)
      
      // 設定 canvas 尺寸
      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
      }
      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)
      
      return () => window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  useEffect(() => {
    // 當方程式更新時,觸發 MathJax 渲染
    if (window.MathJax) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err))
    }
  }, [questions, solutions, showFeedback, currentQuestionIndex])

  const generateNewQuestions = () => {
    const newQuestions = []
    for (let i = 0; i < 3; i++) {
      newQuestions.push(generateEquation(level))
    }
    setQuestions(newQuestions)
    setCurrentQuestionIndex(0)
    setNumerator('')
    setDenominator('1')
    setAnswers([null, null, null])
    setSolutions([[], [], []])
    setShowFeedback([false, false, false])
  }

  const checkAnswer = () => {
    if (!questions[currentQuestionIndex] || numerator === '') {
      alert('請輸入答案！')
      return
    }

    const userAnswer = new Fraction(parseInt(numerator), parseInt(denominator))
    const correctAnswer = questions[currentQuestionIndex].answer
    
    const correct = userAnswer.equals(correctAnswer)
    
    // 更新當前題目的答案狀態
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = correct
    setAnswers(newAnswers)
    
    // 生成解題步驟
    const steps = generateSolution(questions[currentQuestionIndex])
    const newSolutions = [...solutions]
    newSolutions[currentQuestionIndex] = steps
    setSolutions(newSolutions)
    
    const newShowFeedback = [...showFeedback]
    newShowFeedback[currentQuestionIndex] = true
    setShowFeedback(newShowFeedback)
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < 2) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setNumerator('')
      setDenominator('1')
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setNumerator('')
      setDenominator('1')
    }
  }

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const startDrawing = (e) => {
    if (!context) return
    setIsDrawing(true)
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing || !context) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestionIndex]
  const currentSolution = solutions[currentQuestionIndex]
  const currentShowFeedback = showFeedback[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            一元一次方程式練習
          </h1>
          <p className="text-gray-600">選擇難度等級,開始練習吧!</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側:題目與答案區 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 控制區 */}
            <Card>
              <CardHeader>
                <CardTitle>選擇難度等級</CardTitle>
                <CardDescription>{levelDescriptions[level]}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label>難度等級</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((levelNum) => (
                      <Button
                        key={levelNum}
                        onClick={() => setLevel(levelNum)}
                        variant={level === levelNum ? "default" : "outline"}
                        className={`text-sm ${level === levelNum ? 'bg-indigo-600 text-white' : ''}`}
                      >
                        等級{levelNum}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={generateNewQuestions} className="w-full sm:w-auto">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      更換題目
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 題目進度指示器 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-12 h-12 rounded-full font-bold text-lg transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-indigo-600 text-white scale-110'
                          : answers[index] === true
                          ? 'bg-green-500 text-white'
                          : answers[index] === false
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 題目區 */}
            <Card>
              <CardHeader>
                <CardTitle>題目 {currentQuestionIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                {currentQuestion && (
                  <div className="text-3xl text-center py-8 font-semibold text-gray-800">
                    {"\\(" + currentQuestion.equation + "\\)"}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 作答區 */}
            <Card>
              <CardHeader>
                <CardTitle>輸入答案</CardTitle>
                <CardDescription>請輸入 x 的值 (支援分數)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="numerator">分子</Label>
                    <Input
                      id="numerator"
                      type="number"
                      value={numerator}
                      onChange={(e) => setNumerator(e.target.value)}
                      placeholder="輸入分子"
                      className="text-lg"
                    />
                  </div>
                  <div className="text-3xl text-gray-400 mt-6">/</div>
                  <div className="flex-1">
                    <Label htmlFor="denominator">分母</Label>
                    <Input
                      id="denominator"
                      type="number"
                      value={denominator}
                      onChange={(e) => setDenominator(e.target.value)}
                      placeholder="輸入分母"
                      className="text-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={checkAnswer} className="flex-1" size="lg">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    檢查答案
                  </Button>
                  {currentQuestionIndex < 2 && (
                    <Button onClick={goToNextQuestion} variant="outline" size="lg">
                      下一題
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 回饋區 */}
            {currentShowFeedback && (
              <Card className={currentAnswer ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentAnswer ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <span className="text-green-700">答對了!太棒了!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-600" />
                        <span className="text-red-700">答錯了,再試試看!</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg mb-3">詳細解題步驟:</h3>
                    {currentSolution.map((step, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                        {step.type === 'text' ? (
                          <p className="text-gray-700">{step.content}</p>
                        ) : (
                          <p className="text-gray-700 text-center text-xl">{"\\(" + step.content + "\\)"}</p>
                        )}
                      </div>
                    ))}
                    {currentQuestion && (
                      <Alert className="mt-4">
                        <AlertDescription>
                          <strong>正確答案:</strong> {"\\(x = " + currentQuestion.answer.toEquationString() + "\\)"}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右側:手寫草稿區 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>手寫草稿區</CardTitle>
                <CardDescription>在這裡進行計算</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <canvas
                    ref={canvasRef}
                    className="w-full cursor-crosshair"
                    style={{ height: '400px', touchAction: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                <Button onClick={clearCanvas} variant="outline" className="w-full">
                  <Eraser className="w-4 h-4 mr-2" />
                  清除草稿
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
