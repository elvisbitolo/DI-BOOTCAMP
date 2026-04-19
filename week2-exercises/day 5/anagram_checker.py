class AnagramChecker:
    def __init__(self, file_path):
        with open(file_path, "r") as file:
            self.words = set(word.strip().lower() for word in file.readlines())

    # Step 2: validate word
    def is_valid_word(self, word):
        return word.lower() in self.words

    # Step 3: check anagram
    def is_anagram(self, word1, word2):
        return sorted(word1.lower()) == sorted(word2.lower())

    # Step 4: find anagrams
    def get_anagrams(self, word):
        word = word.lower()
        anagrams = []

        for w in self.words:
            if w != word and self.is_anagram(word, w):
                anagrams.append(w)

        return anagrams