import React from 'react'
import TodoCard from './TodoCard'

const TodosComponent = ({ allTodos }) => {
    return (
        <div className="p-4 h-full gap-4 bg-gray-900">
            <div className="mb-4 text-center text-2xl font-bold text-white">To Do List</div>

            <div className='flex flex-col gap-4 overflow-y-scroll h-screen pb-20'>
                {
                    allTodos?.map((todo, index) => (
                        <TodoCard
                            key={index}
                            title={todo.todo}
                            createdAt={new Date(todo.createdAt).toDateString()}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default TodosComponent