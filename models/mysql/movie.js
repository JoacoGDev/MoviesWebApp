import mysql from 'mysql2/promise'

const config = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '',
    database: 'moviesdb'
}

const connection = await mysql.createConnection(config)




export class MovieModel{

    static async getAll({ genre }) {
        if (!genre) {
            // Si no hay género, devuelve todas las películas directamente
            const [movies] = await connection.query(
                'SELECT BIN_TO_UUID(id) id, title, year, director, poster, duration, rate FROM movies;'
            );
            return movies;
        }
    
            const lowerCaseGenre = genre.toLowerCase()

            const [genres] = await connection.query('SELECT id FROM genres WHERE LOWER(name) = ?;', [lowerCaseGenre])

            //not genre found
            if (genres.length === 0) {
                return []
            }

            //get the id from first genre result
            const [{id}] = genres
            
            //get movie_genresss table
            const [moviesIds] = await connection.query('SELECT BIN_TO_UUID(movie_id) movieID FROM movie_genres WHERE genre_id = ?;', [id])

            if(moviesIds.length === 0) {
                return [];
            }
            
            const movieUUIDs = moviesIds.map(row => row.movieID)

            const placeholders = movieUUIDs.map(() => '?').join(',');

            const [movies] = await connection.query(
                `SELECT BIN_TO_UUID(id) id, title, year, director, poster, duration, rate 
                 FROM movies 
                 WHERE BIN_TO_UUID(id) IN (${placeholders});`,
                movieUUIDs
            );
        return movies

    }

    static async getById({id}) {
        
        if(!id) {
            return []
        }

        const [movies] = await connection.query(
            `SELECT BIN_TO_UUID(id) id, title, year, director, poster, duration, rate 
             FROM movies 
             WHERE id = UUID_TO_BIN(?);`,
            [id]
        );

        if (movies.length === 0) {
            return null
        }
        return movies[0]
    }
            
    static async create({input}) {
        const {
            title,
            year,
            duration,
            director,
            rate,
            poster,
            genre
        } = input

        const [uuidResult] = await connection.query('SELECT UUID() uuid;');
        const [{uuid}] = uuidResult
        const genresPlaceholder = genre.map(() => '?').join(',')
        
        const genresIDs = await connection.query(`
            SELECT id FROM genres WHERE name IN (${genresPlaceholder});`, genre)
            

        try{    
                await connection.query(`
                INSERT INTO movies (id, title, year, duration, director, rate, poster)
                VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);`,
                [uuid, title, year, duration, director, rate, poster]
                )

                for(const genre of genresIDs[0]) {
                    await connection.query(`
                        INSERT INTO movie_genres (movie_id, genre_id)
                        VALUES (UUID_TO_BIN(?), ?);`, [uuid, genre.id])
                }
            
            }catch(err) {
                throw new Error('Error creating movie')
            } 

            


            const [movies] = await connection.query(
                `SELECT  title, year, director, poster, duration, rate, BIN_TO_UUID(id) id
                 FROM movies 
                 WHERE id = UUID_TO_BIN(?);`, [uuid]);

            movies[0].genre = genre

        console.log(genresIDs)
        return movies[0]
    }
    


    static async delete({id}) {
    

    }

    static async update({id, input}) {

    }

}