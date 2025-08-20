import { useQuery, useMutation } from "@tanstack/react-query"
import { getRandomPuzzle, checkPuzzleMove } from "@/api/puzzles"

export const PuzzlesPage = () => {
    const { data: puzzle, isLoading, refetch } = useQuery({
        queryKey: ["puzzle"],
        queryFn: getRandomPuzzle,
    })
    console.log(puzzle)

    return <h1>PuzzlesPage</h1>
}