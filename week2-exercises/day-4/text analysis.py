import string
import re

class Text:
    def __init__(self, text):
        self.text = text

    # Step 2: Word frequency
    def word_frequency(self, word):
        words = self.text.lower().split()
        count = words.count(word.lower())

        if count == 0:
            return None
        return count

    # Step 3: Most common word
    def most_common_word(self):
        words = self.text.lower().split()
        freq = {}

        for word in words:
            freq[word] = freq.get(word, 0) + 1

        most_common = max(freq, key=freq.get)
        return most_common

    # Step 4: Unique words
    def unique_words(self):
        words = self.text.lower().split()
        unique = set(words)
        return list(unique)

    # Step 5: Class method to read from file
    @classmethod
    def from_file(cls, file_path):
        try:
            with open(file_path, "r") as file:
                content = file.read()
                return cls(content)
        except FileNotFoundError:
            print("File not found.")
            return None


# Bonus Class
class TextModification(Text):

    # Step 7: Remove punctuation
    def remove_punctuation(self):
        translator = str.maketrans('', '', string.punctuation)
        return self.text.translate(translator)

    # Step 8: Remove stop words
    def remove_stop_words(self):
        stop_words = {
            "a", "an", "the", "is", "are", "was", "were", "in",
            "on", "at", "to", "for", "with", "and", "or", "of"
        }

        words = self.text.lower().split()
        filtered = [word for word in words if word not in stop_words]

        return " ".join(filtered)

    # Step 9: Remove special characters
    def remove_special_characters(self):
        return re.sub(r'[^a-zA-Z0-9\s]', '', self.text)
