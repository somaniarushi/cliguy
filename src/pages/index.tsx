/* eslint-disable react/no-unescaped-entities */
"use client"
import Image from 'next/image'
import { useState } from 'react';
import { JetBrains_Mono } from 'next/font/google';

const font = JetBrains_Mono({ subsets: ['latin'] });

const PROLOG = "Convert this natural language instruction into a single command line instruction. Return nothing but the command line instruction itself — your answer should be a single line of text that can directly be inputted into the command line. Example:\n Prompt: Echo hi on the terminal. Your response: echo hi\n\n Prompt:"

export default function Home() {
  const [text, setText] = useState('')
  const [instruction, setInstruction] = useState('')
  const [explanations, setExplanations] = useState(null)

  async function submitHandler(text: string) {
    const response = await fetch(`/api/openaiCall?prompt=${PROLOG + text + "\nResponse:"}`);
    const instruction = await response.json().then((data) => data['answer']);
    console.log("generated instruction", instruction)
    if (instruction === undefined) {
      setInstruction("Sorry, I don't understand that instruction")
      setExplanations(null)
      return
    }
    setInstruction(instruction);
    // Split the instruciton by space
    const instructionArray = instruction.split(' ')
    console.log("instruction array", instructionArray)
    // For every word, make a GPT call to explain what that means
    const instructionsExplanations: any = {}
    for (const word of instructionArray) {
      const prompt = "Explain what " + word + " means to a beginner learning how to use the command line. The instruction they're using is " + text + ". Please be concise and explain it in one line."
      const explanationCompletion = await fetch(`/api/openaiCall?prompt=${prompt}`).then((response) => response.json()).then((data) => data['answer']);
      if (explanationCompletion === undefined) {
        setInstruction("Sorry, I don't understand that instruction")
        setExplanations(null)
        return
      }
      console.log("for word", word, "explanation is", explanationCompletion)
      instructionsExplanations[word] = explanationCompletion;
    }
    setExplanations(instructionsExplanations)
  }

  return (
    <main className={`${font.className} p-14`}>
      <h1 className="text-4xl font-bold text-center m-2 p-2">CLI GUY 🤝</h1>
      <p className="text-xl text-center m-2 p-2">Say what you want in English. Get a CLI command and a command breakdown.</p>
      <p className='text-center m-2 p-2'>Wanna try it out? Try: 'Kill all processes'</p>
      <div className="flex flex-col items-center justify-center py-2">
        <textarea className="border-2 border-gray-300 rounded-md p-2 m-2 w-96"
        value={text} onChange={(e) => setText(e.target.value)} />
        <button className="border-2 border-gray-300 rounded-md p-2" onClick={
          () => {
            submitHandler(text)
          }
        }>Submit</button>
      </div>
      <div className="flex flex-col items-center justify-center py-2">
        {instruction &&
        <p className="text-2xl font-bold text-center m-2 p-2">{instruction}</p>}
        {/* If there is an instruction, but no explanations, we are loading them in. */}
        {instruction && !explanations &&
            // Loading
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-200"></div>
        }
        {explanations && <div className="grid grid-cols-3 gap-4">
          {Object.keys(explanations).map((key) => {
            return (
              <div className="border-2 border-gray-300 rounded-md p-2" key={key}>
                <p className="font-bold">{key}</p>
                <p>{explanations[key]}</p>
              </div>
            )
          }
          )}
        </div>}
      </div>
    </main>
  )
}
