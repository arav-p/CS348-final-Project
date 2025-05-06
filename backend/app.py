from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import text
from db_setup import init_app, db
from models import Workout, Exercise
import os

app = init_app()
CORS(app, resources={r"/api/*": {"origins": "*"}})

with app.app_context():
    db.create_all()

@app.route("/")
def serve_index():
    return send_from_directory("../frontend/dist", "index.html")

@app.route("/api/workouts/<int:id>", methods=["PUT"])
def update_workout(id):
    data = request.json
    workout = Workout.query.get_or_404(id)
    workout.name = data['name']
    workout.date = data['date']
    db.session.commit()
    return jsonify({ "message": "Workout updated" })

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("../frontend/dist", path)

@app.route("/api/report/summary", methods=["GET"])
def report_summary():
    start = request.args.get("start")
    end = request.args.get("end")
    query = text("""
        SELECT COUNT(*) as count,
               AVG(LENGTH(name)) as averageNameLength,
               SUM(LENGTH(name)) as total
        FROM workout
        WHERE date BETWEEN :start AND :end
    """)
    result = db.session.execute(query, {"start": start, "end": end}).mappings().first()
    return jsonify(dict(result))

@app.route("/api/workouts", methods=["GET"])
def get_workouts():
    workouts = Workout.query.all()
    result = []
    for w in workouts:
        result.append({
            'id': w.id,
            'name': w.name,
            'date': w.date,
            'exercises': [
                { 'id': e.id, 'name': e.name, 'sets': e.sets, 'reps': e.reps }
                for e in w.exercises
            ]
        })
    return jsonify(result)

@app.route("/api/workouts", methods=["POST"])
def create_workout():
    data = request.json
    try:
        with db.session.begin():
            workout = Workout(name=data['name'], date=data['date'])
            db.session.add(workout)
            for ex in data.get('exercises', []):
                e = Exercise(name=ex['name'], sets=ex['sets'], reps=ex['reps'], workout=workout)
                db.session.add(e)
        return jsonify({ 'message': 'Workout created' })
    except:
        db.session.rollback()
        return jsonify({ 'error': 'Failed to create workout' }), 500

@app.route("/api/workouts/<int:id>", methods=["DELETE"])
def delete_workout(id):
    workout = Workout.query.get_or_404(id)
    db.session.delete(workout)
    db.session.commit()
    return jsonify({ 'message': 'Workout deleted' })

@app.route("/api/workouts/raw", methods=["GET"])
def get_workouts_raw():
    query = text("SELECT * FROM workout")
    result = db.session.execute(query).mappings().all()
    return jsonify([dict(row) for row in result])

@app.route("/api/report/exercise_counts", methods=["GET"])
def report_exercise_counts():
    query = text("""
        SELECT name, COUNT(*) as count
        FROM exercise
        GROUP BY name
    """)
    result = db.session.execute(query).mappings().all()
    return jsonify([dict(row) for row in result])

if __name__ == '__main__':
    app.run(debug=True)
