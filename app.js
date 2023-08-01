const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server has been Started");
    });
  } catch (error) {
    console.log("Some Error in Server starting");
    process.exit(1);
  }
};
initializeDBAndServer();

//Get Movies
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT movie_name
        FROM movie ;`;
  let moviesArray = await db.all(getMoviesQuery);
  moviesArray = moviesArray.map((object) => ({ movieName: object.movie_name }));
  response.send(moviesArray);
});

//ADD Movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
    INSERT INTO movie
        ( director_id, movie_name, lead_actor )
    VALUES
        (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

///GET MOVIE
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT * FROM movie
        WHERE movie_id = ${movieId} ; `;
  let movieDetails = await db.get(getMovieQuery);
  movieDetails = {
    movieId: movieDetails.movie_id,
    directorId: movieDetails.director_id,
    movieName: movieDetails.movie_name,
    leadActor: movieDetails.lead_actor,
  };
  response.send(movieDetails);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
    UPDATE movie
    SET
        director_id = ${directorId}, 
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId} ;`;
  await db.run(addMovieQuery);
  response.send("Movie Details Updated");
});

///
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const removeMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  await db.run(removeMovieQuery);
  response.send("Movie Removed");
});

////
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
        SELECT *
        FROM director ;`;
  let directorsArray = await db.all(getDirectorQuery);
  directorsArray = directorsArray.map((object) => ({
    directorId: object.director_id,
    directorName: object.director_name,
  }));
  response.send(directorsArray);
});

///
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieByDirectorQuery = `
    SELECT movie.movie_name
    FROM director INNER JOIN movie
    ON director.director_id = movie.director_id
    WHERE director.director_id = ${directorId} ;`;
  let movies = await db.all(getMovieByDirectorQuery);
  movies = movies.map((object) => {
    return {
      movieName: object.movie_name,
    };
  });

  response.send(movies);
});

module.exports = app;
