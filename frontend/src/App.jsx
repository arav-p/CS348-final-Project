import { useState, useEffect } from 'react'

function App() {
  const [workouts, setWorkouts] = useState([])
  const [newWorkout, setNewWorkout] = useState({ name: '', date: '', exercises: [] })
  const [newExercise, setNewExercise] = useState({ name: '', sets: '', reps: '' })
  const [exerciseCounts, setExerciseCounts] = useState([])

  useEffect(() => {
    fetch('/api/workouts')
      .then(res => res.json())
      .then(setWorkouts)

    fetch('/api/report/exercise_counts')
      .then(res => res.json())
      .then(setExerciseCounts)
  }, [])

  const addExercise = () => {
    if (!newExercise.name || !newExercise.sets || !newExercise.reps) return
    setNewWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }))
    setNewExercise({ name: '', sets: '', reps: '' })
  }

  const addWorkout = () => {
    fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkout)
    }).then(() => {
      setNewWorkout({ name: '', date: '', exercises: [] })
      window.location.reload()
    })
  }

  const deleteWorkout = (id) => {
    fetch(`/api/workouts/${id}`, {
      method: 'DELETE'
    }).then(() => window.location.reload())
  }

  return (
    <div>
      <h1>Workout Tracker</h1>

      <input placeholder="Workout Name" value={newWorkout.name} onChange={e => setNewWorkout({ ...newWorkout, name: e.target.value })} />
      <input placeholder="Date" value={newWorkout.date} onChange={e => setNewWorkout({ ...newWorkout, date: e.target.value })} />

      <h3>Add Exercise</h3>
      <input placeholder="Exercise Name" value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} />
      <input placeholder="Sets" value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })} />
      <input placeholder="Reps" value={newExercise.reps} onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })} />
      <button onClick={addExercise}>Add Exercise</button>

      <button onClick={addWorkout}>Add Workout</button>

      <h2>All Workouts</h2>
      <ul>
        {workouts.map(w => (
          <li key={w.id}>
            <h3>{w.name} ({w.date})</h3>
            <ul>
              {w.exercises.map(ex => (
                <li key={ex.id}>{ex.name}: {ex.sets}x{ex.reps}</li>
              ))}
            </ul>
            <button onClick={() => deleteWorkout(w.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Exercise Report</h2>
      <ul>
        {exerciseCounts.map(ec => (
          <li key={ec.name}>{ec.name}: {ec.count}</li>
        ))}
      </ul>
    </div>
  )
}

export default App