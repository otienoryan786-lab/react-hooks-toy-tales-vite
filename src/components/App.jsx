import React, { useEffect, useState } from "react";

import Header from "./Header";
import ToyForm from "./ToyForm";
import ToyContainer from "./ToyContainer";

const TOYS_URL = "http://localhost:3001/toys";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [toys, setToys] = useState([]);

  useEffect(() => {
    fetch(TOYS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load toys (${response.status})`);
        }
        return response.json();
      })
      .then((loadedToys) => {
        // Keep local changes made while the initial request was in flight.
        setToys((currentToys) => {
          const currentById = new Map(
            currentToys.map((toy) => [toy.id, toy])
          );
          const loadedIds = new Set(loadedToys.map((toy) => toy.id));
          return [
            ...loadedToys.map((toy) => currentById.get(toy.id) ?? toy),
            ...currentToys.filter((toy) => !loadedIds.has(toy.id)),
          ];
        });
      })
      .catch((error) => console.error("Could not fetch toys:", error));
  }, []);

  function handleClick() {
    setShowForm((showForm) => !showForm);
  }

  async function handleAddToy(newToy) {
    try {
      // The server assigns the new toy's id; add its saved response to state.
      const response = await fetch(TOYS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newToy, likes: 0 }),
      });
      if (!response.ok) {
        throw new Error(`Failed to add toy (${response.status})`);
      }
      const savedToy = await response.json();
      setToys((currentToys) => [...currentToys, savedToy]);
    } catch (error) {
      console.error("Could not add toy:", error);
    }
  }

  async function handleDeleteToy(id) {
    try {
      const response = await fetch(`${TOYS_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Failed to delete toy (${response.status})`);
      }
      setToys((currentToys) => currentToys.filter((toy) => toy.id !== id));
    } catch (error) {
      console.error("Could not delete toy:", error);
    }
  }

  async function handleLikeToy(toy) {
    try {
      const response = await fetch(`${TOYS_URL}/${toy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: toy.likes + 1 }),
      });
      if (!response.ok) {
        throw new Error(`Failed to like toy (${response.status})`);
      }
      const updatedToy = await response.json();
      // Replace by id instead of appending so the collection order is stable.
      setToys((currentToys) =>
        currentToys.map((currentToy) =>
          currentToy.id === updatedToy.id ? updatedToy : currentToy
        )
      );
    } catch (error) {
      console.error("Could not like toy:", error);
    }
  }

  return (
    <>
      <Header />
      {showForm ? <ToyForm onAddToy={handleAddToy} /> : null}
      <div className="buttonContainer">
        <button onClick={handleClick}>Add a Toy</button>
      </div>
      <ToyContainer
        toys={toys}
        onDeleteToy={handleDeleteToy}
        onLikeToy={handleLikeToy}
      />
    </>
  );
}

export default App;
