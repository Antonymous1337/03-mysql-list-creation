import { useState } from "react";

function App() {
  const [text, setText] = useState("");

  const submitTodo = async () => {
    if (!text) return;

    await fetch("/api/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ todoListID: text })
    });

    setText(""); // clear textbox
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Todo App</h2>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={submitTodo}>+</button>
    </div>
  );
}

export default App;