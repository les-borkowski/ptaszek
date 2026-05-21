export function buildDeck(words) {
  const deck = [...words]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function getNextWord(deck, allWords) {
  if (deck.length === 0) {
    const newDeck = buildDeck(allWords)
    return { word: newDeck[0], remainingDeck: newDeck.slice(1) }
  }
  return { word: deck[0], remainingDeck: deck.slice(1) }
}
