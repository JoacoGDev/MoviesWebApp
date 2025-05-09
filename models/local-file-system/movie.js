import movies from '../../movies.json' with {type: "json"}
import { randomUUID } from 'crypto'


export class MovieModel{
    static async getAll({ genre }) {
        if (genre) {
            return movies.filter(movie => movie.genre.some(g => g.toLoweCase() === genre.toLoweCase()));
        }
        return movies
    }

    static async getById({id}) {
        const movie = movies.find(movie => movie.id === id)
        return movie
    }

    static async create({input}) {

        const newMovie = {
            id: randomUUID(),
            ...input
        }
    
        movies.push(newMovie)
    }

    static async delete({id}) {
    
        const movieIndex = movies.findIndex(movie => movie.id === id)
    
        if(movieIndex === -1) return false

        movies.splice(movieIndex, 1)
        return true
    }

    static async update({id, input}) {

        const movieIndex = movies.findIndex(movie => movie.id === id)
        if(movieIndex === -1) return false

            movies[movieIndex]= {
                ...movies[movieIndex],
                ...input
            }
        
           return movies[movieIndex] 
    }

}