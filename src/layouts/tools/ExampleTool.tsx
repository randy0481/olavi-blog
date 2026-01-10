import React, { useState } from "react";

export default function ExampleTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Example processing - this is a placeholder
    setResult(`You entered: ${input}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-theme-light rounded-lg border border-border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tool-input" className="block text-sm font-medium mb-2">
            Enter something
          </label>
          <input
            id="tool-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="form-input w-full"
            placeholder="Type here..."
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Process
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-white rounded border border-border">
          <h3 className="font-medium mb-2">Result:</h3>
          <p className="text-text">{result}</p>
        </div>
      )}
    </div>
  );
}
