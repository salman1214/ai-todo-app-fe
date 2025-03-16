import React from 'react'

const TodoCard = ({ title, createdAt }) => {
    return (
        <div className='bg-gray-800 rounded-2xl p-4'>
            <div className='text-white font-bold text-lg'>{title}</div>
            <div className='text-gray-400 text-sm text-right'>{createdAt}</div>
        </div>
    )
}

export default TodoCard