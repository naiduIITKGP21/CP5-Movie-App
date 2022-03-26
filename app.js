const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

//Database Initialization
const intilializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
intilializeDBAndServer();

//API 1: Returns a list of all movie names in the movie table
app.get("/movies/", async (request, response) => {
  const getAllMovieNamesQuery = `SELECT movie_name FROM movie;`;
  const allMoviesNames = await db.all(getAllMovieNamesQuery);

  response.send(
    allMoviesNames.map((eachMovie) => {
      const { movie_name } = eachMovie;
      return { movieName: `${movie_name}` };
    })
  );
  console.log("returned all movie names successfully");
});

//API 2 : Creates a new movie in the movie table. `movie_id` is auto-incremented
app.post("/movies/", async (request, response) => {
  console.log(request.body);
  const { directorId, movieName, leadActor } = request.body;
  const addNewMovieQuery = `INSERT INTO movie 
(director_id, movie_name, lead_actor)
VALUES
(${directorId}, "${movieName}", "${leadActor}")`;

  await db.run(addNewMovieQuery);
  response.send("Movie Successfully Added");
  console.log("added new movie to the movies table");
});

//API 3 : Returns a movie based on the movie ID
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getMovieDetailsQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;

  const movieDetails = await db.get(getMovieDetailsQuery);
  console.log(movieDetails);

  const { movie_id, director_id, movie_name, lead_actor } = movieDetails;

  response.send({
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  });
  console.log(`Returns a movie based on the movie ID ${movieId}`);
});

//API 4: Updates the details of a movie in the movie table based on the movie ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie 
SET
director_id = ${directorId},
movie_name = "${movieName}",
lead_actor = "${leadActor}"
WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
  console.log(
    `Updated the details of a movie in the movie table based on the movie ID ${movieId}`
  );
});

//API 5: Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
  console.log(`Movie(movie_id ${movieId}) Removed`);
});

//API 6: Returns a list of all directors in the director table
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `SELECT * FROM director;`;
  const directorsArray = await db.all(getAllDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => ({
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    }))
  );
  console.log(`returned all directors details`);
});

//API 7: Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
  const directorMovies = await db.all(getDirectorMoviesQuery);
  response.send(
    directorMovies.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
  console.log(
    `Returns a list of all movie names directed by director ID ${directorId}`
  );
});

module.exports = app;
