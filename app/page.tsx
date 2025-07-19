"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RotateCcw, Settings } from "lucide-react"

// Guitar string tuning (standard tuning) with colors
const STRINGS = [
  { name: "E", octave: 4, stringIndex: 0, color: "#F59E0B", label: "1 THIN" }, // High E (1st string) - yellow
  { name: "B", octave: 3, stringIndex: 1, color: "#8B5CF6", label: "2" }, // B (2nd string) - purple
  { name: "G", octave: 3, stringIndex: 2, color: "#06B6D4", label: "3" }, // G (3rd string) - light blue
  { name: "D", octave: 3, stringIndex: 3, color: "#F97316", label: "4" }, // D (4th string) - orange
  { name: "A", octave: 2, stringIndex: 4, color: "#3B82F6", label: "5" }, // A (5th string) - blue
  { name: "E", octave: 2, stringIndex: 5, color: "#F59E0B", label: "6 THICK" }, // Low E (6th string) - yellow
]

// Chromatic scale
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

// Treble clef note positions - shifted up one octave visually
// All notes appear one octave higher on the staff but keep their original names
const TREBLE_CLEF_POSITIONS: { [key: string]: number } = {
  // Lower octaves (now appear in main staff area)
  C2: -9, // Now appears where C3 was
  "C#2": -9,
  D2: -8, // Now appears where D3 was
  "D#2": -8,
  E2: -7, // Now appears where E3 was
  F2: -6, // Now appears where F3 was
  "F#2": -6,
  G2: -5, // Now appears where G3 was
  "G#2": -5,
  A2: -4, // Now appears where A3 was
  "A#2": -4,
  B2: -3, // Now appears where B3 was

  // Octave 3 (now appears in upper staff area)
  C3: -2, // Now appears where C4 was (below staff ledger)
  "C#3": -2,
  D3: -1, // Now appears where D4 was (below staff space)
  "D#3": -1,
  E3: 0, // Now appears where E4 was (bottom line)
  F3: 1, // Now appears where F4 was (first space)
  "F#3": 1,
  G3: 2, // Now appears where G4 was (second line)
  "G#3": 2,
  A3: 3, // Now appears where A4 was (second space)
  "A#3": 3,
  B3: 4, // Now appears where B4 was (middle line)

  // Octave 4 (now appears in upper staff and ledger lines)
  C4: 5, // Now appears where C5 was (third space)
  "C#4": 5,
  D4: 6, // Now appears where D5 was (fourth line)
  "D#4": 6,
  E4: 7, // Now appears where E5 was (fourth space)
  F4: 8, // Now appears where F5 was (top line)
  "F#4": 8,
  G4: 9, // Now appears where G5 was (first ledger above)
  "G#4": 9,
  A4: 10, // Now appears where A5 was (space above first ledger)
  "A#4": 10,
  B4: 11, // Now appears where B5 was (second ledger above)

  // Octave 5 (now appears in higher ledger lines)
  C5: 12, // Now appears where C6 was
  "C#5": 12,
  D5: 13, // Now appears where D6 was
  "D#5": 13,
  E5: 14,
  F5: 15,
  "F#5": 15,
  G5: 16,
  "G#5": 16,
  A5: 17,
  "A#5": 17,
  B5: 18,

  // Octave 6 (now appears even higher)
  C6: 19,
  "C#6": 19,
  D6: 20,
  "D#6": 20,
  E6: 21,
  F6: 22,
  "F#6": 22,
  G6: 23,
  "G#6": 23,
  A6: 24,
  "A#6": 24,
  B6: 25,
}

// Function to get note at specific fret
function getNoteAtFret(stringIndex: number, fret: number) {
  const openString = STRINGS[stringIndex]
  const noteIndex = NOTES.indexOf(openString.name)
  const newNoteIndex = (noteIndex + fret) % 12
  const octaveAdjustment = Math.floor((noteIndex + fret) / 12)

  return {
    name: NOTES[newNoteIndex],
    octave: openString.octave + octaveAdjustment,
    stringIndex,
    fret,
  }
}

// Generate all possible notes on fretboard (first 12 frets)
function generateFretboardNotes(enabledStrings: boolean[], includeAccidentals: boolean) {
  const notes = []
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    if (!enabledStrings[stringIndex]) continue

    for (let fret = 1; fret <= 5; fret++) {
      const note = getNoteAtFret(stringIndex, fret)

      // Skip sharps/flats if not included
      if (!includeAccidentals && (note.name.includes("#") || note.name.includes("b"))) {
        continue
      }

      // Only include notes that appear on treble clef
      const noteKey = `${note.name}${note.octave}`
      if (TREBLE_CLEF_POSITIONS[noteKey] !== undefined) {
        notes.push(note)
      }
    }
  }

  return notes
}

// Treble clef component with notes shifted up one octave visually
function TrebleClef({ note }: { note: { name: string; octave: number } }) {
  const noteKey = `${note.name}${note.octave}`
  const staffPosition = TREBLE_CLEF_POSITIONS[noteKey]

  if (staffPosition === undefined) {
    console.warn(`Note ${noteKey} not found in treble clef positions`)
    return <div>Note not supported</div>
  }

  // Convert staff position to pixel position
  // Bottom line (now E3) is at y=80, each position is 10 pixels apart
  const yPosition = 120 - staffPosition * 10

  // Generate ledger lines if needed
  const ledgerLines = []

  // Below staff ledger lines (for positions < 0)
  if (staffPosition < 0) {
    for (let i = -2; i >= staffPosition; i -= 2) {
      ledgerLines.push(120 - i * 10)
    }
  }

  // Above staff ledger lines (for positions > 8)
  if (staffPosition > 8) {
    for (let i = 10; i <= staffPosition; i += 2) {
      ledgerLines.push(120 - i * 10)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4">Find this note on the fretboard:</h3>
      <div className="relative">
        <svg width="400" height="250" viewBox="0 0 400 250">
          {/* Main staff lines (now E3=0, G3=2, B3=4, D4=6, F4=8) */}
          {[0, 2, 4, 6, 8].map((line) => (
            <line key={line} x1="20" y1={120 - line * 10} x2="380" y2={120 - line * 10} stroke="#000" strokeWidth="2" />
          ))}

          {/* Ledger lines */}
          {ledgerLines.map((y, index) => (
            <line key={`ledger-${index}`} x1="235" y1={y} x2="265" y2={y} stroke="#000" strokeWidth="2" />
          ))}

          {/* Note positioned accurately on the staff */}
          <ellipse cx="250" cy={yPosition} rx="10" ry="7" fill="none" stroke="#000" strokeWidth="2" />

          {/* Sharp or flat symbol if needed */}
          {note.name.includes("#") && (
            <text x="225" y={yPosition + 5} fontSize="20" fontFamily="serif" fill="#000">
              ♯
            </text>
          )}
          {note.name.includes("b") && (
            <text x="225" y={yPosition + 5} fontSize="20" fontFamily="serif" fill="#000">
              ♭
            </text>
          )}
        </svg>

        {/* Treble clef PNG positioned so staff lines go through it */}
        <img src="/treble-clef.png" alt="Treble clef" className="absolute left-4 top-12 w-12 h-20 object-contain" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {note.name}
        {note.octave}
      </p>
    </div>
  )
}

// String selection component
function StringSelector({
  enabledStrings,
  onStringToggle,
  includeAccidentals,
  onAccidentalsToggle,
}: {
  enabledStrings: boolean[]
  onStringToggle: (stringIndex: number) => void
  includeAccidentals: boolean
  onAccidentalsToggle: (value: boolean) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          String Selection
        </CardTitle>
        <p className="text-sm text-muted-foreground">Choose which strings to practice with</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {STRINGS.map((string, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Checkbox
                id={`string-${index}`}
                checked={enabledStrings[index]}
                onCheckedChange={() => onStringToggle(index)}
              />
              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: string.color }} />
              <label htmlFor={`string-${index}`} className="text-sm font-medium cursor-pointer flex-1">
                {string.name} - {string.label}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center space-x-3 mb-3">
            <Checkbox id="include-accidentals" checked={includeAccidentals} onCheckedChange={onAccidentalsToggle} />
            <label htmlFor="include-accidentals" className="text-sm font-medium cursor-pointer">
              Include sharps and flats (#/♭)
            </label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => STRINGS.forEach((_, i) => onStringToggle(i))}>
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                STRINGS.forEach((_, i) => {
                  if (enabledStrings[i]) onStringToggle(i)
                })
              }}
            >
              None
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Fretboard component with realistic design
function Fretboard({
  onFretClick,
  lastClickResult,
}: {
  onFretClick: (stringIndex: number, fret: number) => void
  lastClickResult: { stringIndex: number; fret: number; correct: boolean } | null
}) {
  const frets = Array.from({ length: 13 }, (_, i) => i)

  return (
    <div className="overflow-x-auto bg-gray-50 p-6 rounded-lg">
      <div className="min-w-[900px]">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6 tracking-wider">GUITAR FRETBOARD</h2>

        {/* Fret numbers */}
        <div className="flex mb-4">
          <div className="w-20"></div>
          <div className="w-12"></div> {/* Nut space */}
          {frets.slice(1).map((fret) => (
            <div key={fret} className="flex-1 text-center">
              <div className="bg-gray-300 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-sm font-semibold">
                {fret}
              </div>
            </div>
          ))}
        </div>

        {/* Fretboard */}
        <div className="relative bg-amber-100 border-2 border-gray-400 rounded">
          {/* Nut */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gray-800 rounded-l"></div>

          {/* Strings */}
          {STRINGS.map((string, stringIndex) => (
            <div key={stringIndex} className="flex items-center relative" style={{ height: "60px" }}>
              {/* String label */}
              <div className="w-16 text-right pr-3 font-bold text-lg" style={{ color: string.color }}>
                {string.name}
              </div>

              {/* String line */}
              <div
                className="absolute left-20 right-4 h-1 rounded"
                style={{
                  backgroundColor: string.color,
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.7,
                }}
              />

              {/* Frets */}
              <div className="flex flex-1 relative z-10">
                {frets.map((fret) => {
                  const isLastClick =
                    lastClickResult && lastClickResult.stringIndex === stringIndex && lastClickResult.fret === fret

                  return (
                    <button
                      key={fret}
                      onClick={() => onFretClick(stringIndex, fret)}
                      className={`
                        flex-1 h-14 relative hover:bg-yellow-200 hover:bg-opacity-50 transition-colors
                        ${fret === 0 ? "ml-3" : "border-l border-gray-400"}
                      `}
                    >
                      {/* Fret position markers */}
                      {stringIndex === 2 && [3, 5, 7, 9].includes(fret) && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-400 rounded-full opacity-60" />
                      )}
                      {stringIndex === 2 && fret === 12 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-400 rounded-full opacity-60" />
                      )}
                      {stringIndex === 3 && fret === 12 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-400 rounded-full opacity-60" />
                      )}

                      {/* Last click feedback */}
                      {isLastClick && (
                        <div
                          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 animate-pulse ${
                            lastClickResult.correct ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"
                          }`}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* String thickness label */}
              <div className="w-16 text-left pl-3 text-xs text-gray-500">{string.label}</div>
            </div>
          ))}

          {/* Bottom labels */}
          <div className="flex items-center justify-between py-2 px-4 text-xs text-gray-500 font-semibold">
            <div className="flex items-center gap-1">
              <span>▲</span>
              <span>OPEN STRINGS</span>
            </div>
            <div className="flex items-center gap-1">
              <span>STRINGS</span>
              <span>▲</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GuitarFretboardTrainer() {
  const [currentNote, setCurrentNote] = useState<{ name: string; octave: number } | null>(null)
  const [correctPositions, setCorrectPositions] = useState<{ stringIndex: number; fret: number }[]>([])
  const [lastClickResult, setLastClickResult] = useState<{
    stringIndex: number
    fret: number
    correct: boolean
  } | null>(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [enabledStrings, setEnabledStrings] = useState<boolean[]>([true, true, true, true, true, true])
  const [showSettings, setShowSettings] = useState(false)
  const [includeAccidentals, setIncludeAccidentals] = useState<boolean>(true)

  const handleStringToggle = (stringIndex: number) => {
    setEnabledStrings((prev) => {
      const newEnabled = [...prev]
      newEnabled[stringIndex] = !newEnabled[stringIndex]
      return newEnabled
    })
  }

  const generateNewNote = () => {
    const allNotes = generateFretboardNotes(enabledStrings, includeAccidentals)

    if (allNotes.length === 0) {
      alert("Please select at least one string to practice with!")
      return
    }

    // Get unique notes (remove duplicates) - but only from notes that actually exist on enabled strings
    const availableNoteKeys = new Set(allNotes.map((note) => `${note.name}${note.octave}`))
    const uniqueNotes = Array.from(availableNoteKeys).map((noteStr) => {
      const name = noteStr.slice(0, -1)
      const octave = Number.parseInt(noteStr.slice(-1))
      return { name, octave }
    })

    const randomNote = uniqueNotes[Math.floor(Math.random() * uniqueNotes.length)]
    setCurrentNote(randomNote)

    // Find all positions where this note appears (only on enabled strings)
    const positions = allNotes
      .filter((note) => note.name === randomNote.name && note.octave === randomNote.octave)
      .map((note) => ({ stringIndex: note.stringIndex, fret: note.fret }))

    setCorrectPositions(positions)
    setLastClickResult(null)
  }

  const handleFretClick = (stringIndex: number, fret: number) => {
    if (!currentNote) return

    const isCorrect = correctPositions.some((pos) => pos.stringIndex === stringIndex && pos.fret === fret)

    // Set the last click result for visual feedback
    setLastClickResult({ stringIndex, fret, correct: isCorrect })

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    setAttempts((prev) => prev + 1)

    // Generate new note immediately after any click
    setTimeout(() => {
      generateNewNote()
    }, 500) // Short delay to show the feedback
  }

  const startGame = () => {
    if (!enabledStrings.some((enabled) => enabled)) {
      alert("Please select at least one string to practice with!")
      return
    }
    setGameStarted(true)
    setScore(0)
    setAttempts(0)
    generateNewNote()
  }

  const resetGame = () => {
    setScore(0)
    setAttempts(0)
    setLastClickResult(null)
    generateNewNote()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">Guitar Fretboard Note Trainer</CardTitle>
            <p className="text-muted-foreground">
              Learn to identify notes on the guitar fretboard by clicking the correct positions
            </p>
          </CardHeader>
        </Card>

        {!gameStarted ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <h2 className="text-xl mb-4">Ready to start learning?</h2>
                  <p className="text-muted-foreground mb-6">
                    You'll see a note displayed in treble clef. Click any position on the fretboard to guess where that
                    note appears! A new note will appear after each guess.
                  </p>
                  <Button onClick={startGame} size="lg">
                    Start Training
                  </Button>
                </CardContent>
              </Card>
            </div>
            <StringSelector
              enabledStrings={enabledStrings}
              onStringToggle={handleStringToggle}
              includeAccidentals={includeAccidentals}
              onAccidentalsToggle={setIncludeAccidentals}
            />
          </div>
        ) : (
          <>
            {/* Score and controls */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="flex gap-4 flex-wrap">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Score: {score}
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Attempts: {attempts}
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Accuracy: {attempts > 0 ? Math.round((score / attempts) * 100) : 0}%
                </Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Strings
                </Button>
                <Button onClick={generateNewNote} variant="outline">
                  Skip Note
                </Button>
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {showSettings && (
              <div className="mb-6">
                <StringSelector
                  enabledStrings={enabledStrings}
                  onStringToggle={handleStringToggle}
                  includeAccidentals={includeAccidentals}
                  onAccidentalsToggle={setIncludeAccidentals}
                />
              </div>
            )}

            <div className="grid xl:grid-cols-4 gap-6">
              {/* Note display */}
              <Card className="xl:col-span-1">
                <CardContent className="pt-6">{currentNote && <TrebleClef note={currentNote} />}</CardContent>
              </Card>

              {/* Fretboard */}
              <div className="xl:col-span-3">
                <Fretboard onFretClick={handleFretClick} lastClickResult={lastClickResult} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
