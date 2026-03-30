import { useState, useEffect } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Load todos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert string dates back to Date objects
        const todosWithDates = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
        setTodos(todosWithDates);
      } catch (e) {
        console.error('Failed to parse todos from localStorage', e);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date(),
    };
    setTodos([newTodoItem, ...todos]);
    setNewTodo('');
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editText.trim() === '') return;
    setTodos(
      todos.map(todo =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      )
    );
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingId) {
        saveEdit();
      } else {
        addTodo();
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>✨ Todo List</h1>
        <p>Organize your tasks with style</p>
      </header>

      <main className="main">
        {/* Add Todo Form */}
        <div className="add-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            className="todo-input"
          />
          <button onClick={addTodo} className="add-btn">
            ➕ Add
          </button>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <span className="stats-text">
            {activeCount} {activeCount === 1 ? 'task' : 'tasks'} left
          </span>
          <div className="filter-buttons">
            <button 
              onClick={() => setFilter('all')}
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Todo List */}
        <ul className="todo-list">
          {filteredTodos.length === 0 ? (
            <li className="empty-state">
              {filter === 'all' 
                ? 'No tasks yet. Add your first task!' 
                : filter === 'active' 
                  ? 'All tasks are completed! 🎉' 
                  : 'No completed tasks yet.'}
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <li 
                key={todo.id} 
                className={`todo-item ${todo.completed ? 'completed' : ''} ${editingId === todo.id ? 'editing' : ''}`}
              >
                {editingId === todo.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                      className="edit-input"
                    />
                    <div className="edit-actions">
                      <button onClick={saveEdit} className="save-btn">✓</button>
                      <button onClick={cancelEdit} className="cancel-btn">✕</button>
                    </div>
                  </div>
                ) : (
                  <div className="todo-content">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="todo-checkbox"
                    />
                    <span className="todo-text">{todo.text}</span>
                    <div className="todo-actions">
                      <button 
                        onClick={() => startEditing(todo)} 
                        className="edit-btn"
                        aria-label="Edit todo"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => deleteTodo(todo.id)} 
                        className="delete-btn"
                        aria-label="Delete todo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>

        {/* Footer Stats */}
        <footer className="footer">
          <p>
            Total: {todos.length} | 
            Active: {activeCount} | 
            Completed: {completedCount}
          </p>
        </footer>
      </main>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #4b6584, #6a11cb);
          min-height: 100vh;
          padding: 20px;
          color: #333;
        }

        .app {
          max-width: 600px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 8px;
          background: linear-gradient(45deg, #4b6584, #6a11cb);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .header p {
          color: #666;
          font-size: 1.1rem;
        }

        .main {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .add-form {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .todo-input {
          flex: 1;
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .todo-input:focus {
          outline: none;
          border-color: #4b6584;
          box-shadow: 0 0 0 3px rgba(75, 101, 132, 0.2);
        }

        .add-btn {
          padding: 14px 24px;
          background: linear-gradient(45deg, #4b6584, #6a11cb);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(75, 101, 132, 0.3);
        }

        .stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .stats-text {
          font-weight: 600;
          color: #495057;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 8px 16px;
          background: #e9ecef;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn.active {
          background: linear-gradient(45deg, #4b6584, #6a11cb);
          color: white;
        }

        .filter-btn:hover:not(.active) {
          background: #dee2e6;
        }

        .todo-list {
          list-style: none;
        }

        .todo-item {
          padding: 16px;
          margin-bottom: 12px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          animation: fadeIn 0.4s ease-out;
          border-left: 4px solid #4b6584;
        }

        .todo-item.completed {
          opacity: 0.7;
          border-left-color: #28a745;
        }

        .todo-item.editing {
          background: #f8f9fa;
          border-left-color: #6a11cb;
        }

        .todo-item:hover:not(.editing) {
          transform: translateX(4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }

        .todo-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .todo-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .todo-text {
          flex: 1;
          font-size: 1.1rem;
          word-break: break-word;
        }

        .todo-item.completed .todo-text {
          text-decoration: line-through;
          color: #6c757d;
        }

        .todo-actions {
          display: flex;
          gap: 8px;
        }

        .edit-btn, .delete-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: #e9ecef;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .edit-btn:hover, .delete-btn:hover {
          background: #dee2e6;
        }

        .edit-btn:active, .delete-btn:active {
          transform: scale(0.95);
        }

        .edit-form {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .edit-input {
          flex: 1;
          padding: 10px 12px;
          border: 2px solid #4b6584;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
        }

        .edit-actions {
          display: flex;
          gap: 8px;
        }

        .save-btn, .cancel-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: #28a745;
          color: white;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: #dc3545;
        }

        .save-btn:hover, .cancel-btn:hover {
          opacity: 0.9;
        }

        .empty-state {
          text-align: center;
          padding: 32px 16px;
          color: #6c757d;
          font-style: italic;
        }

        .footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
          text-align: center;
          color: #6c757d;
          font-size: 0.9rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translateX(20px);
          }
        }

        /* Responsive design */
        @media (max-width: 600px) {
          .app {
            margin: 0 10px;
          }
          
          .header h1 {
            font-size: 2rem;
          }
          
          .add-form {
            flex-direction: column;
          }
          
          .stats-bar {
            flex-direction: column;
            gap: 12px;
          }
          
          .filter-buttons {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
