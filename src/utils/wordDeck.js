export function flattenWords(words, selectedCategories) {
  const ids = selectedCategories && selectedCategories.length > 0
    ? selectedCategories
    : Object.keys(words)
  return ids.flatMap(id => (words[id] ?? []).map(w => ({ ...w, category: id })))
}

export function buildDeck(words, selectedCategories) {
  const deck = flattenWords(words, selectedCategories)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function getNextWord(deck, allWords, selectedCategories) {
  if (deck.length === 0) {
    const newDeck = buildDeck(allWords, selectedCategories)
    return { word: newDeck[0], remainingDeck: newDeck.slice(1) }
  }
  return { word: deck[0], remainingDeck: deck.slice(1) }
}
